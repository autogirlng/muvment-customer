"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiCheck,
  FiDroplet,
} from "react-icons/fi";
import { MdAirlineSeatReclineNormal, MdPayment } from "react-icons/md";
import { Navbar } from "@/components/Navbar";
import { useBookingStore } from "@/hooks/bookingStore";

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
  phone?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const calculationId = searchParams.get("calculationId");

  const { user, isAuthenticated } = useAuth();
  const { vehicle, segments, calculatedPrice, clearBooking } =
    useBookingStore();

  // State
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
    phone: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserDataLocked, setIsUserDataLocked] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{10,15}$/.test(phone);

  // Populate user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userFullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
      const userEmail = user.email || "";
      const userPhone = user.phoneNumber || user.phone || "";
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: userFullName,
        email: userEmail,
        phoneNumber: userPhone,
      }));

      // Lock fields that have user data
      setIsUserDataLocked(true);
    } else {
      // Check if previous booking info exists in cookies for non-authenticated users
      const savedInfo = Cookies.get("personalInfo");
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

  // Auto-populate recipient info when "myself" is selected
  useEffect(() => {
    if (personalInfo.rideFor === "myself") {
      setPersonalInfo((prev) => ({
        ...prev,
        recipientFullName: prev.fullName,
        recipientEmail: prev.email,
        recipientPhoneNumber: prev.phoneNumber || prev.phone,
      }));
    } else {
      // Clear recipient info when "others" is selected
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
    personalInfo.phoneNumber || personalInfo.phone,
  ]);

  useEffect(() => {
    if (!calculatedPrice || !vehicle) {
      router.push(`/Booking/search`);
    }
  }, [calculatedPrice, vehicle, id, router]);

  // Get images with primary first
  const images =
    vehicle?.photos
      ?.sort((a: any, b: any) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0))
      .map((p: any) => p.cloudinaryUrl)
      .filter((url: string) => url?.startsWith("http")) || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => {
      const updated = { ...prev, [field]: value };
      // Only save to cookies if user is not authenticated
      if (!isAuthenticated) {
        Cookies.set("personalInfo", JSON.stringify(updated), { expires: 30 });
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

  const handleBookNow = async () => {
    let {
      fullName,
      email,
      phoneNumber,
      rideFor,
      recipientEmail,
      recipientPhoneNumber,
      recipientFullName,
    } = personalInfo;

    phoneNumber = personalInfo.phoneNumber || personalInfo.phone || "";

    // Validate personal information
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

    // Validate recipient information if booking for others
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
      if (!calculatedPrice?.calculationId) {
        throw new Error("Calculation ID is required");
      }

      const bookingPayload = {
        calculationId: calculatedPrice.calculationId,
        primaryPhoneNumber: personalInfo.phoneNumber,
        secondaryPhoneNumber:
          personalInfo.secondaryPhoneNumber || personalInfo.phoneNumber || "",
        guestFullName: personalInfo.fullName,
        guestEmail: personalInfo.email,
        isBookingForOthers: personalInfo.rideFor === "others",
        recipientFullName:
          personalInfo.rideFor === "others"
            ? personalInfo.recipientFullName || ""
            : personalInfo.fullName,
        recipientEmail:
          personalInfo.rideFor === "others"
            ? personalInfo.recipientEmail || ""
            : personalInfo.email,
        recipientPhoneNumber:
          personalInfo.rideFor === "others"
            ? personalInfo.recipientPhoneNumber || personalInfo.phoneNumber
            : personalInfo.phoneNumber,
        recipientSecondaryPhoneNumber:
          personalInfo.secondaryPhoneNumber || personalInfo.phoneNumber || "",
        extraDetails: personalInfo.extraDetails || "N/A",
        purposeOfRide:
          personalInfo.rideFor === "others" ? "For Others" : "Personal",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
      };
      const bookingResponse = await VehicleSearchService.createBooking(
        bookingPayload
      );
      if (!isAuthenticated) {
        Cookies.set("personalInfo", JSON.stringify(personalInfo), {
          expires: 30,
        });
      }
      const paymentPayload = { bookingId: bookingResponse.data.bookingId };
      const paymentResponse = await VehicleSearchService.initiatePayment(
        paymentPayload
      );
      if (paymentResponse.data.authorizationUrl) {
        window.location.href = paymentResponse.data.authorizationUrl;
      } else {
        toast.success("Booking created successfully!");
        clearBooking();
        router.push("/Booking/search");
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
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

  if (!calculatedPrice || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">No booking data found</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const segment = segments[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Header */}
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
          {/* Left Column - Invoice */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <MdPayment className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Booking Invoice</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Vehicle Summary */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={images[0] || "/placeholder-vehicle.jpg"}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.name}
                    </h3>
                    <p className="text-gray-600">
                      {vehicle.vehicleTypeName?.replaceAll("_", " ")}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MdAirlineSeatReclineNormal className="w-4 h-4" />
                        {vehicle.numberOfSeats} seats
                      </span>
                      <span>{vehicle.city}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Trip Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiCalendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(segment.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Time:</span>
                        <span>{segment.startTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-gray-700">
                        <FiMapPin className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Pickup:</span>
                          <p className="text-sm">
                            {segment.pickupLocationString}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-gray-700">
                        <FiMapPin className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Drop-off:</span>
                          <p className="text-sm">
                            {segment.dropoffLocationString}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedPrice.basePrice)}
                      </span>
                    </div>
                    {calculatedPrice.platformFeeAmount &&
                      calculatedPrice.platformFeeAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Service Fee</span>
                          <span className="font-medium">
                            {formatCurrency(calculatedPrice.platformFeeAmount)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span>
                        -{formatCurrency(calculatedPrice.discountAmount)}
                      </span>
                    </div>
                    {calculatedPrice.extraHoursCharge &&
                      calculatedPrice.extraHoursCharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Extra Hours</span>
                          <span className="font-medium">
                            {formatCurrency(calculatedPrice.extraHoursCharge)}
                          </span>
                        </div>
                      )}
                    {calculatedPrice.outskirtPrice &&
                      calculatedPrice.outskirtPrice > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Outskirt Area</span>
                          <span className="font-medium">
                            {formatCurrency(calculatedPrice.outskirtPrice)}
                          </span>
                        </div>
                      )}
                    {calculatedPrice.extremeAreaPrice &&
                      calculatedPrice.extremeAreaPrice > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Extreme Area</span>
                          <span className="font-medium">
                            {formatCurrency(calculatedPrice.extremeAreaPrice)}
                          </span>
                        </div>
                      )}

                    <div className="border-t border-gray-200 pt-3 mt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-blue-600">
                          {formatCurrency(calculatedPrice.finalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Form */}
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
                {/* Show message if user is authenticated */}
                {isAuthenticated && isUserDataLocked && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Using your account information
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your personal details are pre-filled from your account.
                        You can still add a secondary phone number or extra
                        details.
                      </p>
                    </div>
                  </div>
                )}

                {/* Who is this ride for? */}
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

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={isUserDataLocked}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isUserDataLocked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={isUserDataLocked}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isUserDataLocked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phoneNumber || personalInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={isUserDataLocked}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isUserDataLocked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.secondaryPhoneNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "secondaryPhoneNumber",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter secondary phone"
                    />
                  </div>
                </div>

                {/* Recipient Information (if booking for others) */}
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
                              e.target.value
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
                              e.target.value
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

                {/* Extra Details */}
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
                    placeholder="Add any special requests or details about your trip"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Vehicle Preview & Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Vehicle Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                          >
                            <FiChevronLeft className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                          >
                            <FiChevronRight className="w-4 h-4 text-gray-700" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <FiUser className="w-12 h-12 mx-auto mb-2" />
                        <p>No Image</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{vehicle.vehicleTypeName?.replaceAll("_", " ")}</span>
                    <span>{vehicle.city}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MdAirlineSeatReclineNormal className="w-3 h-3" />
                      {vehicle.numberOfSeats} seats
                    </span>
                    {vehicle.willProvideDriver && (
                      <span className="flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        Driver
                      </span>
                    )}
                    {vehicle.willProvideFuel && (
                      <span className="flex items-center gap-1">
                        <FiDroplet className="w-3 h-3" />
                        Fuel
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Summary & Action */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(calculatedPrice.finalPrice)}
                  </div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>

                {/* Security Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FiShield className="w-4 h-4" />
                    <span>Secure SSL Encryption</span>
                  </div>
                </div>

                {/* Pay Now Button */}
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
                      Pay Now
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
    </div>
  );
};

export default CheckoutPage;
