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
  const [action, setAction] = useState<{
    label: string;
    onClick: () => void;
    disabled: boolean;
  } | null>(null);

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
      if (stored) setBookingInfo(JSON.parse(stored));
    } catch {}
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

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start gap-8">
      <div className="space-y-6 w-full lg:flex-1 lg:min-w-0">
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

        {bookingInfo && (
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
            <div className="space-y-4 pt-1">
              <InfoRow
                label="Booking for"
                value={forOthers ? "Someone else" : "Myself"}
              />
              <InfoRow label="Full name" value={recapName} />
              <InfoRow label="Email" value={recapEmail} />
              <InfoRow label="Phone number" value={recapPhone} />
              {recapSecondaryPhone && (
                <InfoRow label="Secondary phone" value={recapSecondaryPhone} />
              )}
            </div>
          </Collapse>
        )}

        {bookingInfo && (
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
              <InfoRow
                label="Ride purpose"
                value={bookingInfo?.purposeOfRide || "Not specified"}
              />
              <div className="space-y-1.5">
                <p className="text-sm md:text-base font-medium text-grey-800">
                  Special requests
                </p>
                <p className="text-sm text-grey-500">
                  {bookingInfo?.extraDetails || "None added"}
                </p>
              </div>
            </div>
          </Collapse>
        )}
      </div>
      <CostBreakdown
        trips={trips}
        vehicleId={vehicleDetails?.data.id || ""}
        onActionChange={setAction}
      />

      <StepperNavigation
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        submitText={action?.label || "Confirm & pay"}
        handleSubmit={action?.onClick}
        disableSubmitButton={!action || action.disabled}
        isSaveDraftloading={false}
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
