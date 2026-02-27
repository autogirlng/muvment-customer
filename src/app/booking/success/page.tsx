"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiCircle,
  FiCreditCard,
  FiCopy,
  FiDownload,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import cn from "classnames";
import { createData } from "@/controllers/connnector/app.callers";
import { BookingService } from "@/controllers/booking/bookingService";
import Cookies from "js-cookie";

type PaymentGateway = "MONNIFY" | "PAYSTACK";

interface BookingResponse {
  bookingId: string;
  invoiceNumber: string;
  bookingStatus: string;
  paymentMethod: string;
  channel: string;
  bookedAt: string;
  originalPrice: number;
  discountAmount: number;
  totalPrice: number;
  purposeOfRide: string;
  extraDetails: string;
  primaryPhoneNumber: string;
  calculationId: string;
  booker: {
    fullName: string;
    email: string;
    customerPhone: string;
  };
  recipient: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  vehicle: {
    vehicleId: string;
    vehicleName: string;
    licensePlate: string;
  };
  segments: Array<{
    segmentId: string;
    startDateTime: string;
    endDateTime: string;
    duration: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupLatitude: number;
    pickupLongitude: number;
    bookingTypeName: string;
    bookingId: string;
    bookingStatus: string;
    bookingTotalPrice: number;
    vehicle: any;
    booker: {
      fullName: string;
      email: string;
      customerPhone: string;
    };
    recipient: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
  }>;
  bookingCategory: string;
  discounted: boolean;
}

const BookingSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [bookingDetails, setBookingDetails] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>("PAYSTACK");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      toast.error("No booking ID found");
      router.push("/");
      return;
    }

    loadBookingDetails();
  }, [bookingId, router]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getBookingById(bookingId!);
      const bookingData = response;
      setBookingDetails(bookingData[0].data);
      
    } catch (err: any) {
      console.error("Error loading booking details:", err);
      setError(err.response?.data?.message || err.message || "Failed to load booking details");
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "hh:mm a");
    } catch {
      return "Invalid time";
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;

    setIsProcessingPayment(true);
    setError(null);

    try {
      if (paymentGateway === "MONNIFY") {
        const paymentResponse = await createData("/api/v1/payments/initiate", {
          bookingId: bookingId,
        });

        const authUrl =
          paymentResponse.data?.data?.authorizationUrl ||
          paymentResponse.data?.authorizationUrl ||
          paymentResponse.data?.data?.data?.authorizationUrl;

        if (authUrl) {
          // Clear any stored session data
          sessionStorage.removeItem("servicePricingTrips");
          sessionStorage.removeItem("servicePricingEstimate");
          sessionStorage.removeItem("servicePricingId");
          sessionStorage.removeItem("yearRangeId");
          Cookies.remove("servicePricingBookingId");
          
          window.location.href = authUrl;
        } else {
          throw new Error("Payment authorization URL missing");
        }
      } else if (paymentGateway === "PAYSTACK") {
        const paymentResponse = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {},
        );

        const paymentUrl =
          paymentResponse.data?.data ||
          paymentResponse.data?.data?.authorization_url ||
          paymentResponse.data?.authorization_url;

        if (paymentUrl) {
          // Clear any stored session data
          sessionStorage.removeItem("servicePricingTrips");
          sessionStorage.removeItem("servicePricingEstimate");
          sessionStorage.removeItem("servicePricingId");
          sessionStorage.removeItem("yearRangeId");
          Cookies.remove("servicePricingBookingId");
          
          window.location.href = paymentUrl;
        } else {
          throw new Error("Paystack payment initialization failed");
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Payment initialization failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      toast.success("Booking ID copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Booking Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Unable to load booking details. The booking may have expired or been cancelled."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBookingForOthers = bookingDetails.booker.fullName !== bookingDetails.recipient.fullName;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Booking Successful!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your booking has been created successfully. You can now complete your payment below.
          </p>
        </div>

        {/* Booking ID and Status Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Booking ID: <span className="font-mono font-bold">{bookingDetails.bookingId}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(bookingDetails.bookingStatus)}`}>
                {bookingDetails.bookingStatus.replace("_", " ")}
              </span>
              <button
                onClick={copyBookingId}
                className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
              >
                <FiCopy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy ID"}
              </button>
            </div>
          </div>
          <div className="mt-2 text-center sm:text-left">
            <p className="text-xs text-blue-600">
              Invoice: {bookingDetails.invoiceNumber} | Booked: {formatDate(bookingDetails.bookedAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-100">
                <div className="flex items-center gap-2 text-gray-900">
                  <FiUser className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Booking Information</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booker Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.booker.fullName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booker Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.booker.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booker Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.booker.customerPhone || bookingDetails.primaryPhoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bookingDetails.paymentMethod}
                    </p>
                  </div>
                  
                  {/* Recipient Information - Only show if different from booker */}
                  {isBookingForOthers && (
                    <>
                      <div className="col-span-2 border-t border-gray-200 my-2"></div>
                      <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Recipient Information
                        </h3>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Recipient Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {bookingDetails.recipient.fullName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Recipient Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {bookingDetails.recipient.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Recipient Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {bookingDetails.recipient.phoneNumber || "N/A"}
                        </p>
                      </div>
                    </>
                  )}

                  {(bookingDetails.purposeOfRide && bookingDetails.purposeOfRide !== "N/A") && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Purpose of Ride</p>
                      <p className="text-sm text-gray-700">
                        {bookingDetails.purposeOfRide}
                      </p>
                    </div>
                  )}

                  {(bookingDetails.extraDetails && bookingDetails.extraDetails !== "N/A") && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Extra Details</p>
                      <p className="text-sm text-gray-700">
                        {bookingDetails.extraDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-100">
                <div className="flex items-center gap-2 text-gray-900">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold">Vehicle Details</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {bookingDetails.vehicle.vehicleName}
                    </h3>
                    {bookingDetails.vehicle.licensePlate !== "N/A" && (
                      <p className="text-sm text-gray-600 mb-2">
                        License Plate: {bookingDetails.vehicle.licensePlate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-100">
                <div className="flex items-center gap-2 text-gray-900">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold">Trip Details</h2>
                </div>
              </div>

              <div className="p-6">
                {bookingDetails.segments.map((segment, index) => (
                  <div key={segment.segmentId} className={index > 0 ? "mt-6 pt-6 border-t border-gray-200" : ""}>
                    {bookingDetails.segments.length > 1 && (
                      <p className="text-sm font-semibold text-gray-900 mb-4">
                        Trip {index + 1}
                      </p>
                    )}

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {segment.bookingTypeName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiCalendar className="w-4 h-4 text-blue-500" />
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(segment.startDateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiClock className="w-4 h-4 text-blue-500" />
                        <span>
                          <span className="font-medium">Time:</span>{" "}
                          {formatTime(segment.startDateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FiClock className="w-4 h-4 text-orange-500" />
                        <span>
                          <span className="font-medium">Duration:</span>{" "}
                          {segment.duration}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-green-500" />
                        <span>
                          <span className="font-medium">Pickup:</span>{" "}
                          {segment.pickupLocation}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-red-500" />
                        <span>
                          <span className="font-medium">Drop-off:</span>{" "}
                          {segment.dropoffLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 text-center border-b border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(bookingDetails.totalPrice || 0)}
                </div>
                <p className="text-sm text-gray-600">TOTAL AMOUNT</p>
              </div>

              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">
                  Complete Your Payment
                </h3>

                <div className="mb-6">
                  <div className="flex flex-col gap-3">
                    <div
                      onClick={() => setPaymentGateway("PAYSTACK")}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                        paymentGateway === "PAYSTACK"
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-100 bg-white hover:border-blue-200",
                      )}
                    >
                      <img
                        src="/images/paymentgateway/paystack1.svg"
                        alt="Paystack"
                        className="h-8 w-auto object-contain"
                      />

                      {paymentGateway === "PAYSTACK" ? (
                        <FiCheckCircle
                          className="text-blue-600 min-w-[24px]"
                          size={24}
                        />
                      ) : (
                        <FiCircle
                          className="text-gray-300 min-w-[24px]"
                          size={24}
                        />
                      )}
                    </div>
                    <div
                      onClick={() => setPaymentGateway("MONNIFY")}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                        paymentGateway === "MONNIFY"
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-100 bg-white hover:border-blue-200",
                      )}
                    >
                      <img
                        src="/images/paymentgateway/monnify.svg"
                        alt="Monnify"
                        className="h-8 w-auto object-contain"
                      />

                      {paymentGateway === "MONNIFY" ? (
                        <FiCheckCircle
                          className="text-blue-600 min-w-[24px]"
                          size={24}
                        />
                      ) : (
                        <FiCircle
                          className="text-gray-300 min-w-[24px]"
                          size={24}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment || bookingDetails.bookingStatus !== "PENDING_PAYMENT"}
                  className={cn(
                    "w-full font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm",
                    bookingDetails.bookingStatus === "PENDING_PAYMENT"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                  )}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : bookingDetails.bookingStatus === "PENDING_PAYMENT" ? (
                    <>
                      <FiCreditCard className="w-4 h-4" />
                      Pay Now with {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"}
                    </>
                  ) : (
                    `Booking ${bookingDetails.bookingStatus.replace("_", " ")}`
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                {bookingDetails.bookingStatus !== "PENDING_PAYMENT" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 text-center">
                      This booking is no longer pending payment. Current status: {bookingDetails.bookingStatus.replace("_", " ")}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  You can also pay later using this Booking ID: {bookingDetails.bookingId.substring(0,8)}...
                </p>

              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Return to Home
          </button>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingSuccessPage;