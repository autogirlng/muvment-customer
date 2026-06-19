"use client";
import { useMemo, useEffect, useState, useRef, Suspense } from "react";
import { format } from "date-fns";
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
import { kindFromValue } from "@/utils/bookingTypeRules";
import ItineraryTypeConflictModal, {
  TypeConflict,
} from "./ItineraryTypeConflictModal";

const segmentPlanKey = (td: any) =>
  JSON.stringify({
    bookingType: td?.bookingType || "",
    tripStartTime: td?.tripStartTime || "",
    pickupLocation: td?.pickupLocation || "",
    dropoffLocation: td?.dropoffLocation || "",
    areasOfUse: td?.areasOfUse || "",
    areaOfUse: td?.areaOfUse || "",
  });

const segmentDate = (d?: string) => {
  if (!d) return "";
  try {
    return format(new Date(d), "MMM d");
  } catch {
    return "";
  }
};

const segmentAreaCount = (td: any) => {
  try {
    const a = td?.areasOfUse ? JSON.parse(td.areasOfUse) : [];
    return Array.isArray(a) ? a.length : 0;
  } catch {
    return 0;
  }
};

const formatPlanRange = (
  startStr?: string,
  endStr?: string,
  count: number = 1,
) => {
  if (!startStr) return `Day 1 to Day ${count}`;
  try {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : start;
    if (count <= 1) return format(start, "do MMM");
    const sameMonth =
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();
    return sameMonth
      ? `${format(start, "do")} to ${format(end, "do MMM")}`
      : `${format(start, "do MMM")} to ${format(end, "do MMM")}`;
  } catch {
    return `Day 1 to Day ${count}`;
  }
};

