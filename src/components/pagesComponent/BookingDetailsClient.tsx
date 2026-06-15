"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, isValid } from "date-fns";
import {
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiHash,
  FiDownload,
  FiArrowLeft,
  FiShield,
  FiCalendar,
  FiBox,
  FiInfo,
  FiLoader,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { getSingleData } from "@/controllers/connnector/app.callers";

interface BookingSegment {
  segmentId: string;
  startDateTime: string;
  endDateTime: string;
  duration: string;
  pickupLocation: string;
  dropoffLocation: string;
  bookingTypeName: string;
}

interface BookingDetails {
  bookingId: string;
  invoiceNumber: string;
  bookingStatus: string;
  paymentMethod: string;
  channel: string;
  bookedAt: string;
  totalPrice: number;
  vehicle?: {
    id: string;
    vehicleName: string;
    licensePlate: string;
  };
  booker?: {
    fullName: string;
    email: string;
    customerPhone: string;
  };
  segments?: BookingSegment[];
}

interface VehiclePhoto {
  cloudinaryUrl: string;
  isPrimary: boolean;
}

interface VehicleDetails {
  id: string;
  name: string;
  photos: VehiclePhoto[];
  vehicleMakeName: string;
  vehicleModelName: string;
  vehicleColorName: string;
  year: number;
  vehicleFeatures: string[];
  numberOfSeats: number;
  description: string;
}

const BRAND = "#0673ff";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const safeFormat = (dateString: string | undefined | null, fmt: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, fmt) : "Invalid Date";
};

const isConfirmedStatus = (s?: string) =>
  s === "CONFIRMED" || s === "SUCCESSFUL" || s === "PAID";

