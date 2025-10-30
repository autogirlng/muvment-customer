"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { BookingService } from "@/controllers/booking/bookingService";

const BookingTrackingPage = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId || paymentId) {
      loadTrackingData();
    }
  }, [bookingId, paymentId]);

  const loadTrackingData = async () => {
    try {
      setLoading(true);

      if (bookingId) {
        const bookingData = await BookingService.getBookingById(bookingId);
        setBooking(bookingData);

        // Load payment data if available
        if (bookingData.paymentId) {
          // You might need to implement a method to get payment by booking ID
        }
      }

      if (paymentId) {
        // Load payment details
        // You might need to implement a method to get payment by ID
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return (
      `₦${amount?.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}` || "N/A"
    );
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
      SUCCESSFUL: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED_BY_USER: "bg-gray-100 text-gray-800",
      IN_PROGRESS_COMPLETED: "bg-blue-100 text-blue-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading tracking information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking && !payment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
          <div className="text-center py-12">
            <FiX className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Tracking Data Found
            </h2>
            <p className="text-gray-600">
              Please check your booking ID or payment ID
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Tracking
          </h1>
          <p className="text-gray-600">Track your booking and payment status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Status
              </h2>

              {booking ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {booking.bookingStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-mono text-sm text-gray-900">
                      {booking.bookingId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="text-gray-900">{booking.vehicleName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Booking Type</span>
                    <span className="text-gray-900">{booking.bookingType}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No booking information available
                </p>
              )}
            </div>

            {/* Payment Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Status
              </h2>

              {payment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-mono text-sm text-gray-900">
                      {payment.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(payment.amountPaid)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-sm text-gray-900">
                      {payment.transactionReference}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No payment information available
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {booking && (
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    View Booking Details
                  </button>
                )}
                {payment && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
                    Download Receipt
                  </button>
                )}
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                  Contact Support
                </button>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Route Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMapPin className="w-5 h-5 text-green-500" />
                  <span>Pickup Location</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMapPin className="w-5 h-5 text-red-500" />
                  <span>Drop-off Location</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiCalendar className="w-5 h-5 text-blue-500" />
                  <span>Booking Date</span>
                </div>
              </div>
            </div>

            {/* IDs Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Tracking IDs
              </h4>
              {bookingId && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600">Booking ID</p>
                  <p className="text-xs font-mono text-gray-900 truncate">
                    {bookingId}
                  </p>
                </div>
              )}
              {paymentId && (
                <div>
                  <p className="text-xs text-gray-600">Payment ID</p>
                  <p className="text-xs font-mono text-gray-900 truncate">
                    {paymentId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTrackingPage;
