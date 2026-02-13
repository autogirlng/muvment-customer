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
  FiAlertCircle,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi";
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

  // New state for checkbox
  const [usePreviousInfo, setUsePreviousInfo] = useState(false);
  const [hasPreviousInfo, setHasPreviousInfo] = useState(false);
  const [existingBookingId, setExistingBookingId] = useState<string | null>(
    null,
  );

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
      // Check if there's saved info in cookies
      const savedInfo = Cookies.get("servicePricingPersonalInfo");
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          setHasPreviousInfo(true);
          // Don't auto-populate, wait for checkbox
        } catch (error) {
          console.error("Error parsing saved info:", error);
        }
      }
    }

    // Check for existing booking ID
    const savedBookingId = Cookies.get("servicePricingBookingId");
    if (savedBookingId) {
      setExistingBookingId(savedBookingId);
      console.log("Found existing booking ID:", savedBookingId);
    }
  }, [isAuthenticated, user]);

  // Handle checkbox toggle
  useEffect(() => {
    if (usePreviousInfo && hasPreviousInfo && !isAuthenticated) {
      const savedInfo = Cookies.get("servicePricingPersonalInfo");
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          setPersonalInfo(parsed);
        } catch (error) {
          console.error("Error parsing saved info:", error);
        }
      }
    } else if (!usePreviousInfo && !isAuthenticated) {
      // Clear the form when unchecked
      setPersonalInfo({
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
    }
  }, [usePreviousInfo, hasPreviousInfo, isAuthenticated]);

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
          router.push("/");
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
    })}`.replace(/₦/, "NGN ");
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
        console.log(paymentGateway);
        const authUrl =
          paymentResponse.data?.data?.authorizationUrl ||
          paymentResponse.data?.authorizationUrl ||
          paymentResponse.data?.data?.data?.authorizationUrl;

        console.log("Authorization URL:", authUrl);

        if (authUrl) {
          // Clean up storage before redirect
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

        console.log("Payment URL:", paymentUrl);

        if (paymentUrl) {
          // Clean up storage before redirect
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
      throw new Error(
        error.response?.data?.message || "Payment initialization failed",
      );
    }
  };

  const createNewBooking = async () => {
    const savedTrips = sessionStorage.getItem("servicePricingTrips");
    if (!savedTrips) {
      throw new Error("Trip data not found. Please start over.");
    }

    const tripsData: any[] = JSON.parse(savedTrips);
    const firstTrip = tripsData[0]?.tripDetails;

    if (!firstTrip) {
      throw new Error("Trip details not found.");
    }

    const formatDateForAPI = (dateString: string) => {
      return format(new Date(dateString), "yyyy-MM-dd");
    };

    const formatTimeForAPI = (timeString: string) => {
      return format(new Date(timeString), "HH:mm:ss");
    };

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

    const bookingResponse =
      await BookingService.createSpecialBooking(bookingPayload);

    const newBookingId = bookingResponse.data.data.bookingId;

    // Store booking ID in cookies (expires in 1 day)
    Cookies.set("servicePricingBookingId", newBookingId, { expires: 1 });

    return newBookingId;
  };

  const handleBookNow = async () => {
    const {
      fullName,
      email,
      phoneNumber,
      rideFor,
      recipientEmail,
      recipientPhoneNumber,
      recipientFullName,
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
      let bookingId: string;

      // Check if we have an existing booking ID
      if (existingBookingId) {
        bookingId = existingBookingId;
      } else {
        bookingId = await createNewBooking();
        setExistingBookingId(bookingId);
      }
      if (!isAuthenticated) {
        Cookies.set(
          "servicePricingPersonalInfo",
          JSON.stringify(personalInfo),
          {
            expires: 30,
          },
        );
      }

      await initiatePayment(bookingId);

      sessionStorage.removeItem("servicePricingTrips");
      sessionStorage.removeItem("servicePricingEstimate");
      sessionStorage.removeItem("servicePricingId");
      sessionStorage.removeItem("yearRangeId");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to process booking. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      if (error.message?.includes("booking")) {
        Cookies.remove("servicePricingBookingId");
        setExistingBookingId(null);
      }
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition"
        >
          <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center">
            <span className="text-sm">✕</span>
          </div>
          <span className="font-medium">Cancel</span>
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Complete Your Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Information & Booking Invoice */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-100">
                <div className="flex items-center gap-2 text-gray-900">
                  <FiUser className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">
                    Personal Information
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {/* Account Info Banner */}
                {isAuthenticated && isUserDataLocked && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900">
                          Using your account information
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Your personal details are pre-filled from your
                          account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Banner for non-authenticated users */}
                {!isAuthenticated && hasPreviousInfo && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900">
                          We found previous information
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Do you wish to auto-fill form data with your stored
                          info to save time and avoid errors?
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Who is this ride for */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Who is this ride for?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rideFor"
                        value="myself"
                        checked={personalInfo.rideFor === "myself"}
                        onChange={() => handleRideForChange("myself")}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Myself</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rideFor"
                        value="others"
                        checked={personalInfo.rideFor === "others"}
                        onChange={() => handleRideForChange("others")}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Others</span>
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={isUserDataLocked}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        isUserDataLocked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={isUserDataLocked}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        isUserDataLocked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone number- primary
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          className="h-11 px-3 border border-gray-300 rounded-lg bg-white flex items-center gap-2 hover:bg-gray-50 transition"
                        >
                          <span className="text-xl">🇳🇬</span>
                          <span className="text-sm text-gray-700">+234</span>
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="tel"
                        value={personalInfo.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        disabled={isUserDataLocked}
                        className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                          isUserDataLocked
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone number- Secondary (optional)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          className="h-11 px-3 border border-gray-300 rounded-lg bg-white flex items-center gap-2 hover:bg-gray-50 transition"
                        >
                          <span className="text-xl">🇳🇬</span>
                          <span className="text-sm text-gray-700">+234</span>
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="tel"
                        value={personalInfo.secondaryPhoneNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "secondaryPhoneNumber",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Extra Details (Optional)
                    </label>
                    <textarea
                      value={personalInfo.extraDetails}
                      onChange={(e) =>
                        handleInputChange("extraDetails", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g I would appreciate a full tank before pickup ready for me to start my trip with thank you."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Invoice Card */}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold">Booking Invoice</h2>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Trip Details
                </h4>

                <div className="space-y-4 mb-6">
                  {trips.map((trip, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-6">
                        Trip {index + 1}
                      </p>

                      <div className="flex items-center gap-10 text-sm text-gray-700 mb-6">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-blue-500" />
                          <span>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(trip.tripStartDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-blue-500" />
                          <span>
                            <span className="font-medium">Time:</span>
                            {format(new Date(trip.tripStartTime), "hh:mm a")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-6">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-green-500" />
                        <span>
                          <span className="font-medium">Pickup:</span>{" "}
                          {trip.pickupLocation}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-6">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-red-500" />
                        <span>
                          <span className="font-medium">Drop-off:</span>{" "}
                          {trip.dropoffLocation}
                        </span>
                      </div>

                      <div className="border border-dashed border-blue-300 rounded-lg bg-blue-50/30 px-3 py-2 flex items-center gap-2 mb-6">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span className="text-xs text-blue-600 font-mono">
                          {id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Cost Breakdown
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price</span>
                      <span className="text-gray-900">
                        {formatCurrency(priceEstimate.basePrice || 0)}
                      </span>
                    </div>

                    {priceEstimate.vatAmount && priceEstimate.vatAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">VAT</span>
                        <span className="text-gray-900">
                          {formatCurrency(priceEstimate.vatAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{priceEstimate.vatPercentage}%</span>
                      <span>
                        {formatCurrency(priceEstimate.platformFeeAmount || 0)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">TOTAL</span>
                        <span className="text-blue-600 text-lg">
                          {formatCurrency(priceEstimate.totalPrice || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 text-center border-b border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(priceEstimate.totalPrice || 0)}
                </div>
                <p className="text-sm text-gray-600">TOTAL AMOUNT</p>
              </div>

              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">
                  Select Payment Method
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
                  onClick={handleBookNow}
                  disabled={isCreatingBooking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isCreatingBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {existingBookingId
                        ? "Processing Payment..."
                        : "Creating Booking..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Proceed to Payment (
                      {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"})
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  By clicking "Pay Now", you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
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
