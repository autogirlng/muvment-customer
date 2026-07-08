"use client";

import React, { useState, useEffect } from "react";
import { FiArrowRight, FiMapPin, FiPlus, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookingService } from "@/controllers/booking/bookingService";
import BookingHistoryComponent from "../Booking/BookingHistoryComponent";
import DashboardFirstBookingOffer from "./DashboardFirstBookingOffer";
import BusinessOnboardingGuide from "./BusinessOnboardingGuide";
import StaffCompanyCard from "./StaffCompanyCard";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import {
  customerBookingStatus,
  customerTripStatus,
} from "@/utils/bookingStatus";

const BRAND = "#0673ff";

const ngn = (n?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n || 0);

const compactNgn = (n?: number) => {
  const v = n || 0;
  if (v >= 1_000_000_000)
    return `₦${(v / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (v >= 1_000_000)
    return `₦${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return ngn(v);
};

const UPCOMING = ["CONFIRMED", "PENDING_PAYMENT"];

const formatDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? ""
    : dt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
};

const prettyStatus = (s?: string) => (s ? customerBookingStatus(s).label : "");

type Trip = {
  bookingId: string;
  segmentId?: string;
  status: string;
  vehicleName: string;
  startDateTime?: string;
  pickup?: string;
  dropoff?: string;
  kind: "active" | "upcoming" | "latest";
};

const deriveHighlight = (rows: any[]): Trip | null => {
  const now = Date.now();
  const make = (b: any, kind: Trip["kind"]): Trip => ({
    bookingId: b.bookingId,
    segmentId: b.segmentId,
    status: b.status,
    vehicleName: b.vehicleName,
    startDateTime: b.startDateTime,
    pickup: b.pickup,
    dropoff: b.dropoff,
    kind,
  });

  const active = rows.find((b) => b.status === "IN_PROGRESS");
  if (active) return make(active, "active");

  const upcoming = rows
    .filter(
      (b) =>
        UPCOMING.includes(b.status) &&
        b.startDateTime &&
        new Date(b.startDateTime).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )[0];
  if (upcoming) return make(upcoming, "upcoming");

  return rows[0] ? make(rows[0], "latest") : null;
};

const TRIP_LABEL: Record<Trip["kind"], string> = {
  active: "Active trip",
  upcoming: "Your next trip",
  latest: "Latest booking",
};

