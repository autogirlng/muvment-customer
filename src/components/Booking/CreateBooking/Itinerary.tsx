import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import ItineraryForm from "./ItineraryForm";

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
    <div className="flex justify-between flex-col md:flex-row items-start gap-8">
      <ItineraryForm
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        vehicleId={vehicle?.id ?? ""}
      />
      {/* <VehicleInformationCard vehicle={vehicle} vehicleImages={vehicleImages} /> */}
    </div>
  );
};

export default Itinerary;
