"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiShare2,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUser,
  FiStar,
} from "react-icons/fi";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface BookingModalProps {
  bookings: any[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  bookings,
  isOpen,
  onClose,
  onShare,
}) => {
  const router = useRouter();
  const [vehicleImages, setVehicleImages] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchVehicleImages = async () => {
      const imagesMap: { [key: string]: string } = {};

      await Promise.all(
        bookings.map(async (booking) => {
          if (booking.vehicleId) {
            try {
              const res = await VehicleSearchService.getVehicleById(
                booking.vehicleUuid
              );
              const data = res[0].data;
              const photoUrl = data?.photos?.[0]?.cloudinaryUrl || "";
              imagesMap[booking.vehicleId] = photoUrl;
            } catch (error) {
              console.error("Error loading vehicle image:", error);
            }
          }
        })
      );

      setVehicleImages(imagesMap);
    };

    if (isOpen && bookings.length > 0) {
      fetchVehicleImages();
    }
  }, [isOpen, bookings]);

  const handleRateBooking = (bookingId: string) => {
    router.push(`/review/${bookingId}`);
  };

  if (!isOpen || !bookings || bookings.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
      PENDING_PAYMENT_CONFIRMED: "bg-blue-100 text-blue-800",
      SUCCESSFUL: "bg-green-100 text-green-800",
      CONFIRMED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      FAILED_AVAILABILITY: "bg-red-100 text-red-800",
      CANCELLED_BY_USER: "bg-gray-100 text-gray-800",
      CANCELLED_BY_HOST: "bg-gray-100 text-gray-800",
      CANCELLED_BY_ADMIN: "bg-gray-100 text-gray-800",
      IN_PROGRESS_COMPLETED: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      NO_SHOW: "bg-orange-100 text-orange-800",
      ABANDONED: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const selectedDate = bookings[0]?.createdAt
    ? formatDate(bookings[0].createdAt)
    : "";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bookings for {selectedDate}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {bookings.length} booking{bookings.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                {/* Vehicle Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {vehicleImages[booking.vehicleId] ? (
                        <img
                          src={vehicleImages[booking.vehicleId]}
                          alt={booking.vehicleName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          Loading...
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.vehicleName}
                      </h3>
                      <p className="text-gray-600">{booking.bookingType}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {booking.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRateBooking(booking.bookingId)}
                      className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                      title="Rate this booking"
                    >
                      <FiStar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onShare(booking)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Share this booking"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Booking Date
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiClock className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Duration
                      </p>
                      <p className="text-sm text-gray-900">
                        {booking.duration || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiUser className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Customer
                      </p>
                      <p className="text-sm text-gray-900">
                        {booking.customerName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        Location
                      </p>
                      <p className="text-sm text-gray-900">{booking.city}</p>
                    </div>
                  </div>
                </div>

                {/* Price and Rating Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(booking.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRateBooking(booking.bookingId)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    <FiStar className="w-4 h-4" />
                    Rate Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