export default function Dashboard(): React.ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const corp = useCorporateMembership();
  const [stats, setStats] = useState<{
    bookings: number;
    trips: number;
    paymentsTotal: number;
  }>({
    bookings: 0,
    trips: 0,
    paymentsTotal: 0,
  });
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripInfo, setTripInfo] = useState<any | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [showTripPrompt, setShowTripPrompt] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const metrics = await BookingService.getDashboardMetrics();
        setStats({
          bookings: metrics.bookings,
          trips: metrics.trips,
          paymentsTotal: metrics.paymentsTotal,
        });
      } catch (e) {
        console.error("Error loading counts:", e);
      } finally {
        setStatsLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const res: any = await BookingService.getMyBookings({
          page: 0,
          size: 10,
        } as any);
        const content: any[] = res?.data?.content ?? [];
        const mapped = content.map((item) => ({
          bookingId: item.booking?.bookingId,
          segmentId: item.id,
          status: item.booking?.bookingStatus,
          vehicleName: item.vehicle?.name || "Vehicle",
          startDateTime: item.startDateTime,
          pickup: item.pickupLocationString,
          dropoff: item.dropoffLocationString,
        }));
        setTrip(deriveHighlight(mapped));
      } catch (e) {
        console.error("Error loading trip:", e);
      } finally {
        setTripLoading(false);
      }
    };
    loadTrip();
  }, []);

  useEffect(() => {
    const sid = trip?.segmentId;
    if (!sid) return;
    let cancelled = false;
    (async () => {
      const info = await BookingService.getTripBySegment(sid);
      if (!cancelled) setTripInfo(info);
    })();
    return () => {
      cancelled = true;
    };
  }, [trip?.segmentId]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const openBook = () =>
    window.dispatchEvent(new CustomEvent("muvment:open-book"));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-5 md:space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{currentDate}</p>
        </div>
        {(tripLoading || trip) && (
          <button
            onClick={openBook}
            className="hidden shrink-0 sm:inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            <FiPlus className="w-4 h-4" />
            <span>Book a vehicle</span>
          </button>
        )}
      </div>

      {/* Company allowance: only renders for corporate staff */}
      <StaffCompanyCard />

      {/* Business onboarding steps: only renders for a business account */}
      <BusinessOnboardingGuide
        onBook={openBook}
        onStatus={(s) => setShowTripPrompt(!s.isBusiness || s.complete)}
      />

      {/* First-booking offer: shows until the user has made a booking */}
      {statsLoaded &&
        stats.bookings === 0 &&
        !corp.isMember && (
          <DashboardFirstBookingOffer onBook={openBook} />
        )}

      {/* Highlight trip / book prompt */}
      {tripLoading ? (
        <div className="h-40 rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
      ) : trip ? (
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div
            className="px-5 py-4 text-white"
            style={{
              background: "linear-gradient(135deg, #0673ff 0%, #0a55c4 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-white/80">
                {TRIP_LABEL[trip.kind]}
              </p>
              {(tripInfo?.tripStatus || trip.status) && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20">
                  {tripInfo?.tripStatus
                    ? customerTripStatus(tripInfo.tripStatus).label
                    : prettyStatus(trip.status)}
                </span>
              )}
            </div>
            <p className="text-lg font-bold mt-1">{trip.vehicleName}</p>
            {trip.startDateTime && (
              <p className="text-sm text-white/80">
                {formatDate(trip.startDateTime)}
              </p>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-2">
                {(trip.pickup || trip.dropoff) && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiMapPin className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">
                      {trip.pickup || "—"}
                      {trip.dropoff ? ` → ${trip.dropoff}` : ""}
                    </span>
                  </div>
                )}
                {tripInfo?.driverAssigned && tripInfo?.driverName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiUser className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">
                      {tripInfo.driverName}
                      {tripInfo.driverPhoneNumber ? (
                        <>
                          {" · "}
                          <a
                            href={`tel:${tripInfo.driverPhoneNumber}`}
                            className="font-medium text-[#0673ff] hover:underline"
                          >
                            {tripInfo.driverPhoneNumber}
                          </a>
                        </>
                      ) : null}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() =>
                  router.push(
                    trip.segmentId
                      ? `/dashboard/booking/${trip.bookingId}/trip/${trip.segmentId}`
                      : `/dashboard/booking/${trip.bookingId}`,
                  )
                }
                className="shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                View trip details
              </button>
            </div>
          </div>
        </div>
      ) : showTripPrompt ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-900 font-semibold">No trips yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Book a vehicle to see your trip here.
          </p>
          <button
            onClick={openBook}
            className="mt-4 inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            Book a vehicle <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Compact stats strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => router.push("/dashboard/my-booking")}
          className="min-w-0 p-3 text-left hover:bg-gray-50 transition rounded-l-2xl sm:p-4"
        >
          <p className="text-[11px] text-gray-500 sm:text-xs">Total bookings</p>
          <p className="text-base font-bold text-gray-900 sm:text-xl">
            {stats.bookings}
          </p>
        </button>
        <button
          onClick={() => router.push("/dashboard/my-booking")}
          className="min-w-0 p-3 text-left hover:bg-gray-50 transition sm:p-4"
        >
          <p className="text-[11px] text-gray-500 sm:text-xs">Total trips</p>
          <p className="text-base font-bold text-gray-900 sm:text-xl">
            {stats.trips}
          </p>
        </button>
        <button
          onClick={() => router.push("/dashboard/payment")}
          className="min-w-0 p-3 text-left hover:bg-gray-50 transition rounded-r-2xl sm:p-4"
        >
          <p className="text-[11px] text-gray-500 sm:text-xs">Payments</p>
          <p
            title={ngn(stats.paymentsTotal)}
            className="truncate text-base font-bold text-gray-900 sm:text-xl"
          >
            {compactNgn(stats.paymentsTotal)}
          </p>
        </button>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Recent bookings</h3>
          {stats.trips > 0 && (
            <button
              onClick={() => router.push("/dashboard/my-booking")}
              className="text-sm font-medium hover:underline"
              style={{ color: BRAND }}
            >
              View all
            </button>
          )}
        </div>
        <BookingHistoryComponent
          showHeader={false}
          showControls={false}
          limit={4}
          onTotalCountChange={(total) =>
            setStats((prev) => ({ ...prev, trips: total }))
          }
        />
      </div>
    </div>
  );
}
