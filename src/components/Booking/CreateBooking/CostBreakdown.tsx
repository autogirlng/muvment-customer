import cn from "classnames";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/controllers/connnector/app.callers";
import { EstimatedBookingPrice, Trips } from "@/types/vehicleDetails";
import { FiCheckCircle, FiCircle, FiAlertCircle } from "react-icons/fi";

const ngn = (n?: number) => `NGN ${Number(n || 0).toLocaleString()}`;

const durationDiscountSubLabel = (d: any): string => {
  const base = d?.basePrice || 0;
  const amt = d?.discountAmount || 0;
  const pct = base > 0 ? Math.round((amt / base) * 100) : 0;
  return [pct > 0 ? `${pct}% off` : null, d?.appliedDiscountName || null]
    .filter(Boolean)
    .join(" · ");
};

const parseCoordinates = (
  raw: unknown,
): { lat: number; lng: number } | null => {
  if (raw === null || raw === undefined || raw === "" || raw === "undefined") {
    return null;
  }
  let value: any = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (value && typeof value.lat === "number" && typeof value.lng === "number") {
    return { lat: value.lat, lng: value.lng };
  }
  return null;
};

const parseAreasOfUse = (
  raw: unknown,
): {
  areaOfUseLatitude: number;
  areaOfUseLongitude: number;
  areaOfUseName: string;
}[] => {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (a: any) =>
          a &&
          a.name &&
          typeof a.lat === "number" &&
          typeof a.lng === "number",
      )
      .map((a: any) => ({
        areaOfUseLatitude: a.lat,
        areaOfUseLongitude: a.lng,
        areaOfUseName: a.name,
      }));
  } catch {
    return [];
  }
};

export type PersonalInformationMyselfValues = {
  guestEmail: string;
  country: string;
  countryCode: string;
  secondaryPhoneNumber: string;
  secondaryCountry: string;
  secondaryCountryCode: string;
  isForSelf: boolean;
  guestFullName: string;
  primaryPhoneNumber: string;
  isBookingForOthers: boolean;
  recipientFullName: string;
  recipientEmail: string;
  recipientPhoneNumber: string;
  recipientSecondaryPhoneNumber: string;
  userCountry: string;
  userCountryCode: string;
  extraDetails: string;
  purposeOfRide: string;
};

type PaymentGateway = "MONNIFY" | "PAYSTACK";

