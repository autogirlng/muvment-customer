import { useMemo, useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { StepperNavigation } from "./stepper";
import { ItineraryInformationValues } from "@/types/booking";

import { itineraryInformationSchema } from "@/utils/validationSchema";
import { useSearchParams } from "next/navigation";
// import { TripPerDaySelect } from "../VehicleSummary/TripPerDaySelect";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { TripAccordion } from "../TripAccordion";
import { VehicleBookingOptions } from "@/types/vehicleDetails";
import { useRouter, useParams } from "next/navigation";
import { EstimatedBookingPrice } from "@/types/vehicleDetails";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

export const saveAndUpdateBookingInformation = (
  values: any,
  id: string,
  formType: string
) => {
  const bookingInformation = localStorage.getItem("bookingInformation");

  if (bookingInformation) {
    const bookingInformationObject = JSON.parse(bookingInformation);
    const updatedBookingInformation = {
      ...bookingInformationObject,
      [id]: {
        ...bookingInformationObject[id],
        [formType]: values,
      },
    };

    localStorage.setItem(
      "bookingInformation",
      JSON.stringify(updatedBookingInformation)
    );
  } else {
    localStorage.setItem(
      "bookingInformation",
      JSON.stringify({ [id]: { [formType]: values } })
    );
  }
};

export const getExistingBookingInformation = (
  values: any,
  vehicleId: string,
  formType: string
  //   user?: User | null
) => {
  const bookingInformation = localStorage.getItem("bookingInformation");

  if (bookingInformation) {
    const bookingInformationObject = JSON.parse(bookingInformation);
    return bookingInformationObject[vehicleId]?.[formType] || values;
  }

  //   return getPrefillUserValuesForBooking(values, user);
};

// Your combineDateTime function - preserves local timezone
function combineDateTime(
  startDate: Date,
  startTime: Date,
  endDate: Date,
  endTime: Date
): { startDateTime: string; endDateTime: string } {
  // Helper function to combine date and time while preserving local values
  const combine = (dateObj: Date, timeObj: Date): string => {
    // Get local date parts
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    // Get local time parts
    const hours = String(timeObj.getHours()).padStart(2, "0");
    const minutes = String(timeObj.getMinutes()).padStart(2, "0");
    const seconds = String(timeObj.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  return {
    startDateTime: combine(startDate, startTime),
    endDateTime: combine(endDate, endTime),
  };
}

// Helper function to parse URL date parameters
function parseDateFromUrl(dateString: string | null): {
  date: Date | null;
  time: Date | null;
} {
  if (!dateString) {
    return { date: null, time: null };
  }

  try {
    const parsedDate = new Date(dateString);

    // Create separate Date objects for date and time
    const dateOnly = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    );
    const timeOnly = new Date();
    timeOnly.setHours(
      parsedDate.getHours(),
      parsedDate.getMinutes(),
      parsedDate.getSeconds(),
      0
    );

    return { date: dateOnly, time: timeOnly };
  } catch (error) {
    console.error("Error parsing date from URL:", error);
    return { date: null, time: null };
  }
}

const baseInitialValues: ItineraryInformationValues = {
  pickupLocation: "",
  startDate: null,
  startTime: null,
  dropoffLocation: "",
  endDate: null,
  endTime: null,
  areaOfUse: "",
  outskirtsLocation: [],
  extraDetails: "",
  purposeOfRide: "",
};

const ItineraryForm = ({
  steps,
  currentStep,
  setCurrentStep,
  vehicleId,
}: {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  vehicleId: string;
}) => {
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [bookingOptions, setBookingOptions] = useState<
    { option: string; value: string }[]
  >([]);
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<EstimatedBookingPrice>();
  const [continueBooking, setContinueBooking] = useState<boolean>(false);

  // Get URL parameters
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const pickupLocationParam = searchParams.get("pickupLocation");

  // Parse dates from URL parameters
  const { date: startDate, time: startTime } = parseDateFromUrl(startDateParam);
  const { date: endDate, time: endTime } = parseDateFromUrl(endDateParam);

  // Check if dates are from URL (to determine if fields should be disabled)
  const hasUrlDates = startDateParam && endDateParam;

  // Create initial values with URL parameters
  const initialValues = useMemo(() => {
    const existingValues = getExistingBookingInformation(
      baseInitialValues,
      vehicleId,
      "itineraryInformation"
    );

    return {
      ...existingValues,
      // Override with URL parameters if they exist
      ...(startDate && { startDate }),
      ...(startTime && { startTime }),
      ...(endDate && { endDate }),
      ...(endTime && { endTime }),
      ...(pickupLocationParam && { pickupLocation: pickupLocationParam }),
    };
  }, [vehicleId, startDate, startTime, endDate, endTime, pickupLocationParam]);

  const {
    setTrips,
    trips,
    deleteTrip,
    onChangeTrip,
    addTrip,
    toggleOpen,
    openTripIds,

    isTripFormsComplete,
  } = useItineraryForm();
  const generateBookingOptions = () => {
    const types: VehicleBookingOptions[] = vehicle?.allPricingOptions;

    const options = types?.map((type) => {
      return { option: type.bookingTypeName, value: type.bookingTypeId };
    });

    return options;
  };

  useEffect(() => {
    const options = generateBookingOptions();
    setBookingOptions(options);
  }, [vehicle]);

  useEffect(() => {
    const trips = sessionStorage.getItem("trips");
    setTrips([{ id: "trip-0", tripDetails: JSON.parse(trips || "") }]);
  }, []);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const data = await VehicleSearchService.getVehicleById(id as string);
        setVehicle(data[0].data);
        setError(null);
      } catch (err) {
        setError("Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);

  console.log(trips);

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={itineraryInformationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values);
          setCurrentStep(currentStep + 1);
        }}
      >
        {({
          values,
          touched,
          errors,
          isValid,
          dirty,
          handleBlur,
          handleChange,
          setFieldTouched,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form className="max-w-[500px] w-full space-y-8">
            <h6 className="!font-bold text-base md:text-md ">
              Booking Details
            </h6>

            <p className="text-sm my-4">Trip per day</p>

            {
              // @ts-ignore
              trips[0]?.tripDetails?.map((trip, index) => {
                return (
                  <TripAccordion
                    key={trip.id}
                    day={`${index + 1}`}
                    id={trip.id}
                    vehicle={vehicle}
                    deleteMethod={deleteTrip}
                    disabled={false}
                    onChangeTrip={onChangeTrip}
                    isCollapsed={!openTripIds.has(trip.id)}
                    toggleOpen={() => toggleOpen(trip.id)}
                    bookingOptions={bookingOptions}
                    initialValues={trip}
                  />
                );
              })
            }
            {/* <button onClick={() => addTrip(`trip-${trips.length}`)} className="text-[#0673ff] mt-3 text-sm cursor-pointer border-0 bg-white">+ Add Trip</button> */}

            {/* <StepperNavigation
                            steps={steps}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            handleSaveDraft={() => { }}
                            isSaveDraftloading={false}
                            isNextLoading={isSubmitting}
                            disableNextButton={false}
                        /> */}

            <StepperNavigation
              steps={steps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              handleSaveDraft={() => {}}
              isSaveDraftloading={false}
              isNextLoading={isSubmitting}
              disableNextButton={!isValid || isSubmitting}
            />
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ItineraryForm;
