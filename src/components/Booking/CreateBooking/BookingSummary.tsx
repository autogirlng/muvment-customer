import Icons from "@/components/general/forms/icons";
import { useEffect, useState, ReactNode } from "react";
import Collapse from "@/components/general/collapsible";
import Vehicle from "./Vehicle";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import { FiBell, FiClock } from "react-icons/fi";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { format } from "date-fns";
import cn from "classnames";
import CostBreakdown from "./CostBreakdown";
import { TripDetails } from "@/types/vehicleDetails";
import { StepperNavigation } from "./stepper";
import EstimatedPickupTime from "./EstimatedPickupTime";
import { DELIVERY_WINDOW_LABEL } from "./deliveryConfig";
import AutocompleteSelect from "@/components/general/forms/AutoCompleteSelect";
import TextArea from "@/components/general/forms/textarea";
import { RIDE_PURPOSES } from "@/helpers/metadata";
import PersonalInformationForm from "./PersonalInformationForm";
import BookingReassurance from "@/components/Booking/BookingReassurance";
import {
  TripFootprintMap,
  TripMapPoint,
} from "@/components/Booking/TripFootprintMap";

type Props = {
  vehicle: any | null;
  vehicleImages: string[];
  perks: any[];
  vehicleDetails: VehicleDetailsPublic | null;
  type: "guest" | "user";
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

const VehicleDetailsChip = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center space-x-1 px-3 font-medium text-gray-900 py-2 rounded-lg text-sm bg-[#F0F2F5]">
    <span>{label}:</span>
    <span>{value}</span>
  </div>
);

const FeatureTag = ({ children }: { children: ReactNode }) => (
  <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-lg border border-gray-200">
    {children}
  </span>
);

const DiscountRow = ({
  days,
  discount,
  color,
}: {
  days: string;
  discount: string;
  color: string;
}) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 border border-[#D0D5DD] rounded-lg">
    <span className="text-sm font-medium text-gray-700">{days}</span>
    <span className={`text-sm font-bold ${color}`}>{discount}</span>
  </div>
);

export default function BookingSummary({
  vehicleImages,
  vehicleDetails,
  steps,
  currentStep,
  setCurrentStep,
}: Props) {
  const { setTrips, trips } = useItineraryForm();
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [purposeOfRide, setPurposeOfRide] = useState<string>("");
  const [extraDetails, setExtraDetails] = useState<string>("");
  const [action, setAction] = useState<{
    label: string;
    onClick: () => void;
    disabled: boolean;
    amount?: number;
  } | null>(null);
  const ngn = (n?: number) => `NGN ${Number(n || 0).toLocaleString()}`;

  const persistAdditional = (purpose: string, extra: string) => {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("userBookingInformation") || "{}",
      );
      stored.purposeOfRide = purpose;
      stored.extraDetails = extra;
      sessionStorage.setItem("userBookingInformation", JSON.stringify(stored));
    } catch {}
  };

  useEffect(() => {
    const tripsInfo = JSON.parse(
      sessionStorage.getItem("trips") || "[]",
    ) as TripDetails[];
    const tripData = tripsInfo.map((trip) => {
      return { id: trip.id || "", tripDetails: { ...trip } };
    });
    setTrips(tripData);

    try {
      const stored = sessionStorage.getItem("userBookingInformation");
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookingInfo(parsed);
        setPurposeOfRide(parsed.purposeOfRide || "");
        setExtraDetails(parsed.extraDetails || "");
      }
    } catch {}
  }, []);

  // Keep the contact details fresh as the user fills the form so the notice and
  // the pay button reflect the latest input.
  useEffect(() => {
    let last = "";
    const sync = () => {
      try {
        const stored = sessionStorage.getItem("userBookingInformation") || "";
        if (stored !== last) {
          last = stored;
          setBookingInfo(stored ? JSON.parse(stored) : null);
        }
      } catch {}
    };
    sync();
    const id = window.setInterval(sync, 600);
    return () => window.clearInterval(id);
  }, []);

  const forOthers = !!bookingInfo?.isBookingForOthers;
  const recapName = forOthers
    ? bookingInfo?.recipientFullName
    : bookingInfo?.guestFullName;
  const recapEmail = forOthers
    ? bookingInfo?.recipientEmail
    : bookingInfo?.guestEmail;
  const recapPhone = forOthers
    ? `${bookingInfo?.countryCode || ""} ${bookingInfo?.recipientPhoneNumber || ""}`.trim()
    : `${bookingInfo?.countryCode || ""} ${bookingInfo?.primaryPhoneNumber || ""}`.trim();
  const recapSecondaryPhone = forOthers
    ? bookingInfo?.recipientSecondaryPhoneNumber
      ? `${bookingInfo?.secondaryCountryCode || ""} ${bookingInfo.recipientSecondaryPhoneNumber}`.trim()
      : ""
    : bookingInfo?.secondaryPhoneNumber
      ? `${bookingInfo?.secondaryCountryCode || ""} ${bookingInfo.secondaryPhoneNumber}`.trim()
      : "";

  const summaryName =
    [
      vehicleDetails?.data.vehicleMakeName,
      vehicleDetails?.data.vehicleModelName,
    ]
      .filter(Boolean)
      .join(" ") || "Your vehicle";
  const dayCount = trips?.length || 0;
  const durationLabel =
    dayCount > 1 ? `${dayCount} days` : dayCount === 1 ? "1 day" : "N/A";
  const firstTrip = trips?.[0]?.tripDetails;
  const firstPickup = (() => {
    if (!firstTrip?.tripStartDate) return "";
    let out = "";
    try {
      out = format(new Date(firstTrip.tripStartDate), "do MMM yyyy");
    } catch {
      return "";
    }
    if (firstTrip?.tripStartTime) {
      try {
        out += ` · ${format(new Date(firstTrip.tripStartTime), "hh:mma")}`;
      } catch {}
    }
    return out;
  })();

  const phoneNumberRaw = forOthers
    ? bookingInfo?.recipientPhoneNumber
    : bookingInfo?.primaryPhoneNumber;
  const missingInfo: string[] = [];
  if (!String(recapName || "").trim())
    missingInfo.push(forOthers ? "Recipient's full name" : "Your full name");
  if (!String(recapEmail || "").trim())
    missingInfo.push(forOthers ? "Recipient's email" : "Your email");
  if (!String(phoneNumberRaw || "").trim())
    missingInfo.push(
      forOthers ? "Recipient's phone number" : "Your phone number",
    );
  const priceReady = !!action?.amount;

  const pricingOptions: { bookingTypeId: string; bookingTypeName: string }[] =
    (vehicleDetails?.data as any)?.allPricingOptions || [];
  const typeNameById = new Map(
    pricingOptions.map((o) => [o.bookingTypeId, o.bookingTypeName]),
  );
  const selectedTypeNames = (trips || [])
    .map((t) => typeNameById.get(t?.tripDetails?.bookingType as string))
    .filter(Boolean) as string[];

  // Area of use is required for non-interstate trips, so pricing reflects where
  // the customer actually drives, including any outskirt areas. A trip missing
  // its area of use blocks payment.
  const anyTripMissingAreaOfUse = (trips || []).some((t) => {
    const typeName = (
      typeNameById.get(t?.tripDetails?.bookingType as string) || ""
    ).toLowerCase();
    if (typeName.includes("interstate")) return false;
    const raw = t?.tripDetails?.areasOfUse;
    let areas: unknown[] = [];
    try {
      areas = raw ? JSON.parse(raw) : [];
    } catch {
      areas = [];
    }
    const single = t?.tripDetails?.areaOfUse;
    return (!Array.isArray(areas) || areas.length === 0) && !single;
  });
  if (anyTripMissingAreaOfUse) {
    missingInfo.push("Area of use for each trip");
  }

  const completionNotice =
    missingInfo.length > 0 ? (
      <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-900">
          Add these before you can pay
        </p>
        <ul className="mt-2 space-y-1.5">
          {missingInfo.map((l) => (
            <li
              key={l}
              className="flex items-center gap-2 text-sm text-amber-800"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {l}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      <div className="space-y-6 w-full lg:flex-1 lg:min-w-0">
        {completionNotice}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            {vehicleImages?.[0] ? (
              <img
                src={vehicleImages[0]}
                alt={summaryName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-semibold text-grey-900 text-sm truncate">
                {summaryName}
              </p>
              {vehicleDetails?.data.year ? (
                <p className="text-xs text-grey-500">
                  {vehicleDetails.data.year}
                </p>
              ) : null}
            </div>
          </div>
          <div className="border-t border-[#EAECF0] pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-grey-500">Duration</span>
              <span className="text-grey-900 font-medium text-right">
                {durationLabel}
              </span>
            </div>
            {firstPickup ? (
              <div className="flex items-start justify-between gap-3">
                <span className="text-grey-500 flex-shrink-0">Pick-up time</span>
                <span className="text-grey-900 font-medium text-right break-words">
                  {firstPickup}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <Collapse
          title={
            <p className="text-base md:text-lg font-semibold text-grey-900">
              Vehicle Details
            </p>
          }
          closeText={Icons.ic_chevron_down}
          openText={Icons.ic_chevron_up}
          className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-4"
        >
          <Vehicle photos={vehicleImages} />
          <div className="bg-[#F9FAFB] border border-[#EAECF0] py-4 w-full px-4 rounded-xl space-y-3">
            {/* Advance Notice */}
            <div className="flex items-center space-x-3">
              <FiBell
                size={30}
                className="p-2 bg-[#FBE2B7] rounded-lg border border-[#F38218] flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-800">
                {vehicleDetails?.data.advanceNotice
                  ? `${vehicleDetails.data.advanceNotice} advance notice required before booking`
                  : "Advance notice may be required before booking"}
              </span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center space-x-3">
              <FiClock
                size={30}
                className="p-2 bg-[#D1FAE5] rounded-lg border border-[#10B981] flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-800">
                Your vehicle will arrive within {DELIVERY_WINDOW_LABEL} of
                booking, regardless of where it's currently located
              </span>
            </div>
          </div>
          <div className="w-full space-y-8 mt-5">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-grey-900 pb-1">
                Specifications
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <VehicleDetailsChip
                  label="Make"
                  value={vehicleDetails?.data.vehicleMakeName || "N/A"}
                />
                <VehicleDetailsChip
                  label="Model"
                  value={vehicleDetails?.data.vehicleModelName || "N/A"}
                />
                <VehicleDetailsChip
                  label="Year"
                  value={`${vehicleDetails?.data.year || "N/A"}`}
                />
                <VehicleDetailsChip
                  label="Colour"
                  value={vehicleDetails?.data.vehicleColorName || "N/A"}
                />
                <VehicleDetailsChip
                  label="City"
                  value={vehicleDetails?.data.city || "N/A"}
                />
                <VehicleDetailsChip
                  label="Vehicle type"
                  value={
                    vehicleDetails?.data.vehicleTypeName?.replaceAll(
                      "_",
                      " ",
                    ) || "N/A"
                  }
                />
                <VehicleDetailsChip
                  label="Seating Capacity"
                  value={`${vehicleDetails?.data.numberOfSeats || "N/A"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-grey-900">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {vehicleDetails?.data.description || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-grey-900">Features</h2>
              <div className="flex flex-wrap gap-2">
                {vehicleDetails?.data.vehicleFeatures &&
                  vehicleDetails?.data.vehicleFeatures.map(
                    (feature: string) => {
                      return <FeatureTag key={feature}>{feature} </FeatureTag>;
                    },
                  )}
              </div>
            </div>
          </div>
        </Collapse>

        <Collapse
          title={
            <p className="text-base md:text-lg font-semibold text-grey-900">
              Trip Details
            </p>
          }
          closeText={Icons.ic_chevron_down}
          openText={Icons.ic_chevron_up}
          className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-4"
        >
          <div className="space-y-4">
            {trips.map((trip, index) => {
              const td = trip?.tripDetails;
              const areas = (() => {
                try {
                  const list = td?.areasOfUse ? JSON.parse(td.areasOfUse) : [];
                  if (Array.isArray(list) && list.length > 0) {
                    return list.map((a: any) => a.name).join(", ");
                  }
                } catch {}
                return td?.areaOfUse || "N/A";
              })();
              const startDate = td?.tripStartDate
                ? format(new Date(td.tripStartDate), "do MMM yyyy")
                : "N/A";
              const startTime = td?.tripStartTime
                ? format(new Date(td.tripStartTime), "hh:mma")
                : "";
              return (
                <div
                  key={trip.id}
                  className="rounded-xl border border-[#EAECF0] p-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-grey-100">
                    <p className="text-sm font-semibold text-grey-900">
                      Day {index + 1}
                    </p>
                    <span className="text-xs text-grey-500">
                      {startDate}
                      {startTime ? ` · ${startTime}` : ""}
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    <SummaryRow
                      icon={Icons.ic_location}
                      label="Pick-up"
                      value={td?.pickupLocation || "N/A"}
                    />
                    <SummaryRow
                      icon={Icons.ic_location}
                      label="Drop-off"
                      value={td?.dropoffLocation || "N/A"}
                    />
                    <SummaryRow
                      icon={Icons.ic_location}
                      label="Areas of use"
                      value={areas}
                    />
                    {(() => {
                      const parseC = (raw: unknown) => {
                        if (!raw) return null;
                        try {
                          const v =
                            typeof raw === "string" ? JSON.parse(raw) : raw;
                          if (
                            v &&
                            typeof v.lat === "number" &&
                            typeof v.lng === "number"
                          )
                            return { lat: v.lat, lng: v.lng };
                        } catch {}
                        return null;
                      };
                      const pts: TripMapPoint[] = [];
                      const pu = parseC(td?.pickupCoordinates);
                      if (pu)
                        pts.push({
                          ...pu,
                          label: td?.pickupLocation || "Pickup",
                          kind: "pickup",
                        });
                      const doff = parseC(td?.dropoffCoordinates);
                      if (doff)
                        pts.push({
                          ...doff,
                          label: td?.dropoffLocation || "Drop-off",
                          kind: "dropoff",
                        });
                      try {
                        const list = td?.areasOfUse
                          ? JSON.parse(td.areasOfUse)
                          : [];
                        if (Array.isArray(list)) {
                          list.forEach((a: any) => {
                            if (
                              a &&
                              typeof a.lat === "number" &&
                              typeof a.lng === "number"
                            )
                              pts.push({
                                lat: a.lat,
                                lng: a.lng,
                                label: a.name || "Area",
                                kind: "area",
                                isOutskirt: !!a.isOutskirts,
                              });
                          });
                        }
                      } catch {}
                      return pts.length > 0 ? (
                        <div className="pt-1">
                          <TripFootprintMap points={pts} height={200} />
                        </div>
                      ) : null;
                    })()}
                    <EstimatedPickupTime
                      tripStartDate={td?.tripStartDate || ""}
                      tripStartTime={td?.tripStartTime || ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Collapse>

        <Collapse
          title={
            <p className="text-base md:text-lg font-semibold text-grey-900">
              Your Information
            </p>
          }
          closeText={Icons.ic_chevron_down}
          openText={Icons.ic_chevron_up}
          isDefaultOpen
          className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-4"
        >
          <div className="pt-1">
            <PersonalInformationForm
              steps={steps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              vehicleId={vehicleDetails?.data.id ?? ""}
              type="user"
              hideNavigation
            />
          </div>
        </Collapse>

        <Collapse
          title={
            <p className="text-base md:text-lg font-semibold text-grey-900">
              Additional Details
              </p>
            }
            closeText={Icons.ic_chevron_down}
            openText={Icons.ic_chevron_up}
            isDefaultOpen
            className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-4"
          >
            <div className="space-y-4 pt-1">
              <AutocompleteSelect
                id="purposeOfRide"
                label="Ride purpose (optional)"
                placeholder="Search or select ride purpose..."
                profile
                options={RIDE_PURPOSES.map((purpose) => ({
                  value: purpose,
                  option: purpose,
                }))}
                value={purposeOfRide}
                onChange={(value) => {
                  setPurposeOfRide(value);
                  persistAdditional(value, extraDetails);
                }}
              />
              <TextArea
                name="extraDetails"
                id="extraDetails"
                label="Special requests (optional)"
                placeholder="e.g. child seat needed, extra luggage, preferred route"
                value={extraDetails}
                onChange={(e: any) => {
                  const value =
                    typeof e === "string" ? e : (e?.target?.value ?? "");
                  setExtraDetails(value);
                  persistAdditional(purposeOfRide, value);
                }}
              />
            </div>
        </Collapse>
      </div>
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 lg:sticky lg:top-6 space-y-4">
        <CostBreakdown
          trips={trips}
          vehicleId={vehicleDetails?.data.id || ""}
          onActionChange={setAction}
        />

        <BookingReassurance bookingTypeNames={selectedTypeNames} />
      </div>

      <StepperNavigation
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        submitText={action?.label || "Confirm & pay"}
        handleSubmit={action?.onClick}
        disableSubmitButton={
          !action ||
          action.disabled ||
          (priceReady && missingInfo.length > 0)
        }
        isSaveDraftloading={false}
        priceText={action?.amount ? ngn(action.amount) : undefined}
      />
    </div>
  );
}

const SummaryRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="flex items-center gap-2 text-grey-700 font-medium flex-shrink-0">
      <span className="*:w-4 *:h-4 text-grey-400">{icon}</span>
      {label}
    </span>
    <span className="text-grey-900 text-right break-words">{value}</span>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-4 text-sm md:text-base">
    <span className="text-grey-800 font-medium flex-shrink-0">{label}</span>
    <span className="text-[#98a2b3] text-right break-words">
      {value || "N/A"}
    </span>
  </div>
);

const TripInfoWrapper = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="bg-white rounded-3xl py-4 px-5 md:px-7 mb-3 space-y-5 shadow-sm">
    <p className="text-sm md:text-base font-semibold text-grey-800">{title}</p>
    <div className="space-y-6">{children}</div>
  </div>
);

const SectionDetails = ({
  title,
  description,
  isLocation,
}: {
  title: string;
  description: string | string[];
  isLocation?: boolean;
}) => (
  <div className="space-y-3 text-sm md:text-base">
    <div className="flex items-center gap-2">
      {isLocation && Icons.ic_location}
      <p className="text-grey-800 font-medium">{title}</p>
    </div>

    {Array.isArray(description) ? (
      <ul className="space-y-2 text-[#98a2b3] text-xs">
        {description.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-[#98a2b3]">{description}</p>
    )}
  </div>
);

const DurationDetails = ({
  date,
  time,
  icon,
  iconColor,
  title,
}: {
  date: Date;
  time: Date;
  icon: ReactNode;
  iconColor: string;
  title: string;
}) => (
  <div className="flex text-xs justify-between mb-3 items-center text-sm md:text-base">
    <p className="flex items-center gap-2">
      <span className={cn("*:w-5 *:h-5", iconColor)}>{icon}</span>
      <span>{title}</span>
    </p>
    <p>
      {format(date, "do MMM yyyy")} | {format(time, "hh:mma")}
    </p>
  </div>
);
