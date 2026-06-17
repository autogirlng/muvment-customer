"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/services/vechilePriceUtiles";
import { format } from "date-fns";

const formatPlanRange = (
  startStr?: string,
  endStr?: string,
  count: number = 1,
) => {
  if (!startStr) return `Day 1 to Day ${count}`;
  try {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : start;
    if (count <= 1) return format(start, "do MMM");
    const sameMonth =
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();
    return sameMonth
      ? `${format(start, "do")} to ${format(end, "do MMM")}`
      : `${format(start, "do MMM")} to ${format(end, "do MMM")}`;
  } catch {
    return `Day 1 to Day ${count}`;
  }
};
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/general/modal";

import {
  FiHeart,
  FiLoader,
  FiArrowLeft,
  FiBell,
  FiTag,
  FiInfo,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import ScreenLoader from "@/components/utils/ScreenLoader";
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
  const [priceErrorMessage, setPriceErrorMessage] = useState<string>("");
  const [bookRideModal, setBookRideModal] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copiedAllDays, setCopiedAllDays] = useState(false);

  const {
    setTrips,
    trips,
    deleteTrip,
    onChangeTrip,
    addTrip,
    toggleOpen,
    openTripIds,
    isTripFormsComplete,
    missingByTrip,
    generateNextTripId,
    tripsVersion,
    applyToAllTrips,
    setNumberOfDays,
    sameForAllDays,
    setSameForAllDays,
    applySharedPlanChange,
  } = useItineraryForm();

  // Guards against an older in-flight estimate overwriting a newer one.
  const estimateSeq = useRef(0);

  useEffect(() => {
    setPriceErrorMessage("");
  }, [tripsVersion]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  useEffect(() => {
    if (continueBooking) {
      setContinueBooking(false);
      setPricing(undefined);
    }
  }, [trips]);

  useEffect(() => {
    if (continueBooking) {
      setContinueBooking(false);
      setPricing(undefined);
    }
  }, [couponCode]);

  // Estimate the price automatically once the trip form is complete, and re-run
  // it whenever the trip details or coupon change. Keyed off the trip content,
  // since field edits change trips without bumping tripsVersion; without this a
  // change would clear the price and never recalculate it. The footer button is
  // only used to confirm the booking.
  const tripsSignature = JSON.stringify(trips);
  useEffect(() => {
    if (!isTripFormsComplete) return;
    const timer = setTimeout(() => {
      estimatePrice();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTripFormsComplete, tripsSignature, couponCode]);

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
    sessionStorage.removeItem("bookingId");

    // Prefill the itinerary from the search params: pickup location, start date,
    // start time, booking type, and the trip length all carry over. Drop-off is
    // still chosen here.
    const params = new URLSearchParams(window.location.search);
    const location = params.get("location");
    const lat = params.get("lat");
    const lng = params.get("lng");
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const startTime = params.get("startTime");
    const bookingTypeParam = params.get("bookingType");
    const dropoffLocation = params.get("dropoffLocation");
    const dropoffLat = params.get("dropoffLat");
    const dropoffLng = params.get("dropoffLng");

    // Restore the saved itinerary when returning to the same search (for example
    // coming back from checkout to change details) so earlier choices like the
    // drop-off location are kept. A new search has a different signature and
    // falls through to a fresh seed below.
    const seedSig = JSON.stringify({
      location,
      lat,
      lng,
      startDate,
      endDate,
      startTime,
      bookingType: bookingTypeParam,
      dropoffLocation,
      dropoffLat,
      dropoffLng,
    });
    const hasSearch = !!(location || startDate || bookingTypeParam);
    try {
      const savedRaw = sessionStorage.getItem("trips");
      const saved = savedRaw ? JSON.parse(savedRaw) : null;
      if (
        hasSearch &&
        sessionStorage.getItem("tripsSeedSig") === seedSig &&
        Array.isArray(saved) &&
        saved.length > 0
      ) {
        setTrips(
          saved.map((t: Record<string, string>) => {
            const { id, ...details } = t;
            return { id: id || "trip-0", tripDetails: details };
          }),
        );
        return;
      }
    } catch {}

    const base: Record<string, string> = {};
    if (bookingTypeParam) base.bookingType = bookingTypeParam;
    if (location) base.pickupLocation = location;
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      base.pickupCoordinates = JSON.stringify({
        lat: Number(lat),
        lng: Number(lng),
      });
    }
    if (dropoffLocation) base.dropoffLocation = dropoffLocation;
    if (
      dropoffLat &&
      dropoffLng &&
      !isNaN(Number(dropoffLat)) &&
      !isNaN(Number(dropoffLng))
    ) {
      base.dropoffCoordinates = JSON.stringify({
        lat: Number(dropoffLat),
        lng: Number(dropoffLng),
      });
    }

    if (Object.keys(base).length === 0 && !startDate) {
      sessionStorage.removeItem("trips");
      sessionStorage.setItem("tripsSeedSig", seedSig);
      setTrips([{ id: "trip-0", tripDetails: {} }]);
      return;
    }

    // Trip length comes from the searched date range; defaults to a single day.
    let days = 1;
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00Z`).getTime();
      const end = new Date(`${endDate}T00:00:00Z`).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        days = Math.min(60, Math.floor((end - start) / 86400000) + 1);
      }
    }

    // Normalise the time to HH:mm:ss so the booking calculation can parse it.
    const timePart =
      startTime && startTime.length >= 4
        ? startTime.length === 5
          ? `${startTime}:00`
          : startTime
        : "";

    const flat: Record<string, string>[] = [];
    const nested: { id: string; tripDetails: Record<string, string> }[] = [];
    for (let i = 0; i < days; i++) {
      const id = `trip-${i}`;
      const details: Record<string, string> = { ...base };
      if (startDate) {
        const d = new Date(`${startDate}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + i);
        const dayStr = d.toISOString().slice(0, 10);
        details.tripStartDate = `${dayStr}T00:00:00`;
        if (timePart) details.tripStartTime = `${dayStr}T${timePart}`;
      }
      flat.push({ ...details, id });
      nested.push({ id, tripDetails: details });
    }

    sessionStorage.setItem("trips", JSON.stringify(flat));
    sessionStorage.setItem("tripsSeedSig", seedSig);
    setTrips(nested);
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
    return <ScreenLoader />;
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
    const seq = ++estimateSeq.current;
    setIsEstimating(true);
    setPriceErrorMessage("");
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

        let areaOfUseList: {
          areaOfUseLatitude: number;
          areaOfUseLongitude: number;
          areaOfUseName: string;
        }[] = [];
        if (details?.areasOfUse) {
          try {
            const parsedAreas = JSON.parse(details.areasOfUse);
            areaOfUseList = parsedAreas
              .filter(
                (a: any) =>
                  a &&
                  a.name &&
                  typeof a.lat === "number" &&
                  typeof a.lng === "number",
              )
              .map((a: any) => ({
                areaOfUseLatitude: a.lat,
                areaOfUseLongitude: a.lng,
                areaOfUseName: a.name,
              }));
          } catch (e) {
            console.error("Error parsing areas of use", e);
          }
        }
        if (areaOfUseList.length === 0 && areaOfUseCoordinates) {
          areaOfUseList = [
            {
              areaOfUseLatitude: areaOfUseCoordinates.lat,
              areaOfUseLongitude: areaOfUseCoordinates.lng,
              areaOfUseName: details?.areaOfUse || "",
            },
          ];
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
          areaOfUse: areaOfUseList,
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
      if (seq !== estimateSeq.current) return;
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
      setPricing(pricing as unknown as EstimatedBookingPrice);
      setContinueBooking(true);
    } catch (e: any) {
      if (seq !== estimateSeq.current) return;
      console.warn("Price estimate unavailable:", e?.message || e);
      setPriceErrorMessage(
        e?.message ||
          "We couldn't estimate the price. Please check your trip details and try again.",
      );
      setPricing(undefined);
      setContinueBooking(false);
    } finally {
      if (seq === estimateSeq.current) setIsEstimating(false);
    }
  };

  const handlePrimaryAction = () => {
    if (!isTripFormsComplete || isEstimating) return;
    // Recover from a failed estimate without leaving the page.
    if (priceErrorMessage && !continueBooking) {
      estimatePrice();
      return;
    }
    if (continueBooking) {
      router.push(
        `/booking/create/${vehicle.id}${isAuthenticated ? "" : "?user=guest"}`,
      );
    }
  };

  const storedTrips =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("trips") || "[]")
      : [];
  const tripInitialValues =
    storedTrips.length > 0 ? storedTrips[storedTrips.length - 1] : null;

  const lowestPrice = vehicle?.allPricingOptions?.length
    ? Math.min(
        ...vehicle.allPricingOptions.map((o: any) => Number(o.price) || 0),
      )
    : null;

  const primaryPhoto =
    vehicle?.photos?.find((ph: any) => ph.isPrimary)?.cloudinaryUrl ||
    vehicle?.photos?.[0]?.cloudinaryUrl ||
    "";

  const appliedCouponDiscount = Number(
    pricing?.data?.data?.couponDiscountAmount || 0,
  );
  const couponState: "none" | "pending" | "applied" | "invalid" =
    !couponCode.trim()
      ? "none"
      : !pricing?.data
        ? "pending"
        : appliedCouponDiscount > 0
          ? "applied"
          : "invalid";

  const selectedBookingTypeName = (
    vehicle?.allPricingOptions?.find(
      (o: any) => o.bookingTypeId === trips?.[0]?.tripDetails?.bookingType,
    )?.bookingTypeName || ""
  )
    .trim()
    .toLowerCase();
  // Only the hourly within-city types (12h/24h) span multiple days. Airport,
  // boat, interstate, and monthly are single-segment bookings.
  // Multi-day applies to within-state bookings, i.e. anything that is not a
  // single-segment type, so the day count seeded from the searched date range
  // is kept regardless of how the within-state type is named.
  const allowsMultiDay = !/airport|boat|interstate|month/i.test(
    selectedBookingTypeName,
  );
  const bookingNoteTitle = selectedBookingTypeName.includes("airport")
    ? "Airport pickup"
    : selectedBookingTypeName.includes("interstate")
      ? "Interstate trip"
      : selectedBookingTypeName.includes("hour")
        ? "Within-city booking"
        : "Important note";
  const bookingNote = selectedBookingTypeName.includes("airport")
    ? "Airport pickup is a one-way trip to your chosen location. Outskirts stops can be added and will be reflected in the price."
    : selectedBookingTypeName.includes("interstate")
      ? "Interstate trips are priced for travel between states, based on your route."
      : selectedBookingTypeName.includes("hour")
        ? "This is a within-city booking for the period you select, so you can move around central locations freely. Going to an outskirts area can be added and will be reflected in the price."
        : "Prices shown are for trips within the city. Outskirts areas can be added and will be reflected in the price.";

  const bookingMain = (
    <>
                <div>
                  <h2 className="font-bold text-[17px]">Add Booking Details</h2>
                  <div className="mt-2 mb-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Daily Itinerary
                    </p>
                    <p className="text-xs text-gray-500">
                      Add a stop for each day you need the car.
                    </p>
                  </div>

                  {allowsMultiDay && trips.length > 0 && (
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          Trip length
                        </p>
                        <p className="text-[11px] leading-snug text-gray-500">
                          Set days once; fill one plan for all.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Fewer days"
                          onClick={() => setNumberOfDays(trips.length - 1)}
                          disabled={trips.length <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E7EC] text-gray-700 disabled:opacity-40"
                        >
                          &minus;
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={trips.length}
                          onChange={(e) =>
                            setNumberOfDays(
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                          className="h-7 w-11 rounded-lg border border-[#E4E7EC] text-center text-sm text-gray-800 focus:border-[#0673ff] focus:outline-none"
                        />
                        <button
                          type="button"
                          aria-label="More days"
                          onClick={() => setNumberOfDays(trips.length + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E7EC] text-gray-700"
                        >
                          +
                        </button>
                        <span className="ml-0.5 text-xs text-gray-600">
                          {trips.length === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>
                  )}

                  {priceErrorMessage && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2.5">
                      <FiAlertCircle
                        className="mt-0.5 flex-shrink-0 text-[#D42620]"
                        size={16}
                      />
                      <p className="text-xs text-[#912018]">
                        {priceErrorMessage}
                      </p>
                    </div>
                  )}

                  {trips.length <= 1 ? (
                    trips.map((key, index) => (
                      <TripAccordion
                        key={`${key.id}-${tripsVersion}`}
                        day={`${index + 1}`}
                        id={key.id}
                        vehicle={vehicle}
                        initialValues={
                          key.tripDetails &&
                          Object.keys(key.tripDetails).length > 0
                            ? key.tripDetails
                            : tripInitialValues
                        }
                        deleteMethod={deleteTrip}
                        disabled={false}
                        onChangeTrip={onChangeTrip}
                        isCollapsed={false}
                        toggleOpen={() => toggleOpen(key.id)}
                        bookingOptions={bookingOptions}
                        vehicleId={vehicle.id}
                      />
                    ))
                  ) : sameForAllDays ? (
                    <>
                      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-3 py-2 text-xs text-[#0560d6]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>
                          One plan for all {trips.length} days. Fill it once; every
                          day is set.
                        </span>
                      </div>
                      {trips[0] && (
                        <TripAccordion
                          key={`plan-${tripsVersion}`}
                          day={`${1}`}
                          dayLabel={formatPlanRange(
                            trips[0]?.tripDetails?.tripStartDate,
                            trips[trips.length - 1]?.tripDetails?.tripStartDate,
                            trips.length,
                          )}
                          daySubLabel={`${trips.length} days`}
                          id={trips[0].id || ""}
                          vehicle={vehicle}
                          initialValues={
                            trips[0].tripDetails &&
                            Object.keys(trips[0].tripDetails).length > 0
                              ? trips[0].tripDetails
                              : tripInitialValues
                          }
                          deleteMethod={() => {}}
                          disabled={false}
                          onChangeTrip={(_id, details) =>
                            applySharedPlanChange(details)
                          }
                          isCollapsed={!openTripIds.has(trips[0].id || "")}
                          toggleOpen={() => toggleOpen(trips[0].id || "")}
                          bookingOptions={bookingOptions}
                          vehicleId={vehicle.id}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setSameForAllDays(false)}
                        className="mt-2 text-[#0673ff] text-xs font-medium cursor-pointer"
                      >
                        Need a day to be different?
                      </button>
                    </>
                  ) : (
                    <>
                      {trips?.map((key, index) => (
                        <TripAccordion
                          key={`${key.id}-${tripsVersion}`}
                          day={`${index + 1}`}
                          id={key.id}
                          vehicle={vehicle}
                          initialValues={
                            key.tripDetails &&
                            Object.keys(key.tripDetails).length > 0
                              ? key.tripDetails
                              : tripInitialValues
                          }
                          deleteMethod={deleteTrip}
                          disabled={false}
                          onChangeTrip={onChangeTrip}
                          isCollapsed={!openTripIds.has(key.id)}
                          toggleOpen={() => toggleOpen(key.id)}
                          bookingOptions={bookingOptions}
                          vehicleId={vehicle.id}
                        />
                      ))}
                      <button
                        onClick={() => addTrip(generateNextTripId())}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#0673ff]/40 text-[#0673ff] text-sm font-medium py-2.5 hover:bg-[#0673ff]/5 transition cursor-pointer"
                      >
                        + Add a different day
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          applyToAllTrips(trips[0]?.id || "");
                          setSameForAllDays(true);
                        }}
                        className="mt-2 w-full text-gray-600 text-xs cursor-pointer"
                      >
                        Use one plan for all days
                      </button>
                    </>
                  )}

                  <div className="mt-6 mb-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Have a coupon? (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTag
                          className={
                            couponState === "applied"
                              ? "text-green-500"
                              : couponState === "invalid"
                                ? "text-red-400"
                                : "text-gray-400"
                          }
                        />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className={`block w-full pl-10 pr-10 py-2 border rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 sm:text-sm transition duration-150 ease-in-out ${
                          couponState === "applied"
                            ? "border-green-400 focus:ring-green-500 focus:border-green-500"
                            : couponState === "invalid"
                              ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {couponState === "applied" && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FiCheckCircle className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {couponState === "applied" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
                        Coupon applied, you save{" "}
                        {formatCurrency(appliedCouponDiscount)}
                      </p>
                    )}
                    {couponState === "invalid" && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        We couldn&apos;t apply this code. Check it and estimate
                        again.
                      </p>
                    )}
                    {couponState === "pending" && (
                      <p className="mt-1.5 text-xs text-gray-400">
                        Tap Estimate Price to apply your coupon.
                      </p>
                    )}
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

                      {pricing.data.data.discountAmount > 0 && (
                        <PriceRow
                          label="Duration Discount"
                          value={pricing.data.data.discountAmount}
                          isDiscount
                        />
                      )}

                      {pricing.data.data.couponDiscountAmount > 0 && (
                        <PriceRow
                          label={`Coupon (${
                            pricing.data.data.appliedCouponCode || couponCode
                          })`}
                          value={pricing.data.data.couponDiscountAmount}
                          isDiscount
                        />
                      )}

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
                      {bookingNoteTitle}
                    </span>
                    <p className="text-sm text-orange-900 leading-snug font-medium">
                      {bookingNote}
                    </p>
                  </div>
                </div>
    </>
  );

  const FIELD_LABELS: Record<string, string> = {
    tripStartDate: "Trip date",
    tripStartTime: "Pickup time",
    pickupLocation: "Pickup location",
    pickupCoordinates: "Pickup location",
    dropoffLocation: "Drop-off location",
    dropoffCoordinates: "Drop-off location",
  };
  const labelsForFields = (fields: string[]) => {
    const out: string[] = [];
    for (const f of fields) {
      const label = FIELD_LABELS[f];
      if (label && !out.includes(label)) out.push(label);
    }
    return out;
  };
  const pendingByDay = (missingByTrip || [])
    .map((m) => ({
      day: trips.findIndex((t) => t.id === m.id) + 1,
      labels: labelsForFields(m.fields),
    }))
    .filter((d) => d.labels.length > 0);
  const pendingAllSame =
    pendingByDay.length > 0 &&
    pendingByDay.every(
      (d) => d.labels.join("|") === pendingByDay[0].labels.join("|"),
    );

  const pendingChecklist =
    !isTripFormsComplete && pendingByDay.length > 0 ? (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Add these to see your price
        </p>
        {pendingAllSame || pendingByDay.length === 1 ? (
          <ul className="mt-2 space-y-1.5">
            {pendingByDay[0].labels.map((l) => (
              <li
                key={l}
                className="flex items-center gap-2 text-sm text-amber-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {l}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 space-y-2">
            {pendingByDay.map((d) => (
              <div key={d.day}>
                <p className="text-xs font-semibold text-amber-900">
                  Day {d.day}
                </p>
                <ul className="mt-1 space-y-1">
                  {d.labels.map((l) => (
                    <li
                      key={l}
                      className="flex items-center gap-2 text-sm text-amber-800"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null;

  const isPricePending =
    isTripFormsComplete && !continueBooking && !priceErrorMessage;
  const isPriceLoading = isEstimating || isPricePending;
  const canConfirmBooking = continueBooking && !isEstimating;
  const canRetryEstimate =
    isTripFormsComplete &&
    !continueBooking &&
    !isEstimating &&
    !!priceErrorMessage;

  const bookingCTA = (
    <>
      {pendingChecklist && <div className="mb-3">{pendingChecklist}</div>}
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={!canConfirmBooking && !canRetryEstimate}
                  className={`w-full py-4 mt-2 text-sm font-medium text-white rounded-full shadow-md transition duration-150 flex items-center justify-center gap-2 ${
                    isPriceLoading
                      ? "bg-blue-600 opacity-80 cursor-wait"
                      : canConfirmBooking || canRetryEstimate
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-blue-600/60 cursor-not-allowed"
                  }`}
                >
                  {isPriceLoading ? (
                    <>
                      <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calculating price...
                    </>
                  ) : canRetryEstimate ? (
                    "Retry"
                  ) : canConfirmBooking ? (
                    "Confirm booking"
                  ) : (
                    "Complete your trip details"
                  )}
                </button>
    </>
  );

  const bookingDiscounts = vehicle?.discounts?.length > 0 && (
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
                );

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        vehicleName={vehicle?.name}
      />
      <Navbar />
      <div className="min-h-screen w-full bg-gray-50 mt-24">
        <div className="min-h-screen bg-gray-50 p-0 sm:p-3 flex items-center justify-center flex-col">
          <div className="max-w-4xl flex flex-col w-full">
            <div className=" rounded-xl flex-shrink p-4 sm:p-6 space-y-4">
              <button
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
                onClick={() => router.back()}
              >
                <FiArrowLeft size={18} />
                <span>Back</span>
              </button>
              <header className="flex flex-row items-start justify-between gap-3 w-full">
                <h1 className="min-w-0 flex-1 text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words">
                  {vehicle.name || ""}
                </h1>

                <div className="flex items-center gap-2 shrink-0">
                  <SocialShareButton triggerClassName="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition cursor-pointer" />

                  <button
                    onClick={handleToggleFavourite}
                    disabled={isFavoriteLoading}
                    aria-label={
                      isFavorited ? "Remove from favourites" : "Add to favourites"
                    }
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isFavorited
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-red-500"
                    } ${isFavoriteLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {isFavoriteLoading ? (
                      <span className="block w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <FiHeart
                        size={18}
                        className={isFavorited ? "fill-red-500" : ""}
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
                  {vehicle?.advanceNotice || "1 day"} advance notice required
                  before booking
                </span>
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="w-full lg:w-3/5 space-y-8 mt-5 lg:sticky lg:top-24 lg:self-start">
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
                    {typeof vehicle.willProvideDriver === "boolean" && (
                      <VehicleDetailsChip
                        label="Driver"
                        value={
                          vehicle.willProvideDriver
                            ? "Included"
                            : "Not included"
                        }
                      />
                    )}
                    {typeof vehicle.willProvideFuel === "boolean" && (
                      <VehicleDetailsChip
                        label="Fuel"
                        value={
                          vehicle.willProvideFuel ? "Included" : "Not included"
                        }
                      />
                    )}
                    {vehicle.maxTripDuration && (
                      <VehicleDetailsChip
                        label="Max trip"
                        value={vehicle.maxTripDuration}
                      />
                    )}
                  </div>
                </div>

                {vehicle.allPricingOptions?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-lg text-gray-800">Pricing</h2>
                    {(() => {
                      const opts = vehicle.allPricingOptions || [];
                      const isWithinState = (name: string) => {
                        const n = (name || "").toLowerCase();
                        return n.includes("hour") || n.includes("month");
                      };
                      const within = opts.filter((o: any) =>
                        isWithinState(o.bookingTypeName),
                      );
                      const standalone = opts.filter(
                        (o: any) => !isWithinState(o.bookingTypeName),
                      );
                      const row = (label: string, value: string, key: string) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-3 bg-[#F0F2F5] rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {label}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {value}
                          </span>
                        </div>
                      );
                      return (
                        <div className="space-y-4">
                          {within.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Within state booking
                              </p>
                              {within.map((opt: any) =>
                                row(
                                  opt.bookingTypeName?.trim(),
                                  formatCurrency(Number(opt.price || 0)),
                                  opt.bookingTypeId,
                                ),
                              )}
                              {vehicle.extraHourlyRate
                                ? row(
                                    "Extra hour",
                                    `${formatCurrency(
                                      Number(vehicle.extraHourlyRate),
                                    )}/hr`,
                                    "extra-hour",
                                  )
                                : null}
                            </div>
                          )}
                          {standalone.length > 0 && (
                            <div className="space-y-2">
                              {within.length > 0 && (
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Other bookings
                                </p>
                              )}
                              {standalone.map((opt: any) =>
                                row(
                                  opt.bookingTypeName?.trim(),
                                  formatCurrency(Number(opt.price || 0)),
                                  opt.bookingTypeId,
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <p className="text-xs text-gray-400">
                      Final price depends on your itinerary. Use Estimate Price
                      for an exact quote.
                    </p>
                  </div>
                )}

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
                    <Reviews vehicleId={vehicle.id} />
                  </div>
                </section>
              </div>

              {!isMobile && (
                <div className="w-full lg:w-2/5 border py-5 px-3 rounded-xl border-[#E4E7EC] lg:sticky lg:top-24 lg:self-start">
                  {bookingMain}
                  {bookingCTA}
                  {bookingDiscounts}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isMobile && (
        <>
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
            <div className="leading-tight">
              {lowestPrice != null ? (
                <>
                  <p className="text-[11px] text-gray-500">From</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(lowestPrice)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  Book this vehicle
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex-1 max-w-[60%] bg-[#0673ff] hover:bg-[#0560d6] text-white font-semibold py-3 rounded-full transition cursor-pointer"
            >
              Book this car
            </button>
          </div>

          {sheetOpen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 shrink-0">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={vehicle?.name || "Vehicle"}
                    className="w-16 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-gray-900 truncate">
                    {vehicle?.name}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {[
                      vehicle?.vehicleTypeName?.replaceAll("_", " "),
                      vehicle?.numberOfSeats
                        ? `${vehicle.numberOfSeats} seats`
                        : null,
                      lowestPrice != null
                        ? `from ${formatCurrency(lowestPrice)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close booking"
                  className="p-2 -mr-1 rounded-full hover:bg-gray-100 cursor-pointer shrink-0"
                >
                  <FiX size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {bookingMain}
                {bookingDiscounts}
              </div>
              <div className="border-t border-gray-200 px-4 py-3 shrink-0">
                {bookingCTA}
              </div>
            </div>
          )}
        </>
      )}
      <Footer />
      {isMobile && <div aria-hidden className="h-20" />}
      <Modal isOpen={bookRideModal} onClose={() => setBookRideModal(false)}>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            {primaryPhoto ? (
              <img
                src={primaryPhoto}
                alt={vehicle?.name || "Vehicle"}
                className="w-16 h-12 rounded-lg object-cover shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {vehicle?.name}
              </p>
              {pricing?.data?.data?.finalPrice ? (
                <p className="text-xs text-gray-500">
                  Estimated total{" "}
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(Number(pricing.data.data.finalPrice))}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {[
                    vehicle?.vehicleTypeName?.replaceAll("_", " "),
                    vehicle?.numberOfSeats
                      ? `${vehicle.numberOfSeats} seats`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            You&apos;re almost there
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Confirm your trip in the next step. Book as a guest in seconds, or
            sign in to save it to your account.
          </p>

          <button
            onClick={() =>
              router.push(`/booking/create/${vehicle.id}?user=guest`)
            }
            className="w-full py-3.5 text-sm font-semibold text-white rounded-full bg-[#0673ff] hover:bg-[#0560d6] shadow-sm transition cursor-pointer"
          >
            Continue as guest
          </button>

          <div className="mt-4 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Have an account, or want one?
            </p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">
              Sign in to track your bookings and check out faster next time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/auth/login`)}
                className="flex-1 py-2.5 text-sm font-medium rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50 transition cursor-pointer"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push(`/auth/register`)}
                className="flex-1 py-2.5 text-sm font-medium rounded-full border border-[#0673ff]/40 text-[#0673ff] hover:bg-[#0673ff]/5 transition cursor-pointer"
              >
                Create account
              </button>
            </div>
          </div>
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
