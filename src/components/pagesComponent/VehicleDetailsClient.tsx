"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/general/modal";

import {
  FiHeart,
  FiLoader,
  FiArrowLeft,
  FiBell,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { SocialShareButton } from "@/components/general/share";
import { Carousel } from "@/components/utils/Carousel";
import { TripAccordion } from "@/components/Booking/TripAccordion";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { Reviews } from "@/components/Reviews";
import {
  VehicleBookingOptions,
  EstimatedBookingPrice,
} from "@/types/vehicleDetails";
import { BookingService } from "@/controllers/booking/bookingService";
import { trackPaymentClick } from "@/services/analytics";
import Footer from "../HomeComponent/Footer";
import { FavouriteVehicleService } from "@/controllers/booking/favouritevehicleservice";
import LoginPromptModal from "../Booking/Loginpromptmodal";

interface VehicleDetailsClientProps {
  initialVehicleData: any;
}

const VehicleDetailsClient: React.FC<VehicleDetailsClientProps> = ({
  initialVehicleData,
}) => {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState<any>(initialVehicleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingOptions, setBookingOptions] = useState<
    { option: string; value: string }[]
  >([]);
  const [pricing, setPricing] = useState<EstimatedBookingPrice | undefined>();
  const [continueBooking, setContinueBooking] = useState<boolean>(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [bookRideModal, setBookRideModal] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    setTrips,
    trips,
    deleteTrip,
    onChangeTrip,
    addTrip,
    toggleOpen,
    openTripIds,
    isTripFormsComplete,
    generateNextTripId,
  } = useItineraryForm();

  useEffect(() => {
    if (continueBooking) {
      setContinueBooking(false);
      setPricing(undefined);
    }
  }, [trips]);

  useEffect(() => {
    if (continueBooking) {
      setContinueBooking(false);
    }
  }, [couponCode]);

  const generateBookingOptions = () => {
    const types: VehicleBookingOptions[] = vehicle?.allPricingOptions;
    const options = types?.map((type) => {
      return { option: type.bookingTypeName, value: type.bookingTypeId };
    });
    return options;
  };

  useEffect(() => {
    if (vehicle) {
      const options = generateBookingOptions();
      setBookingOptions(options);
    }
  }, [vehicle]);

  useEffect(() => {
    sessionStorage.removeItem("trips");
    sessionStorage.removeItem("bookingId");
    setTrips([{ id: "trip-0", tripDetails: {} }]);
  }, []);

  const check = async () => {
    if (!vehicle?.id) return;
    try {
      const result = await FavouriteVehicleService.checkIsFavourite(vehicle.id);
      setIsFavorited(result);
    } catch (e) {
      console.error("Failed to check favourite status", e);
    }
  };

  useEffect(() => {
    if (!vehicle || !isAuthenticated) return;
    check();
  }, [vehicle, isAuthenticated]);

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsFavoriteLoading(true);
    try {
      const current = isFavorited ? [vehicle.id] : [];
      const { isFavourited } = await FavouriteVehicleService.toggleFavourite(
        vehicle.id,
        current,
      );
      setIsFavorited(isFavourited);
    } catch (e) {
      console.error("Failed to toggle favourite", e);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <FiLoader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-red-600 mb-4">
            {error || "Vehicle not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const estimatePrice = async () => {
    setIsEstimating(true);
    try {
      const tripSegments = trips.map((trip) => {
        const details = trip?.tripDetails;

        let pickupCoordinates: { lat: number; lng: number };
        let dropoffCoordinates: { lat: number; lng: number };
        try {
          pickupCoordinates = JSON.parse(`${details?.pickupCoordinates}`);
          dropoffCoordinates = JSON.parse(`${details?.dropoffCoordinates}`);
        } catch {
          throw new Error(
            "Please select your pickup and dropoff locations from the dropdown suggestions.",
          );
        }

        let areaOfUseCoordinates: { lat: number; lng: number } | null = null;
        if (details?.areaOfUseCoordinates) {
          try {
            areaOfUseCoordinates = JSON.parse(
              `${details?.areaOfUseCoordinates}`,
            );
          } catch (e) {
            console.error("Error parsing area of use", e);
          }
        }

        return {
          bookingTypeId: details?.bookingType,
          startDate: format(
            new Date(details?.tripStartDate || ""),
            "yyyy-MM-dd",
          ),
          startTime: format(
            new Date(details?.tripStartTime || ""),
            "HH:mm:ss",
          ),
          pickupLatitude: pickupCoordinates.lat,
          pickupLongitude: pickupCoordinates.lng,
          dropoffLatitude: dropoffCoordinates.lat,
          dropoffLongitude: dropoffCoordinates.lng,
          pickupLocationString: details?.pickupLocation,
          dropoffLocationString: details?.dropoffLocation,
          areaOfUse: areaOfUseCoordinates
            ? [
                {
                  areaOfUseLatitude: areaOfUseCoordinates.lat,
                  areaOfUseLongitude: areaOfUseCoordinates.lng,
                  areaOfUseName: details?.areaOfUse,
                },
              ]
            : [],
        };
      });

      const data: any = {
        vehicleId: vehicle.id,
        segments: tripSegments,
      };
      if (couponCode.trim() !== "") {
        data.couponCode = couponCode;
      }

      const pricing = await BookingService.calculateBooking(data);
      sessionStorage.setItem(
        "priceEstimateId",
        pricing.data.data.calculationId,
      );
      trackPaymentClick({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        amount: vehicle.price,
        step: "initiate",
      });
      if (couponCode.trim()) {
        sessionStorage.setItem("couponCode", couponCode);
      } else {
        sessionStorage.removeItem("couponCode");
      }
      setPricing(pricing);
      setContinueBooking(true);
    } catch (e: any) {
      console.error("Failed to estimate price", e);
      toast.error(
        e?.message ||
          "We couldn't estimate the price. Please check your trip details and try again.",
      );
      setPricing(undefined);
      setContinueBooking(false);
    } finally {
      setIsEstimating(false);
    }
  };

  const handlePrimaryAction = () => {
    if (!isTripFormsComplete) {
      toast.warning(
        "Please complete all trip details. Make sure to select your locations from the dropdown suggestions.",
      );
      return;
    }
    if (!continueBooking) {
      estimatePrice();
      return;
    }
    if (!isAuthenticated) {
      setBookRideModal(true);
      return;
    }
    router.push(`/booking/create/${vehicle.id}`);
  };

  const storedTrips =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("trips") || "[]")
      : [];
  const tripInitialValues =
    storedTrips.length > 0 ? storedTrips[storedTrips.length - 1] : null;

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <Navbar />
      <div className="min-h-screen w-full bg-gray-50 mt-15">
        <div className="min-h-screen bg-gray-50 p-0 sm:p-3 flex items-center justify-center flex-col">
          <div className="max-w-4xl flex flex-col w-full">
            <div className=" rounded-xl flex-shrink p-4 sm:p-6 space-y-4">
              <button
                className="cursor-pointer flex items-center space-x-1"
                onClick={() => router.back()}
              >
                <FiArrowLeft size={24} />
                <span>Back</span>
              </button>
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 w-full">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words max-w-full">
                  {vehicle.name || ""}
                </h1>

                <div className="flex flex-row items-center space-x-2 self-end sm:self-auto">
                  <SocialShareButton />

                  <button
                    onClick={handleToggleFavourite}
                    disabled={isFavoriteLoading}
                    aria-label={
                      isFavorited ? "Remove from favourites" : "Add to favourites"
                    }
                    className={`p-2 sm:p-2.5 rounded-full transition duration-150 cursor-pointer
                    ${isFavorited ? "bg-red-100 text-red-600" : "bg-red-50 hover:bg-red-100 text-red-600"}
                    ${isFavoriteLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {isFavoriteLoading ? (
                      <span className="block w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <FiHeart
                        size={16}
                        className={`sm:size-[18px] ${isFavorited ? "fill-red-500" : ""}`}
                      />
                    )}
                  </button>
                </div>
              </header>

              <Carousel
                urls={
                  vehicle.photos?.map((photo: any) => photo.cloudinaryUrl) || []
                }
              />
            </div>

            <div className="bg-[#F7F9FC] py-4 w-full px-4 rounded-t-xl space-y-3">
              <div className="flex items-center space-x-3">
                <FiBell
                  size={30}
                  className="p-2 bg-[#FBE2B7] rounded-lg border border-[#F38218] flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-800">
                  1 day advance notice required before booking
                </span>
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-3/5 space-y-8 mt-5">
                <div className="space-y-2">
                  <h2 className="text-lg text-gray-800 pb-1">
                    Vehicle Details
                  </h2>
                  <div className="flex flex-wrap items-center gap-4">
                    <VehicleDetailsChip
                      label="Make"
                      value={vehicle.vehicleMakeName || "N/A"}
                    />
                    <VehicleDetailsChip
                      label="Model"
                      value={vehicle.vehicleModelName || "N/A"}
                    />
                    <VehicleDetailsChip
                      label="Year"
                      value={vehicle.year || "N/A"}
                    />
                    <VehicleDetailsChip
                      label="Colour"
                      value={vehicle.vehicleColorName || "N/A"}
                    />
                    <VehicleDetailsChip
                      label="City"
                      value={vehicle.city || "N/A"}
                    />
                    <VehicleDetailsChip
                      label="Vehicle type"
                      value={vehicle.vehicleTypeName?.replaceAll("_", " ")}
                    />
                    <VehicleDetailsChip
                      label="Seating Capacity"
                      value={vehicle.numberOfSeats}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg">Description</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {vehicle.description || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg text-gray-800">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.vehicleFeatures?.length > 0 &&
                      vehicle.vehicleFeatures.map((feature: string) => {
                        return (
                          <FeatureTag key={feature}>{feature} </FeatureTag>
                        );
                      })}
                  </div>
                </div>
                <section>
                  <h2 className="text-lg text-gray-800 pb-1"> Reviews </h2>
                  <div>
                    <Reviews vehicleId={id as string} />
                  </div>
                </section>
              </div>

              <div className="w-full lg:w-2/5 border py-5 px-3 rounded-xl border-[#E4E7EC]">
                <div>
                  <h2 className="font-bold text-[17px]">Add Booking Details</h2>
                  <p className="text-sm my-4">Daily Itinerary</p>

                  {trips?.map((key, index) => {
                    return (
                      <TripAccordion
                        key={`${key.id}`}
                        day={`${index + 1}`}
                        id={key.id}
                        vehicle={vehicle}
                        initialValues={tripInitialValues}
                        deleteMethod={deleteTrip}
                        disabled={false}
                        onChangeTrip={onChangeTrip}
                        isCollapsed={!openTripIds.has(key.id)}
                        toggleOpen={() => toggleOpen(key.id)}
                        bookingOptions={bookingOptions}
                        vehicleId={id?.toString()}
                      />
                    );
                  })}
                  <button
                    onClick={() => addTrip(generateNextTripId())}
                    className="text-[#0673ff] mt-3 text-sm cursor-pointer border-0"
                  >
                    + Add Trip
                  </button>

                  <div className="mt-6 mb-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Have a Coupon? (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTag className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                      />
                    </div>
                  </div>

                  {pricing?.data && (
                    <div className="p-4 rounded-xl border border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Payment Summary
                      </h3>

                      <PriceRow
                        label="Base Price"
                        value={
                          pricing.data.data.basePrice +
                          pricing.data.data.platformFeeAmount
                        }
                      />

                      <PriceRow
                        label="Outskirts Surcharge"
                        value={pricing.data.data.geofenceSurcharge}
                        subLabel={
                          pricing.data.data.appliedGeofenceNames?.length > 0
                            ? `Applied to: ${pricing.data.data.appliedGeofenceNames.join(
                                ", ",
                              )}`
                            : null
                        }
                      />

                      {pricing.data.data.vatPercentage && (
                        <PriceRow
                          label="VAT Amount"
                          value={pricing.data.data.vatAmount}
                          subLabel={`${pricing.data.data.vatPercentage}%`}
                        />
                      )}

                      <PriceRow
                        label="Duration Discount"
                        value={pricing.data.data.discountAmount}
                        isDiscount
                      />

                      <PriceRow
                        label={`Coupon (${
                          pricing.data.data.appliedCouponCode || "Applied"
                        })`}
                        value={pricing.data.data.couponDiscountAmount}
                        isDiscount
                      />

                      <PriceRow
                        label="TOTAL"
                        value={Number(pricing.data.data.finalPrice)}
                        isTotal
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 mb-4 rounded-xl bg-orange-50 border border-orange-100 p-4 flex items-start gap-3 transition-all hover:bg-orange-100/50">
                  <FiInfo
                    className="text-orange-500 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                      Important Note
                    </span>
                    <p className="text-sm text-orange-900 leading-snug font-medium">
                      Kindly note that all prices on this website are within
                      city and does not cover interstate travels.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isEstimating}
                  className={`w-full py-4 mt-2 text-sm font-medium text-white rounded-full shadow-md transition duration-150 flex items-center justify-center gap-2 ${
                    isEstimating
                      ? "bg-blue-600 opacity-80 cursor-wait"
                      : !isTripFormsComplete
                        ? "bg-blue-600/60 cursor-pointer"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {isEstimating ? (
                    <>
                      <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Estimating...
                    </>
                  ) : !continueBooking || !isTripFormsComplete ? (
                    "Estimate Price"
                  ) : (
                    "Continue Booking"
                  )}
                </button>

                {vehicle?.discounts?.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Discounts
                    </h3>
                    {vehicle.discounts.map((discount: any, index: number) => (
                      <DiscountRow
                        key={index}
                        days={discount.durationName + " trips"}
                        discount={discount.percentage + "% off"}
                        color={"text-[#0aaf24]"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal isOpen={bookRideModal} onClose={() => setBookRideModal(false)}>
        <div className="flex flex-col px-[50px] py-[25px]">
          <h2 className="text-xl font-semibold mb-4">Book Ride</h2>

          <button
            className="w-full py-4 text-sm font-medium cursor-pointer bg-[#d0d5dd] text-black rounded-2xl  hover:opacity-80 "
            onClick={() =>
              router.push(`/booking/create/${vehicle.id}?user=guest`)
            }
          >
            Continue as guest
          </button>

          <button
            className="w-full py-4 mt-4 text-sm font-medium cursor-pointer bg-blue-600 text-white rounded-2xl hover:bg-blue-700 "
            onClick={() => router.push(`/auth/login`)}
          >
            Sign In
          </button>
        </div>
      </Modal>
    </>
  );
};

const PriceRow = ({
  label,
  value,
  isDiscount = false,
  isTotal = false,
  subLabel = null,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
  isTotal?: boolean;
  subLabel?: string | null;
}) => {
  if (value === 0 && !isTotal) return null;

  return (
    <div
      className={`flex justify-between items-start ${
        isTotal ? "mt-3 pt-3 border-t border-gray-200" : "mb-2"
      }`}
    >
      <div className="flex flex-col">
        <span
          className={`${
            isTotal
              ? "text-base font-bold text-gray-900"
              : "text-sm text-gray-600"
          }`}
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-gray-400 max-w-[180px] leading-tight">
            {subLabel}
          </span>
        )}
      </div>

      <span
        className={`font-medium ${
          isTotal
            ? "text-lg text-blue-600 font-bold"
            : isDiscount
              ? "text-green-600 text-sm"
              : "text-gray-900 text-sm"
        }`}
      >
        {isDiscount ? "-" : ""} NGN
        {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
};

const VehicleDetailsChip = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
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

export default VehicleDetailsClient;
