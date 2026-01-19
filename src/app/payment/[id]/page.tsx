"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
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

// --- Helpers ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const safeFormat = (dateString: string | undefined | null, fmt: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, fmt) : "Invalid Date";
};

const StatusBadge = ({ status }: { status: string }) => {
  const isConfirmed = status === "CONFIRMED" || status === "SUCCESSFUL";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${isConfirmed
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
        }`}
    >
      {isConfirmed && <FiCheckCircle />}
      {status}
    </span>
  );
};

const BookingDetailsPage = () => {
  const path = usePathname();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id || "";

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");




  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const bookingRes = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`
        );
        const bookingData = bookingRes?.data[0]?.data;

        if (!bookingData) {
          throw new Error("Booking data is missing or invalid.");
        }

        setBooking(bookingData);

        // 2. Fetch Vehicle Details if ID exists
        const vehicleId = bookingData.vehicle?.id;

        if (vehicleId) {
          const vehicleRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {}
          );

          setVehicle(vehicleRes?.data[0]?.data || null);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse">
            Retrieving booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FiShield className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Booking
          </h3>
          <p className="text-red-500 mb-6 text-sm max-w-md">
            {error || "Booking not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 mt-16">
        {/* Header Actions */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 bg-white rounded-full border border-gray-200 mr-2 group-hover:border-blue-200">
              <FiArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Home</span>
          </button>

          {/*   <button className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
            <FiDownload size={16} /> Download Invoice
          </button> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: Vehicle & Itinerary --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Vehicle Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Image Gallery */}
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
                          alt={`Vehicle ${idx}`}
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
                      <FiInfo className="text-blue-500" /> Vehicle Description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Trip Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <FiMapPin className="text-blue-600" /> Trip Itinerary
              </h3>

              <div className="space-y-10">
                {booking.segments && booking.segments.length > 0 ? (
                  booking.segments.map((segment) => (
                    <div
                      key={segment.segmentId}
                      className="relative pl-8 md:pl-10 border-l-2 border-blue-100 last:border-0"
                    >
                      {/* Timeline Connector Dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10"></div>

                      <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-100 relative top-[-10px]">
                        {/* Segment Header */}
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b border-gray-200 pb-4">
                          <span className="inline-flex items-center bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-blue-200">
                            {segment.bookingTypeName}
                          </span>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {safeFormat(
                                segment.startDateTime,
                                "EEEE, MMMM do, yyyy"
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Duration: {segment.duration}
                            </p>
                          </div>
                        </div>

                        {/* Pickup / Dropoff Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Pickup Location
                            </label>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {segment.pickupLocation || "N/A"}
                            </p>
                            <div className="inline-flex items-center gap-1.5 mt-3 text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">
                              <FiClock size={14} />
                              {safeFormat(segment.startDateTime, "h:mm a")}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Drop-off Location
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
                    <p className="text-sm">
                      No specific itinerary details found.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Booker Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiUser className="text-blue-600" /> Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                    Primary Booker
                  </p>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {booking.booker?.fullName || "Guest User"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {booking.booker?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {booking.booker?.customerPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary --- */}
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
                    <FiCalendar size={16} /> Booked On
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
                    Total Amount Paid
                  </span>
                  <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-blue-900 font-bold text-sm mb-2 flex items-center gap-2">
                  <FiCheckCircle /> Booking Confirmed
                </h4>
                <p className="text-blue-700/80 text-xs leading-relaxed">
                  Your ride is scheduled. Use invoice{" "}
                  <strong>{booking.invoiceNumber}</strong> for any support
                  inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetailsPage;
