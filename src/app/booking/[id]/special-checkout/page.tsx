"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiChevronLeft,
  FiShield,
  FiCheck,
  FiTag,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { Navbar } from "@/components/Navbar";
import { BookingService } from "@/controllers/booking/bookingService";
import Footer from "@/components/HomeComponent/Footer";
import cn from "classnames";
import { createData } from "@/controllers/connnector/app.callers";

interface PersonalInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  rideFor: "myself" | "others";
  recipientFullName?: string;
  recipientEmail?: string;
  recipientPhoneNumber?: string;
  extraDetails?: string;
}

interface TripDetails {
  id: string;
  bookingType: string;
  tripStartDate: string;
  tripStartTime: string;
  pickupLocation: string;
  dropoffLocation: string;
}

type PaymentGateway = "MONNIFY" | "PAYSTACK";

const ServicePricingCheckoutPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    rideFor: "myself",
    recipientFullName: "",
    recipientEmail: "",
    recipientPhoneNumber: "",
    extraDetails: "",
  });

  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserDataLocked, setIsUserDataLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGateway>("PAYSTACK");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{10,15}$/.test(phone);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userFullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
      const userEmail = user.email || "";
      const userPhone = user.phoneNumber || "";

      setPersonalInfo((prev) => ({
        ...prev,
        fullName: userFullName,
        email: userEmail,
        phoneNumber: userPhone,
      }));

      setIsUserDataLocked(true);
    } else {
      const savedInfo = Cookies.get("servicePricingPersonalInfo");
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          if (
            confirm("Do you want to use your previous booking information?")
          ) {
            setPersonalInfo(parsed);
          }
        } catch (error) {
          console.error("Error parsing saved info:", error);
        }
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const savedTrips = sessionStorage.getItem("servicePricingTrips");
        const savedEstimate = sessionStorage.getItem("servicePricingEstimate");

        if (savedTrips && savedEstimate) {
          const tripsData = JSON.parse(savedTrips);
          setTrips(tripsData.map((t: any) => t.tripDetails));
          setPriceEstimate(JSON.parse(savedEstimate));
        } else {
          toast.error("No booking data found");
          router.push("/booking/service-pricing");
          return;
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  useEffect(() => {
    if (personalInfo.rideFor === "myself") {
      setPersonalInfo((prev) => ({
        ...prev,
        recipientFullName: prev.fullName,
        recipientEmail: prev.email,
        recipientPhoneNumber: prev.phoneNumber,
      }));
    } else {
      setPersonalInfo((prev) => ({
        ...prev,
        recipientFullName: "",
        recipientEmail: "",
        recipientPhoneNumber: "",
      }));
    }
  }, [
    personalInfo.rideFor,
    personalInfo.fullName,
    personalInfo.email,
    personalInfo.phoneNumber,
  ]);

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => {
      const updated = { ...prev, [field]: value };
      if (!isAuthenticated) {
        Cookies.set("servicePricingPersonalInfo", JSON.stringify(updated), {
          expires: 30,
        });
      }
      return updated;
    });
  };

  const handleRideForChange = (value: "myself" | "others") => {
    setPersonalInfo((prev) => ({ ...prev, rideFor: value }));
  };

  const formatCurrency = (amount: number = 0) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const initiatePayment = async (bookingId: string) => {
    try {
      if (paymentGateway === "MONNIFY") {
        const paymentResponse = await createData("/api/v1/payments/initiate", {
          bookingId: bookingId,
        });

        if (paymentResponse.data.authorizationUrl) {
          sessionStorage.removeItem("servicePricingTrips");
          sessionStorage.removeItem("servicePricingEstimate");
          sessionStorage.removeItem("servicePricingId");
          sessionStorage.removeItem("yearRangeId");

          window.location.href = paymentResponse.data.authorizationUrl;
        } else {
          throw new Error("Payment authorization URL missing");
        }
      } else if (paymentGateway === "PAYSTACK") {
        const paymentResponse = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {},
        );

        if (paymentResponse.data.data) {
          // Clean up session storage before redirecting
          sessionStorage.removeItem("servicePricingTrips");
          sessionStorage.removeItem("servicePricingEstimate");
          sessionStorage.removeItem("servicePricingId");
          sessionStorage.removeItem("yearRangeId");

          window.location.href = paymentResponse.data.data;
        } else {
          throw new Error("Paystack payment initialization failed");
        }
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Payment initialization failed",
      );
    }
  };

  console.log(priceEstimate);

  const handleBookNow = async () => {
    const {
      fullName,
      email,
      phoneNumber,
      rideFor,
      recipientEmail,
      recipientPhoneNumber,
      recipientFullName,
      secondaryPhoneNumber,
      extraDetails,
    } = personalInfo;

    if (!fullName || !email || !phoneNumber) {
      toast.error("Please fill in all required personal information");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      toast.error("Invalid phone number (must be 10-15 digits)");
      return;
    }

    if (rideFor === "others") {
      if (!recipientFullName || !recipientEmail || !recipientPhoneNumber) {
        toast.error("Please fill in all recipient information");
        return;
      }
      if (!validateEmail(recipientEmail)) {
        toast.error("Invalid recipient email format");
        return;
      }
      if (!validatePhone(recipientPhoneNumber)) {
        toast.error("Invalid recipient phone number (must be 10-15 digits)");
        return;
      }
    }

    setIsCreatingBooking(true);
    setError(null);

    try {
      // Get trip data from session storage
      const savedTrips = sessionStorage.getItem("servicePricingTrips");
      if (!savedTrips) {
        throw new Error("Trip data not found. Please start over.");
      }

      const tripsData: any[] = JSON.parse(savedTrips);
      const firstTrip = tripsData[0]?.tripDetails;

      if (!firstTrip) {
        throw new Error("Trip details not found.");
      }

      // Format dates properly
      const formatDateForAPI = (dateString: string) => {
        return format(new Date(dateString), "yyyy-MM-dd");
      };

      const formatTimeForAPI = (timeString: string) => {
        return format(new Date(timeString), "HH:mm:ss");
      };

      // Create booking payload using extracted trip data
      const bookingPayload = {
        servicePricingId: id,
        bookingTypeId:
          firstTrip.bookingType || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        startDate: formatDateForAPI(
          firstTrip.tripStartDate || new Date().toISOString(),
        ),
        startTime: formatTimeForAPI(
          firstTrip.tripStartTime || new Date().toISOString(),
        ),
        pickupLocationString: firstTrip.pickupLocation || "string",
        pickupLatitude: firstTrip.pickupCoordinates?.lat || 0.1,
        pickupLongitude: firstTrip.pickupCoordinates?.lng || 0.1,
        dropoffLocationString: firstTrip.dropoffLocation || "string",
        dropoffLatitude: firstTrip.dropoffCoordinates?.lat || 0.1,
        dropoffLongitude: firstTrip.dropoffCoordinates?.lng || 0.1,
        primaryPhoneNumber: phoneNumber,
        secondaryPhoneNumber: secondaryPhoneNumber || phoneNumber,
        guestFullName: fullName,
        guestEmail: email,
        guestPhoneNumber: phoneNumber,
        isBookingForOthers: rideFor === "others",
        recipientFullName:
          rideFor === "others" ? recipientFullName || fullName : fullName,
        recipientEmail: rideFor === "others" ? recipientEmail || email : email,
        recipientPhoneNumber:
          rideFor === "others"
            ? recipientPhoneNumber || phoneNumber
            : phoneNumber,
        purposeOfRide: extraDetails || "N/A",
        extraDetails: extraDetails || "N/A",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
      };

      // If you have calculationId in priceEstimate, add it
      //   if (priceEstimate?.calculationId) {
      //     bookingPayload.calculationId = priceEstimate.calculationId;
      //   }
      console.log(bookingPayload);
      const bookingResponse =
        await BookingService.createSpecialBooking(bookingPayload);

      if (!isAuthenticated) {
        Cookies.set(
          "servicePricingPersonalInfo",
          JSON.stringify(personalInfo),
          {
            expires: 30,
          },
        );
      }
      console.log(bookingResponse);
      // Initiate payment based on selected gateway
      await initiatePayment(bookingResponse.data.data.bookingId);

      // Clear session storage after successful payment initiation
      sessionStorage.removeItem("servicePricingTrips");
      sessionStorage.removeItem("servicePricingEstimate");
      sessionStorage.removeItem("servicePricingId");
      sessionStorage.removeItem("yearRangeId");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create booking. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingBooking(false);
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

  if (!priceEstimate || trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">No booking data found</p>
            <button
              onClick={() => router.push("/booking/service-pricing")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Complete Your Booking
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <MdPayment className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Booking Invoice</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Trip Details
                  </h4>
                  <div className="space-y-4">
                    {trips.map((trip, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <p className="font-semibold text-gray-900 mb-3">
                          Trip {index + 1}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FiCalendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(trip.tripStartDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FiClock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Time:</span>
                            <span>
                              {format(new Date(trip.tripStartTime), "hh:mm a")}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700 col-span-2">
                            <FiMapPin className="w-4 h-4 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium">Pickup:</span>
                              <p className="text-xs mt-1">
                                {trip.pickupLocation}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-gray-700 col-span-2">
                            <FiMapPin className="w-4 h-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium">Drop-off:</span>
                              <p className="text-xs mt-1">
                                {trip.dropoffLocation}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                              <FiTag className="w-3 h-3" />
                              {trip.bookingType}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium">
                        {formatCurrency(priceEstimate.basePrice || 0)}
                      </span>
                    </div>
                    {priceEstimate.platformFeeAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">
                          {formatCurrency(priceEstimate.platformFeeAmount)}
                        </span>
                      </div>
                    )}
                    {priceEstimate.vatAmount && priceEstimate.vatAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          VAT ({priceEstimate.vatPercentage}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(priceEstimate.vatAmount)}
                        </span>
                      </div>
                    )}
                    {priceEstimate.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount</span>
                        <span>
                          -{formatCurrency(priceEstimate.discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 mt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-blue-600">
                          {formatCurrency(priceEstimate.totalPrice || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <FiUser className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {isAuthenticated && isUserDataLocked && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Using your account information
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your personal details are pre-filled from your account.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Who is this ride for? *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleRideForChange("myself")}
                      className={`flex-1 py-3 px-4 border-2 rounded-lg text-center transition ${
                        personalInfo.rideFor === "myself"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <FiUser className="w-5 h-5 mx-auto mb-1" />
                      <span className="font-medium">Myself</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRideForChange("others")}
                      className={`flex-1 py-3 px-4 border-2 rounded-lg text-center transition ${
                        personalInfo.rideFor === "others"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <FiUser className="w-5 h-5 mx-auto mb-1" />
                      <span className="font-medium">Others</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        disabled={isUserDataLocked}
                        className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isUserDataLocked
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={isUserDataLocked}
                        className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isUserDataLocked
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={personalInfo.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        disabled={isUserDataLocked}
                        className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isUserDataLocked
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone (Optional)
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={personalInfo.secondaryPhoneNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "secondaryPhoneNumber",
                            e.target.value,
                          )
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter secondary phone"
                      />
                    </div>
                  </div>
                </div>

                {personalInfo.rideFor === "others" && (
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Recipient Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Full Name *
                        </label>
                        <input
                          type="text"
                          value={personalInfo.recipientFullName}
                          onChange={(e) =>
                            handleInputChange(
                              "recipientFullName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter recipient's full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Email *
                        </label>
                        <input
                          type="email"
                          value={personalInfo.recipientEmail}
                          onChange={(e) =>
                            handleInputChange("recipientEmail", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter recipient's email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={personalInfo.recipientPhoneNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "recipientPhoneNumber",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter recipient's phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Details (Optional)
                  </label>
                  <textarea
                    value={personalInfo.extraDetails}
                    onChange={(e) =>
                      handleInputChange("extraDetails", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any special requests or details"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(priceEstimate.totalPrice || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>

                {/* Payment Gateway Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">
                    Select Payment Method
                  </h3>
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

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FiShield className="w-4 h-4" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FiCheck className="w-4 h-4" />
                    <span>Safe Payment Processing</span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={isCreatingBooking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingBooking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdPayment className="w-5 h-5" />
                      Pay with{" "}
                      {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"}
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  By clicking "Pay Now", you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicePricingCheckoutPage;
