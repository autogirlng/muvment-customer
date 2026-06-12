import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import ItineraryForm from "./ItineraryForm";
import BookingVehicleAside from "./BookingVehicleAside";

const Itinerary = ({
    steps,
    currentStep,
    setCurrentStep,
    vehicle,
    vehicleImages,
}: {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicle: VehicleDetailsPublic | null;
    vehicleImages: string[];
}) => {
    return (
        <div className="flex flex-col-reverse lg:flex-row lg:justify-between items-start gap-8 lg:gap-10">
            <div className="w-full lg:flex-1">
                <ItineraryForm
                    steps={steps}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                />
            </div>
            <BookingVehicleAside vehicle={vehicle} vehicleImages={vehicleImages} />
        </div>
    );
};

export default Itinerary;
