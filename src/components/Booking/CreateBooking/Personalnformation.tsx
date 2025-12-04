import PersonalInformationForm from "./PersonalInformationForm";
import VehicleInformationCard from "../VehicleCard";
// import { VehicleInformation } from "@/utils/types";
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
    <div className="flex justify-between flex-col md:flex-row items-start gap-8">
      <PersonalInformationForm
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        vehicleId={vehicle?.id ?? ""}
        type={type}
      />
      {/* <VehicleInformationCard  /> */}
    </div>
  );
};

export default PersonalInformation;
