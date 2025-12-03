// import {
//     MappedInformation,
//     VehicleInformation,
//     VehiclePerksProp,
// } from "@/utils/types";
import { useRouter } from "next/navigation";
// import VehicleDetails from "../VehicleSummary/VehicleDetails";
// import Collapse from "@/components/general/collapsible";
// import Icons from "@/components/general/forms/icons";
import { Carousel } from "@/components/utils/Carousel";

type Props = {
    // vehicle: VehicleInformation | null;
    // vehicleImages: string[];
    // perks: VehiclePerksProp[];
    // vehicleDetails: MappedInformation[];
    photos: string[]
};

const Vehicle = ({ photos }: Props) => {
    const router = useRouter();

    return (
        <div className=" rounded-xl  flex-shrink p-4 sm:p-6 space-y-4">
            <Carousel urls={photos} />
        </div>
    );
};

export default Vehicle;
