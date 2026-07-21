"use client";

import React, { useState, useEffect, useRef, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSafeBack } from "@/hooks/useSafeBack";
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
  FiMapPin,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import WelcomeOfferNote from "@/components/general/WelcomeOfferNote";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { SocialShareButton } from "@/components/general/share";
import { Carousel } from "@/components/utils/Carousel";
import { TripAccordion } from "@/components/Booking/TripAccordion";
import InterstateRoundTrip from "@/components/Booking/InterstateRoundTrip";
import { useItineraryForm } from "@/hooks/vehicle-details/useItineraryForm";
import { kindFromValue } from "@/utils/bookingTypeRules";
import ItineraryTypeConflictModal, {
  TypeConflict,
} from "@/components/Booking/CreateBooking/ItineraryTypeConflictModal";
import { Reviews } from "@/components/Reviews";
import {
  VehicleBookingOptions,
  EstimatedBookingPrice,
} from "@/types/vehicleDetails";
import { BookingService } from "@/controllers/booking/bookingService";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { trackPaymentClick } from "@/services/analytics";
import Footer from "../HomeComponent/Footer";
import { FavouriteVehicleService } from "@/controllers/booking/favouritevehicleservice";
import LoginPromptModal from "../Booking/Loginpromptmodal";
import VehicleAvailabilityModal from "@/components/Booking/VehicleAvailabilityModal";
import TopRatedBadge from "@/components/Booking/TopRatedBadge";
import {
  setPendingFavourite,
  FAVOURITES_CHANGED_EVENT,
} from "@/utils/pendingFavourite";

interface VehicleDetailsClientProps {
  initialVehicleData: any;
}

