"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";
import { FiMapPin, FiArrowRight, FiPlus, FiInbox, FiUser } from "react-icons/fi";
import { BookingService } from "@/controllers/booking/bookingService";
import { customerBookingStatus, customerTripStatus } from "@/utils/bookingStatus";

type Trip = {
  segmentId: string;
  bookingId: string;
  status: string;
  vehicleName: string;
  start?: string;
  end?: string;
  pickup?: string;
  dropoff?: string;
  bookingType?: string;
};

const dayLabel = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "Date pending";

const timeLabel = (d?: string) =>
  d
    ? new Date(d).toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const MyTripsPage = () => {
  const router = useRouter();
  const setup = useBusinessSetup();
  const needsSetup = setup.isBusiness && !setup.setupComplete;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripInfo, setTripInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const body = await BookingService.getMyBookings({
          page: 0,
          size: 1000,
        } as any);
        const content: any[] = body?.data?.content ?? [];
        const mapped: Trip[] = content
          .map((item) => ({
            segmentId: item.id,
            bookingId: item.booking?.bookingId,
            status: item.booking?.bookingStatus,
            vehicleName: item.vehicle?.name || "Vehicle",
            start: item.startDateTime,
            end: item.endDateTime,
            pickup: item.pickupLocationString,
            dropoff: item.dropoffLocationString,
            bookingType: item.bookingType?.name,
          }))
          // A booking waiting on admin approval is not a confirmed trip yet; it shows in
          // My bookings, not here.
          .filter((t) => t.status !== "PENDING_APPROVAL");
        setTrips(mapped);
      } catch (e) {
        console.error("Error loading trips:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!trips.length) return;
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const ids = trips
      .filter((t) => t.start && new Date(t.start).getTime() >= startOfToday)
      .map((t) => t.segmentId)
      .filter(Boolean)
      .slice(0, 30);
    if (!ids.length) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        ids.map((id) => BookingService.getTripBySegment(id)),
      );
      if (cancelled) return;
      const map: Record<string, any> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) map[ids[i]] = r.value;
      });
      setTripInfo(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [trips]);

  const groups = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    const today: Trip[] = [];
    const upcoming: Trip[] = [];
    const past: Trip[] = [];

    for (const t of trips) {
      const ts = t.start ? new Date(t.start).getTime() : 0;
      if (ts >= startOfToday && ts <= endOfToday) today.push(t);
      else if (ts > endOfToday) upcoming.push(t);
      else past.push(t);
    }

    const asc = (a: Trip, b: Trip) =>
      new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime();
    const desc = (a: Trip, b: Trip) =>
      new Date(b.start || 0).getTime() - new Date(a.start || 0).getTime();

    today.sort(asc);
    upcoming.sort(asc);
    past.sort(desc);

    return { today, upcoming, past };
  }, [trips]);

  const openTrip = (t: Trip) =>
    router.push(`/dashboard/booking/${t.bookingId}/trip/${t.segmentId}`);

  const TripCard = ({ t }: { t: Trip }) => {
    const info = tripInfo[t.segmentId];
    const s = info?.tripStatus
      ? customerTripStatus(info.tripStatus)
      : customerBookingStatus(t.status);
    return (
      <button
        type="button"
        onClick={() => openTrip(t)}
        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {dayLabel(t.start)}
              {timeLabel(t.start) ? ` · ${timeLabel(t.start)}` : ""}
            </p>
            <p className="mt-0.5 truncate text-sm text-gray-700">
              {t.vehicleName}
              {t.bookingType ? ` · ${t.bookingType}` : ""}
            </p>
            {(t.pickup || t.dropoff) && (
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.pickup || "Pickup"}</span>
                <FiArrowRight className="h-3 w-3 shrink-0" />
                <span className="truncate">{t.dropoff || "Drop-off"}</span>
              </p>
            )}
            {info?.driverAssigned && info?.driverName && (
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <FiUser className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{info.driverName}</span>
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${s.classes}`}
          >
            {s.label}
          </span>
        </div>
      </button>
    );
  };

  const Section = ({ title, items }: { title: string; items: Trip[] }) =>
    items.length === 0 ? null : (
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          {title} <span className="text-gray-400">({items.length})</span>
        </h2>
        <div className="space-y-3">
          {items.map((t) => (
            <TripCard key={t.segmentId} t={t} />
          ))}
        </div>
      </section>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My trips</h1>
          <p className="mt-1 text-sm text-gray-500">
            Every dated trip across your bookings. Each day of a multi-day
            booking is its own trip.
          </p>
        </div>
        <button
          onClick={() =>
            router.push(needsSetup ? "/business-setup" : "/booking/search")
          }
          className="hidden shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 sm:inline-flex"
          style={{ backgroundColor: "#0673ff" }}
        >
          <FiPlus className="h-4 w-4" />
          {needsSetup ? "Set up business" : "New booking"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0673ff] border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FiInbox className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mt-3 font-semibold text-gray-900">No trips yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            When you book a vehicle, each day of the trip will show up here.
          </p>
          <button
            onClick={() =>
              router.push(needsSetup ? "/business-setup" : "/booking/search")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#0673ff" }}
          >
            {needsSetup ? "Set up business" : "Book a vehicle"}{" "}
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <Section title="Today" items={groups.today} />
          <Section title="Upcoming" items={groups.upcoming} />
          <Section title="Past" items={groups.past} />
        </>
      )}
    </div>
  );
};

export default MyTripsPage;
