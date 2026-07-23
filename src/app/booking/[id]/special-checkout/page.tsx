"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAuth } from "@/context/AuthContext";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import {
  computeAllowance,
  spendableAmount,
  type Allowance,
} from "@/utils/corporateAllowance";
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
  FiLink,
  FiCreditCard,
  FiPlus,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import BookingReassurance from "@/components/Booking/BookingReassurance";
import { BookingService } from "@/controllers/booking/bookingService";
import Footer from "@/components/HomeComponent/Footer";
import cn from "classnames";
import {
  TripFootprintMap,
  TripMapPoint,
} from "@/components/Booking/TripFootprintMap";
import { createData } from "@/controllers/connnector/app.callers";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
import { ProfileService } from "@/controllers/user/profile.service";
import { getCountryCallingCode } from "react-phone-number-input";
import { isValidPhoneNumber, CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";

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
  bookingTypeName?: string;
  tripStartDate: string;
  tripStartTime: string;
  pickupLocation: string;
  dropoffLocation: string;
}

// Hours implied by a duration name ("3 Hours" -> 3, "Monthly" -> 0).
const hoursFromName = (name?: string) => {
  if (!name || /month/i.test(name)) return 0;
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

// Split a stored phone into its country and national parts for the field.
const splitPhone = (raw?: string) => {
  if (!raw) return { country: "NG", countryCode: "+234", local: "" };
  const e164 = raw.startsWith("+") ? raw : "+" + raw.replace(/^0+/, "");
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed && parsed.country) {
    return {
      country: parsed.country as string,
      countryCode: "+" + parsed.countryCallingCode,
      local: parsed.nationalNumber as string,
    };
  }
  let local = raw.replace(/[^\d]/g, "");
  if (local.startsWith("234")) local = local.slice(3);
  local = local.replace(/^0+/, "");
  return { country: "NG", countryCode: "+234", local };
};

type PaymentGateway = "MONNIFY" | "PAYSTACK";

const ServicePricingCheckoutPage = () => {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const corpMembership = useCorporateMembership();
  const corpIsStaff = corpMembership.isMember && !corpMembership.isAdmin;
  const corpLoading = corpMembership.loading;

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

  // Country & country code state for each phone field
  const [primaryCountry, setPrimaryCountry] = useState("NG");
  const [primaryCountryCode, setPrimaryCountryCode] = useState("+234");
  const [secondaryCountry, setSecondaryCountry] = useState("NG");
  const [secondaryCountryCode, setSecondaryCountryCode] = useState("+234");
  const [recipientCountry, setRecipientCountry] = useState("NG");
  const [recipientCountryCode, setRecipientCountryCode] = useState("+234");

  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserDataLocked, setIsUserDataLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGateway>("PAYSTACK");
  const [locationAcknowledged, setLocationAcknowledged] =
    useState<boolean>(false);
  // Corporate wallet payment (business accounts only)
  const [corpOrg, setCorpOrg] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [corpBalance, setCorpBalance] = useState<number | null>(null);
  // Backend-computed spendable for this member (min of remaining limit and balance),
  // so staff see a real cap without being shown the raw wallet balance.
  const [corpSpendable, setCorpSpendable] = useState<number | null>(null);
  const [corpAllowance, setCorpAllowance] = useState<Allowance | null>(null);
  const [payWithCorporate, setPayWithCorporate] = useState(false);
  // Which payment method the already-created booking was made with, so switching
  // methods never reuses a booking created for the other one.
  const [existingBookingMethod, setExistingBookingMethod] = useState<
    string | null
  >(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState<string | null>(
    null,
  );
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] =
    useState<string>("");
  const [usePreviousInfo, setUsePreviousInfo] = useState(false);
  const [hasPreviousInfo, setHasPreviousInfo] = useState(false);
  const [existingBookingId, setExistingBookingId] = useState<string | null>(
    null,
  );
  const [showSecondary, setShowSecondary] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [collapsedTrips, setCollapsedTrips] = useState<Record<number, boolean>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [profilePhone, setProfilePhone] = useState<string>("");

  // ─── Validation helpers ───────────────────────────────────────────────────
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (
    phone: string,
    country: string,
    countryCode: string,
  ): boolean => {
    if (!phone) return false;
    const fullNumber = `${countryCode}${phone}`;
    return isValidPhoneNumber(fullNumber, country as CountryCode);
  };

  // Format a phone number to E.164 before sending to backend
  const formatPhone = (phone: string, countryCode: string): string =>
    phone.startsWith("+") ? phone : `${countryCode}${phone}`;

  // ─── Effects ─────────────────────────────────────────────────────────────
  // Any organization member can pay from the company wallet. Only an ORG_ADMIN can
  // read the balance (the API restricts it), so staff see their remaining monthly
  // allowance instead. Membership role is authoritative: an invited user who
  // already had an account keeps userType CUSTOMER.
  useEffect(() => {
    if (!isAuthenticated || corpLoading || !corpMembership.isMember) return;
    const org = corpMembership.org;
    if (!org?.id) return;

    setCorpOrg({ id: org.id, name: org.name });
    setCorpAllowance(computeAllowance(org.mySpendingLimit, org.myAmountSpent));
    setCorpSpendable(org.myEffectiveSpendable ?? null);
    // Members default to the wallet; staff are locked to it (toggle hidden below).
    setPayWithCorporate(true);

    if (!corpMembership.isAdmin) return;
    let active = true;
    (async () => {
      const info = await OrganizationService.getWalletInfo(org.id);
      if (!active) return;
      if (info) setCorpBalance(Number(info.balance ?? 0));
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, corpLoading, corpMembership.isMember, corpMembership.isAdmin, corpMembership.org?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userFullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
      const userEmail = user.email || "";

      setPersonalInfo((prev) => ({
        ...prev,
        fullName: userFullName,
        email: userEmail,
      }));

      setIsUserDataLocked(true);
    } else {
      const savedInfo = Cookies.get("servicePricingPersonalInfo");
      if (savedInfo) {
        try {
          JSON.parse(savedInfo);
          setHasPreviousInfo(true);
        } catch (error) {
          console.error("Error parsing saved info:", error);
        }
      }
    }

    const savedBookingId = Cookies.get("servicePricingBookingId");
    if (savedBookingId) {
      setExistingBookingId(savedBookingId);
    }
  }, [isAuthenticated, user]);

  // The login response does not include the phone number, so pull it from the
  // user's profile when the auth object has none.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.phoneNumber || user.phone) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await ProfileService.getMyProfile();
        const respData: any = response?.data;
        const first = Array.isArray(respData) ? respData[0] : respData;
        const profileData: any = first && (first.data ?? first);
        const phone = profileData?.phoneNumber || profileData?.phone || "";
        if (!cancelled && phone) setProfilePhone(phone);
      } catch {
        // best effort; leave the field empty if the profile can't be loaded
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  // Prefill the primary phone once a source is available, without overwriting a
  // number the user has already typed.
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = user?.phoneNumber || user?.phone || profilePhone;
    if (!raw) return;
    const { country, countryCode, local } = splitPhone(raw);
    if (!local) return;
    setPrimaryCountry(country);
    setPrimaryCountryCode(countryCode);
    setPersonalInfo((prev) =>
      prev.phoneNumber ? prev : { ...prev, phoneNumber: local },
    );
  }, [isAuthenticated, user, profilePhone]);

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
      }));
    }
  }, [personalInfo.rideFor, personalInfo.fullName, personalInfo.email]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
    setPersonalInfo((prev) => ({
      ...prev,
      rideFor: value,
      // When booking for someone else the recipient details must be entered by
      // the user, so never carry over the booker's own name and email.
      recipientFullName: value === "myself" ? prev.fullName : "",
      recipientEmail: value === "myself" ? prev.email : "",
      recipientPhoneNumber:
        value === "myself" ? prev.recipientPhoneNumber : "",
    }));
  };

  // ─── Formatting ───────────────────────────────────────────────────────────
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

  // ─── Payment ──────────────────────────────────────────────────────────────
  const initiatePayment = async (bookingId: string) => {
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
    if (!savedTrips) throw new Error("Trip data not found. Please start over.");

    const tripsData: any[] = JSON.parse(savedTrips);
    if (!tripsData.length) throw new Error("Trip details not found.");

    const formatDateForAPI = (dateString: string) =>
      format(new Date(dateString), "yyyy-MM-dd");
    const formatTimeForAPI = (timeString: string) =>
      format(new Date(timeString), "HH:mm:ss");

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

    // Build the trips array for the API
    const tripsPayload = tripsData.map((t: any) => {
      const trip = t.tripDetails;
      return {
        bookingTypeId:
          trip.bookingType || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        startDate: formatDateForAPI(
          trip.tripStartDate || new Date().toISOString(),
        ),
        startTime: formatTimeForAPI(
          trip.tripStartTime || new Date().toISOString(),
        ),
        pickupLocationString: trip.pickupLocation || "string",
        pickupLatitude: trip.pickupCoordinates?.lat || 0.1,
        pickupLongitude: trip.pickupCoordinates?.lng || 0.1,
        dropoffLocationString: trip.dropoffLocation || "string",
        dropoffLatitude: trip.dropoffCoordinates?.lat || 0.1,
        dropoffLongitude: trip.dropoffCoordinates?.lng || 0.1,
      };
    });

    const bookingPayload = {
      servicePricingId: id,
      trips: tripsPayload,
      primaryPhoneNumber: formatPhone(phoneNumber, primaryCountryCode),
      secondaryPhoneNumber: secondaryPhoneNumber
        ? formatPhone(secondaryPhoneNumber, secondaryCountryCode)
        : formatPhone(phoneNumber, primaryCountryCode),
      guestFullName: fullName,
      guestEmail: email,
      guestPhoneNumber: formatPhone(phoneNumber, primaryCountryCode),
      isBookingForOthers: rideFor === "others",
      recipientFullName:
        rideFor === "others" ? recipientFullName || fullName : fullName,
      recipientEmail: rideFor === "others" ? recipientEmail || email : email,
      recipientPhoneNumber:
        rideFor === "others"
          ? formatPhone(
              recipientPhoneNumber || phoneNumber,
              recipientCountryCode,
            )
          : formatPhone(phoneNumber, primaryCountryCode),
      purposeOfRide: "N/A",
      extraDetails: extraDetails || "N/A",
      channel: "WEBSITE",
      paymentMethod: payWithCorporate ? "CORPORATE_WALLET" : "ONLINE",
      ...(payWithCorporate && corpOrg ? { organizationId: corpOrg.id } : {}),
    };

    const bookingResponse =
      await BookingService.createSpecialBooking(bookingPayload);
    const newBookingId = bookingResponse.data.data.bookingId;
    const newInvoiceNumber = bookingResponse.data.data.invoiceNumber || "";
    setGeneratedInvoiceNumber(newInvoiceNumber);
    Cookies.set("servicePricingBookingId", newBookingId, { expires: 1 });
    return newBookingId;
  };

  const handleBookNow = async () => {
    const errs = validateForm(personalInfo.rideFor === "others");
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      toast.error("Please complete the highlighted fields");
      return;
    }
    setFormErrors({});

    setIsCreatingBooking(true);
    setError(null);

    try {
      let bookingId: string;
      const method = payWithCorporate ? "CORPORATE_WALLET" : "ONLINE";

      if (existingBookingId && existingBookingMethod === method) {
        bookingId = existingBookingId;
      } else {
        bookingId = await createNewBooking();
        setExistingBookingId(bookingId);
        setExistingBookingMethod(method);
      }

      if (!isAuthenticated) {
        Cookies.set(
          "servicePricingPersonalInfo",
          JSON.stringify(personalInfo),
          { expires: 30 },
        );
      }

      if (payWithCorporate || personalInfo.rideFor === "others") {
        // A corporate-wallet booking is already paid: the backend debits the
        // wallet when the booking is created, so there is no gateway step.
        sessionStorage.removeItem("servicePricingTrips");
        sessionStorage.removeItem("servicePricingEstimate");
        sessionStorage.removeItem("servicePricingId");
        sessionStorage.removeItem("yearRangeId");
        Cookies.remove("servicePricingBookingId");
        router.push(`/booking/success?bookingId=${bookingId}`);
      } else {
        await initiatePayment(bookingId);
      }
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

  const handleGeneratePaymentLink = async () => {
    const errs = validateForm(personalInfo.rideFor === "others");
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      toast.error("Please complete the highlighted fields");
      return;
    }
    setFormErrors({});

    setIsCreatingBooking(true);
    try {
      const bookingId = existingBookingId || (await createNewBooking());
      // Keep the created booking and the trip data so the user can close the
      // link modal and still pay directly or generate the link again. The trip
      // data and cookie are only cleared once payment actually proceeds.
      setExistingBookingId(bookingId);
      setGeneratedBookingId(bookingId);

      setShowPaymentLinkModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // ─── Loading / empty states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="h-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl border border-gray-200 bg-white animate-pulse" />
          <div className="h-80 rounded-2xl border border-gray-200 bg-white animate-pulse" />
        </div>
      </div>
    );
  }

  if (!priceEstimate || trips.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <Navbar />
        <div className="flex items-center justify-center h-screen px-4">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">No booking data found</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-[#0673FF] text-white rounded-xl hover:bg-[#0560d6] font-semibold"
            >
              Start a new booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  const forOthers = personalInfo.rideFor === "others";
  const inputCls = (locked = false, hasError = false) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
        : "border-gray-300 focus:border-[#0673FF] focus:ring-[#0673FF]/20"
    } ${locked ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`;

  const validateForm = (requireRecipient: boolean) => {
    const e: Record<string, string> = {};
    const {
      fullName,
      email,
      phoneNumber,
      recipientFullName,
      recipientEmail,
      recipientPhoneNumber,
    } = personalInfo;
    if (!fullName) e.fullName = "Enter your full name";
    if (!email) e.email = "Enter your email address";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";
    if (!phoneNumber) e.phoneNumber = "Enter your phone number";
    else if (!validatePhone(phoneNumber, primaryCountry, primaryCountryCode))
      e.phoneNumber = "Enter a valid phone number";
    if (
      showSecondary &&
      personalInfo.secondaryPhoneNumber &&
      !validatePhone(
        personalInfo.secondaryPhoneNumber,
        secondaryCountry,
        secondaryCountryCode,
      )
    )
      e.secondaryPhoneNumber = "Enter a valid phone number";
    if (requireRecipient) {
      if (!recipientFullName)
        e.recipientFullName = "Enter the recipient's full name";
      if (!recipientEmail)
        e.recipientEmail = "Enter the recipient's email address";
      else if (!validateEmail(recipientEmail))
        e.recipientEmail = "Enter a valid email address";
      if (!recipientPhoneNumber)
        e.recipientPhoneNumber = "Enter the recipient's phone number";
      else if (
        !validatePhone(
          recipientPhoneNumber,
          recipientCountry,
          recipientCountryCode,
        )
      )
        e.recipientPhoneNumber = "Enter a valid phone number";
    }
    return e;
  };

  const fieldError = (name: string) =>
    formErrors[name] ? (
      <p className="mt-1 text-xs text-red-500">{formErrors[name]}</p>
    ) : null;

  const paymentBlock = (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Payment method
      </h3>

      {corpOrg && (
        <div className="space-y-2.5 mb-4">
          <div
            onClick={() => setPayWithCorporate(true)}
            className={cn(
              "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all",
              payWithCorporate
                ? "border-[#0673FF] bg-[#0673FF]/5"
                : "border-gray-200 bg-white hover:border-[#cfe0fb]",
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {corpOrg.name} wallet
              </p>
              <p className="text-xs text-gray-500">
                {corpBalance !== null
                  ? `Balance ${formatCurrency(corpBalance)}`
                  : corpSpendable !== null
                    ? `${formatCurrency(corpSpendable)} available to spend`
                    : corpAllowance?.hasLimit
                      ? `${formatCurrency(corpAllowance.remaining ?? 0)} left this month`
                      : "Paid from your company wallet"}
              </p>
            </div>
            {payWithCorporate ? (
              <FiCheckCircle className="text-[#0673FF] min-w-[22px]" size={22} />
            ) : (
              <FiCircle className="text-gray-300 min-w-[22px]" size={22} />
            )}
          </div>

          {!corpIsStaff && (
            <div
              onClick={() => setPayWithCorporate(false)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all",
                !payWithCorporate
                  ? "border-[#0673FF] bg-[#0673FF]/5"
                  : "border-gray-200 bg-white hover:border-[#cfe0fb]",
              )}
            >
              <p className="text-sm font-medium text-gray-900">
                Pay with card or transfer
              </p>
              {!payWithCorporate ? (
                <FiCheckCircle className="text-[#0673FF] min-w-[22px]" size={22} />
              ) : (
                <FiCircle className="text-gray-300 min-w-[22px]" size={22} />
              )}
            </div>
          )}
        </div>
      )}

      {(() => {
        if (!corpOrg || !payWithCorporate) return null;
        const total = Number(priceEstimate?.totalPrice || 0);
        const spendable =
          corpBalance !== null
            ? spendableAmount(corpAllowance?.remaining ?? null, corpBalance)
            : corpSpendable ?? corpAllowance?.remaining ?? null;
        if (spendable === null || total <= 0 || spendable >= total) return null;

        // Say which limit is short, so the fix is obvious.
        const limitedByAllowance =
          corpAllowance?.hasLimit &&
          (corpBalance === null ||
            (corpAllowance.remaining ?? 0) <= corpBalance);

        return (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
            {corpBalance === null
              ? `This booking is more than the ${formatCurrency(
                  spendable,
                )} you can spend right now. Ask your administrator to raise your limit or top up the company wallet.`
              : limitedByAllowance
                ? `This booking is more than the ${formatCurrency(
                    corpAllowance?.remaining ?? 0,
                  )} left in your monthly allowance. Ask your administrator to raise it, or pay with card or transfer.`
                : "This booking is more than your company wallet balance. Fund the wallet, or pay with card or transfer."}
          </p>
        );
      })()}

      <div className={cn("space-y-2.5 mb-4", payWithCorporate && "hidden")}>
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

      <label
        className={cn(
          "mt-4 mb-4 flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all select-none",
          locationAcknowledged
            ? "border-[#0673ff] bg-[#EAF2FF]"
            : "border-amber-300 bg-[#FFFBEB] hover:border-amber-400",
        )}
      >
        <input
          type="checkbox"
          checked={locationAcknowledged}
          onChange={(e) => setLocationAcknowledged(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#0673ff]"
        />
        <span
          className={cn(
            "text-xs leading-snug",
            locationAcknowledged ? "text-[#0d1320]" : "text-amber-900",
          )}
        >
          I confirm my pickup, drop-off, and areas of use are correct and
          complete. I understand outskirt and interstate areas attract extra
          charges, and that refusing to pay these charges does not entitle me to
          a refund.
        </span>
      </label>

      {/* Pay now: desktop CTA (mobile uses the sticky bottom bar) */}
      <button
        onClick={handleBookNow}
        disabled={isCreatingBooking || !locationAcknowledged}
        className="hidden w-full bg-[#0673FF] hover:bg-[#0560d6] text-white font-semibold py-3.5 px-4 rounded-xl transition disabled:bg-gray-300 disabled:cursor-not-allowed lg:flex items-center justify-center gap-2 text-sm"
      >
        {isCreatingBooking ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {existingBookingId ? "Processing payment..." : "Creating booking..."}
          </>
        ) : (
          <>
            <FiCreditCard className="w-4 h-4" />
            Proceed to payment
          </>
        )}
      </button>

      <div className="my-3 hidden items-center gap-3 text-xs text-gray-400 lg:flex">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        onClick={handleGeneratePaymentLink}
        disabled={isCreatingBooking}
        className="w-full bg-white border border-gray-300 hover:border-[#0673FF] hover:text-[#0673FF] text-gray-800 font-semibold py-3.5 px-4 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        <FiLink className="w-4 h-4" />
        Generate payment link
      </button>
      <p className="mt-2 text-center text-xs text-gray-500">
        Send a secure link for someone else to pay.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        By continuing, you agree to our{" "}
        <a href="/policy/terms-conditions" className="text-[#0673FF] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/policy/privacy-policy" className="text-[#0673FF] hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
        <button
          onClick={() => safeBack("/")}
          className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 transition"
        >
          <FiChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Back</span>
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete your booking
        </h1>
        <p className="mt-1 text-gray-500">
          Confirm your trip, add your details, and pay securely.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#EAF2FF] rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-[#0673FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your trip</h2>
                  <p className="text-gray-500 text-sm">
                    {trips.length} {trips.length > 1 ? "trips" : "trip"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {trips.map((trip, index) => {
                  const start = trip.tripStartTime
                    ? new Date(trip.tripStartTime)
                    : null;
                  const hrs = hoursFromName(trip.bookingTypeName);
                  const end =
                    start && hrs
                      ? new Date(start.getTime() + hrs * 3600000)
                      : null;
                  const tripsCollapsible = trips.length > 2;
                  const isCollapsed = tripsCollapsible
                    ? (collapsedTrips[index] ?? true)
                    : false;
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <button
                        type="button"
                        onClick={
                          tripsCollapsible
                            ? () =>
                                setCollapsedTrips((p) => ({
                                  ...p,
                                  [index]: !(p[index] ?? true),
                                }))
                            : undefined
                        }
                        className={`flex w-full items-start justify-between gap-2 text-left ${
                          tripsCollapsible ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Trip {index + 1}
                            </span>
                            {trip.bookingTypeName && (
                              <span className="inline-flex items-center rounded-full bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#0673FF]">
                                {trip.bookingTypeName}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                              <FiCalendar className="w-3.5 h-3.5" />
                              {formatDate(trip.tripStartDate)}
                            </span>
                            {start && (
                              <span className="inline-flex items-center gap-1.5">
                                <FiClock className="w-3.5 h-3.5" />
                                {format(start, "hh:mm a")}
                                {end ? ` - ${format(end, "hh:mm a")}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        {tripsCollapsible && (
                          <FiChevronDown
                            className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform ${
                              isCollapsed ? "" : "rotate-180"
                            }`}
                          />
                        )}
                      </button>

                      {!isCollapsed && (
                        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-gray-400 text-xs mb-0.5">
                              Pickup
                            </p>
                            <p className="flex items-start gap-1.5 text-gray-800">
                              <FiMapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span className="break-words">
                                {trip.pickupLocation}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-0.5">
                              Drop-off
                            </p>
                            <p className="flex items-start gap-1.5 text-gray-800">
                              <FiMapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span className="break-words">
                                {trip.dropoffLocation}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      {(() => {
                        const pts: TripMapPoint[] = [];
                        const tAny = trip as any;
                        const pu = tAny.pickupCoordinates;
                        if (
                          pu &&
                          typeof pu.lat === "number" &&
                          typeof pu.lng === "number"
                        )
                          pts.push({
                            lat: pu.lat,
                            lng: pu.lng,
                            label: trip.pickupLocation || "Pickup",
                            kind: "pickup",
                          });
                        const doff = tAny.dropoffCoordinates;
                        if (
                          doff &&
                          typeof doff.lat === "number" &&
                          typeof doff.lng === "number"
                        )
                          pts.push({
                            lat: doff.lat,
                            lng: doff.lng,
                            label: trip.dropoffLocation || "Drop-off",
                            kind: "dropoff",
                          });
                        return pts.length > 0 ? (
                          <div className="mt-3">
                            <TripFootprintMap points={pts} height={180} />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Your details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#EAF2FF] rounded-xl flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-[#0673FF]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Your details</h2>
              </div>

              {isAuthenticated && isUserDataLocked && (
                <div className="mb-5 p-3.5 bg-[#EAF2FF] border border-[#cfe0fb] rounded-xl flex items-start gap-2.5">
                  <FiAlertCircle className="w-4 h-4 text-[#0673FF] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700">
                    Your name and email are pre-filled from your account.
                  </p>
                </div>
              )}

              {!isAuthenticated && hasPreviousInfo && (
                <div className="mb-5 p-3.5 bg-[#EAF2FF] border border-[#cfe0fb] rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <FiAlertCircle className="w-4 h-4 text-[#0673FF] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Use your saved details?
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        We can auto-fill the form from your last booking.
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => setUsePreviousInfo(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            usePreviousInfo
                              ? "bg-[#0673FF] text-white"
                              : "bg-white border border-gray-300 text-gray-700"
                          }`}
                        >
                          Yes, use it
                        </button>
                        <button
                          onClick={() => setUsePreviousInfo(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            !usePreviousInfo
                              ? "bg-[#0673FF] text-white"
                              : "bg-white border border-gray-300 text-gray-700"
                          }`}
                        >
                          No, start fresh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Who is this ride for?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["myself", "others"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleRideForChange(opt)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition ${
                        personalInfo.rideFor === opt
                          ? "border-[#0673FF] bg-[#0673FF]/5 text-[#0673FF]"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    disabled={isUserDataLocked}
                    className={inputCls(isUserDataLocked, !!formErrors.fullName)}
                    placeholder="Enter your full name"
                  />
                  {fieldError("fullName")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isUserDataLocked}
                    className={inputCls(isUserDataLocked, !!formErrors.email)}
                    placeholder="Enter your email address"
                  />
                  {fieldError("email")}
                </div>

                <PhoneNumberAndCountryField
                  inputName="phoneNumber"
                  selectName="primaryCountry"
                  inputId="phoneNumber"
                  selectId="primaryCountry"
                  label="Phone number - Primary"
                  inputPlaceholder="Enter phone number"
                  selectPlaceholder="+234"
                  inputValue={personalInfo.phoneNumber}
                  selectValue={primaryCountry}
                  inputOnChange={(event) => {
                    const number = event.target.value.replace(/\D/g, "");
                    handleInputChange("phoneNumber", number);
                  }}
                  selectOnChange={(value: string) => {
                    const code = `+${getCountryCallingCode(value as any)}`;
                    setPrimaryCountry(value);
                    setPrimaryCountryCode(code);
                  }}
                  inputOnBlur={() => {}}
                  selectOnBlur={() => {}}
                  selectClassname="!w-[130px]"
                  inputError={formErrors.phoneNumber || ""}
                />

                {!showSecondary ? (
                  <button
                    type="button"
                    onClick={() => setShowSecondary(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673FF] hover:text-[#0560d6]"
                  >
                    <FiPlus className="w-4 h-4" />
                    Do you have a secondary phone number?
                  </button>
                ) : (
                  <div>
                    <PhoneNumberAndCountryField
                      inputName="secondaryPhoneNumber"
                      selectName="secondaryCountry"
                      inputId="secondaryPhoneNumber"
                      selectId="secondaryCountry"
                      label="Phone number - Secondary (optional)"
                      inputPlaceholder="Enter phone number"
                      selectPlaceholder="+234"
                      inputValue={personalInfo.secondaryPhoneNumber || ""}
                      selectValue={secondaryCountry}
                      inputOnChange={(event) => {
                        const number = event.target.value.replace(/\D/g, "");
                        handleInputChange("secondaryPhoneNumber", number);
                      }}
                      selectOnChange={(value: string) => {
                        const code = `+${getCountryCallingCode(value as any)}`;
                        setSecondaryCountry(value);
                        setSecondaryCountryCode(code);
                      }}
                      inputOnBlur={() => {}}
                      selectOnBlur={() => {}}
                      selectClassname="!w-[130px]"
                      inputError={formErrors.secondaryPhoneNumber || ""}
                      info
                      tooltipTitle=""
                      tooltipDescription="Add an extra phone number we can reach you on if your primary line isn't available. This helps us contact you faster in case of urgent updates or booking issues."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowSecondary(false);
                        handleInputChange("secondaryPhoneNumber", "");
                      }}
                      className="mt-2 text-xs font-semibold text-[#0673FF] hover:text-[#0560d6]"
                    >
                      Remove secondary number
                    </button>
                  </div>
                )}

                {forOthers && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Recipient information
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Details of the person taking the ride.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Recipient full name
                      </label>
                      <input
                        type="text"
                        value={personalInfo.recipientFullName || ""}
                        onChange={(e) =>
                          handleInputChange("recipientFullName", e.target.value)
                        }
                        className={inputCls(false, !!formErrors.recipientFullName)}
                        placeholder="Enter recipient's full name"
                      />
                      {fieldError("recipientFullName")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Recipient email address
                      </label>
                      <input
                        type="email"
                        value={personalInfo.recipientEmail || ""}
                        onChange={(e) =>
                          handleInputChange("recipientEmail", e.target.value)
                        }
                        className={inputCls(false, !!formErrors.recipientEmail)}
                        placeholder="Enter recipient's email address"
                      />
                      {fieldError("recipientEmail")}
                    </div>

                    <PhoneNumberAndCountryField
                      inputName="recipientPhoneNumber"
                      selectName="recipientCountry"
                      inputId="recipientPhoneNumber"
                      selectId="recipientCountry"
                      label="Recipient phone number"
                      inputPlaceholder="Enter recipient's phone number"
                      selectPlaceholder="+234"
                      inputValue={personalInfo.recipientPhoneNumber || ""}
                      selectValue={recipientCountry}
                      inputOnChange={(event) => {
                        const number = event.target.value.replace(/\D/g, "");
                        handleInputChange("recipientPhoneNumber", number);
                      }}
                      selectOnChange={(value: string) => {
                        const code = `+${getCountryCallingCode(value as any)}`;
                        setRecipientCountry(value);
                        setRecipientCountryCode(code);
                      }}
                      inputOnBlur={() => {}}
                      selectOnBlur={() => {}}
                      selectClassname="!w-[130px]"
                      inputError={formErrors.recipientPhoneNumber || ""}
                    />
                  </>
                )}

                {!showExtra ? (
                  <button
                    type="button"
                    onClick={() => setShowExtra(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673FF] hover:text-[#0560d6]"
                  >
                    <FiPlus className="w-4 h-4" />
                    Want to provide extra details?
                  </button>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Extra details (optional)
                    </label>
                    <textarea
                      value={personalInfo.extraDetails}
                      onChange={(e) =>
                        handleInputChange("extraDetails", e.target.value)
                      }
                      className={inputCls()}
                      placeholder="Anything about your ride experience, a special need, or a unique adjustment to your itinerary."
                      rows={4}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowExtra(false);
                        handleInputChange("extraDetails", "");
                      }}
                      className="mt-2 text-xs font-semibold text-[#0673FF] hover:text-[#0560d6]"
                    >
                      Remove extra details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(priceEstimate.totalPrice || 0)}
                  </p>
                </div>
                <div className="p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base price</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(priceEstimate.basePrice || 0)}
                    </span>
                  </div>
                  {priceEstimate.couponDiscountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="flex flex-col text-gray-500">
                        <span>
                          Coupon discount
                          {priceEstimate.appliedCouponCode
                            ? ` (${priceEstimate.appliedCouponCode})`
                            : ""}
                        </span>
                        {String(
                          priceEstimate.appliedCouponCode || "",
                        ).toUpperCase() === "WELCOME" && (
                          <span className="text-xs text-gray-400">
                            10% off your first ride, capped at ₦10,000
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-green-600">
                        - {formatCurrency(priceEstimate.couponDiscountAmount)}
                      </span>
                    </div>
                  )}
                  {priceEstimate.logisticsFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Outskirt fee</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(priceEstimate.logisticsFee)}
                      </span>
                    </div>
                  )}
                  {priceEstimate.platformFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform fee</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(priceEstimate.platformFeeAmount)}
                      </span>
                    </div>
                  )}
                  {priceEstimate.vatAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        VAT
                        {priceEstimate.vatPercentage
                          ? ` (${priceEstimate.vatPercentage}%)`
                          : ""}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(priceEstimate.vatAmount)}
                      </span>
                    </div>
                  )}
                  {priceEstimate.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">
                        - {formatCurrency(priceEstimate.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-[#0673FF]">
                      {formatCurrency(priceEstimate.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {paymentBlock}

              <BookingReassurance
                bookingTypeNames={trips.map((t) => (t as any).bookingTypeName)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {formatCurrency(priceEstimate.totalPrice || 0)}
            </p>
          </div>
          <button
            onClick={handleBookNow}
            disabled={isCreatingBooking || !locationAcknowledged}
            className="ml-auto flex-1 max-w-[62%] py-3 rounded-xl font-semibold text-sm transition bg-[#0673FF] hover:bg-[#0560d6] text-white disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingBooking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                <FiCreditCard className="w-4 h-4" />
                Proceed to payment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Link Modal */}
      {showPaymentLinkModal &&
        generatedBookingId &&
        (() => {
          const paymentLink = `${window.location.origin}/booking/success?bookingId=${generatedBookingId}`;
          const shareMessage = `Hi, a booking has just been generated by ${personalInfo.fullName} on Muvment. Please click the link below to proceed with your payment.\n\n${paymentLink}\n\nPlease note: Only payments on muvment.ng are valid. Do not make any payment on any platform that is not Muvment, and please do not share your card details with anyone or any staff of Muvment for this payment.`;
          const closeModal = () => {
            setShowPaymentLinkModal(false);
          };
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="relative bg-gradient-to-br from-[#0673FF] to-[#0560d6] px-6 pt-8 pb-7 text-center">
                  <button
                    onClick={closeModal}
                    className="absolute right-3 top-3 text-white/80 transition hover:text-white"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                    <FiCheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">
                    Booking created
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    Share the payment link with whoever is paying.
                  </p>
                </div>

                <div className="px-5 pb-6 pt-5 sm:px-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                    <p className="mb-1.5 text-xs font-medium text-gray-500">
                      Payment link
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 truncate text-sm text-[#0673FF]">
                        {paymentLink}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentLink);
                          toast.success("Link copied to clipboard");
                        }}
                        className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#EAF2FF] px-2.5 py-1.5 text-xs font-semibold text-[#0673FF] transition hover:bg-[#dbe9ff]"
                      >
                        <FiLink className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-[#F7F9FC] px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">
                        Invoice ID
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {generatedInvoiceNumber || generatedBookingId}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          generatedInvoiceNumber || generatedBookingId,
                        );
                        toast.success("Invoice ID copied");
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300"
                    >
                      <FiLink className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Track this booking anytime from the{" "}
                    <a
                      href={
                        generatedInvoiceNumber
                          ? `/track-booking?invoice=${encodeURIComponent(generatedInvoiceNumber)}`
                          : "/track-booking"
                      }
                      className="font-semibold text-[#0673FF] hover:underline"
                    >
                      tracking page
                    </a>
                    .
                  </p>

                  <div className="mt-4 rounded-xl bg-[#F7F9FC] p-4 text-sm leading-relaxed text-gray-600">
                    <p>
                      Hi, a booking has just been generated by{" "}
                      <span className="font-semibold text-gray-900">
                        {personalInfo.fullName}
                      </span>{" "}
                      on Muvment. Click the link to proceed with payment.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Only payments on{" "}
                      <span className="font-semibold">muvment.ng</span> are valid.
                      Never share card details with anyone.
                    </p>
                  </div>

                  <p className="mt-5 mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Share via
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
                          "_blank",
                        )
                      }
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 transition hover:border-green-500 hover:bg-green-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 fill-white"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </span>
                      WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(
                          "Your Muvment booking payment link",
                        );
                        const body = encodeURIComponent(
                          `Hi,\n\nA booking has just been generated by ${personalInfo.fullName} on Muvment. Please click the link below to proceed with your payment.\n\n${paymentLink}\n\nPlease note: Only payments on muvment.ng are valid. Do not make any payment on any platform that is not Muvment, and please do not share your card details with anyone or any staff of Muvment for this payment.\n\nThank you,\nMuvment Team`,
                        );
                        window.open(
                          `mailto:${personalInfo.recipientEmail || ""}?subject=${subject}&body=${body}`,
                          "_blank",
                        );
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 transition hover:border-[#0673FF] hover:bg-[#EAF2FF]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0673FF]">
                        <FiMail className="h-5 w-5 text-white" />
                      </span>
                      Email
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareMessage);
                        toast.success("Message copied to clipboard");
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
                        <FiLink className="h-5 w-5 text-white" />
                      </span>
                      Copy text
                    </button>
                  </div>

                  <button
                    onClick={closeModal}
                    className="mt-5 w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      <Footer />
    </div>
  );
};

export default ServicePricingCheckoutPage;
