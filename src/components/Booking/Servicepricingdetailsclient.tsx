"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiCalendar,
  FiInfo,
  FiMapPin,
  FiClock,
  FiChevronDown,
  FiTrash2,
  FiPlus,
  FiShield,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import Footer from "../HomeComponent/Footer";
import { ServicePricingShowcase } from "@/types/Servicepricing";
import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { ServicePricingStorage } from "@/utils/Servicepricingstorage";
import DateInput, { CalendarValue } from "@/components/general/forms/DateInput";
import TimeInput from "@/components/general/forms/TimeInput";
import SelectInput from "@/components/general/forms/select";
import { GoogleMapsLocationInput } from "@/components/general/forms/GoogleMapsLocationInput";
import Cookies from "js-cookie";
import WelcomeOfferNote from "@/components/general/WelcomeOfferNote";

interface TripDetails {
  id: string;
  bookingType: string;
  tripStartDate: string;
  tripStartTime: string;
  pickupLocation: string;
  pickupCoordinates: { lat: number; lng: number } | null;
  dropoffLocation: string;
  dropoffCoordinates: { lat: number; lng: number } | null;
}

interface Trip {
  id: string;
  tripDetails: Partial<TripDetails>;
}

const naira = (n?: number) => `\u20a6${Number(n || 0).toLocaleString()}`;

