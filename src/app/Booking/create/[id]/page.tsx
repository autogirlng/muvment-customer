"use client";
import { useEffect, useState } from "react";
import cn from "classnames";
// import BackLink from "@/components/BackLink";
import Itinerary from "@/components/Booking/CreateBooking/Itinerary";
import { FullPageSpinner } from "@/components/general/spinner";
import BookingSummary from "@/components/Booking/CreateBooking/BookingSummary";
import PersonalInformation from "@/components/Booking/CreateBooking/Personalnformation";
import { Navbar } from "@/components/Navbar";
import BackLink from "@/components/general/backlink";
// import PickupsAndDropoffs from "@/components/VehicleBooking/PickupsAndDropoffs";
import { Stepper } from "@/components/Booking/CreateBooking/stepper";
// import { Stepper } from "@repo/ui/stepper";
// import useFetchVehicleById from "@/components/VehicleBooking/hooks/useFetchVehicleById";
import { useRouter } from "next/navigation";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import { useParams } from "next/navigation";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

const steps = ["Personal Information", "Itinerary", "Booking Summary"];

export default function CreateBooking() {
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetailsPublic | null>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);

  useEffect(() => {
    if (!params.id) {
      router.back();
    }
  }, [params.id]);

  // const { vehicle, perks, vehicleDetails, vehicleImages, isError, isLoading } =
  //     useFetchVehicleById({
  //         id: params?.id,
  //     });

  const fetchVehicleDetails = async () => {
    const data = await VehicleSearchService.getVehicleById(
      params?.id as string
    );
    const vehicleData = data as VehicleDetailsPublic[];

    if (vehicleData.length > 0) {
      const data = vehicleData[0].data;
      const photos = data.photos.map((photo) => {
        return photo.cloudinaryUrl;
      });
      setVehicleImages(photos);

      setVehicle(vehicleData[0]);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleCurrentStep = (step: number) => {
    setCurrentStep(step);
  };

  // if (isLoading) {
  //     return <FullPageSpinner />;
  // }

  return (
    <>
      <Navbar />
      <main className="pb-[188px] pt-[52px] md:pt-16 px-8 lg:px-[52px]">
        <div
          className={cn(
            "mx-auto space-y-8 md:space-y-[52px]",
            currentStep === 3
              ? "max-w-[1020px] 3xl:max-w-[1120px]"
              : "max-w-[1492px]"
          )}
        >
          <div className="mt-[40px] md:mt-[32px]">
            <BackLink backLink="/" />
            <h2 className="mt-3 font-bold text-black text-2xl">
              {currentStep === 3 ? "Summary" : "Book Ride"}
            </h2>
          </div>
          <Stepper steps={steps} currentStep={currentStep}>
            {currentStep === 0 && (
              <PersonalInformation
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={handleCurrentStep}
                vehicle={vehicle ?? null}
                vehicleImages={vehicleImages}
                type="user"
              />
            )}
            {currentStep === 1 && (
              <Itinerary
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={handleCurrentStep}
                vehicle={vehicle ?? null}
                vehicleImages={vehicleImages}
              />
            )}

            {currentStep === 2 && (
              <BookingSummary
                vehicle={vehicle ?? null}
                vehicleImages={vehicleImages}
                perks={[]}
                vehicleDetails={vehicle}
                type="user"
              />
            )}
          </Stepper>
        </div>
      </main>
    </>
  );
}
