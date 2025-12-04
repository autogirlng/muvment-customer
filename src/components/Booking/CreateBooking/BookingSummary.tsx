import Icons from "@/components/general/forms/icons";
import { useEffect, ReactNode } from "react";
import Collapse from "@/components/general/collapsible";
import Vehicle from "./Vehicle";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import { FiBell } from "react-icons/fi";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { format } from "date-fns";
import cn from "classnames";
import CostBreakdown from "./CostBreakdown";
import { TripDetails } from "@/types/vehicleDetails";

type Props = {
  vehicle: any | null;
  vehicleImages: string[];
  perks: any[];
  vehicleDetails: VehicleDetailsPublic | null;
  type: "guest" | "user";
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
}: Props) {
  const { setTrips, trips } = useItineraryForm();

  useEffect(() => {
    const tripsInfo = JSON.parse(
      sessionStorage.getItem("trips") || "[]"
    ) as TripDetails[];
    const tripData = tripsInfo.map((trip) => {
      return { id: trip.id || "", tripDetails: { ...trip } };
    });
    setTrips(tripData);
  }, []);

  return (
    <div className="flex justify-between flex-col-reverse md:flex-row items-start gap-8">
      <div className="space-y-8 w-full md:max-w-[calc(100%-400px)]">
        <Collapse
          title={
            <p className="text-h6 3xl:text-h5 font-medium text-black">
              Vehicle Details
            </p>
          }
          closeText={Icons.ic_chevron_down}
          openText={Icons.ic_chevron_up}
          className="bg-[#F9FAFB] border border-[#98a2b3] rounded-3xl py-5 px-7"
        >
          <Vehicle photos={vehicleImages} />
          <div className="bg-[#F7F9FC] py-3 w-full  px-3 flex items-center space-x-2 rounded-t-xl">
            <FiBell
              size={40}
              color="#F38218 "
              className="p-2 bg-[#FBE2B7] rounded-lg border-[#F38218] border-1"
            />
            <span className="text-sm font-medium text-gray-800">
              1 day advance notice required before booking
            </span>
          </div>
          <div className="w-full md:w-3/5 space-y-8 mt-5">
            <div className="space-y-2">
              <h2 className="text-lg text-gray-800 pb-1">Vehicle Details</h2>
              <div className="flex flex-wrap items-center gap-4">
                <VehicleDetailsChip
                  label="Make"
                  value={vehicleDetails?.vehicleMakeName || "N/A"}
                />
                <VehicleDetailsChip
                  label="Model"
                  value={vehicleDetails?.vehicleModelName || "N/A"}
                />
                <VehicleDetailsChip
                  label="Year"
                  value={`${vehicleDetails?.year || "N/A"}`}
                />
                <VehicleDetailsChip
                  label="Colour"
                  value={vehicleDetails?.vehicleColorName || "N/A"}
                />
                <VehicleDetailsChip
                  label="City"
                  value={vehicleDetails?.city || "N/A"}
                />
                <VehicleDetailsChip
                  label="Vehicle type"
                  value={
                    vehicleDetails?.vehicleTypeName.replaceAll("_", " ") ||
                    "N/A"
                  }
                />
                <VehicleDetailsChip
                  label="Seating Capacity"
                  value={`${vehicleDetails?.numberOfSeats || "N/A"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {vehicleDetails?.description || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg text-gray-800">Features</h2>
              <div className="flex flex-wrap gap-2">
                {vehicleDetails?.vehicleFeatures &&
                  vehicleDetails?.vehicleFeatures.map((feature: string) => {
                    return <FeatureTag key={feature}>{feature} </FeatureTag>;
                  })}
              </div>
            </div>
          </div>
        </Collapse>

        <Collapse
          title={
            <p className="text-h6 3xl:text-h5 font-medium text-black">
              Trip Details
            </p>
          }
          closeText={Icons.ic_chevron_down}
          openText={Icons.ic_chevron_up}
          isDefaultOpen
          className="bg-[#F9FAFB] border border-[#98a2b3] rounded-3xl py-5 px-7"
        >
          {/* <Trip vehicle={vehicle} /> */}
          {
            // @ts-ignore
            trips[0]?.tripDetails?.map((trip, index) => {
              // let { tripDetails } = trip;
              // tripDetails = tripDetails[0]
              return (
                <div key={trip.id}>
                  <p>Trip {index + 1}</p>

                  <TripInfoWrapper title="Booking Type">
                    <DurationDetails
                      date={new Date(trip?.tripStartDate || "")}
                      time={new Date(trip?.tripStartTime || "")}
                      icon={Icons.ic_flag}
                      iconColor="text-primary-500"
                      title="Start"
                    />
                  </TripInfoWrapper>

                  <TripInfoWrapper title="Itinerary">
                    <SectionDetails
                      title="Pick-up"
                      description={trip?.pickupLocation || "N/A"}
                      isLocation
                    />
                    <SectionDetails
                      title="Drop-off"
                      description={trip?.dropoffLocation || "N/A"}
                      isLocation
                    />
                    <SectionDetails
                      title="Areas of Use"
                      description={trip?.areaOfUse || "N/A"}
                    />
                  </TripInfoWrapper>
                </div>
              );
            })
          }
        </Collapse>
      </div>
      <CostBreakdown trips={trips} vehicleId={vehicleDetails?.id || ""} />
    </div>
  );
}

const TripInfoWrapper = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="bg-white rounded-3xl py-4 px-7 space-y-5">
      <p className="text-sm md:text-base 3xl:text-xl text-grey-800 !font-semibold">
        {title}
      </p>
      <div className="space-y-8">{children}</div>
    </div>
  );
};

const SectionDetails = ({
  title,
  description,
  isLocation,
}: {
  title: string;
  description: string | string[];
  isLocation?: boolean;
}) => {
  return (
    <div className="space-y-4 text-xs md:text-sm 3xl:text-base">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isLocation && Icons.ic_location}
          <p className="text-grey-800 !font-medium">{title}</p>
        </div>
      </div>

      {description && Array.isArray(description) ? (
        <ul className="space-y-4">
          {description.map((item, index) => (
            <li className="text-[#98a2b3]" key={index}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#98a2b3]">{description}</p>
      )}
    </div>
  );
};

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
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="flex items-center gap-1.5">
        <span className={cn("*:w-5 *:h-5", iconColor)}>{icon}</span>
        <span>{title}</span>
      </p>
      <p>
        {format(new Date(date), "do MMM yyyy")} |{" "}
        {format(new Date(time), "hh:mma")}
      </p>
    </div>
  );
};
