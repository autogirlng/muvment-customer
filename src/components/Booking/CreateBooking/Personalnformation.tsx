import PersonalInformationForm from "./PersonalInformationForm";
import BookingVehicleAside from "./BookingVehicleAside";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";

type Props = {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicle: VehicleDetailsPublic | null;
    vehicleImages: string[];
    type: "user" | "guest";
};

const PersonalInformation = ({
    steps,
    currentStep,
    setCurrentStep,
    vehicle,
    vehicleImages,
    type,
}: Props) => {
    return (
        <div className="flex flex-col-reverse lg:flex-row lg:justify-between items-start gap-8 lg:gap-10">
            <div className="w-full lg:flex-1">
                <PersonalInformationForm
                    steps={steps}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    vehicleId={vehicle?.data.id ?? ""}
                    type={type}
                />
            </div>
            <BookingVehicleAside vehicle={vehicle} vehicleImages={vehicleImages} />
        </div>
    );
};

export default PersonalInformation;
