"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiShare2,
  FiStar,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiUser,
  FiEye,
  FiX,
  FiCopy,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getSingleData } from "@/controllers/connnector/app.callers";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { BookingService } from "@/controllers/booking/bookingService";
import { customerTripStatus, customerBookingStatus } from "@/utils/bookingStatus";

const BRAND = "#0673ff";

const ngn = (amount?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);

const fmt = (d?: string, withTime = false) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

const prettyStatus = (s?: string) =>
  s
    ? s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())
    : "Unknown";

const statusClasses = (s?: string) => {
  const v = (s || "").toUpperCase();
  if (v.includes("CONFIRM") || v.includes("COMPLETE"))
    return "bg-green-50 text-green-700";
  if (v.includes("PROGRESS") || v.includes("ACTIVE"))
    return "bg-blue-50 text-blue-700";
  if (v.includes("PENDING")) return "bg-amber-50 text-amber-700";
  if (v.includes("CANCEL")) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const Card: React.FC<{
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
    {(title || action) && (
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </h3>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <span className="mt-0.5 text-gray-400">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {value ?? "N/A"}
      </p>
    </div>
  </div>
);

export default function BookingDetail(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.id as string) || "";

  const [booking, setBooking] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [focusTripId, setFocusTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Record<string, any>>({});

  useEffect(() => {
    setFocusTripId(new URLSearchParams(window.location.search).get("trip"));
  }, []);

  useEffect(() => {
    if (!focusTripId || !booking) return;
    const el = document.getElementById(`trip-${focusTripId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusTripId, booking]);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`,
        );
        const data = res?.data?.[0]?.data;
        if (!data) throw new Error("We couldn't find this booking.");
        setBooking(data);

        const vehicleId = data.vehicle?.id;
        if (vehicleId) {
          const vRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {},
          );
          setVehicle(vRes?.data?.[0]?.data || null);
        }
      } catch (e: any) {
        console.error("Error loading booking:", e);
        setError(e?.message || "Failed to load this booking.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  useEffect(() => {
    const segs = (booking?.segments || []) as any[];
    const ids = segs.map((s) => s.segmentId || s.id).filter(Boolean);
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
      setTrips(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [booking]);

  const handleShare = async () => {
    const segment = booking?.segments?.[0];
    const name = vehicle?.name || booking?.vehicle?.vehicleName || "my booking";
    const shareText = `My Muvment booking for ${name}${
      segment?.startDateTime ? ` on ${fmt(segment.startDateTime)}` : ""
    }`;
    const shareUrl = `${window.location.origin}/track-booking?bookingId=${bookingId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Booking", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Booking link copied to clipboard");
      }
    } catch {
      // share cancelled or unavailable; no action needed
    }
  };

  const copyBookingId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookingId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1500);
    } catch {
      toast.error("Could not copy booking ID");
    }
  };

  useEffect(() => {
    document.body.style.overflow = vehicleModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [vehicleModalOpen]);

  const bookThisVehicle = () => {
    const vid = vehicle?.slug || vehicle?.id || booking?.vehicle?.id;
    if (vid) router.push(`/booking/details/${vid}`);
  };

  if (loading) return <ScreenLoader />;

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button
          onClick={() => router.push("/dashboard/my-booking")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to my bookings
        </button>
        <Card>
          <p className="text-gray-900 font-semibold">
            {error || "Booking not found"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This booking may have been removed, or the link is no longer valid.
          </p>
        </Card>
      </div>
    );
  }

  const segment = booking.segments?.[0];
  const segments = (booking.segments || []) as any[];
  const photo =
    vehicle?.photos?.find((p: any) => p.isPrimary)?.cloudinaryUrl ||
    vehicle?.photos?.[0]?.cloudinaryUrl ||
    "";
  const vehicleName = vehicle?.name || booking.vehicle?.vehicleName || "Vehicle";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-5">
      <button
        onClick={() => router.push("/dashboard/my-booking")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to my bookings
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative h-44 w-full bg-gray-100 sm:h-56">
          {photo ? (
            <img
              src={photo}
              alt={vehicleName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {vehicleName}
              </h2>
              <p className="text-sm text-gray-500">
                {segment?.bookingTypeName || booking.bookingType || "Booking"}
                {booking.invoiceNumber
                  ? ` · Invoice ${booking.invoiceNumber}`
                  : ""}
              </p>
              {bookingId && (
                <button
                  onClick={copyBookingId}
                  title="Copy booking ID to track this booking"
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <span className="font-mono">
                    ID: {bookingId.slice(0, 8)}…{bookingId.slice(-4)}
                  </span>
                  {idCopied ? (
                    <FiCheck className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <FiCopy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                booking.bookingStatus,
              )}`}
            >
              {prettyStatus(booking.bookingStatus)}
            </span>
          </div>

          {/* Actions: book this vehicle, review, share */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={bookThisVehicle}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ backgroundColor: BRAND }}
            >
              <FiArrowRight className="h-4 w-4" /> Book this Vehicle
            </button>
            <button
              onClick={() =>
                router.push(`/review/${bookingId}?entityType=Booking`)
              }
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <FiStar className="h-4 w-4" /> Review
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <FiShare2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Trips: navigable list, one card per trip, each opens the trip page */}
      <Card title={segments.length > 1 ? `Trips (${segments.length})` : "Trip"}>
        <div className="space-y-3">
          {segments.map((seg: any, i: number) => {
            const sid = seg.segmentId || seg.id;
            const focused = !!focusTripId && sid === focusTripId;
            const trip = trips[sid];
            const st = trip?.tripStatus
              ? customerTripStatus(trip.tripStatus)
              : customerBookingStatus(
                  seg.bookingStatus || booking.bookingStatus,
                );
            return (
              <button
                key={sid || i}
                id={`trip-${sid}`}
                type="button"
                onClick={() =>
                  router.push(`/dashboard/booking/${bookingId}/trip/${sid}`)
                }
                className={`block w-full rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-gray-100 ${
                  focused
                    ? "border-[#0673ff] ring-2 ring-[#0673ff]/40"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Trip {i + 1}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${st.classes}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      <FiCalendar className="h-4 w-4 shrink-0 text-gray-400" />
                      {fmt(seg.startDateTime, true)}
                    </p>
                    {(seg.pickupLocation || seg.dropoffLocation) && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {seg.pickupLocation || "Pickup"}
                        </span>
                        <FiArrowRight className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {seg.dropoffLocation || "Drop-off"}
                        </span>
                      </p>
                    )}
                    {trip?.driverAssigned && trip?.driverName && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <FiUser className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{trip.driverName}</span>
                      </p>
                    )}
                  </div>
                  <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0673ff]">
                    Details
                    <FiChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Vehicle */}
      {vehicle && (
        <Card
          title="Vehicle"
          action={
            <button
              onClick={() => setVehicleModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673ff] hover:underline"
            >
              <FiEye className="h-4 w-4" /> View vehicle
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Row
              icon={<FiUser className="h-4 w-4" />}
              label="Make & model"
              value={[vehicle.vehicleMakeName, vehicle.vehicleModelName]
                .filter(Boolean)
                .join(" ")}
            />
            <Row
              icon={<FiUser className="h-4 w-4" />}
              label="Colour"
              value={vehicle.vehicleColorName}
            />
            <Row
              icon={<FiUser className="h-4 w-4" />}
              label="Year"
              value={vehicle.year}
            />
            <Row
              icon={<FiUser className="h-4 w-4" />}
              label="Seats"
              value={vehicle.numberOfSeats}
            />
          </div>
          {Array.isArray(vehicle.vehicleFeatures) &&
            vehicle.vehicleFeatures.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {vehicle.vehicleFeatures.map((f: string) => (
                  <span
                    key={f}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
        </Card>
      )}

      {/* Payment */}
      <Card title="Payment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Row
            icon={<FiCreditCard className="h-4 w-4" />}
            label="Total"
            value={
              <span className="text-base font-bold text-gray-900">
                {ngn(booking.totalPrice)}
              </span>
            }
          />
          <Row
            icon={<FiCreditCard className="h-4 w-4" />}
            label="Method"
            value={booking.paymentMethod}
          />
          <Row
            icon={<FiCalendar className="h-4 w-4" />}
            label="Booked on"
            value={fmt(booking.bookedAt)}
          />
        </div>
      </Card>

      {vehicleModalOpen && vehicle && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setVehicleModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto bg-white sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 w-full bg-gray-100">
              {photo ? (
                <img
                  src={photo}
                  alt={vehicleName}
                  className="h-full w-full object-cover sm:rounded-t-2xl"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {vehicleName}
                </h3>
                <p className="text-sm text-gray-500">
                  {[
                    vehicle.vehicleMakeName,
                    vehicle.vehicleModelName,
                    vehicle.vehicleColorName,
                    vehicle.year,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="font-medium text-gray-900">
                    {vehicle.numberOfSeats ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-medium text-gray-900">
                    {vehicle.year ?? "N/A"}
                  </p>
                </div>
              </div>

              {Array.isArray(vehicle.vehicleFeatures) &&
                vehicle.vehicleFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {vehicle.vehicleFeatures.map((f: string) => (
                      <span
                        key={f}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

              {vehicle.description && (
                <p className="text-sm leading-relaxed text-gray-600">
                  {vehicle.description}
                </p>
              )}

              <button
                onClick={bookThisVehicle}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                <FiArrowRight className="h-4 w-4" /> Book this Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