// Expand "start:end,start:end" ranges into a sorted list of unique day strings
// (YYYY-MM-DD). Used to turn one or more selected date ranges into one booking
// segment per day. Capped so a very wide selection can't create runaway trips.
const expandRangesToDays = (rangesStr: string): string[] => {
  const set = new Set<string>();
  rangesStr.split(",").forEach((seg) => {
    const [a, b] = seg.split(":");
    if (!a) return;
    const start = new Date(`${a}T00:00:00Z`);
    const end = new Date(`${b || a}T00:00:00Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return;
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      set.add(d.toISOString().slice(0, 10));
    }
  });
  return Array.from(set).sort().slice(0, 90);
};

// Collapse a list of day strings (YYYY-MM-DD) into contiguous ranges, so the
// current itinerary can be shown back in the availability calendar for editing.
const daysToRanges = (days: string[]): { start: string; end: string }[] => {
  const sorted = Array.from(new Set(days.filter(Boolean)))
    .filter((d) => !isNaN(new Date(`${d}T00:00:00Z`).getTime()))
    .sort();
  if (sorted.length === 0) return [];
  const ranges: { start: string; end: string }[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = new Date(`${prev}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    if (sorted[i] === next.toISOString().slice(0, 10)) {
      prev = sorted[i];
    } else {
      ranges.push({ start, end: prev });
      start = sorted[i];
      prev = sorted[i];
    }
  }
  ranges.push({ start, end: prev });
  return ranges;
};

const VehicleDetailsClient: React.FC<VehicleDetailsClientProps> = ({
  initialVehicleData,
}) => {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState<any>(initialVehicleData);
  const isFeatured = vehicle?.featured === true;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingOptions, setBookingOptions] = useState<
    { option: string; value: string }[]
  >([]);
  const [urlBookingTypeId, setUrlBookingTypeId] = useState("");
  const [interstateSeedDate, setInterstateSeedDate] = useState("");
  const [interstateSeedLocalDays, setInterstateSeedLocalDays] = useState(1);
  const [interstateSeedVersion, setInterstateSeedVersion] = useState(0);
  const [interstateRegionValid, setInterstateRegionValid] = useState(true);
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, string>
  >({});
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [partnerCtx, setPartnerCtx] = useState<{
    lock: boolean;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
  } | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("partnerLock") === "1") {
      const lat = Number(p.get("partnerLat"));
      const lng = Number(p.get("partnerLng"));
      setPartnerCtx({
        lock: true,
        name: p.get("partnerName") || "",
        address: p.get("partnerAddress") || "",
        lat: isNaN(lat) ? undefined : lat,
        lng: isNaN(lng) ? undefined : lng,
      });
      const pid = p.get("partnerId");
      if (pid) sessionStorage.setItem("partnerBookingId", pid);
      else sessionStorage.removeItem("partnerBookingId");
    } else {
      sessionStorage.removeItem("partnerBookingId");
    }
  }, []);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUrlBookingTypeId(p.get("bookingType") || "");

    // Seed the interstate round trip from the searched range: the first day is
    // the trip out, the last day is the trip back, and the days in between are
    // local days.
    let firstDay = "";
    let totalDays = 0;
    const rangesStr = p.get("ranges");
    if (rangesStr) {
      const days = expandRangesToDays(rangesStr);
      if (days.length) {
        firstDay = days[0];
        const a = new Date(`${days[0]}T00:00:00`).getTime();
        const b = new Date(`${days[days.length - 1]}T00:00:00`).getTime();
        totalDays = Math.max(1, Math.round((b - a) / 86400000) + 1);
      }
    }
    if (!firstDay) {
      const sd = p.get("startDate");
      const ed = p.get("endDate");
      if (sd) {
        firstDay = sd;
        if (ed) {
          const a = new Date(`${sd}T00:00:00`).getTime();
          const b = new Date(`${ed}T00:00:00`).getTime();
          totalDays = Math.max(1, Math.round((b - a) / 86400000) + 1);
        } else {
          totalDays = 1;
        }
      }
    }
    if (firstDay) {
      setInterstateSeedDate(firstDay);
      setInterstateSeedLocalDays(totalDays >= 2 ? totalDays - 2 : 1);
    }
  }, []);
  const [pricing, setPricing] = useState<EstimatedBookingPrice | undefined>();
  const [continueBooking, setContinueBooking] = useState<boolean>(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [priceErrorMessage, setPriceErrorMessage] = useState<string>("");
  const [bookRideModal, setBookRideModal] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
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

  // The interstate round trip owns the itinerary in memory. Persist it to
  // sessionStorage in the same flat shape the rest of the flow uses, so the
  // checkout step (which reloads the itinerary from storage) sees every segment
  // with its coordinates.
  const persistInterstateTrips = (
    newTrips: { id: string; tripDetails: Record<string, string> }[],
  ) => {
    setTrips(newTrips);
    try {
      sessionStorage.setItem(
        "trips",
        JSON.stringify(newTrips.map((t) => ({ ...t.tripDetails, id: t.id }))),
      );
    } catch {}
  };

  // Bumped on every conflict resolution or cancel to force the trip accordions
  // to re-read the corrected booking type from state.
  const [resyncKey, setResyncKey] = useState(0);
  // Remembers the last booking type that was valid as a repeatable daily plan,
  // so a conflict can be reverted or the other days restored.
  const lastPerDayType = useRef<string | undefined>(undefined);

  // Guards against an older in-flight estimate overwriting a newer one.
  const estimateSeq = useRef(0);
  const priceRetryRef = useRef(0);

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
  const isInterstateFlow = (
    vehicle?.allPricingOptions?.find(
      (o: any) => o.bookingTypeId === urlBookingTypeId,
    )?.bookingTypeName || ""
  )
    .toLowerCase()
    .includes("interstate");
  const interstateTypeId = urlBookingTypeId;
  const dayTypeId =
    vehicle?.allPricingOptions?.find((o: any) =>
      String(o.bookingTypeName || "")
        .toLowerCase()
        .includes("24"),
    )?.bookingTypeId || "";

  // For interstate, load the vehicle's day availability once so the flow can
  // default to a free start date and hold the price if any chosen day is taken.
  useEffect(() => {
    if (!vehicle) return;
    let cancelled = false;
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const t = new Date();
    const startStr = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
    const e = new Date(t);
    e.setDate(e.getDate() + 120);
    const endStr = `${e.getFullYear()}-${pad2(e.getMonth() + 1)}-${pad2(e.getDate())}`;
    (async () => {
      try {
        const res = await VehicleSearchService.getVehicleAvailabilityRange(
          vehicle.id,
          startStr,
          endStr,
        );
        const match = res?.data?.data || null;
        const map: Record<string, string> = {};
        (match?.availability || []).forEach((d: any) => {
          if (d?.date) map[d.date] = d.status;
        });
        if (!cancelled) {
          setAvailabilityMap(map);
          setAvailabilityLoaded(true);
        }
      } catch {
        if (!cancelled) setAvailabilityLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterstateFlow, vehicle?.id, partnerCtx?.lock]);

  // Once availability is known, move the default start date to the first fully
  // available day if the seeded one is missing or taken. Runs at most once so a
  // later manual choice is never overridden.
  const autoSeededRef = useRef(false);
  useEffect(() => {
    if (!availabilityLoaded || !isInterstateFlow || autoSeededRef.current)
      return;
    const t = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const fmtD = (d: Date) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const todayStr = fmtD(t);

    // The trip is contiguous: out, local days, then back. Every day in that span
    // has to be fully available, so seed the first window where the whole span is
    // free rather than just the first free day.
    const span = (interstateSeedLocalDays || 0) + 2;
    const spanFree = (startStr: string) => {
      const d = new Date(`${startStr}T00:00:00`);
      for (let i = 0; i < span; i++) {
        const key = fmtD(d);
        if (availabilityMap[key] && availabilityMap[key] !== "AVAILABLE")
          return false;
        d.setDate(d.getDate() + 1);
      }
      return true;
    };

    const seedOk = interstateSeedDate && spanFree(interstateSeedDate);
    if (!seedOk) {
      const firstClean = Object.keys(availabilityMap)
        .filter((d) => availabilityMap[d] === "AVAILABLE" && d >= todayStr)
        .sort()
        .find((d) => spanFree(d));
      if (firstClean) {
        setInterstateSeedDate(firstClean);
        setInterstateSeedVersion((v) => v + 1);
      }
    }
    autoSeededRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityLoaded, isInterstateFlow]);

  // Every interstate segment day must be fully available. Days outside the
  // loaded window are left to the backend check rather than blocked here.
  const interstateDatesValid = (() => {
    if (!isInterstateFlow || !availabilityLoaded) return true;
    const days = (trips || [])
      .map((t) => String(t.tripDetails?.tripStartDate || "").slice(0, 10))
      .filter(Boolean);
    if (days.length === 0) return true;
    return days.every(
      (d) =>
        availabilityMap[d] === "AVAILABLE" || availabilityMap[d] === undefined,
    );
  })();

  const tripsSignature = JSON.stringify(trips);
  useEffect(() => {
    if (!isTripFormsComplete) return;
    if (isInterstateFlow && !interstateRegionValid) {
      setContinueBooking(false);
      setPricing(undefined);
      setPriceErrorMessage(
        "Check the interstate addresses. The trip out has to cross into another state and the return has to come back to where it started.",
      );
      return;
    }
    if (isInterstateFlow && !interstateDatesValid) {
      setContinueBooking(false);
      setPricing(undefined);
      setPriceErrorMessage(
        "Some of your selected days are not available for this vehicle. Open Check availability and pick dates that are free.",
      );
      return;
    }
    const timer = setTimeout(() => {
      estimatePrice();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isTripFormsComplete,
    tripsSignature,
    couponCode,
    isInterstateFlow,
    interstateRegionValid,
    interstateDatesValid,
  ]);

  // When the form goes incomplete (for example a location is edited and no
  // longer matches a selected place), drop any earlier estimate so a stale
  // price cannot be confirmed.
  useEffect(() => {
    if (!isTripFormsComplete) {
      setContinueBooking(false);
      setPricing(undefined);
      setPriceErrorMessage("");
      priceRetryRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTripFormsComplete]);

  const generateBookingOptions = () => {
    const types: VehicleBookingOptions[] = vehicle?.allPricingOptions;
    let options = types?.map((type) => {
      return { option: type.bookingTypeName, value: type.bookingTypeId };
    });
    if (partnerCtx?.lock && options) {
      const allowed = ["3 hour", "6 hour", "12 hour", "airport"];
      options = options.filter((o) => {
        const n = String(o.option || "").toLowerCase();
        return allowed.some((a) => n.includes(a));
      });
    }
    return options;
  };

  useEffect(() => {
    if (vehicle) {
      const options = generateBookingOptions();
      setBookingOptions(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, partnerCtx]);

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

    // The interstate round trip owns its own itinerary and persists it, so the
    // generic seeding must not run for it (it would overwrite the round trip
    // with a single trip, including if auth state settles after mount).
    const isInterstateSeed = (
      vehicle?.allPricingOptions?.find(
        (o: any) => o.bookingTypeId === bookingTypeParam,
      )?.bookingTypeName || ""
    )
      .toLowerCase()
      .includes("interstate");
    if (isInterstateSeed) return;

    // Restore the saved itinerary when returning to the same search (for example
    // coming back from checkout to change details) so earlier choices like the
    // drop-off location are kept. A new search has a different signature and
    // falls through to a fresh seed below.
    const seedSig = JSON.stringify({
      vehicleId: initialVehicleData?.id,
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

    const rangesParam = params.get("ranges");
    if (rangesParam) {
      const days = expandRangesToDays(rangesParam);
      if (days.length > 0) {
        const flat: Record<string, string>[] = [];
        const nested: { id: string; tripDetails: Record<string, string> }[] =
          [];
        days.forEach((day, i) => {
          const id = `trip-${i}`;
          const details: Record<string, string> = {
            ...base,
            tripStartDate: `${day}T00:00:00`,
          };
          flat.push({ ...details, id });
          nested.push({ id, tripDetails: details });
        });
        sessionStorage.setItem("trips", JSON.stringify(flat));
        sessionStorage.setItem("tripsSeedSig", seedSig);
        setTrips(nested);
        return;
      }
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

  useEffect(() => {
    const onChanged = (e: Event) => {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      if (id && vehicle?.id && id === vehicle.id) setIsFavorited(true);
    };
    window.addEventListener(FAVOURITES_CHANGED_EVENT, onChanged);
    return () =>
      window.removeEventListener(FAVOURITES_CHANGED_EVENT, onChanged);
  }, [vehicle?.id]);

  // Remember the last valid daily type while the plan is in a good shape.
  useEffect(() => {
    if (sameForAllDays && trips.length >= 1) {
      const v = trips[0]?.tripDetails?.bookingType as string | undefined;
      if (v && kindFromValue(v, bookingOptions) === "per_day") {
        lastPerDayType.current = v;
      }
    }
  }, [trips, sameForAllDays, bookingOptions]);

  // The conflict is derived from the current itinerary shape, recomputed every
  // render, so it always reflects state and cannot desync. An impossible plan
  // (a single-trip or monthly type spread across days) always surfaces the
  // modal, however it was reached.
  const conflict: TypeConflict | null = useMemo(() => {
    const labelOf = (v?: string) =>
      bookingOptions.find((o) => o.value === v)?.option || "Plan not set";
    if (trips.length <= 1) return null;
    if (sameForAllDays) {
      const v = trips[0]?.tripDetails?.bookingType as string | undefined;
      const kind = kindFromValue(v, bookingOptions);
      if (v && kind !== "per_day") {
        return {
          kind: kind as TypeConflict["kind"],
          value: v,
          typeName: labelOf(v),
          via: "shared",
        };
      }
      return null;
    }
    const monthly = trips.find(
      (t) =>
        kindFromValue(
          t.tripDetails?.bookingType as string | undefined,
          bookingOptions,
        ) === "whole_booking",
    );
    if (monthly) {
      const v = monthly.tripDetails?.bookingType as string;
      return {
        kind: "whole_booking",
        value: v,
        typeName: labelOf(v),
        via: "per_day",
      };
    }
    return null;
  }, [trips, sameForAllDays, bookingOptions]);

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      if (vehicle?.id) setPendingFavourite(vehicle.id);
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
            onClick={() => safeBack("/explore")}
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
    let scheduledRetry = false;
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
          startTime: format(new Date(details?.tripStartTime || ""), "HH:mm:ss"),
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

      const existingId = sessionStorage.getItem("priceEstimateId") || "";
      // Reuse a single calculation record across recalculations. The first
      // estimate creates one (POST); every later tweak updates that same record
      // (PUT) instead of creating another, so we don't leave orphan estimates
      // in the database.
      let pricing: any;
      if (existingId) {
        pricing = await BookingService.updateCalculation(
          existingId,
          data,
        ).catch(() => null);
        if (!pricing || pricing.error) {
          // The saved estimate could not be reused (cleared, expired, or tied
          // to a different trip). Start a fresh one so a price still shows.
          sessionStorage.removeItem("priceEstimateId");
          pricing = await BookingService.calculateBooking(data);
        }
      } else {
        pricing = await BookingService.calculateBooking(data);
      }
      if (seq !== estimateSeq.current) return;
      // Surface the specific reason (for example a location the vehicle does
      // not serve, or an ineligible coupon) instead of failing silently.
      if (pricing?.error) {
        throw new Error(pricing.message || "");
      }
      const calculationId = pricing?.data?.data?.calculationId;
      if (calculationId) {
        sessionStorage.setItem("priceEstimateId", calculationId);
      }
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
      priceRetryRef.current = 0;
    } catch (e: any) {
      if (seq !== estimateSeq.current) return;
      const reason = typeof e?.message === "string" ? e.message.trim() : "";
      console.warn("Price estimate unavailable:", reason || e);
      // A clear reason from the server (for example a location the vehicle does
      // not serve, or an ineligible coupon) is shown right away. Only retry
      // once when there is no message, to ride out a transient blip.
      if (!reason && priceRetryRef.current < 1) {
        priceRetryRef.current += 1;
        scheduledRetry = true;
        setPriceErrorMessage("");
        window.setTimeout(() => {
          estimatePrice();
        }, 1200);
        return;
      }
      setPriceErrorMessage(
        reason ||
          "We couldn't estimate the price. Please check your pickup and drop-off locations and dates, then try again.",
      );
      setPricing(undefined);
      setContinueBooking(false);
    } finally {
      if (seq === estimateSeq.current && !scheduledRetry)
        setIsEstimating(false);
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

  const baseType = trips[0]?.tripDetails?.bookingType as string | undefined;
  const baseKind = kindFromValue(baseType, bookingOptions);

  const fallbackPerDay = () =>
    bookingOptions.find(
      (o) => kindFromValue(o.value, bookingOptions) === "per_day",
    )?.value;

  const closeConflict = () => setResyncKey((k) => k + 1);

  // Collapse the whole booking to a single day carrying the conflicting type.
  const resolveSingleDay = () => {
    if (!conflict) return;
    if (!sameForAllDays) {
      setSameForAllDays(true);
      applyToAllTrips(trips[0]?.id || "");
    }
    setNumberOfDays(1);
    applySharedPlanChange({ bookingType: conflict.value } as any);
    closeConflict();
  };

  // Keep the days, switch to per-day mode, and leave only the chosen day as the
  // type; the remaining days fall back to the last valid daily plan.
  const resolveOneSpecificDay = (dayIndex: number) => {
    if (!conflict) return;
    const restore = lastPerDayType.current || fallbackPerDay();
    setSameForAllDays(false);
    trips.forEach((t, i) => {
      if (i === dayIndex) {
        onChangeTrip(t.id, { bookingType: conflict.value } as any);
      } else if (restore) {
        onChangeTrip(t.id, { bookingType: restore } as any);
      }
    });
    closeConflict();
  };

  const conflictDays = trips.map((t, i) => {
    const d = t.tripDetails?.tripStartDate as string | undefined;
    let dateLabel: string | undefined;
    if (d) {
      try {
        dateLabel = new Date(d).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      } catch {}
    }
    return { label: `Day ${i + 1}`, dateLabel };
  });

  const resolveMonthly = () => {
    if (!conflict) return;
    setSameForAllDays(true);
    setNumberOfDays(1);
    applySharedPlanChange({ bookingType: conflict.value } as any);
    closeConflict();
  };

  // Cancel: put the plan back into a valid shape so the modal closes.
  const cancelConflict = () => {
    if (!conflict) return;
    const restore = lastPerDayType.current || fallbackPerDay();
    if (!restore) {
      setNumberOfDays(1);
      closeConflict();
      return;
    }
    if (conflict.via === "shared") {
      applySharedPlanChange({ bookingType: restore } as any);
    } else {
      trips.forEach((t) => {
        if (
          kindFromValue(
            t.tripDetails?.bookingType as string | undefined,
            bookingOptions,
          ) === "whole_booking"
        ) {
          onChangeTrip(t.id, { bookingType: restore } as any);
        }
      });
    }
    closeConflict();
  };

  const applyRanges = (ranges: { start: string; end: string }[]) => {
    const rangesStr = ranges.map((r) => `${r.start}:${r.end}`).join(",");
    const days = expandRangesToDays(rangesStr);
    if (days.length === 0) return;
    const selectedDays = allowsMultiDay ? days : days.slice(0, 1);
    const shared = { ...(trips[0]?.tripDetails || {}) } as Record<
      string,
      string
    >;
    delete shared.tripStartDate;
    delete shared.tripStartTime;
    const nested = selectedDays.map((day, i) => ({
      id: `trip-${i}`,
      tripDetails: { ...shared, tripStartDate: `${day}T00:00:00` },
    }));
    try {
      sessionStorage.setItem(
        "trips",
        JSON.stringify(nested.map((t) => ({ ...t.tripDetails, id: t.id }))),
      );
    } catch {}
    setTrips(nested);
    setResyncKey((k) => k + 1);
    setShowAvailability(false);
  };

  const applyInterstateRange = (ranges: { start: string; end: string }[]) => {
    const rangesStr = ranges.map((r) => `${r.start}:${r.end}`).join(",");
    const days = expandRangesToDays(rangesStr);
    if (days.length === 0) {
      setShowAvailability(false);
      return;
    }
    const a = new Date(`${days[0]}T00:00:00`).getTime();
    const b = new Date(`${days[days.length - 1]}T00:00:00`).getTime();
    const totalDays = Math.max(1, Math.round((b - a) / 86400000) + 1);
    setInterstateSeedDate(days[0]);
    setInterstateSeedLocalDays(totalDays >= 2 ? totalDays - 2 : 1);
    setInterstateSeedVersion((v) => v + 1);
    setShowAvailability(false);
  };

  const hasAnyTripDate = trips.some(
    (t) => !!(t.tripDetails?.tripStartDate as string | undefined),
  );

  const selectedRanges = daysToRanges(
    trips
      .map((t) => (t.tripDetails?.tripStartDate as string | undefined) || "")
      .filter(Boolean)
      .map((s) => s.slice(0, 10)),
  );

  // A location-type estimate error (the vehicle does not serve the chosen
  // pickup or drop-off) is actionable: offer a jump to search near that spot.
  const isLocationError =
    /region|operating|area|support travel|location|not available in|does not serve/i.test(
      priceErrorMessage,
    );

  const buildLocationSearchHref = () => {
    const first = trips[0]?.tripDetails;
    const params = new URLSearchParams();
    try {
      const c = JSON.parse(`${first?.pickupCoordinates}`);
      if (c?.lat && c?.lng) {
        params.set("lat", String(c.lat));
        params.set("lng", String(c.lng));
        params.set("radiusInKm", "100");
      }
    } catch {}
    const loc =
      (first?.pickupLocation as string | undefined) || vehicle?.city || "";
    if (loc) params.set("location", loc);
    const bt = first?.bookingType as string | undefined;
    if (bt) params.set("bookingType", bt);
    return `/booking/search?${params.toString()}`;
  };

  const bookingMain = (
    <>
      <div>
        <h2 className="font-bold text-[17px]">Add Booking Details</h2>
        <div className="mt-2 mb-4">
          <p className="text-sm font-semibold text-gray-900">Daily Itinerary</p>
          <p className="text-xs text-gray-500">
            Add a stop for each day you need the car.
          </p>
        </div>

        {!hasAnyTripDate && (
          <div className="mb-4 rounded-xl border border-[#EAF2FF] bg-[#EAF2FF] px-4 py-3">
            <p className="text-sm font-semibold text-[#101928]">
              Choose your dates
            </p>
            <p className="mt-0.5 text-xs text-[#475467]">
              See the days this car is free and pick one or more date ranges.
              Booked and unavailable days can&apos;t be selected.
            </p>
            <button
              type="button"
              onClick={() => setShowAvailability(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#0673FF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0560d6]"
            >
              View availability
            </button>
          </div>
        )}

        {allowsMultiDay && trips.length > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#E4E7EC] bg-white px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800">Trip length</p>
              <p className="text-[11px] leading-snug text-gray-500">
                {trips.length} {trips.length === 1 ? "day" : "days"} selected.
                Change the dates from the availability calendar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAvailability(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#0673FF] px-3 py-1.5 text-xs font-semibold text-[#0673FF] hover:bg-[#EAF2FF]"
            >
              Change dates
            </button>
          </div>
        )}

        {priceErrorMessage && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2.5">
            <FiAlertCircle
              className="mt-0.5 flex-shrink-0 text-[#D42620]"
              size={16}
            />
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-[#912018]">{priceErrorMessage}</p>
              {isLocationError && (
                <button
                  type="button"
                  onClick={() => router.push(buildLocationSearchHref())}
                  className="self-start text-xs font-semibold text-[#0673FF] underline underline-offset-2 hover:text-[#0560d6]"
                >
                  Find cars available in this area
                </button>
              )}
            </div>
          </div>
        )}

        {partnerCtx?.lock && partnerCtx.name && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-3 py-2.5">
            <FiMapPin
              className="mt-0.5 flex-shrink-0 text-[#0673FF]"
              size={16}
            />
            <p className="text-xs text-[#0560d6]">
              Booking through {partnerCtx.name}. Pickup is set to the hotel;
              airport transfers are dropped at the hotel.
            </p>
          </div>
        )}

        {isInterstateFlow ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold text-gray-700">Dates</p>
                <p className="text-[11px] leading-snug text-gray-500">
                  Check the calendar for days this car is available.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvailability(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#0673FF] px-3 py-1.5 text-xs font-semibold text-[#0673FF] hover:bg-[#EAF2FF]"
              >
                Check availability
              </button>
            </div>
            <InterstateRoundTrip
              interstateTypeId={interstateTypeId}
              dayTypeId={dayTypeId}
              onTripsChange={persistInterstateTrips}
              onRegionValidChange={setInterstateRegionValid}
              initialStartDateStr={interstateSeedDate}
              initialLocalDays={interstateSeedLocalDays}
              seedVersion={interstateSeedVersion}
            />
          </>
        ) : trips.length <= 1 ? (
          trips.map((key, index) => (
            <TripAccordion
              key={`${key.id}-${tripsVersion}-${resyncKey}`}
              day={`${index + 1}`}
              id={key.id}
              vehicle={vehicle}
              initialValues={
                key.tripDetails && Object.keys(key.tripDetails).length > 0
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
              partnerLock={partnerCtx?.lock || false}
              partnerName={partnerCtx?.name}
              partnerAddress={partnerCtx?.address}
              partnerLat={partnerCtx?.lat}
              partnerLng={partnerCtx?.lng}
              availabilityMap={availabilityMap}
            />
          ))
        ) : sameForAllDays ? (
          <>
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-3 py-2 text-xs text-[#0560d6]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>
                One plan for all {trips.length} days. Fill it once; every day is
                set.
              </span>
            </div>
            {trips[0] && (
              <TripAccordion
                key={`plan-${tripsVersion}-${resyncKey}`}
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
                onChangeTrip={(_id, details) => applySharedPlanChange(details)}
                isCollapsed={!openTripIds.has(trips[0].id || "")}
                toggleOpen={() => toggleOpen(trips[0].id || "")}
                bookingOptions={bookingOptions}
                vehicleId={vehicle.id}
                partnerLock={partnerCtx?.lock || false}
                partnerName={partnerCtx?.name}
                partnerAddress={partnerCtx?.address}
                partnerLat={partnerCtx?.lat}
                partnerLng={partnerCtx?.lng}
                availabilityMap={availabilityMap}
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
                key={`${key.id}-${tripsVersion}-${resyncKey}`}
                day={`${index + 1}`}
                id={key.id}
                vehicle={vehicle}
                initialValues={
                  key.tripDetails && Object.keys(key.tripDetails).length > 0
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
                partnerLock={partnerCtx?.lock || false}
                partnerName={partnerCtx?.name}
                partnerAddress={partnerCtx?.address}
                partnerLat={partnerCtx?.lat}
                partnerLng={partnerCtx?.lng}
                availabilityMap={availabilityMap}
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
              className="mt-2 w-full text-center text-[#0673ff] text-xs font-medium underline underline-offset-2 hover:text-[#0560d6] cursor-pointer"
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
              Coupon applied, you save {formatCurrency(appliedCouponDiscount)}
            </p>
          )}
          {couponState === "invalid" && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              We couldn&apos;t apply this code. Check it and estimate again.
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
                subLabel={`${pricing.data.data.vatPercentage}% of platform fee`}
              />
            )}

            {pricing.data.data.discountAmount > 0 && (
              <PriceRow
                label="Duration Discount"
                value={pricing.data.data.discountAmount}
                isDiscount
                subLabel={
                  [
                    pricing.data.data.basePrice > 0
                      ? `${Math.round(
                          (pricing.data.data.discountAmount /
                            pricing.data.data.basePrice) *
                            100,
                        )}% off`
                      : null,
                    pricing.data.data.appliedDiscountName || null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />
            )}

            {pricing.data.data.couponDiscountAmount > 0 && (
              <PriceRow
                label={`Coupon (${
                  pricing.data.data.appliedCouponCode || couponCode
                })`}
                subLabel={
                  String(
                    pricing.data.data.appliedCouponCode || couponCode || "",
                  ).toUpperCase() === "WELCOME"
                    ? "10% of your booking, capped at ₦10,000"
                    : null
                }
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
        <FiInfo className="text-orange-500 shrink-0 mt-0.5" size={20} />
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

  const interstatePending: string[] = (() => {
    if (!isInterstateFlow) return [];
    const out = (trips[0]?.tripDetails || {}) as Record<string, string>;
    const back = (trips[trips.length - 1]?.tripDetails || {}) as Record<
      string,
      string
    >;
    const items: string[] = [];
    if (!out.tripStartDate) items.push("Start date");
    if (!out.pickupLocation || !out.pickupCoordinates)
      items.push("Trip out pickup address");
    if (!out.dropoffLocation || !out.dropoffCoordinates)
      items.push("Destination address");
    if (!back.pickupLocation || !back.pickupCoordinates)
      items.push("Return pickup address");
    if (!back.dropoffLocation || !back.dropoffCoordinates)
      items.push("Return drop-off address");
    return items;
  })();

  const pendingChecklist = isTripFormsComplete ? null : isInterstateFlow ? (
    interstatePending.length > 0 ? (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Add these to see your price
        </p>
        <ul className="mt-2 space-y-1.5">
          {interstatePending.map((l) => (
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
    ) : null
  ) : pendingByDay.length > 0 ? (
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
  const canConfirmBooking =
    continueBooking && !isEstimating && isTripFormsComplete;
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
      <h3 className="text-lg font-bold text-gray-800">Discounts</h3>
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
      {!isInterstateFlow && (
        <ItineraryTypeConflictModal
          conflict={conflict}
          days={conflictDays}
          onSingleDay={resolveSingleDay}
          onOneSpecificDay={resolveOneSpecificDay}
          onMonthly={resolveMonthly}
          onCancel={cancelConflict}
        />
      )}
      <VehicleAvailabilityModal
        isOpen={showAvailability}
        onClose={() => setShowAvailability(false)}
        vehicleId={vehicle?.id}
        vehicleName={vehicle?.name}
        vehicleTypeName={vehicle?.vehicleTypeName}
        bookingType={trips[0]?.tripDetails?.bookingType as string | undefined}
        onConfirm={isInterstateFlow ? applyInterstateRange : applyRanges}
        initialRanges={selectedRanges}
        requireFullDay={isInterstateFlow}
      />
      <Navbar />
      <div className="min-h-screen w-full bg-gray-50 mt-24">
        <div className="min-h-screen bg-gray-50 p-0 sm:p-3 flex items-center flex-col">
          <div className="max-w-4xl flex flex-col w-full">
            <div className=" rounded-xl flex-shrink p-4 sm:p-6 space-y-4">
              <button
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
                onClick={() => safeBack("/explore")}
              >
                <FiArrowLeft size={18} />
                <span>Back</span>
              </button>
              <header className="flex flex-row items-start justify-between gap-3 w-full">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words">
                    {vehicle.name || ""}
                  </h1>
                  {isFeatured && <TopRatedBadge className="mt-2" />}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SocialShareButton triggerClassName="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition cursor-pointer" />

                  <button
                    onClick={handleToggleFavourite}
                    disabled={isFavoriteLoading}
                    aria-label={
                      isFavorited
                        ? "Remove from favourites"
                        : "Add to favourites"
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
                      const row = (
                        label: string,
                        value: string,
                        key: string,
                      ) => (
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

          <WelcomeOfferNote />

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
