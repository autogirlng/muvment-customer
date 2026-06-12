"use client";
import { useEffect, useState } from "react";
import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Itinerary from "@/components/Booking/CreateBooking/Itinerary";
import BookingSummary from "@/components/Booking/CreateBooking/BookingSummary";
import PersonalInformation from "@/components/Booking/CreateBooking/Personalnformation";
import { Stepper } from "@/components/Booking/CreateBooking/stepper";
import Modal from "@/components/general/modal";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { useRouter, useParams } from "next/navigation";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

const steps = ["Personal Information", "Itinerary", "Booking Summary"];

export default function CreateBookingPageClient() {
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetailsPublic | null>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    if (!params.id) {
      router.back();
    }
  }, [params.id]);

  const fetchVehicleDetails = async () => {
    try {
      const data = await VehicleSearchService.getVehicleById(
        params?.id as string,
      );
      const vehicleData = data as VehicleDetailsPublic[];

      if (vehicleData.length > 0) {
        const photos = vehicleData[0].data.photos.map(
          (photo) => photo.cloudinaryUrl,
        );
        setVehicleImages(photos);
        setVehicle(vehicleData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, []);

  const handleCurrentStep = (step: number) => {
    setCurrentStep(step);
  };

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <>
      {/* Focused checkout header (replaces the full site nav to keep the flow distraction-free) */}
      <header className="sticky top-0 z-30 bg-white border-b border-grey-100">
        <div className="max-w-[1200px] 3xl:max-w-[1320px] mx-auto flex items-center justify-between px-6 lg:px-[52px] py-3">
          <Link href="/" aria-label="Muvment home">
            <Image
              src="/images/image.png"
              alt="Muvment"
              width={130}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="inline-flex items-center gap-1.5 text-sm text-grey-500 hover:text-grey-800 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </header>

      <main className="pb-[188px] pt-8 px-6 lg:px-[52px] min-h-screen">
        <div
          className={cn(
            "mx-auto space-y-8 md:space-y-[40px]",
            "max-w-[1200px] 3xl:max-w-[1320px]",
          )}
        >
          <h2 className="mt-2 font-bold text-black text-2xl">
            {currentStep === 2 ? "Summary" : "Book Ride"}
          </h2>

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
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={handleCurrentStep}
              />
            )}
          </Stepper>
        </div>
      </main>

      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)}>
        <div className="space-y-4 pr-6">
          <h3 className="text-lg font-bold text-grey-900">
            Cancel this booking?
          </h3>
          <p className="text-sm text-grey-600">
            Your progress so far will be lost and you will go back to browsing.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="rounded-full border border-grey-300 px-5 py-2.5 text-sm font-medium text-grey-700 hover:bg-grey-50 cursor-pointer"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full bg-[#D42620] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
            >
              Yes, cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