const CostBreakdown = ({
  vehicleId,
  trips,
  onActionChange,
}: {
  vehicleId: string;
  trips: Trips[];
  onActionChange?: (action: {
    label: string;
    onClick: () => void;
    disabled: boolean;
    amount?: number;
  }) => void;
}) => {
  const [estimatedPriceId, setEstimatedPriceId] = useState<string>("");
  const [priceReEstimated, setPriceReEstimated] = useState<boolean>(false);
  const [bookId, setBookId] = useState<string>("");
  const [pricing, setPricing] = useState<EstimatedBookingPrice>();
  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGateway>("PAYSTACK");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [unavailable, setUnavailable] = useState<boolean>(false);
  const retryCountRef = useRef(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const router = useRouter();

  const readApiMessage = (result: any, fallback: string) => {
    const msg = result?.message;
    if (typeof msg === "string" && msg && msg !== "Success") return msg;
    return fallback;
  };

  const estimatePrice = async () => {
    setErrorMessage("");
    setUnavailable(false);

    if (!vehicleId) {
      setPriceReEstimated(false);
      setErrorMessage(
        "We couldn't load this vehicle. Please go back and select it again.",
      );
      return;
    }

    const tripSegments: any[] = [];
    for (const trip of trips || []) {
      const pickup = parseCoordinates(trip?.tripDetails?.pickupCoordinates);
      const dropoff = parseCoordinates(trip?.tripDetails?.dropoffCoordinates);

      if (!pickup || !dropoff) {
        setPriceReEstimated(false);
        setErrorMessage(
          "Select your pick-up and drop-off from the location suggestions so we can price your trip.",
        );
        return;
      }

      let areaOfUse = parseAreasOfUse(trip?.tripDetails?.areasOfUse);
      if (areaOfUse.length === 0) {
        const single = parseCoordinates(trip?.tripDetails?.areaOfUseCoordinates);
        if (single) {
          areaOfUse = [
            {
              areaOfUseLatitude: single.lat,
              areaOfUseLongitude: single.lng,
              areaOfUseName: trip?.tripDetails?.areaOfUse || "",
            },
          ];
        }
      }

      tripSegments.push({
        bookingTypeId: trip?.tripDetails?.bookingType,
        startDate: format(
          new Date(trip?.tripDetails?.tripStartDate || ""),
          "yyyy-MM-dd",
        ),
        startTime: format(
          new Date(trip?.tripDetails?.tripStartTime || ""),
          "HH:mm:ss",
        ),
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        dropoffLatitude: dropoff.lat,
        dropoffLongitude: dropoff.lng,
        pickupLocationString: trip?.tripDetails?.pickupLocation,
        dropoffLocationString: trip?.tripDetails?.dropoffLocation,
        areaOfUse,
      });
    }

    if (tripSegments.length === 0) {
      setPriceReEstimated(false);
      return;
    }

    const couponCode = sessionStorage.getItem("couponCode");
    const body: any = { vehicleId, segments: tripSegments };
    if (couponCode) {
      body.couponCode = couponCode;
    }

    const existingId = sessionStorage.getItem("priceEstimateId") || "";

    const result: any = existingId
      ? await updateData(`/api/v1/public/bookings/calculate`, existingId, body)
      : await createData(`/api/v1/public/bookings/calculate`, body, {
          silent: true,
        });

    const payload = result?.data?.data;

    if (result?.error || !payload?.calculationId) {
      setPriceReEstimated(false);
      // Transient failures (slow network, a brief backend hiccup) are common
      // here. Retry once automatically before surfacing an error, so a single
      // blip does not read as a dead end.
      if (retryCountRef.current < 1) {
        retryCountRef.current += 1;
        setErrorMessage("");
        setTimeout(() => {
          estimateRef.current?.();
        }, 1200);
        return;
      }
      setErrorMessage(
        readApiMessage(
          result,
          "We couldn't get your price just now. Please check your trip details and try again.",
        ),
      );
      return;
    }

    retryCountRef.current = 0;
    sessionStorage.setItem("priceEstimateId", payload.calculationId);
    setEstimatedPriceId(payload.calculationId);
    setPricing(result as EstimatedBookingPrice);
    setErrorMessage("");
    setPriceReEstimated(true);
  };

  useEffect(() => {
    const storedBookingId = sessionStorage.getItem("bookingId") || "";
    setEstimatedPriceId(sessionStorage.getItem("priceEstimateId") || "");
    setBookId(storedBookingId);
    setPriceReEstimated(false);
    estimatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips]);

  const processPayment = async () => {
    if (isProcessing) return;

    const calculationId =
      sessionStorage.getItem("priceEstimateId") || estimatedPriceId;
    if (!calculationId) {
      setErrorMessage(
        "Please calculate your price before continuing to payment.",
      );
      return;
    }

    let userBookingInfo: PersonalInformationMyselfValues;
    try {
      userBookingInfo = JSON.parse(
        sessionStorage.getItem("userBookingInformation") || "",
      );
    } catch {
      setErrorMessage(
        "Your details are missing. Please complete the contact details above.",
      );
      return;
    }

    const stripZero = (value: string) => (value || "").replace(/^0+/, "");

    if (userBookingInfo.isBookingForOthers) {
      if (
        !userBookingInfo.recipientFullName?.trim() ||
        !userBookingInfo.recipientEmail?.trim() ||
        !userBookingInfo.recipientPhoneNumber?.trim()
      ) {
        setErrorMessage(
          "Please complete the recipient's name, email, and phone number above before paying.",
        );
        return;
      }
    } else if (
      !userBookingInfo.guestFullName?.trim() ||
      !userBookingInfo.guestEmail?.trim() ||
      !userBookingInfo.primaryPhoneNumber?.trim()
    ) {
      setErrorMessage(
        "Please complete your name, email, and phone number above before paying.",
      );
      return;
    }

    const discountAmount = pricing?.data?.data?.discountAmount;

    let data: any;
    if (userBookingInfo.isBookingForOthers) {
      data = {
        calculationId,
        primaryPhoneNumber:
          userBookingInfo.countryCode +
            stripZero(userBookingInfo.recipientPhoneNumber) || "",
        guestFullName:
          userBookingInfo.guestFullName?.trim() ||
          userBookingInfo.recipientFullName ||
          "",
        guestEmail:
          userBookingInfo.guestEmail?.trim() ||
          userBookingInfo.recipientEmail ||
          "",
        recipientFullName: userBookingInfo.recipientFullName || "",
        recipientEmail: userBookingInfo.recipientEmail || "",
        recipientPhoneNumber:
          userBookingInfo.countryCode +
            stripZero(userBookingInfo.recipientPhoneNumber) || "",
        extraDetails: userBookingInfo.extraDetails || "N/A",
        isBookingForOthers: userBookingInfo.isBookingForOthers,
        purposeOfRide: userBookingInfo.purposeOfRide || "N/A",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
        discountAmount,
      };
      if (userBookingInfo.recipientSecondaryPhoneNumber) {
        data.recipientSecondaryPhoneNumber =
          userBookingInfo.secondaryCountryCode +
          stripZero(userBookingInfo.recipientSecondaryPhoneNumber);
      }
    } else {
      data = {
        calculationId,
        primaryPhoneNumber:
          userBookingInfo.countryCode +
            stripZero(userBookingInfo.primaryPhoneNumber) || "",
        extraDetails: userBookingInfo.extraDetails || "N/A",
        isBookingForOthers: userBookingInfo.isBookingForOthers,
        purposeOfRide: userBookingInfo.purposeOfRide || "N/A",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
        discountAmount,
        guestFullName: userBookingInfo.guestFullName || "",
        guestEmail: userBookingInfo.guestEmail || "",
      };
      if (userBookingInfo.secondaryPhoneNumber) {
        data.secondaryPhoneNumber =
          userBookingInfo.secondaryCountryCode +
          stripZero(userBookingInfo.secondaryPhoneNumber);
      }
    }

    const partnerBookingId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("partnerBookingId")
        : null;
    if (partnerBookingId) data.partnerId = partnerBookingId;

    setIsProcessing(true);
    setErrorMessage("");
    setUnavailable(false);

    try {
      const booking: any = await createData("/api/v1/bookings", data, {
        silent: true,
      });

      if (booking?.status === 409) {
        // The calculation behind this attempt is already spent or the slot is
        // taken. Drop the stored calculation id so the next attempt builds a
        // fresh one instead of reusing a consumed calculation.
        sessionStorage.removeItem("priceEstimateId");
        setEstimatedPriceId("");
        setUnavailable(true);
        setErrorMessage(
          "This vehicle is no longer available for the selected time. Please choose another time.",
        );
        return;
      }
      if (booking?.error) {
        setErrorMessage(
          readApiMessage(
            booking,
            "We could not create your booking. Please try again.",
          ),
        );
        return;
      }

      const bookingId = booking?.data?.data?.bookingId;
      if (!bookingId) {
        setErrorMessage(
          readApiMessage(
            booking,
            "We could not create your booking. Please try again.",
          ),
        );
        return;
      }

      setBookId(bookingId);
      sessionStorage.setItem("bookingId", bookingId);
      // This calculation has now produced a booking. Clear it so a later
      // booking starts a new calculation rather than reusing this consumed one.
      sessionStorage.removeItem("priceEstimateId");
      setEstimatedPriceId("");

      let authUrl = "";

      if (paymentGateway === "MONNIFY") {
        const payment: any = await createData(
          "/api/v1/payments/initiate",
          { bookingId },
          { silent: true },
        );
        if (payment?.error) {
          setErrorMessage(
            readApiMessage(
              payment,
              "We couldn't start the payment. Please try again.",
            ),
          );
          return;
        }
        authUrl = payment?.data?.data?.authorizationUrl;
      } else {
        const payment: any = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {},
          { silent: true },
        );
        if (payment?.error) {
          setErrorMessage(
            readApiMessage(
              payment,
              "We couldn't start the payment. Please try again.",
            ),
          );
          return;
        }
        authUrl = payment?.data?.data;
      }

      if (!authUrl) {
        setErrorMessage("We couldn't start the payment. Please try again.");
        return;
      }

      router.push(authUrl);
    } catch (err) {
      setErrorMessage(
        "Something went wrong while processing your booking. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processPaymentRef = useRef(processPayment);
  processPaymentRef.current = processPayment;
  const estimateRef = useRef(estimatePrice);
  estimateRef.current = estimatePrice;

  useEffect(() => {
    if (!onActionChange) return;

    if (isProcessing) {
      onActionChange({
        label: "Processing...",
        onClick: () => {},
        disabled: true,
        amount: pricing?.data?.data?.finalPrice,
      });
      return;
    }

    if (unavailable) {
      onActionChange({
        label: "Change trip details",
        onClick: () => router.back(),
        disabled: false,
        amount: pricing?.data?.data?.finalPrice,
      });
      return;
    }

    const hasPrice = !!pricing?.data?.data?.finalPrice;
    if (hasPrice) {
      onActionChange({
        label: "Confirm & pay",
        onClick: () => processPaymentRef.current(),
        disabled: false,
        amount: pricing?.data?.data?.finalPrice,
      });
    } else {
      onActionChange({
        label: errorMessage ? "Try again" : "Calculate price",
        onClick: () => estimateRef.current(),
        disabled: false,
        amount: pricing?.data?.data?.finalPrice,
      });
    }
  }, [
    priceReEstimated,
    onActionChange,
    isProcessing,
    errorMessage,
    unavailable,
    pricing?.data?.data?.finalPrice,
  ]);

  return (
    <>
      <div className="rounded-2xl w-full p-5 border border-[#E4E7EC]">
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] p-3 mb-4">
            <FiAlertCircle
              className="text-[#D42620] flex-shrink-0 mt-0.5"
              size={18}
            />
            <div className="space-y-2">
              <p className="text-sm text-[#912018]">{errorMessage}</p>
              <button
                type="button"
                onClick={() =>
                  unavailable ? router.back() : estimateRef.current()
                }
                className="text-sm font-medium text-[#0673ff] hover:underline"
              >
                {unavailable ? "Change trip details" : "Try again"}
              </button>
            </div>
          </div>
        )}

        {priceReEstimated && (
          <section>
            <h2 className="font-bold">Cost Breakdown</h2>
            <div className="border-b border-grey-200 pb-4">
              {((pricing?.data?.data?.basePrice || 0) + (pricing?.data?.data?.platformFeeAmount || 0)) > 0 && (
                <div className="w-full text-sm flex text-black justify-between mt-3">
                  <span>Base Price</span>
                  <span>
                    {ngn((pricing?.data?.data?.basePrice || 0) + (pricing?.data?.data?.platformFeeAmount || 0))}
                  </span>
                </div>
              )}

              {(pricing?.data?.data?.geofenceSurcharge || 0) > 0 && (
                <div className="w-full text-sm flex justify-between mt-4">
                  <span>Geofence Surcharge</span>
                  <span>{ngn(pricing?.data?.data?.geofenceSurcharge)}</span>
                </div>
              )}

              {(pricing?.data?.data?.vatAmount || 0) > 0 && (
                <div className="w-full text-sm flex justify-between mt-4">
                  <span>
                    VAT{pricing?.data?.data?.vatPercentage ? ` (${pricing.data.data.vatPercentage}%)` : ""}
                  </span>
                  <span>{ngn(pricing?.data?.data?.vatAmount)}</span>
                </div>
              )}

              {(pricing?.data?.data?.discountAmount || 0) > 0 && (
                <div className="w-full text-sm flex justify-between mt-4 text-green-600">
                  <span className="flex flex-col">
                    <span>Duration Discount</span>
                    {durationDiscountSubLabel(pricing?.data?.data) && (
                      <span className="text-xs text-green-700/80">
                        {durationDiscountSubLabel(pricing?.data?.data)}
                      </span>
                    )}
                  </span>
                  <span>- {ngn(pricing?.data?.data?.discountAmount)}</span>
                </div>
              )}

              {(pricing?.data?.data?.couponDiscountAmount || 0) > 0 && (
                <div className="w-full text-sm flex justify-between mt-4 text-green-600">
                  <span>
                    Coupon Discount ({pricing?.data?.data?.appliedCouponCode})
                  </span>
                  <span>- {ngn(pricing?.data?.data?.couponDiscountAmount)}</span>
                </div>
              )}
            </div>
            <div className="w-full text-sm flex justify-between mt-4 mb-6">
              <span>Total</span>
              <span className="font-bold">
                {ngn(pricing?.data?.data?.finalPrice)}
              </span>
            </div>

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

            <p className="text-xs text-gray-500 text-center leading-relaxed mt-2">
              By making this payment you agree to the Muvment platform&apos;s{" "}
              <a
                href="/policy/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0673ff] hover:underline"
              >
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a
                href="/policy/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0673ff] hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </section>
        )}

        {!priceReEstimated && !errorMessage && (
          <div className="text-center text-sm text-grey-500 py-4">
            Calculating your price...
          </div>
        )}
      </div>
    </>
  );
};

export default CostBreakdown;