const prettyStatus = (s?: string) => {
  if (!s) return "Pending";
  const t = s.replace(/_/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const StatusBadge = ({ status }: { status: string }) => {
  const confirmed = isConfirmedStatus(status);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
        confirmed
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {confirmed ? <FiCheckCircle /> : <FiClock />}
      {prettyStatus(status)}
    </span>
  );
};

const MAX_POLLS = 5;

const BookingDetailsClient = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params.id as string) || "";

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      sessionStorage.removeItem("servicePricingBookingId");
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const bookingRes = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`,
        );
        const bookingData = bookingRes?.data?.[0]?.data;

        if (!bookingData) {
          throw new Error("We couldn't find this booking.");
        }

        setBooking(bookingData);

        const vehicleId = bookingData.vehicle?.id;
        if (vehicleId) {
          const vehicleRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {},
          );
          setVehicle(vehicleRes?.data?.[0]?.data || null);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // The payment callback can land here a moment before the booking is marked
  // confirmed. Re-check a few times so a freshly paid booking stops reading as
  // pending without the user having to refresh.
  useEffect(() => {
    if (!booking || !bookingId) return;
    if (isConfirmedStatus(booking.bookingStatus)) return;
    if (pollCount >= MAX_POLLS) return;

    const t = setTimeout(async () => {
      try {
        const res = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`,
        );
        const data = res?.data?.[0]?.data;
        if (data) setBooking(data);
      } catch (e) {
        console.error("Re-check failed", e);
      }
      setPollCount((c) => c + 1);
    }, 4000);

    return () => clearTimeout(t);
  }, [booking, pollCount, bookingId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
            style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
          ></div>
          <p className="text-gray-500 animate-pulse">
            Retrieving booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FiInfo className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load booking
          </h3>
          <p className="text-red-500 mb-6 text-sm max-w-md">
            {error || "Booking not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 text-white rounded-full hover:opacity-90 transition font-medium"
            style={{ backgroundColor: BRAND }}
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const confirmed = isConfirmedStatus(booking.bookingStatus);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 mt-16">
        {/* Success hero */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 mb-8 text-center">
          {confirmed ? (
            <div className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500">
              <FiCheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
            </div>
          ) : (
            <div
              className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full"
              style={{ backgroundColor: "#E7F1FF" }}
            >
              <FiLoader className="w-10 h-10 animate-spin" style={{ color: BRAND }} />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {confirmed ? "Payment successful" : "Payment received"}
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-3 max-w-xl mx-auto">
            {confirmed
              ? "Your booking is confirmed. A professional driver will be assigned to you shortly, and you'll be notified once everything is set."
              : "We're confirming your booking now. This usually takes a moment, no need to refresh."}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <StatusBadge status={booking.bookingStatus} />
            <span className="text-xs text-gray-500">
              Booking ID:{" "}
              <span className="font-mono" style={{ color: BRAND }}>
                {bookingId}
              </span>
            </span>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
            <button
              onClick={() => router.push("/dashboard/my-booking")}
              className="w-full sm:w-auto text-white font-semibold py-3 px-6 rounded-full hover:opacity-90 transition"
              style={{ backgroundColor: BRAND }}
            >
              View my bookings
            </button>
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto font-semibold py-3 px-6 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download receipt
            </button>
          </div>
        </section>

        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center text-gray-500 hover:text-[#0673ff] transition-colors"
          >
            <div className="p-2 bg-white rounded-full border border-gray-200 mr-2 group-hover:border-[#cfe2ff]">
              <FiArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: vehicle, itinerary, contact */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicle */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {vehicle && vehicle.photos && vehicle.photos.length > 0 ? (
                <div className="w-full relative group">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {vehicle.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="snap-center shrink-0 w-full sm:w-[85%] h-64 sm:h-80 relative first:pl-0 border-r border-white/20"
                      >
                        <img
                          src={photo.cloudinaryUrl}
                          alt={`${vehicle.vehicleMakeName || "Vehicle"} ${
                            vehicle.vehicleModelName || ""
                          }`.trim()}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {vehicle.photos.length} Photos
                  </div>
                </div>
              ) : (
                <div className="h-56 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <FiBox size={32} className="mb-2 opacity-50" />
                  <span>Image unavailable</span>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {vehicle
                        ? `${vehicle.year} ${vehicle.vehicleMakeName} ${vehicle.vehicleModelName}`
                        : booking?.vehicle?.vehicleName || "Vehicle"}
                    </h2>

                    <div className="flex items-center gap-3 mt-3">
                      {vehicle?.vehicleColorName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-gray-200"
                            style={{
                              backgroundColor:
                                vehicle.vehicleColorName.toLowerCase(),
                            }}
                          ></span>
                          {vehicle.vehicleColorName}
                        </span>
                      )}
                      {booking?.vehicle?.licensePlate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 font-mono">
                          {booking.vehicle.licensePlate}
                        </span>
                      )}
                    </div>
                  </div>

                  {vehicle && vehicle.vehicleFeatures && (
                    <div className="flex flex-wrap gap-2 md:justify-end md:max-w-[40%]">
                      {vehicle.vehicleFeatures
                        .slice(0, 4)
                        .map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-50 border border-gray-200 text-gray-600 text-[11px] px-2 py-1 rounded-md font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {vehicle?.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiInfo style={{ color: BRAND }} /> Vehicle description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <FiMapPin style={{ color: BRAND }} /> Trip itinerary
              </h3>

              <div className="space-y-10">
                {booking.segments && booking.segments.length > 0 ? (
                  booking.segments.map((segment) => (
                    <div
                      key={segment.segmentId}
                      className="relative pl-8 md:pl-10 border-l-2 last:border-0"
                      style={{ borderColor: "#cfe2ff" }}
                    >
                      <div
                        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10"
                        style={{ backgroundColor: BRAND }}
                      ></div>

                      <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-100 relative top-[-10px]">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b border-gray-200 pb-4">
                          <span
                            className="inline-flex items-center text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: BRAND }}
                          >
                            {segment.bookingTypeName}
                          </span>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {safeFormat(
                                segment.startDateTime,
                                "EEEE, MMMM do, yyyy",
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Duration: {segment.duration}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Pickup location
                            </label>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {segment.pickupLocation || "N/A"}
                            </p>
                            <div
                              className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded text-xs font-semibold"
                              style={{ color: "#0b4ea2", backgroundColor: "#E7F1FF" }}
                            >
                              <FiClock size={14} />
                              {safeFormat(segment.startDateTime, "h:mm a")}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Drop-off location
                            </label>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {segment.dropoffLocation || "N/A"}
                            </p>
                            <div className="inline-flex items-center gap-1.5 mt-3 text-gray-600 bg-gray-200 px-2 py-1 rounded text-xs font-semibold">
                              <FiClock size={14} />
                              {safeFormat(segment.endDateTime, "h:mm a")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiMapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No specific itinerary details found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiUser style={{ color: BRAND }} /> Contact information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                    Primary booker
                  </p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {booking.booker?.fullName || "Guest user"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: BRAND }}
                      ></span>
                      {booking.booker?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: BRAND }}
                      ></span>
                      {booking.booker?.customerPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Summary</h3>
                <StatusBadge status={booking.bookingStatus} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiHash size={16} /> Invoice #
                  </span>
                  <span className="font-mono font-medium text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
                    {booking.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiCalendar size={16} /> Booked on
                  </span>
                  <span className="font-medium text-gray-900 text-sm">
                    {safeFormat(booking.bookedAt, "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiShield size={16} /> Payment
                  </span>
                  <span className="font-medium text-gray-900 text-sm capitalize">
                    {booking.paymentMethod?.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100">
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Total amount paid
                  </span>
                  <span
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: BRAND }}
                  >
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
              </div>

              <div
                className="mt-8 p-4 rounded-xl border"
                style={{ backgroundColor: "#E7F1FF", borderColor: "#cfe2ff" }}
              >
                <h4
                  className="font-bold text-sm mb-2 flex items-center gap-2"
                  style={{ color: "#0b4ea2" }}
                >
                  <FiCheckCircle /> {confirmed ? "Booking confirmed" : "Confirming booking"}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "#0b4ea2" }}>
                  Keep invoice <strong>{booking.invoiceNumber}</strong> handy for
                  any support enquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetailsClient;
