"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { clarityEvent } from "@/services/clarity";
import { trackBooking } from "@/services/analytics";
import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

type PaymentGateway = "MONNIFY" | "PAYSTACK";

const BRAND = "#0673FF";

// Render catalogue names in a readable case ("EXECUTIVE SUV" -> "Executive SUV").
const prettyName = (s?: string) =>
  (s || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === "suv" ? "SUV" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

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
  servicePricingName?: string;
  rideType?: string;
  discounted: boolean;
}

const BookingSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const homeOrDashboard = user ? "/dashboard" : "/";
  const doneHref = user ? "/dashboard/my-booking" : "/";
  const bookingId = searchParams.get("bookingId");

  const [bookingDetails, setBookingDetails] = useState<BookingResponse | null>(null);
  const [servicePricingInfo, setServicePricingInfo] = useState<{
    imageUrl?: string;
    minYear?: number;
    maxYear?: number;
    name?: string;
  } | null>(null);
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

    // The booking is created, so the draft itinerary should not carry into a
    // new booking or onto another car.
    try {
      sessionStorage.removeItem("trips");
      sessionStorage.removeItem("tripsSeedSig");
      sessionStorage.removeItem("priceEstimateId");
      sessionStorage.removeItem("couponCode");
    } catch {}

    loadBookingDetails();
  }, [bookingId, router]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getBookingById(bookingId!);
      const bookingData = response;
      const details = bookingData[0].data;
      setBookingDetails(details);

      if (details?.bookingStatus === "CONFIRMED") {
        clarityEvent("payment_succeeded", {
          booking_id: details?.bookingId ?? bookingId,
          invoice_number: details?.invoiceNumber,
          amount: details?.totalPrice,
        });
        const purchaseKey = `ga_purchase_${details?.bookingId ?? bookingId}`;
        if (
          typeof window !== "undefined" &&
          !localStorage.getItem(purchaseKey)
        ) {
          trackBooking({
            vehicleId: details?.vehicle?.vehicleId ?? "N/A",
            vehicleName: details?.vehicle?.vehicleName ?? "Vehicle",
            category: details?.bookingCategory ?? "N/A",
            price: details?.totalPrice ?? 0,
            duration: details?.segments?.[0]?.bookingTypeName ?? "",
            bookingId: details?.bookingId ?? (bookingId as string),
          });
          localStorage.setItem(purchaseKey, "1");
        }
      } else {
        clarityEvent("booking_success_viewed", {
          booking_id: details?.bookingId ?? bookingId,
          status: details?.bookingStatus,
        });
      }

      const hasVehicle =
        details?.vehicle?.vehicleName &&
        details.vehicle.vehicleName !== "Vehicle Assignment Pending" &&
        details.vehicle?.licensePlate &&
        details.vehicle.licensePlate !== "N/A";
      if (!hasVehicle && (details?.servicePricingName || details?.rideType)) {
        try {
          const showcase =
            await ServicePricingService.getServicePricingShowcase();
          const norm = (s?: string) => (s || "").trim().toLowerCase();
          const target = norm(details.servicePricingName);
          const ride = norm(details.rideType);
          const list = showcase || [];
          const pick = (pred: (p: any) => boolean) => {
            const c = list.filter(pred);
            return c.find((p: any) => p.imageUrl) || c[0];
          };
          const match =
            pick((p: any) => !!ride && norm(p.rideType) === ride) ||
            pick(
              (p: any) =>
                norm(p.servicePricingName) === target ||
                norm(p.name) === target,
            );
          if (match) {
            setServicePricingInfo({
              imageUrl: match.imageUrl,
              minYear: match.minYear,
              maxYear: match.maxYear,
              name: match.servicePricingName || match.name,
            });
          } else {
            setServicePricingInfo({ name: details.servicePricingName });
          }
        } catch {
          setServicePricingInfo({ name: details.servicePricingName });
        }
      }
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
    const ref = bookingDetails?.invoiceNumber || bookingId;
    if (ref) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      toast.success("Invoice number copied to clipboard!");
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
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0673FF]" />
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="flex items-center justify-center h-screen px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking not found</h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "Unable to load booking details. The booking may have expired or been cancelled."}
            </p>
            <button
              onClick={() => router.push(homeOrDashboard)}
              className="px-6 py-3 bg-[#0673FF] hover:bg-[#0560d6] text-white rounded-xl transition font-semibold"
            >
              {user ? "Go to dashboard" : "Return home"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBookingForOthers =
    !!bookingDetails.recipient &&
    bookingDetails.booker?.fullName !== bookingDetails.recipient?.fullName;

  const isPending = bookingDetails.bookingStatus === "PENDING_PAYMENT";
  const total = bookingDetails.totalPrice || 0;
  const statusLabel = (bookingDetails.bookingStatus || "").replace(/_/g, " ");

  const hasVehicle =
    !!bookingDetails.vehicle?.vehicleName &&
    bookingDetails.vehicle.vehicleName !== "Vehicle Assignment Pending" &&
    !!bookingDetails.vehicle?.licensePlate &&
    bookingDetails.vehicle.licensePlate !== "N/A";
  const vehicleTitle = hasVehicle
    ? bookingDetails.vehicle.vehicleName
    : prettyName(servicePricingInfo?.name || bookingDetails.servicePricingName) ||
      "Vehicle";

  const paymentCard = (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="text-center pb-4 border-b border-gray-100">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {isPending ? "Amount due" : "Total amount"}
        </p>
        <p className="mt-1 text-3xl font-bold" style={{ color: BRAND }}>
          {formatCurrency(total)}
        </p>
      </div>

      {isPending ? (
        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pay with</h3>
          <div className="space-y-2.5 mb-4">
            {(["PAYSTACK", "MONNIFY"] as PaymentGateway[]).map((gw) => (
              <div
                key={gw}
                onClick={() => setPaymentGateway(gw)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all",
                  paymentGateway === gw
                    ? "border-[#0673FF] bg-[#0673FF]/5"
                    : "border-gray-200 bg-white hover:border-[#cfe0fb]",
                )}
              >
                <img
                  src={
                    gw === "PAYSTACK"
                      ? "/images/paymentgateway/paystack1.svg"
                      : "/images/paymentgateway/monnify.svg"
                  }
                  alt={gw}
                  className="h-7 w-auto object-contain"
                />
                {paymentGateway === gw ? (
                  <FiCheckCircle className="text-[#0673FF] min-w-[22px]" size={22} />
                ) : (
                  <FiCircle className="text-gray-300 min-w-[22px]" size={22} />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="hidden w-full bg-[#0673FF] hover:bg-[#0560d6] text-white font-semibold py-3.5 px-4 rounded-xl transition disabled:bg-gray-300 disabled:cursor-not-allowed lg:flex items-center justify-center gap-2 text-sm"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard className="w-4 h-4" />
                Pay with {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"}
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-gray-500">
            Or pay later with invoice {bookingDetails.invoiceNumber}
          </p>
        </div>
      ) : (
        <div className="pt-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-[#EAF2FF] border border-[#cfe0fb] p-4">
            <FiCheckCircle
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              style={{ color: BRAND }}
            />
            <p className="text-sm text-gray-700">
              This booking is {statusLabel.toLowerCase()}. Keep invoice{" "}
              <span className="font-semibold">{bookingDetails.invoiceNumber}</span>{" "}
              for your records.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-28 lg:pb-0">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Status header */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
                isPending ? "bg-[#EAF2FF]" : "bg-green-100",
              )}
            >
              {isPending ? (
                <FiCreditCard className="h-6 w-6" style={{ color: BRAND }} />
              ) : (
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {isPending ? "Complete your payment" : "Booking confirmed"}
              </h1>
              <p className="mt-1 text-gray-600">
                {isPending
                  ? "Your booking is reserved. Pay below to confirm it."
                  : "Your booking is confirmed. The details are below."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
              Invoice
              <span className="font-semibold text-gray-900">
                {bookingDetails.invoiceNumber}
              </span>
              <button
                onClick={copyBookingId}
                className="ml-1 text-[#0673FF] hover:text-[#0560d6]"
                aria-label="Copy invoice"
              >
                <FiCopy className="h-3.5 w-3.5" />
              </button>
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                getBookingStatusColor(bookingDetails.bookingStatus),
              )}
            >
              {statusLabel}
            </span>
            {bookingDetails.bookedAt && (
              <span className="text-xs text-gray-500">
                Booked {formatDate(bookingDetails.bookedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
          {/* Left: what was booked */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <FiMapPin className="h-5 w-5" style={{ color: BRAND }} />
                <h2 className="text-base font-semibold text-gray-900">
                  Trip details
                </h2>
              </div>

              <div className="space-y-4">
                {(bookingDetails.segments || []).map((segment, index) => (
                  <div
                    key={segment.segmentId || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      {(bookingDetails.segments || []).length > 1 ? (
                        <span className="text-sm font-semibold text-gray-900">
                          Trip {index + 1}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">
                          Itinerary
                        </span>
                      )}
                      {segment.bookingTypeName && (
                        <span className="inline-flex items-center rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#0673FF]">
                          {segment.bookingTypeName}
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FiCalendar className="h-3.5 w-3.5" />
                        {formatDate(segment.startDateTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FiClock className="h-3.5 w-3.5" />
                        {formatTime(segment.startDateTime)}
                        {segment.endDateTime
                          ? ` - ${formatTime(segment.endDateTime)}`
                          : ""}
                      </span>
                      {segment.duration && (
                        <span className="inline-flex items-center gap-1.5">
                          <FiClock className="h-3.5 w-3.5" />
                          {segment.duration}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="mb-0.5 text-xs text-gray-400">Pickup</p>
                        <p className="flex items-start gap-1.5 text-gray-800">
                          <FiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="break-words">
                            {segment.pickupLocation}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs text-gray-400">Drop-off</p>
                        <p className="flex items-start gap-1.5 text-gray-800">
                          <FiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="break-words">
                            {segment.dropoffLocation}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {servicePricingInfo?.imageUrl && (
                <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-[#EAF2FF] via-[#F5F9FF] to-white p-6">
                  <img
                    src={servicePricingInfo.imageUrl}
                    alt={vehicleTitle}
                    className="max-h-full w-auto max-w-sm object-contain mix-blend-multiply"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Vehicle
                </p>
                <h3 className="text-xl font-bold text-gray-900">{vehicleTitle}</h3>
                {hasVehicle ? (
                  bookingDetails.vehicle?.licensePlate &&
                  bookingDetails.vehicle.licensePlate !== "N/A" && (
                    <p className="mt-1 text-sm text-gray-600">
                      License plate: {bookingDetails.vehicle.licensePlate}
                    </p>
                  )
                ) : (
                  <>
                    {(servicePricingInfo?.minYear ||
                      servicePricingInfo?.maxYear) && (
                      <p className="mt-1 text-sm text-gray-600">
                        Vehicle Year: {servicePricingInfo?.minYear} -{" "}
                        {servicePricingInfo?.maxYear}
                      </p>
                    )}
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#cfe0fb] bg-[#EAF2FF] p-4">
                      <FiAlertCircle
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: BRAND }}
                      />
                      <p className="text-sm text-gray-700">
                        The exact vehicle assigned to your booking will be shared
                        with you and updated here as soon as it has been assigned.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Booking details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <FiUser className="h-5 w-5" style={{ color: BRAND }} />
                <h2 className="text-base font-semibold text-gray-900">
                  Booking details
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-0.5 text-xs text-gray-400">Booked by</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bookingDetails.booker?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {bookingDetails.booker?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bookingDetails.booker?.customerPhone ||
                      bookingDetails.primaryPhoneNumber ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-gray-400">Payment method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bookingDetails.paymentMethod || "N/A"}
                  </p>
                </div>

                {isBookingForOthers && (
                  <>
                    <div className="border-t border-gray-100 sm:col-span-2" />
                    <div className="sm:col-span-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Recipient
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-gray-400">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {bookingDetails.recipient?.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {bookingDetails.recipient?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {bookingDetails.recipient?.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </>
                )}

                {bookingDetails.purposeOfRide &&
                  bookingDetails.purposeOfRide !== "N/A" && (
                    <div className="sm:col-span-2">
                      <p className="mb-0.5 text-xs text-gray-400">
                        Purpose of ride
                      </p>
                      <p className="text-sm text-gray-700">
                        {bookingDetails.purposeOfRide}
                      </p>
                    </div>
                  )}

                {bookingDetails.extraDetails &&
                  bookingDetails.extraDetails !== "N/A" && (
                    <div className="sm:col-span-2">
                      <p className="mb-0.5 text-xs text-gray-400">Extra details</p>
                      <p className="text-sm text-gray-700">
                        {bookingDetails.extraDetails}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right: payment */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <div className="hidden lg:block">{paymentCard}</div>
            <div className="lg:hidden">{paymentCard}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push(doneHref)}
            className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
          >
            {user ? "Go to my bookings" : "Return home"}
          </button>
        </div>
      </div>

      {isPending && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">Amount due</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="ml-auto flex max-w-[60%] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0673FF] py-3 text-sm font-semibold text-white transition hover:bg-[#0560d6] disabled:bg-gray-300"
          >
            {isProcessingPayment ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard className="h-4 w-4" />
                Pay now
              </>
            )}
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

const BookingSuccessPage = () => (
  <Suspense fallback={null}>
    <BookingSuccessContent />
  </Suspense>
);

export default BookingSuccessPage;