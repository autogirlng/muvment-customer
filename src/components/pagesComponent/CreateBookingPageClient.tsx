"use client";
import { useEffect, useState } from "react";
import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { FiClock, FiLock } from "react-icons/fi";
import BookingSummary from "@/components/Booking/CreateBooking/BookingSummary";
import Modal from "@/components/general/modal";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { useRouter, useParams } from "next/navigation";
import { useSafeBack } from "@/hooks/useSafeBack";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { clarityEvent } from "@/services/clarity";
import WelcomeOfferNote from "@/components/general/WelcomeOfferNote";

const steps = ["Confirm and pay"];

export default function CreateBookingPageClient() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetailsPublic | null>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    if (!params.id) {
      safeBack("/explore");
    }
  }, [params.id]);

  const fetchVehicleDetails = async () => {
    try {
      const result = await VehicleSearchService.getVehicleById(
        params?.id as string,
      );

      // The endpoint returns the vehicle object directly. Stay tolerant of an
      // array or an already-wrapped shape so a backend change can't break this.
      let v: any = result;
      if (Array.isArray(v)) v = v[0];
      if (v && v.data && v.data.id) v = v.data;

      if (v && v.id) {
        const wrapped = { data: v } as VehicleDetailsPublic;
        const photos = (v.photos || []).map((photo: any) => photo.cloudinaryUrl);
        setVehicleImages(photos);
        setVehicle(wrapped);
      } else {
        setVehicle(null);
      }
    } catch (error) {
      console.error("Failed to load vehicle:", error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clarityEvent("booking_started", { vehicle_id: params?.id as string });
    fetchVehicleDetails();
  }, []);

  const handleCurrentStep = (step: number) => {
    setCurrentStep(step);
  };

  if (loading) {
    return <ScreenLoader />;
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          We couldn&apos;t load this vehicle
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          It may no longer be available. Please go back and choose another
          vehicle.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => safeBack("/explore")}
            className="inline-flex items-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#0673ff" }}
          >
            Browse vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Focused checkout header (replaces the full site nav to keep the flow distraction-free) */}
      <header className="sticky top-0 z-30 bg-white border-b border-grey-100">
        <div className="max-w-[1200px] 3xl:max-w-[1320px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-[52px] py-3">
          <Link
            href="/"
            aria-label="Muvment home"
            className="col-start-1 justify-self-start"
          >
            <Image
              src="/images/image.png"
              alt="Muvment"
              width={1451}
              height={165}
              className="h-auto w-[132px] sm:w-[160px]"
              priority
            />
          </Link>
          <div className="col-start-2 hidden sm:flex items-center gap-1.5 justify-self-center text-sm font-medium text-grey-600">
            <FiLock className="w-4 h-4 text-grey-400" />
            <span>Secure checkout</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="col-start-3 justify-self-end inline-flex items-center rounded-full border border-grey-200 px-4 py-1.5 text-sm font-medium text-grey-600 hover:bg-grey-50 hover:text-grey-800 cursor-pointer"
          >
            Cancel
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
            Confirm your booking
          </h2>

          <WelcomeOfferNote />

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
        </div>
      </main>

      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)}>
        <div className="text-center px-2 pt-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F1FF]">
            <FiClock className="h-7 w-7 text-[#0673ff]" />
          </div>
          <h3 className="text-xl font-bold text-grey-900">You're almost done</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-grey-600">
            You're one step away from booking this vehicle. If you leave now your
            details won't be submitted, and the vehicle won't be held for you.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="w-full rounded-full bg-[#0673ff] px-5 py-3.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => safeBack("/explore")}
              className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-grey-500 hover:text-grey-700 cursor-pointer"
            >
              Leave and cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
