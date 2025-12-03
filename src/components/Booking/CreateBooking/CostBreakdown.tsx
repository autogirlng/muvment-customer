import cn from "classnames";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/controllers/connnector/app.callers";
import { EstimatedBookingPrice, Trips } from "@/types/vehicleDetails";
import { FiCheckCircle, FiCircle, FiCreditCard } from "react-icons/fi"; // Added icons for selection

// ... (Previous Interfaces remain the same) ...

export type PersonalInformationMyselfValues = {
  guestName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  country: string;
  countryCode: string;
  secondaryPhoneNumber: string;
  secondaryCountry: string;
  secondaryCountryCode: string;
  isForSelf: boolean;
};

type PaymentGateway = "MONNIFY" | "PAYSTACK";

const CostBreakdown = ({
  vehicleId,
  trips,
}: {
  vehicleId: string;
  trips: Trips[];
}) => {
  const [estimatedPriceId, setEstimatedPriceId] = useState<string>("");
  const [priceReEstimated, setPriceReEstimated] = useState<boolean>(false);
  const [pricing, setPricing] = useState<EstimatedBookingPrice>();
  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGateway>("MONNIFY"); // ✅ NEW: Gateway State
  const router = useRouter();

  useEffect(() => {
    const estimatedPriceId = sessionStorage.getItem("priceEstimateId") || "";
    setEstimatedPriceId(estimatedPriceId);
    setPriceReEstimated(false);
  }, []);

  const estimatePrice = async () => {
    // @ts-ignore
    const tripSegments = trips[0]?.tripDetails?.map((trip, index) => {
      const pickupCoordinates: { lat: number; lng: number } = JSON.parse(
        `${trip?.pickupCoordinates}`
      );
      const dropoffCoordinates: { lat: number; lng: number } = JSON.parse(
        `${trip?.dropoffCoordinates}`
      );

      let areaOfUseCoordinates: { lat: number; lng: number } | null = null;

      if (
        trip?.areaOfUseCoordinates &&
        trip?.areaOfUseCoordinates !== "undefined"
      ) {
        try {
          areaOfUseCoordinates = JSON.parse(`${trip?.areaOfUseCoordinates}`);
        } catch (e) {
          console.error("Error parsing area of use:", e);
        }
      }

      return {
        bookingTypeId: trip?.bookingType,
        startDate: format(new Date(trip?.tripStartDate || ""), "yyyy-MM-dd"),
        startTime: format(new Date(trip?.tripStartTime || ""), "HH:mm:ss"),
        pickupLatitude: pickupCoordinates.lat,
        pickupLongitude: pickupCoordinates.lng,
        dropoffLatitude: dropoffCoordinates.lat,
        dropoffLongitude: dropoffCoordinates.lng,
        pickupLocationString: trip?.pickupLocation,
        dropoffLocationString: trip?.dropoffLocation,
        areaOfUse: areaOfUseCoordinates
          ? [
              {
                areaOfUseLatitude: areaOfUseCoordinates.lat,
                areaOfUseLongitude: areaOfUseCoordinates.lng,
                areaOfUseName: trip?.areaOfUse,
              },
            ]
          : [],
      };
    });

    const couponCode = sessionStorage.getItem("couponCode");
    const data: any = { vehicleId: vehicleId, segments: tripSegments };

    if (couponCode) {
      data.couponCode = couponCode;
    }

    const pricing = (await updateData(
      `/api/v1/public/bookings/calculate`,
      estimatedPriceId,
      data
    )) as EstimatedBookingPrice;

    sessionStorage.setItem("priceEstimateId", pricing.data.data.calculationId);
    setPricing(pricing);
    setPriceReEstimated(true);
    return pricing;
  };

  const processPayment = async () => {
    const userBookingInfo: PersonalInformationMyselfValues = JSON.parse(
      sessionStorage.getItem("userBookingInformation") || ""
    );

    const data = {
      calculationId: estimatedPriceId,
      primaryPhoneNumber: userBookingInfo.guestPhoneNumber,
      secondaryPhoneNumber: userBookingInfo.guestPhoneNumber,
      guestFullName: userBookingInfo.guestName,
      guestEmail: userBookingInfo.guestEmail,
      isBookingForOthers: true,
      recipientFullName: userBookingInfo.guestName || "N/A",
      recipientEmail: userBookingInfo.guestEmail,
      recipientPhoneNumber: userBookingInfo.guestPhoneNumber,
      recipientSecondaryPhoneNumber: userBookingInfo.guestPhoneNumber,
      extraDetails: "N/A",
      purposeOfRide: "N/A",
      channel: "WEBSITE",
      paymentMethod: "ONLINE",
      discountAmount: pricing?.data.data.discountAmount,
    };

    try {
      // 1. Create the Booking
      const booking: any = await createData("/api/v1/bookings", data);
      const bookingId = booking?.data?.data?.bookingId;

      if (!bookingId) {
        throw new Error("Booking ID not returned from API");
      }

      // 2. Initiate Payment based on Gateway Selection
      let authUrl = "";

      if (paymentGateway === "MONNIFY") {
        // --- MONNIFY FLOW ---
        const payment = await createData("/api/v1/payments/initiate", {
          bookingId: bookingId,
        });
        authUrl = payment?.data?.data?.authorizationUrl;
      } else if (paymentGateway === "PAYSTACK") {
        // --- PAYSTACK FLOW ---
        // Assuming path param as requested: POST {baseURL}payments/initialize/{bookingId}
        const payment = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {} // Empty body
        );
        // Paystack response: data is the string directly
        authUrl = payment?.data?.data;
      }

      if (!authUrl) {
        throw new Error("Payment authorization URL missing");
      }

      // 3. Redirect user
      router.push(authUrl);
    } catch (err) {
      console.error("Booking or payment failed:", err);
      // Optional: Add toast notification here
    }
  };

  return (
    <>
      <div className="rounded-2xl w-full md:w-[450px] p-5 m-2 border border-[#98a2b3]">
        {priceReEstimated && (
          <section>
            <h2 className="font-bold">Cost Breakdown</h2>
            <div className="border-b border-grey-200 pb-4">
              <div className="w-full text-sm flex text-black justify-between mt-3">
                <span>Base Price</span>
                <span>NGN {pricing?.data.data.basePrice}</span>
              </div>
              <div className="w-full text-sm flex justify-between mt-4">
                <span>Platform Fee</span>
                <span>NGN {pricing?.data.data.platformFeeAmount}</span>
              </div>

              {pricing?.data.data.discountAmount ? (
                <div className="w-full text-sm flex justify-between mt-4 text-green-600">
                  <span>Duration Discount</span>
                  <span>- NGN {pricing?.data.data.discountAmount}</span>
                </div>
              ) : null}

              {pricing?.data.data.couponDiscountAmount ? (
                <div className="w-full text-sm flex justify-between mt-4 text-green-600">
                  <span>
                    Coupon Discount ({pricing.data.data.appliedCouponCode})
                  </span>
                  <span>- NGN {pricing?.data.data.couponDiscountAmount}</span>
                </div>
              ) : null}
            </div>
            <div className="w-full text-sm flex justify-between mt-4 mb-6">
              <span>Total</span>
              <span className="font-bold">
                NGN {pricing?.data.data.finalPrice}
              </span>
            </div>

            {/* ✅ NEW: Payment Gateway Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">
                Select Payment Method
              </h3>
              <div className="flex flex-col gap-3">
                {/* Monnify Option */}
                <div
                  onClick={() => setPaymentGateway("MONNIFY")}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                    paymentGateway === "MONNIFY"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-gray-600" />
                    <span className="text-sm font-medium">
                      Pay with Monnify
                    </span>
                  </div>
                  {paymentGateway === "MONNIFY" ? (
                    <FiCheckCircle className="text-blue-600" />
                  ) : (
                    <FiCircle className="text-gray-300" />
                  )}
                </div>

                {/* Paystack Option */}
                <div
                  onClick={() => setPaymentGateway("PAYSTACK")}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                    paymentGateway === "PAYSTACK"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-gray-600" />
                    <span className="text-sm font-medium">
                      Pay with Paystack
                    </span>
                  </div>
                  {paymentGateway === "PAYSTACK" ? (
                    <FiCheckCircle className="text-blue-600" />
                  ) : (
                    <FiCircle className="text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {priceReEstimated ? (
          <button
            onClick={processPayment}
            className="bg-[#0673ff] cursor-pointer mt-3 hover:opacity-90 w-full p-3 text-white rounded-full font-medium"
          >
            Proceed to Payment (
            {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"})
          </button>
        ) : (
          <div className="text-xs">
            Get cost breakdown before payment
            <button
              onClick={estimatePrice}
              className="bg-[#0673ff] cursor-pointer hover:opacity-90 w-full p-3 text-white rounded-full"
            >
              Calculate
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CostBreakdown;