// Render catalogue names in a readable case ("EXECUTIVE SUV" -> "Executive SUV").
const prettyName = (s?: string) =>
  (s || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === "suv" ? "SUV" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

const hoursFromName = (name?: string): number => {
  if (!name || /month/i.test(name)) return 0;
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

// Map a hero duration token (3h, 6h, 12h, 24h, monthly) to a priced duration.
const matchPriceId = (
  token: string | null,
  prices: { bookingTypeId: string; bookingTypeName: string }[],
): string => {
  if (!token || !prices?.length) return "";
  if (/month/i.test(token)) {
    return (
      prices.find((p) => /month/i.test(p.bookingTypeName))?.bookingTypeId || ""
    );
  }
  const n = parseInt(token, 10);
  if (!n) return "";
  return (
    prices.find((p) => {
      const m = p.bookingTypeName.match(/\d+/);
      return m && parseInt(m[0], 10) === n && /hour/i.test(p.bookingTypeName);
    })?.bookingTypeId || ""
  );
};

const tripComplete = (d: Partial<TripDetails>) =>
  !!(
    d.bookingType &&
    d.tripStartDate &&
    d.tripStartTime &&
    d.pickupLocation &&
    d.pickupCoordinates &&
    d.dropoffLocation &&
    d.dropoffCoordinates
  );

const ServicePricingBookingPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.id as string;
  const durationToken = searchParams?.get("duration") || null;

  const [pricing, setPricing] = useState<ServicePricingShowcase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([{ id: "trip-0", tripDetails: {} }]);
  const [openTripIds, setOpenTripIds] = useState<Set<string>>(
    new Set(["trip-0"]),
  );
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const estimateSeq = useRef(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyCar, setShowStickyCar] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCar(!entry.isIntersecting),
      { rootMargin: "-96px 0px 0px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pricing]);

  useEffect(() => {
    if (slug) fetchPricingData();
  }, [slug]);

  // Preselect the duration handed over from the hero and carry the typed pickup.
  useEffect(() => {
    if (!pricing) return;
    const prices = pricing.prices || [];
    const preId = matchPriceId(durationToken, prices);
    if (preId) {
      setTrips((prev) =>
        prev.map((t, i) =>
          i === 0
            ? { ...t, tripDetails: { ...t.tripDetails, bookingType: preId } }
            : t,
        ),
      );
    }
    try {
      const raw = sessionStorage.getItem("muvment:hourlyPickup");
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p.lat === "number" && typeof p.lng === "number") {
          setTrips((prev) =>
            prev.map((t, i) =>
              i === 0
                ? {
                    ...t,
                    tripDetails: {
                      ...t.tripDetails,
                      pickupLocation: p.name || "",
                      pickupCoordinates: { lat: p.lat, lng: p.lng },
                    },
                  }
                : t,
            ),
          );
        }
        sessionStorage.removeItem("muvment:hourlyPickup");
      }
    } catch {
      // sessionStorage may be unavailable; the pickup field stays blank.
    }
  }, [pricing, durationToken]);

  useEffect(() => {
    Cookies.remove("servicePricingBookingId");
  }, [trips]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedData: any = ServicePricingStorage.getFromStorage();
      if (storedData && storedData.slug === slug) {
        setPricing(storedData);
        setLoading(false);
        return;
      }
      const data = await ServicePricingService.getServicePricingBySlug(slug);
      if (!data) {
        setError("Service pricing not found");
        setLoading(false);
        return;
      }
      setPricing(data);
      ServicePricingStorage.saveToStorage(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pricing details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    ServicePricingStorage.clearStorage();
    router.back();
  };

  const allComplete = useMemo(
    () => trips.length > 0 && trips.every((t) => tripComplete(t.tripDetails)),
    [trips],
  );

  const addTrip = () => {
    const newId = `trip-${Date.now()}`;
    const lastTrip = trips[trips.length - 1];
    const prefilled: Partial<TripDetails> = lastTrip
      ? {
          bookingType: lastTrip.tripDetails.bookingType,
          pickupLocation: lastTrip.tripDetails.pickupLocation,
          pickupCoordinates: lastTrip.tripDetails.pickupCoordinates,
          dropoffLocation: lastTrip.tripDetails.dropoffLocation,
          dropoffCoordinates: lastTrip.tripDetails.dropoffCoordinates,
        }
      : {};
    setTrips([...trips, { id: newId, tripDetails: prefilled }]);
    setOpenTripIds(new Set([newId]));
  };

  const deleteTrip = (id: string) => {
    if (trips.length === 1) return;
    setTrips(trips.filter((trip) => trip.id !== id));
    const newOpenIds = new Set(openTripIds);
    newOpenIds.delete(id);
    setOpenTripIds(newOpenIds);
  };

  const toggleTrip = (id: string) => {
    const newOpenIds = new Set(openTripIds);
    if (newOpenIds.has(id)) newOpenIds.delete(id);
    else newOpenIds.add(id);
    setOpenTripIds(newOpenIds);
  };

  const updateTrip = (id: string, field: string, value: any) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === id
          ? { ...trip, tripDetails: { ...trip.tripDetails, [field]: value } }
          : trip,
      ),
    );
  };

  // Live estimate: recalculates whenever the schedule is complete. The previous
  // price stays on screen during recalculation so the page does not flash.
  const runEstimate = useCallback(async () => {
    if (!pricing || !allComplete) return;
    const seq = ++estimateSeq.current;
    setIsEstimating(true);
    setEstimateError(null);
    try {
      const requestBody = {
        servicePricingId: pricing.servicePricingId,
        trips: trips.map((trip) => ({
          bookingTypeId: trip.tripDetails.bookingType,
          pickupLatitude: trip.tripDetails.pickupCoordinates?.lat || 0.1,
          pickupLongitude: trip.tripDetails.pickupCoordinates?.lng || 0.1,
          dropoffLatitude: trip.tripDetails.dropoffCoordinates?.lat || 0.1,
          dropoffLongitude: trip.tripDetails.dropoffCoordinates?.lng || 0.1,
        })),
      };
      const response =
        await ServicePricingService.calulateSpecialBooking(requestBody);
      if (seq !== estimateSeq.current) return;
      if (response?.error) {
        setPriceEstimate(null);
        setEstimateError(
          response.message ||
            "We couldn't estimate the price. Please check your pickup and drop-off locations and dates, then try again.",
        );
        return;
      }
      const quote = response?.data?.data;
      if (quote) setPriceEstimate(quote);
    } catch (err) {
      if (seq !== estimateSeq.current) return;
      console.warn("Estimate unavailable:", err);
      setEstimateError(
        "We couldn't estimate the price. Please check your pickup and drop-off locations and dates, then try again.",
      );
    } finally {
      if (seq === estimateSeq.current) setIsEstimating(false);
    }
  }, [pricing, allComplete, trips]);

  useEffect(() => {
    if (!allComplete) return;
    const id = setTimeout(runEstimate, 700);
    return () => clearTimeout(id);
  }, [trips, allComplete, runEstimate]);

  const proceedToCheckout = () => {
    if (!priceEstimate || !pricing) return;
    const tripsForStore = trips.map((t) => ({
      ...t,
      tripDetails: {
        ...t.tripDetails,
        bookingTypeName:
          prices.find((p) => p.bookingTypeId === t.tripDetails.bookingType)
            ?.bookingTypeName || "",
      },
    }));
    sessionStorage.setItem(
      "servicePricingTrips",
      JSON.stringify(tripsForStore),
    );
    sessionStorage.setItem(
      "servicePricingEstimate",
      JSON.stringify(priceEstimate),
    );
    sessionStorage.setItem("servicePricingId", pricing.servicePricingId);
    sessionStorage.setItem("yearRangeId", pricing.yearRangeId);
    router.push(`/booking/${pricing.servicePricingId}/special-checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[9vh]" />
        <div className="bg-gradient-to-br from-[#EAF2FF] via-[#F5F9FF] to-white border-b border-[#E2ECFB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="h-5 w-40 rounded-full bg-white/70 animate-pulse" />
                <div className="h-9 w-64 rounded-lg bg-white/70 animate-pulse" />
                <div className="h-4 w-52 rounded bg-white/60 animate-pulse" />
                <div className="flex gap-2.5 pt-2">
                  <div className="h-14 w-28 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-14 w-28 rounded-xl bg-white/70 animate-pulse" />
                </div>
              </div>
              <div className="h-48 rounded-2xl bg-white/50 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />
          <div className="h-64 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiInfo className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {error ? "Error Loading Details" : "Service Not Found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "The package you are looking for does not exist."}
            </p>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-[#0673FF] text-white rounded-xl hover:bg-[#0560d6] transition-colors font-semibold w-full"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const prices = pricing.prices || [];
  const bookingOptions = prices.map((p) => ({
    option: p.bookingTypeName,
    value: p.bookingTypeId,
  }));
  const total = priceEstimate?.totalPrice || 0;

  const summaryCard = (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-base font-bold text-gray-900">Booking summary</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Vehicle</span>
          <span className="font-semibold text-gray-900 text-right">
            {pricing.servicePricingName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Trips</span>
          <span className="font-semibold text-gray-900">{trips.length}</span>
        </div>
      </div>

      {estimateError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {estimateError}
        </div>
      )}

      {priceEstimate ? (
        <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
          <PriceRow label="Base fare" value={priceEstimate.basePrice || 0} />
          {priceEstimate.couponDiscountAmount > 0 && (
            <PriceRow
              label={
                priceEstimate.appliedCouponCode
                  ? `Coupon discount (${priceEstimate.appliedCouponCode})`
                  : "Coupon discount"
              }
              value={priceEstimate.couponDiscountAmount}
              subLabel={
                String(priceEstimate.appliedCouponCode || "").toUpperCase() ===
                "WELCOME"
                  ? "10% off your first ride, capped at ₦10,000"
                  : undefined
              }
              isDiscount
            />
          )}
          {priceEstimate.platformFeeAmount > 0 && (
            <PriceRow
              label="Platform fee"
              value={priceEstimate.platformFeeAmount}
            />
          )}
          {priceEstimate.logisticsFee > 0 && (
            <PriceRow label="Outskirt fee" value={priceEstimate.logisticsFee} />
          )}
          {priceEstimate.vatAmount > 0 && (
            <PriceRow
              label="VAT"
              value={priceEstimate.vatAmount}
              subLabel={`${priceEstimate.vatPercentage || 0}%`}
            />
          )}
          {priceEstimate.discountAmount > 0 && (
            <PriceRow
              label="Discount"
              value={priceEstimate.discountAmount}
              isDiscount
            />
          )}
          <div className="pt-3 border-t border-gray-200">
            <PriceRow label="Total" value={total} isTotal />
          </div>
        </div>
      ) : (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Complete each trip to see your price.
          </p>
        </div>
      )}

      <button
        onClick={proceedToCheckout}
        disabled={!priceEstimate || isEstimating || !allComplete}
        className={`mt-5 hidden w-full py-3.5 rounded-xl font-semibold text-sm transition-all lg:block ${
          priceEstimate && !isEstimating && allComplete
            ? "bg-[#0673FF] hover:bg-[#0560d6] text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isEstimating ? "Updating..." : "Confirm booking"}
      </button>

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
        <FiInfo className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>Final price is confirmed at checkout.</p>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      {/* Floating car summary, shown after scrolling past the hero */}
      <div
        className={`fixed left-0 right-0 top-20 z-30 border-b border-gray-200 bg-white/95 backdrop-blur transition-all duration-200 ${
          showStickyCar
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 py-2.5">
          <img
            src={pricing.imageUrl}
            alt={pricing.servicePricingName}
            className="h-9 w-12 flex-shrink-0 object-contain mix-blend-multiply"
          />
          <span className="truncate text-sm font-semibold text-gray-900">
            {prettyName(pricing.servicePricingName)}
          </span>
          <div className="ml-auto flex items-center gap-2 overflow-hidden">
            {prices.map((p) => (
              <span
                key={p.bookingTypeId}
                className="hidden whitespace-nowrap rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#0673FF] sm:inline-flex"
              >
                {p.bookingTypeName}: {naira(p.price)}
              </span>
            ))}
            <span className="whitespace-nowrap text-sm font-bold text-gray-900 sm:hidden">
              {prices.length
                ? `from ${naira(Math.min(...prices.map((x) => x.price)))}`
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-white pb-28 lg:pb-0">
        <div className="h-[9vh]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <WelcomeOfferNote />
        </div>

        {/* Hero band: vehicle and its prices */}
        <div
          ref={heroRef}
          className="bg-gradient-to-br from-[#EAF2FF] via-[#F5F9FF] to-white border-b border-[#E2ECFB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <button
              onClick={handleBackClick}
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-5"
            >
              <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Back</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pb-6">
              <div className="order-2 md:order-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {prettyName(pricing.servicePricingName)}
                </h1>
                <p className="mt-2 text-gray-600">
                  Vehicle Year: {pricing.minYear} - {pricing.maxYear}
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {prices.map((p) => (
                    <div
                      key={p.bookingTypeId}
                      className="rounded-xl border border-[#cfe0fb] bg-white/70 px-4 py-2.5"
                    >
                      <p className="text-xs text-gray-500 font-medium">
                        {p.bookingTypeName}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {naira(p.price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
                  <FiShield className="w-4 h-4 text-[#0673FF]" />
                  Driver and fuel included
                </div>
              </div>

              <div className="order-1 md:order-2 flex items-center justify-center md:justify-end">
                <img
                  src={pricing.imageUrl}
                  alt={pricing.servicePricingName}
                  className="w-full max-w-md h-auto object-contain mix-blend-multiply"
                  style={{ maxHeight: "300px" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 transition-[padding] duration-200 ${
            showStickyCar ? "pt-24" : "pt-8"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#EAF2FF] rounded-xl flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-[#0673FF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Plan your trip
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Set the duration and details for each trip.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {trips.map((trip, index) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      index={index}
                      isOpen={openTripIds.has(trip.id)}
                      onToggle={() => toggleTrip(trip.id)}
                      onDelete={() => deleteTrip(trip.id)}
                      onUpdate={updateTrip}
                      bookingOptions={bookingOptions}
                      canDelete={trips.length > 1}
                    />
                  ))}

                  <button
                    onClick={addTrip}
                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#0673FF] hover:bg-[#0673FF]/5 rounded-xl text-sm font-medium text-gray-500 hover:text-[#0673FF] transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add another trip
                  </button>
                </div>
              </div>

              {/* Summary in flow on mobile */}
              <div className="lg:hidden">{summaryCard}</div>
            </div>

            {/* Sticky summary on desktop */}
            <div className="hidden lg:block">
              <div className={`sticky ${showStickyCar ? "top-36" : "top-24"}`}>
                {summaryCard}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {priceEstimate ? naira(total) : isEstimating ? "..." : "--"}
            </p>
          </div>
          <button
            onClick={proceedToCheckout}
            disabled={!priceEstimate || isEstimating || !allComplete}
            className={`ml-auto flex-1 max-w-[60%] py-3 rounded-xl font-semibold text-sm transition-all ${
              priceEstimate && !isEstimating && allComplete
                ? "bg-[#0673FF] hover:bg-[#0560d6] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isEstimating ? "Updating..." : "Confirm booking"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

const TripCard = ({
  trip,
  index,
  isOpen,
  onToggle,
  onDelete,
  onUpdate,
  bookingOptions,
  canDelete,
}: {
  trip: Trip;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  bookingOptions: { option: string; value: string }[];
  canDelete: boolean;
}) => {
  const details = trip.tripDetails;

  const [sameAsPickup, setSameAsPickup] = useState(false);

  // Keep the drop-off mirrored to the pickup while the box is ticked.
  useEffect(() => {
    if (!sameAsPickup) return;
    onUpdate(trip.id, "dropoffLocation", details.pickupLocation || "");
    if (details.pickupCoordinates) {
      onUpdate(trip.id, "dropoffCoordinates", details.pickupCoordinates);
    }
    // onUpdate is intentionally omitted to avoid a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameAsPickup, details.pickupLocation, details.pickupCoordinates]);

  const tripStartDate = details.tripStartDate
    ? new Date(details.tripStartDate)
    : null;
  const tripStartTime = details.tripStartTime
    ? new Date(details.tripStartTime)
    : null;

  const selectedName =
    bookingOptions.find((o) => o.value === details.bookingType)?.option || "";
  const hours = hoursFromName(selectedName);

  const endLabel = (() => {
    if (!tripStartDate || !tripStartTime || !hours) return "";
    const start = new Date(tripStartDate);
    start.setHours(tripStartTime.getHours(), tripStartTime.getMinutes(), 0, 0);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return format(end, "EEE, MMM d 'at' h:mm a");
  })();

  const startLabel =
    tripStartDate && tripStartTime
      ? format(
          (() => {
            const s = new Date(tripStartDate);
            s.setHours(
              tripStartTime.getHours(),
              tripStartTime.getMinutes(),
              0,
              0,
            );
            return s;
          })(),
          "EEE, MMM d 'at' h:mm a",
        )
      : "";

  const dateLabel = tripStartDate
    ? `Trip ${index + 1}: ${format(tripStartDate, "MMM do yyyy")}`
    : `Trip ${index + 1}: choose a date`;

  const handleCoordinates = (
    type: string,
    coordinates: { lat: number; lng: number } | null,
  ) => {
    onUpdate(trip.id, type, coordinates);
  };

  return (
    <div className="border border-gray-200 rounded-xl">
      <div
        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-xl"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#EAF2FF] rounded-md flex items-center justify-center">
              <span className="text-sm font-bold text-[#0673FF]">
                {index + 1}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {dateLabel}
              </h3>
              {selectedName && (
                <p className="text-xs text-gray-500 mt-0.5">{selectedName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
            <FiChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-100 space-y-4 rounded-b-xl">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Duration
            </label>
            <SelectInput
              id={`bookingType-${trip.id}`}
              placeholder="Select duration"
              variant="outlined"
              options={bookingOptions}
              value={details.bookingType || ""}
              onChange={(value) => onUpdate(trip.id, "bookingType", value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
              Pickup location
            </label>
            <GoogleMapsLocationInput
              value={details.pickupLocation || ""}
              onChange={(value) => onUpdate(trip.id, "pickupLocation", value)}
              placeholder="Enter pickup address"
              coordinates={handleCoordinates}
              type="pickupCoordinates"
              disabled={false}
            />
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <svg
                className="mt-[1px] h-3.5 w-3.5 flex-shrink-0 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
              <p className="text-[11px] leading-snug text-amber-800">
                Enter your exact address. Outskirt and interstate trips cost
                extra, and these charges are not refundable.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
              Drop-off location
            </label>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sameAsPickup}
                onChange={(e) => setSameAsPickup(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#0673ff] focus:ring-[#0673ff]"
              />
              Return to pickup location
            </label>
            {!sameAsPickup && (
              <GoogleMapsLocationInput
                value={details.dropoffLocation || ""}
                onChange={(value) => onUpdate(trip.id, "dropoffLocation", value)}
                placeholder="Enter drop-off location"
                coordinates={handleCoordinates}
                type="dropoffCoordinates"
                disabled={false}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Trip date
              </label>
              <DateInput
                name={`startDate-${trip.id}`}
                value={tripStartDate}
                onChange={(value: CalendarValue) => {
                  onUpdate(trip.id, "tripStartDate", value?.toString() || "");
                }}
                minDate={new Date()}
                disabled={false}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Start time
              </label>
              <TimeInput
                name={`startTime-${trip.id}`}
                value={tripStartTime}
                onChange={(date: Date) =>
                  onUpdate(trip.id, "tripStartTime", date.toString())
                }
                timeType="start"
                disabled={false}
                selectedDate={tripStartDate}
                minLeadMinutes={180}
              />
            </div>
          </div>

          {endLabel && (
            <div className="rounded-xl bg-[#EAF2FF] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0673FF]">
                <FiClock className="w-3.5 h-3.5" />
                Your {hours}-hour booking
              </div>
              <p className="mt-1 text-sm text-gray-700">
                Starts {startLabel}
              </p>
              <p className="text-sm text-gray-700">Ends {endLabel}</p>
            </div>
          )}
        </div>
      )}
    </div>
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
    <div className="flex justify-between items-center">
      <div>
        <span
          className={
            isTotal
              ? "text-sm font-bold text-gray-900"
              : "text-xs text-gray-600"
          }
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-xs text-gray-400 block">{subLabel}</span>
        )}
      </div>
      <span
        className={`font-semibold ${
          isTotal
            ? "text-lg text-gray-900"
            : isDiscount
              ? "text-green-600 text-sm"
              : "text-gray-700 text-sm"
        }`}
      >
        {isDiscount ? "-" : ""}
        {naira(value)}
      </span>
    </div>
  );
};

export default ServicePricingBookingPage;
