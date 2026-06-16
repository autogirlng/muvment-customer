"use client";

import React, { useState, useEffect } from "react";
import { FiArrowRight, FiMapPin, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookingService } from "@/controllers/booking/bookingService";
import BookingHistoryComponent from "../Booking/BookingHistoryComponent";

const BRAND = "#0673ff";

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

const prettyStatus = (s?: string) =>
  s ? s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : "";

type Trip = {
  bookingId: string;
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
  const [stats, setStats] = useState<{ bookings: number; payments: number }>({
    bookings: 0,
    payments: 0,
  });
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const counts = await BookingService.getDashboardCounts();
        setStats((prev) => ({ ...prev, payments: counts.payments }));
      } catch (e) {
        console.error("Error loading counts:", e);
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
            className="shrink-0 inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            <FiPlus className="w-4 h-4" />
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a vehicle</span>
          </button>
        )}
      </div>

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
              {trip.status && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20">
                  {prettyStatus(trip.status)}
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
          <div className="p-4 space-y-3">
            {(trip.pickup || trip.dropoff) && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <FiMapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                <span>
                  {trip.pickup || "—"}
                  {trip.dropoff ? ` → ${trip.dropoff}` : ""}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard/booking/${trip.bookingId}`)}
                className="flex-1 text-white py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                View details
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/booking-tracking?bookingId=${trip.bookingId}`,
                  )
                }
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* Compact stats strip */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => router.push("/dashboard/my-booking")}
          className="p-4 text-left hover:bg-gray-50 transition rounded-l-2xl"
        >
          <p className="text-xs text-gray-500">Total bookings</p>
          <p className="text-xl font-bold text-gray-900">{stats.bookings}</p>
        </button>
        <button
          onClick={() => router.push("/dashboard/payment")}
          className="p-4 text-left hover:bg-gray-50 transition rounded-r-2xl"
        >
          <p className="text-xs text-gray-500">Payments</p>
          <p className="text-xl font-bold text-gray-900">{stats.payments}</p>
        </button>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Recent bookings</h3>
          <button
            onClick={() => router.push("/dashboard/my-booking")}
            className="text-sm font-medium hover:underline"
            style={{ color: BRAND }}
          >
            View all
          </button>
        </div>
        <BookingHistoryComponent
          showHeader={false}
          showControls={false}
          limit={4}
          onTotalCountChange={(total) =>
            setStats((prev) => ({ ...prev, bookings: total }))
          }
        />
      </div>
    </div>
  );
}
