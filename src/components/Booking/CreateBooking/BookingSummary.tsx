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
  const {
    setTrips,
    trips,
  } = useItineraryForm();

  useEffect(() => {
    const tripsInfo = JSON.parse(sessionStorage.getItem("trips") || "[]") as TripDetails[];
    const tripData = tripsInfo.map((trip) => {
      return { id: trip.id || "", tripDetails: { ...trip } }
    })
    setTrips(tripData)
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
                    vehicleDetails?.data.vehicleTypeName.replaceAll("_", " ") ||
                    "N/A"
                  }
                />
                <VehicleDetailsChip
                  label="Seating Capacity"
                  value={`${vehicleDetails?.data.numberOfSeats || "N/A"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {vehicleDetails?.data.description || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg text-gray-800">Features</h2>
              <div className="flex flex-wrap gap-2">
                {vehicleDetails?.data.vehicleFeatures &&
                  vehicleDetails?.data.vehicleFeatures.map(
                    (feature: string) => {
                      return <FeatureTag key={feature}>{feature} </FeatureTag>;
                    }
                  )}
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
          className="bg-[#F9FAFB] border border-[#98a2b3] mt-4 rounded-3xl py-5 px-7"
        >
          {
            trips.map((trip, index) => {

              return (
                <div key={trip.id}>
                  <p>Trip {index + 1}</p>

                  <TripInfoWrapper title="Booking Type">
                    <DurationDetails
                      date={new Date(trip?.tripDetails?.tripStartDate || "")}
                      time={new Date(trip?.tripDetails?.tripStartTime || "")}
                      icon={Icons.ic_flag}
                      iconColor="text-primary-500"
                      title="Start"
                    />
                  </TripInfoWrapper>

                  <TripInfoWrapper title="Itinerary">
                    <SectionDetails
                      title="Pick-up"
                      description={trip?.tripDetails?.pickupLocation || "N/A"}
                      isLocation
                    />
                    <SectionDetails
                      title="Drop-off"
                      description={trip?.tripDetails?.dropoffLocation || "N/A"}
                      isLocation
                    />
                    <SectionDetails
                      title="Areas of Use"
                      description={trip?.tripDetails?.areaOfUse || "N/A"}
                    />
                  </TripInfoWrapper>
                </div>
              );
            })
          }
        </Collapse>
      </div>
      <CostBreakdown trips={trips} vehicleId={vehicleDetails?.data.id || ""} />
    </div>
  );
}

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
  <div className="flex text-xs justify-between mb-3items-center text-sm md:text-base">
    <p className="flex items-center gap-2">
      <span className={cn("*:w-5 *:h-5", iconColor)}>{icon}</span>
      <span>{title}</span>
    </p>
    <p>
      {format(date, "do MMM yyyy")} | {format(time, "hh:mma")}
    </p>
  </div>
);


// import Icons from "@/components/general/forms/icons";
// import { useEffect, ReactNode } from "react";
// import Collapse from "@/components/general/collapsible";
// import Vehicle from "./Vehicle";
// import { VehicleDetailsPublic } from "@/types/vehicleDetails";
// import { FiBell } from "react-icons/fi";
// import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
// import { format } from "date-fns";
// import cn from "classnames";
// import CostBreakdown from "./CostBreakdown";
// import { TripDetails } from "@/types/vehicleDetails";

// type Props = {
//   vehicle: any | null;
//   vehicleImages: string[];
//   perks: any[];
//   vehicleDetails: VehicleDetailsPublic | null;
//   type: "guest" | "user";
// };

// const VehicleDetailsChip = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) => (
//   <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#F0F2F5] text-sm font-medium text-gray-900 whitespace-nowrap">
//     <span>{label}:</span>
//     <span>{value}</span>
//   </div>
// );

// const FeatureTag = ({ children }: { children: ReactNode }) => (
//   <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-lg border border-gray-200">
//     {children}
//   </span>
// );

// const DiscountRow = ({
//   days,
//   discount,
//   color,
// }: {
//   days: string;
//   discount: string;
//   color: string;
// }) => (
//   <div className="flex justify-between items-center p-3 bg-gray-50 border border-[#D0D5DD] rounded-lg">
//     <span className="text-sm font-medium text-gray-700">{days}</span>
//     <span className={`text-sm font-bold ${color}`}>{discount}</span>
//   </div>
// );

// export default function BookingSummary({ vehicleImages, vehicleDetails }: Props) {
//   const { setTrips, trips } = useItineraryForm();

//   useEffect(() => {
//     const tripsInfo = JSON.parse(sessionStorage.getItem("trips") || "[]") as TripDetails[];
//     setTrips(
//       tripsInfo.map((trip) => ({
//         id: trip.id || "",
//         tripDetails: { ...trip },
//       }))
//     );
//   }, []);

//   return (
//     <div className="flex flex-col md:flex-row gap-8 w-full">
//       {/* LEFT SIDE */}
//       <div className="w-full md:flex-1 space-y-8">
//         {/* VEHICLE DETAILS */}
//         <Collapse
//           title={<p className="text-h6 3xl:text-h5 font-medium text-black">Vehicle Details</p>}
//           closeText={Icons.ic_chevron_down}
//           openText={Icons.ic_chevron_up}
//           className="bg-[#F9FAFB] border border-[#98a2b3] rounded-3xl py-5 px-5 md:px-7"
//         >
//           <Vehicle photos={vehicleImages} />

//           <div className="bg-[#F7F9FC] py-3 px-3 rounded-t-xl mt-3 flex items-center gap-2">
//             <FiBell
//               size={40}
//               color="#F38218"
//               className="p-2 bg-[#FBE2B7] rounded-lg border border-[#F38218]"
//             />
//             <span className="text-sm font-medium text-gray-800">
//               1 day advance notice required before booking
//             </span>
//           </div>

//           <div className="w-full space-y-8 mt-5">
//             {/* CHIP DETAILS */}
//             <div className="space-y-2">
//               <h2 className="text-lg text-gray-800">Vehicle Details</h2>

//               <div className="flex flex-wrap gap-3">
//                 <VehicleDetailsChip label="Make" value={vehicleDetails?.data.vehicleMakeName || "N/A"} />
//                 <VehicleDetailsChip label="Model" value={vehicleDetails?.data.vehicleModelName || "N/A"} />
//                 <VehicleDetailsChip label="Year" value={`${vehicleDetails?.data.year || "N/A"}`} />
//                 <VehicleDetailsChip label="Colour" value={vehicleDetails?.data.vehicleColorName || "N/A"} />
//                 <VehicleDetailsChip label="City" value={vehicleDetails?.data.city || "N/A"} />
//                 <VehicleDetailsChip
//                   label="Vehicle type"
//                   value={vehicleDetails?.data.vehicleTypeName?.replaceAll("_", " ") || "N/A"}
//                 />
//                 <VehicleDetailsChip
//                   label="Seating Capacity"
//                   value={`${vehicleDetails?.data.numberOfSeats || "N/A"}`}
//                 />
//               </div>
//             </div>

//             {/* DESCRIPTION */}
//             <div className="space-y-2">
//               <h2 className="text-lg text-gray-800">Description</h2>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 {vehicleDetails?.data.description || "N/A"}
//               </p>
//             </div>

//             {/* FEATURES */}
//             <div className="space-y-2">
//               <h2 className="text-lg text-gray-800">Features</h2>
//               <div className="flex flex-wrap gap-2">
//                 {vehicleDetails?.data.vehicleFeatures?.map((feature: string) => (
//                   <FeatureTag key={feature}>{feature}</FeatureTag>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </Collapse>

//         {/* TRIP DETAILS */}
//         <Collapse
//           title={<p className="text-h6 3xl:text-h5 font-medium text-black">Trip Details</p>}
//           closeText={Icons.ic_chevron_down}
//           openText={Icons.ic_chevron_up}
//           isDefaultOpen
//           className="bg-[#F9FAFB] border border-[#98a2b3] rounded-3xl py-5 px-5 md:px-7"
//         >
//           {trips.map((trip, index) => (
//             <div key={trip.id} className="space-y-5">
//               <p className="text-base font-semibold text-gray-700">Trip {index + 1}</p>

//               <TripInfoWrapper title="Booking Type">
//                 <DurationDetails
//                   date={new Date(trip?.tripDetails?.tripStartDate || "")}
//                   time={new Date(trip?.tripDetails?.tripStartTime || "")}
//                   icon={Icons.ic_flag}
//                   iconColor="text-primary-500"
//                   title="Start"
//                 />
//               </TripInfoWrapper>

//               <TripInfoWrapper title="Itinerary">
//                 <SectionDetails
//                   title="Pick-up"
//                   description={trip?.tripDetails?.pickupLocation || "N/A"}
//                   isLocation
//                 />
//                 <SectionDetails
//                   title="Drop-off"
//                   description={trip?.tripDetails?.dropoffLocation || "N/A"}
//                   isLocation
//                 />
//                 <SectionDetails
//                   title="Areas of Use"
//                   description={trip?.tripDetails?.areaOfUse || "N/A"}
//                 />
//               </TripInfoWrapper>
//             </div>
//           ))}
//         </Collapse>
//       </div>

//       {/* RIGHT SIDE — COST BREAKDOWN */}
//       <div className="w-full md:w-[380px] lg:w-[400px]">
//         <CostBreakdown trips={trips} vehicleId={vehicleDetails?.data.id || ""} />
//       </div>
//     </div>
//   );
// }

// const TripInfoWrapper = ({
//   title,
//   children,
// }: {
//   title: string;
//   children: ReactNode;
// }) => (
//   <div className="bg-white rounded-3xl py-4 px-5 md:px-7 space-y-5 shadow-sm">
//     <p className="text-sm md:text-base font-semibold text-grey-800">{title}</p>
//     <div className="space-y-6">{children}</div>
//   </div>
// );

// const SectionDetails = ({
//   title,
//   description,
//   isLocation,
// }: {
//   title: string;
//   description: string | string[];
//   isLocation?: boolean;
// }) => (
//   <div className="space-y-3 text-sm md:text-base">
//     <div className="flex items-center gap-2">
//       {isLocation && Icons.ic_location}
//       <p className="text-grey-800 font-medium">{title}</p>
//     </div>

//     {Array.isArray(description) ? (
//       <ul className="space-y-2 text-[#98a2b3] text-xs">
//         {description.map((item, i) => (
//           <li key={i}>{item}</li>
//         ))}
//       </ul>
//     ) : (
//       <p className="text-[#98a2b3]">{description}</p>
//     )}
//   </div>
// );

// const DurationDetails = ({
//   date,
//   time,
//   icon,
//   iconColor,
//   title,
// }: {
//   date: Date;
//   time: Date;
//   icon: ReactNode;
//   iconColor: string;
//   title: string;
// }) => (
//   <div className="flex text-xs justify-between items-center text-sm md:text-base">
//     <p className="flex items-center gap-2">
//       <span className={cn("*:w-5 *:h-5", iconColor)}>{icon}</span>
//       <span>{title}</span>
//     </p>
//     <p>
//       {format(date, "do MMM yyyy")} | {format(time, "hh:mma")}
//     </p>
//   </div>
// );

