"use client";
import { useMemo, useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { StepperNavigation } from "./stepper";
import { ItineraryInformationValues } from "@/types/booking";
import { itineraryInformationSchema } from "@/utils/validationSchema";
import { useSearchParams } from "next/navigation";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { TripAccordion } from "../TripAccordion";
import { VehicleBookingOptions } from "@/types/vehicleDetails";
import { useRouter, useParams } from "next/navigation";
import { EstimatedBookingPrice } from "@/types/vehicleDetails";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { TripDetails } from "@/types/vehicleDetails";
import TextArea from "@/components/general/forms/textarea";
import InputField from "@/components/general/forms/inputField";
import { PersonalInformationMyselfValues } from "@/types/booking";
import SelectInput from "@/components/general/forms/select";
import { RIDE_PURPOSES } from "@/helpers/metadata";
import AutocompleteSelect from "@/components/general/forms/AutoCompleteSelect";

const ItineraryForm = ({
  steps,
  currentStep,
  setCurrentStep,
}: {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
  const [vehicle, setVehicle] = useState<any>(null);
  const [bookingOptions, setBookingOptions] = useState<
    { option: string; value: string }[]
  >([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingInformationValues, setBookingInformationValues] = useState<{
    extraDetails: string;
    purposeOfRide: string;
  } | null>(null);

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
    const tripsInfo = JSON.parse(
      sessionStorage.getItem("trips") || "[]",
    ) as TripDetails[];
    const tripData = tripsInfo.map((trip) => {
      return { id: trip.id || "", tripDetails: { ...trip } };
    });
    setTrips(tripData);
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

  const initialValues = {
    extraDetails: bookingInformationValues?.extraDetails || "",
    purposeOfRide: bookingInformationValues?.purposeOfRide || "",
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("userBookingInformation");
    if (stored) {
      try {
        const { extraDetails, purposeOfRide } = JSON.parse(stored);
        setBookingInformationValues({ extraDetails, purposeOfRide });
      } catch (error) {
        console.error(
          "Failed to parse booking information from sessionStorage:",
          error,
        );
      }
    }
  }, []);
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={itineraryInformationSchema}
        onSubmit={({ extraDetails, purposeOfRide }, { setSubmitting }) => {
          let bookingInformation: any = {};

          try {
            bookingInformation = JSON.parse(
              sessionStorage.getItem("userBookingInformation") || "{}",
            );
          } catch (e) {
            console.error("Invalid bookingInformation JSON", e);
            bookingInformation = {};
          }
          if (extraDetails) {
            bookingInformation.extraDetails = extraDetails;
          }

          if (purposeOfRide) {
            bookingInformation.purposeOfRide = purposeOfRide;
          }

          sessionStorage.setItem(
            "userBookingInformation",
            JSON.stringify(bookingInformation),
          );
          setCurrentStep(currentStep + 1);
        }}
        enableReinitialize={true}
        validateOnChange={true}
        validateOnBlur={true}
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
        }) => {
          return (
            <Form className="max-w-[500px] w-full space-y-8">
              <h6 className="!font-bold text-base md:text-md ">
                Booking Details
              </h6>

              <p className="text-sm my-4">Daily Iternary </p>

              {trips.map((trip, index) => {
                return (
                  <TripAccordion
                    key={trip.id}
                    day={`${index + 1}`}
                    id={trip.id || ""}
                    vehicle={vehicle}
                    deleteMethod={deleteTrip}
                    disabled={false}
                    onChangeTrip={onChangeTrip}
                    isCollapsed={!openTripIds.has(trip.id || "")}
                    toggleOpen={() => toggleOpen(trip.id || "")}
                    bookingOptions={bookingOptions}
                    initialValues={trip.tripDetails}
                  />
                );
              })}

              <button
                type="button"
                onClick={() => addTrip(`trip-${trips?.length}`)}
                className="text-[#0673ff] mt-1 text-sm cursor-pointer border-0"
              >
                + Add Trip
              </button>

              <TextArea
                name="extraDetails"
                id="extraDetails"
                placeholder="Add extra trip details you will like to share"
                label="Extra details(optional)"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.extraDetails}
              />

              <AutocompleteSelect
                id="purposeOfRide"
                label="Ride purpose (optional)"
                placeholder="Search or select ride purpose..."
                options={RIDE_PURPOSES.map((purpose) => ({
                  value: purpose,
                  option: purpose,
                }))}
                value={values.purposeOfRide}
                onChange={(value) => setFieldValue("purposeOfRide", value)}
                error={
                  errors.purposeOfRide && touched.purposeOfRide
                    ? String(errors.purposeOfRide)
                    : ""
                }
              />

              <StepperNavigation
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                handleSaveDraft={() => {}}
                isSaveDraftloading={false}
                disableNextButton={!isTripFormsComplete}
              />
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ItineraryForm;