const ItineraryFormContent = ({
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
  const [copiedAll, setCopiedAll] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);



  const {
    setTrips,
    trips,
    deleteTrip,
    onChangeTrip,
    addTrip,
    toggleOpen,
    openTripIds,
    isTripFormsComplete,
    generateNextTripId,
    tripsVersion,
    applyToAllTrips,
    setNumberOfDays,
    sameForAllDays,
    setSameForAllDays,
    applySharedPlanChange,
  } = useItineraryForm();

  const segments = useMemo(() => {
    const segs: { key: string; indices: number[]; firstId: string; plan: any }[] =
      [];
    trips.forEach((t, i) => {
      const key = segmentPlanKey(t.tripDetails);
      const last = segs[segs.length - 1];
      if (last && last.key === key) {
        last.indices.push(i);
      } else {
        segs.push({ key, indices: [i], firstId: t.id || "", plan: t.tripDetails });
      }
    });
    return segs;
  }, [trips, tripsVersion]);

  const bookingTypeLabel = (val?: string) =>
    bookingOptions.find((o) => o.value === val)?.option || "Plan not set";

  // Bumped whenever a conflict is resolved or cancelled, to force the trip
  // accordions to re-read the corrected booking type from state.
  const [resyncKey, setResyncKey] = useState(0);
  const lastPerDayType = useRef<string | undefined>(undefined);

  const baseType = trips[0]?.tripDetails?.bookingType as string | undefined;
  const baseKind = kindFromValue(baseType, bookingOptions);
  const canAddDays = baseKind === "per_day";

  useEffect(() => {
    if (sameForAllDays && trips.length >= 1) {
      const v = trips[0]?.tripDetails?.bookingType as string | undefined;
      if (v && kindFromValue(v, bookingOptions) === "per_day") {
        lastPerDayType.current = v;
      }
    }
  }, [trips, sameForAllDays, bookingOptions]);

  // The conflict is derived from the current itinerary shape, recomputed every
  // render, so it always reflects state and cannot desync.
  const conflict: TypeConflict | null = useMemo(() => {
    if (trips.length <= 1) return null;
    if (sameForAllDays) {
      const v = trips[0]?.tripDetails?.bookingType as string | undefined;
      const kind = kindFromValue(v, bookingOptions);
      if (v && kind !== "per_day") {
        return {
          kind: kind as TypeConflict["kind"],
          value: v,
          typeName: bookingTypeLabel(v),
          via: "shared",
        };
      }
      return null;
    }
    const monthly = trips.find(
      (t) =>
        kindFromValue(
          t.tripDetails?.bookingType as string | undefined,
          bookingOptions,
        ) === "whole_booking",
    );
    if (monthly) {
      const v = monthly.tripDetails?.bookingType as string;
      return {
        kind: "whole_booking",
        value: v,
        typeName: bookingTypeLabel(v),
        via: "per_day",
      };
    }
    return null;
  }, [trips, sameForAllDays, bookingOptions]);

  const fallbackPerDay = () =>
    bookingOptions.find(
      (o) => kindFromValue(o.value, bookingOptions) === "per_day",
    )?.value;

  const closeConflict = () => setResyncKey((k) => k + 1);

  const resolveSingleDay = () => {
    if (!conflict) return;
    if (!sameForAllDays) {
      setSameForAllDays(true);
      applyToAllTrips(trips[0]?.id || "");
    }
    setNumberOfDays(1);
    applySharedPlanChange({ bookingType: conflict.value } as TripDetails);
    closeConflict();
  };

  const resolveOneSpecificDay = (dayIndex: number) => {
    if (!conflict) return;
    const restore = lastPerDayType.current || fallbackPerDay();
    setSameForAllDays(false);
    trips.forEach((t, i) => {
      if (i === dayIndex) {
        onChangeTrip(t.id || "", { bookingType: conflict.value } as TripDetails);
      } else if (restore) {
        onChangeTrip(t.id || "", { bookingType: restore } as TripDetails);
      }
    });
    closeConflict();
  };

  const conflictDays = trips.map((t, i) => {
    const d = t.tripDetails?.tripStartDate as string | undefined;
    let dateLabel: string | undefined;
    if (d) {
      try {
        dateLabel = new Date(d).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      } catch {}
    }
    return { label: `Day ${i + 1}`, dateLabel };
  });

  const resolveMonthly = () => {
    if (!conflict) return;
    setSameForAllDays(true);
    setNumberOfDays(1);
    applySharedPlanChange({ bookingType: conflict.value } as TripDetails);
    closeConflict();
  };

  const cancelConflict = () => {
    if (!conflict) return;
    const restore = lastPerDayType.current || fallbackPerDay();
    if (!restore) {
      setNumberOfDays(1);
      closeConflict();
      return;
    }
    if (conflict.via === "shared") {
      applySharedPlanChange({ bookingType: restore } as TripDetails);
    } else {
      trips.forEach((t) => {
        if (
          kindFromValue(
            t.tripDetails?.bookingType as string | undefined,
            bookingOptions,
          ) === "whole_booking"
        ) {
          onChangeTrip(t.id || "", { bookingType: restore } as TripDetails);
        }
      });
    }
    closeConflict();
  };

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
        if (extraDetails || purposeOfRide) {
          setShowAdditional(true);
        }
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

              <p className="text-sm my-4">Daily itinerary</p>

              {trips.length > 0 && (
                <div className="flex flex-col gap-4 rounded-xl border border-[#E4E7EC] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0673ff]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">Trip length</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Set the number of days, then fill one plan and copy it to
                        all.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Fewer days"
                      onClick={() => setNumberOfDays(trips.length - 1)}
                      disabled={trips.length <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] text-gray-700 disabled:opacity-40"
                    >
                      &minus;
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={trips.length}
                      disabled={!canAddDays}
                      onChange={(e) =>
                        setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="h-8 w-12 rounded-lg border border-[#E4E7EC] text-center text-sm text-gray-800 focus:border-[#0673ff] focus:outline-none disabled:opacity-40"
                    />
                    <button
                      type="button"
                      aria-label="More days"
                      onClick={() => setNumberOfDays(trips.length + 1)}
                      disabled={!canAddDays}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] text-gray-700 disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="ml-1 text-sm text-gray-600">
                      {trips.length === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
              )}

              {!canAddDays && trips.length > 0 && (
                <p className="-mt-2 text-xs leading-relaxed text-gray-500">
                  {baseKind === "whole_booking"
                    ? `${bookingTypeLabel(baseType)} covers one continuous booking, so days are set for you.`
                    : `${bookingTypeLabel(baseType)} is a single trip. To book multiple days, switch to an hourly or daily plan.`}
                </p>
              )}

              {trips.length <= 1 ? (
                trips.map((trip, index) => (
                  <TripAccordion
                    key={`${trip.id}-${tripsVersion}-${resyncKey}`}
                    day={`${index + 1}`}
                    id={trip.id || ""}
                    isCollapsed={false}
                    toggleOpen={() => toggleOpen(trip.id || "")}
                    initialValues={trip.tripDetails}
                    vehicle={vehicle}
                    deleteMethod={deleteTrip}
                    disabled={false}
                    onChangeTrip={onChangeTrip}
                    bookingOptions={bookingOptions}
                    vehicleId={vehicle?.id}
                  />
                ))
              ) : sameForAllDays ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-4 py-2.5 text-sm text-[#0560d6]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>
                      One plan for all {trips.length} days. Fill it once below and
                      every day is set.
                    </span>
                  </div>
                  {trips[0] && (
                    <TripAccordion
                      key={`plan-${tripsVersion}-${resyncKey}`}
                      day={`${1}`}
                      dayLabel={formatPlanRange(
                        trips[0]?.tripDetails?.tripStartDate,
                        trips[trips.length - 1]?.tripDetails?.tripStartDate,
                        trips.length,
                      )}
                      daySubLabel={`${trips.length} days`}
                      id={trips[0].id || ""}
                      isCollapsed={!openTripIds.has(trips[0].id || "")}
                      toggleOpen={() => toggleOpen(trips[0].id || "")}
                      initialValues={trips[0].tripDetails}
                      vehicle={vehicle}
                      deleteMethod={() => {}}
                      disabled={false}
                      onChangeTrip={(_id, details) =>
                        applySharedPlanChange(details)
                      }
                      bookingOptions={bookingOptions}
                      vehicleId={vehicle?.id}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setSameForAllDays(false)}
                    className="text-[#0673ff] mt-1 text-sm cursor-pointer border-0"
                  >
                    Need a day to be different?
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Your trip at a glance
                    </p>
                    <div className="space-y-1.5">
                      {segments.map((seg) => {
                        const multi = seg.indices.length > 1;
                        const first = seg.indices[0] + 1;
                        const lastDay = seg.indices[seg.indices.length - 1] + 1;
                        const startD = segmentDate(
                          trips[seg.indices[0]]?.tripDetails?.tripStartDate,
                        );
                        const endD = segmentDate(
                          trips[seg.indices[seg.indices.length - 1]]?.tripDetails
                            ?.tripStartDate,
                        );
                        const areas = segmentAreaCount(seg.plan);
                        return (
                          <div
                            key={`${seg.firstId}-ov`}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#0673ff]">
                              {multi ? `Days ${first}-${lastDay}` : `Day ${first}`}
                            </span>
                            <span className="min-w-0 truncate text-gray-700">
                              {bookingTypeLabel(seg.plan?.bookingType)}
                              {seg.plan?.pickupLocation
                                ? ` · ${seg.plan.pickupLocation}`
                                : ""}
                              {areas > 0
                                ? ` · ${areas} area${areas > 1 ? "s" : ""}`
                                : ""}
                            </span>
                            {startD && (
                              <span className="ml-auto shrink-0 text-[11px] text-gray-400">
                                {multi ? `${startD} - ${endD}` : startD}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {trips?.map((trip, index) => (
                    <TripAccordion
                      key={`${trip.id}-${tripsVersion}-${resyncKey}`}
                      day={`${index + 1}`}
                      id={trip.id || ""}
                      isCollapsed={!openTripIds.has(trip.id || "")}
                      toggleOpen={() => toggleOpen(trip.id || "")}
                      initialValues={trip.tripDetails}
                    vehicle={vehicle}
                    deleteMethod={deleteTrip}
                    disabled={false}
                    onChangeTrip={onChangeTrip}
                    bookingOptions={bookingOptions}
                    vehicleId={vehicle?.id}
                    />
                  ))}

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => addTrip(generateNextTripId())}
                      className="text-[#0673ff] text-sm cursor-pointer border-0"
                    >
                      + Add a different day
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyToAllTrips(trips[0]?.id || "");
                        setSameForAllDays(true);
                      }}
                      className="text-[#0673ff] text-sm font-medium underline underline-offset-2 hover:text-[#0560d6] cursor-pointer border-0"
                    >
                      Use one plan for all days
                    </button>
                  </div>
                </>
              )}

              <div className="rounded-2xl border border-[#D0D5DD] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-grey-900">
                      Additional information
                    </h3>
                    <p className="text-sm text-grey-500 mt-0.5">
                      Optional. A ride purpose or special request for your driver.
                    </p>
                  </div>
                  {!showAdditional && (
                    <button
                      type="button"
                      onClick={() => setShowAdditional(true)}
                      className="shrink-0 rounded-full border border-[#0673ff] text-[#0673ff] text-sm font-medium px-4 py-2 hover:bg-[#EAF2FF] cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>

                {showAdditional && (
                  <div className="space-y-4 mt-5">
                    <AutocompleteSelect
                      id="purposeOfRide"
                      label="Ride purpose"
                      placeholder="Search or select ride purpose..."
                      profile
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

                    <TextArea
                      name="extraDetails"
                      id="extraDetails"
                      placeholder="e.g. child seat needed, extra luggage, preferred route"
                      label="Special requests"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.extraDetails}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setShowAdditional(false);
                        setFieldValue("purposeOfRide", "");
                        setFieldValue("extraDetails", "");
                      }}
                      className="text-sm font-medium text-[#0673ff] hover:underline cursor-pointer"
                    >
                      Remove additional information
                    </button>
                  </div>
                )}
              </div>

              <StepperNavigation
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                handleSaveDraft={() => {}}
                isSaveDraftloading={false}
                nextText="Review itinerary"
                disableNextButton={!isTripFormsComplete}
              />

              <ItineraryTypeConflictModal
                conflict={conflict}
                days={conflictDays}
                onSingleDay={resolveSingleDay}
                onOneSpecificDay={resolveOneSpecificDay}
                onMonthly={resolveMonthly}
                onCancel={cancelConflict}
              />
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

const ItineraryForm = (props: {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => (
  <Suspense fallback={null}>
    <ItineraryFormContent {...props} />
  </Suspense>
);

export default ItineraryForm;
