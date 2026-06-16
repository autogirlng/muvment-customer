"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiCompass,
  FiAlertCircle,
  FiNavigation,
  FiArrowRight,
} from "react-icons/fi";
import { BookingService } from "@/controllers/booking/bookingService";

const BRAND = "#0673ff";

const formatDate = (d?: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? "—"
    : dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const formatCurrency = (a?: number) =>
  typeof a === "number" ? `₦${a.toLocaleString("en-NG")}` : "—";

const prettyStatus = (s?: string) =>
  s ? s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : "—";

const statusClasses = (status?: string) => {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-700 border border-amber-200",
    CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
    SUCCESSFUL: "bg-green-50 text-green-700 border border-green-200",
    COMPLETED: "bg-green-50 text-green-700 border border-green-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
    FAILED: "bg-red-50 text-red-700 border border-red-200",
    FAILED_AVAILABILITY: "bg-red-50 text-red-700 border border-red-200",
  };
  return map[status || ""] || "bg-gray-100 text-gray-700 border border-gray-200";
};

const normalize = (data: any) => {
  const raw = Array.isArray(data)
    ? data[0]?.data ?? data[0]
    : data?.data ?? data;
  if (!raw) return null;
  const seg = raw.segments?.[0] ?? {};
  return {
    id: raw.bookingId || raw.id || "",
    status: raw.bookingStatus || raw.booking?.bookingStatus,
    vehicle: raw.vehicle?.name || raw.vehicleName || raw.vehicle?.vehicleName,
    type: raw.bookingType?.name || raw.bookingType || seg.bookingTypeName,
    pickup:
      seg.pickupLocation || seg.pickupLocationString || raw.pickupLocationString,
    dropoff:
      seg.dropoffLocation ||
      seg.dropoffLocationString ||
      raw.dropoffLocationString,
    date: seg.startDateTime || raw.bookedAt || raw.createdAt,
    amount: raw.totalPrice ?? raw.booking?.totalPrice,
    paymentMethod: raw.paymentMethod || raw.booking?.paymentMethod,
    invoice: raw.invoiceNumber || raw.booking?.invoiceNumber,
  };
};

type Tracked = ReturnType<typeof normalize>;

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-right break-words">
      {value || "—"}
    </span>
  </div>
);

const BookingTrackingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("bookingId") || "";

  const [trackId, setTrackId] = useState(urlId);
  const [input, setInput] = useState("");
  const [booking, setBooking] = useState<Tracked>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(false);
    setBooking(null);
    try {
      const data = await BookingService.getBookingById(id);
      const n = normalize(data);
      if (!n) setError(true);
      else setBooking(n);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackId) load(trackId);
  }, [trackId, load]);

  const submitManual = () => {
    const id = input.trim();
    if (!id) return;
    setTrackId(id);
    router.replace(
      `/dashboard/booking-tracking?bookingId=${encodeURIComponent(id)}`,
    );
  };

  const reset = () => {
    setTrackId("");
    setBooking(null);
    setError(false);
    setInput("");
    router.replace("/dashboard/booking-tracking");
  };

  const wrap = "p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto";

  // Loading (only ever true while a fetch is in flight)
  if (loading) {
    return (
      <div className={wrap}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div
            className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto"
            style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
          />
          <p className="mt-4 text-gray-500 text-sm">Loading booking status...</p>
        </div>
      </div>
    );
  }

  // Not ready / failed to load
  if (trackId && error) {
    return (
      <div className={wrap}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-xl mx-auto">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center bg-amber-50">
            <FiAlertCircle className="h-7 w-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Tracking details aren&apos;t ready yet
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            We couldn&apos;t load this booking right now. It may still be
            processing, or its tracking information isn&apos;t available yet.
            Try again in a moment.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => load(trackId)}
              className="px-5 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: BRAND }}
            >
              Try again
            </button>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Track another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder when there is nothing to track yet
  if (!trackId) {
    return (
      <div className={wrap}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-xl mx-auto">
          <div
            className="mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E7F1FF" }}
          >
            <FiCompass className="h-7 w-7" style={{ color: BRAND }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Track a booking</h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter a booking reference to see its status, or open one from your
            bookings.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitManual()}
                placeholder="Booking reference"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-[#0673ff] focus:ring-1 focus:ring-[#0673ff]"
              />
            </div>
            <button
              onClick={submitManual}
              className="px-5 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              Track
            </button>
          </div>
          <button
            onClick={() => router.push("/dashboard/my-booking")}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: BRAND }}
          >
            Open My bookings <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Loaded
  return (
    <div className={wrap}>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <p className="text-sm text-gray-500">
          Tracking reference:{" "}
          <span className="font-mono" style={{ color: BRAND }}>
            {booking?.id || trackId}
          </span>
        </p>
        <button
          onClick={reset}
          className="text-sm font-medium hover:underline"
          style={{ color: BRAND }}
        >
          Track another
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Booking status</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses(
                  booking?.status,
                )}`}
              >
                {prettyStatus(booking?.status)}
              </span>
            </div>
            <Row label="Booking ID" value={booking?.id} />
            <Row label="Invoice" value={booking?.invoice} />
            <Row label="Vehicle" value={booking?.vehicle} />
            <Row label="Booking type" value={booking?.type} />
            <Row label="Payment method" value={booking?.paymentMethod} />
            <Row label="Amount" value={formatCurrency(booking?.amount)} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Route</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="h-5 w-5 mt-0.5 text-green-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Pick-up
                  </p>
                  <p className="text-sm text-gray-900">
                    {booking?.pickup || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="h-5 w-5 mt-0.5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Drop-off
                  </p>
                  <p className="text-sm text-gray-900">
                    {booking?.dropoff || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCalendar
                  className="h-5 w-5 mt-0.5 shrink-0"
                  style={{ color: BRAND }}
                />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(booking?.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={() =>
                  router.push(`/payment/${booking?.id || trackId}`)
                }
                className="w-full text-white py-2.5 px-4 rounded-full font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                View full details
              </button>
              <a
                href="mailto:info@muvment.ng"
                className="block w-full text-center border border-gray-200 text-gray-700 py-2.5 px-4 rounded-full font-semibold hover:bg-gray-50 transition"
              >
                Contact support
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-6 text-center">
            <div
              className="mx-auto mb-3 h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E7F1FF" }}
            >
              <FiNavigation className="h-6 w-6" style={{ color: BRAND }} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Live location coming soon
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Once your trip starts, the driver&apos;s live location and status
              will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingTrackingPage = () => (
  <Suspense fallback={null}>
    <BookingTrackingContent />
  </Suspense>
);

export default BookingTrackingPage;
