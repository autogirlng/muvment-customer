import cn from "classnames";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/controllers/connnector/app.callers";
import { EstimatedBookingPrice, Trips } from "@/types/vehicleDetails";
import { FiCheckCircle, FiCircle, FiCreditCard } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

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
  extraDetails: "";
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
    useState<PaymentGateway>("MONNIFY");
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const estimatePrice = async () => {
    const tripSegments = trips?.map((trip, index) => {
      const pickupCoordinates: { lat: number; lng: number } = JSON.parse(
        `${trip?.tripDetails?.pickupCoordinates}`
      );
      const dropoffCoordinates: { lat: number; lng: number } = JSON.parse(
        `${trip?.tripDetails?.dropoffCoordinates}`
      );

      let areaOfUseCoordinates: { lat: number; lng: number } | null = null;

      if (trip?.tripDetails?.areaOfUseCoordinates) {
        try {
          areaOfUseCoordinates = JSON.parse(
            `${trip?.tripDetails.areaOfUseCoordinates}`
          );
        } catch (e) {
          console.error("Error parsing area of use:", e);
        }
      }

      return {
        bookingTypeId: trip?.tripDetails?.bookingType,
        startDate: format(
          new Date(trip?.tripDetails?.tripStartDate || ""),
          "yyyy-MM-dd"
        ),
        startTime: format(
          new Date(trip?.tripDetails?.tripStartTime || ""),
          "HH:mm:ss"
        ),
        pickupLatitude: pickupCoordinates.lat,
        pickupLongitude: pickupCoordinates.lng,
        dropoffLatitude: dropoffCoordinates.lat,
        dropoffLongitude: dropoffCoordinates.lng,
        pickupLocationString: trip?.tripDetails?.pickupLocation,
        dropoffLocationString: trip?.tripDetails?.dropoffLocation,
        areaOfUse: areaOfUseCoordinates
          ? [
              {
                areaOfUseLatitude: areaOfUseCoordinates.lat,
                areaOfUseLongitude: areaOfUseCoordinates.lng,
                areaOfUseName: trip?.tripDetails?.areaOfUse,
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
  useEffect(() => {
    const estimatedPriceId = sessionStorage.getItem("priceEstimateId") || "";
    setEstimatedPriceId(estimatedPriceId);
    setPriceReEstimated(false);
    estimatePrice();
  }, [trips]);

  const processPayment = async () => {
    const userBookingInfo: PersonalInformationMyselfValues = JSON.parse(
      sessionStorage.getItem("userBookingInformation") || ""
    );

    let data;
    if (userBookingInfo.isBookingForOthers) {
      data = {
        calculationId: estimatedPriceId,
        primaryPhoneNumber: userBookingInfo.recipientPhoneNumber || "",
        recipientFullName: userBookingInfo.recipientFullName || "d",
        recipientEmail: userBookingInfo.recipientEmail || "",
        recipientPhoneNumber: userBookingInfo.recipientPhoneNumber || "",
        extraDetails: userBookingInfo.extraDetails || "N/A",
        isBookingForOthers: userBookingInfo.isBookingForOthers,
        purposeOfRide: "N/A",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
        discountAmount: pricing?.data.data.discountAmount,
      };
      if (userBookingInfo.secondaryPhoneNumber) {
        data = {
          ...data,
          secondaryPhoneNumber: userBookingInfo.secondaryPhoneNumber,
        };
      }
    } else {
      data = {
        calculationId: estimatedPriceId,
        primaryPhoneNumber: userBookingInfo.primaryPhoneNumber || "",
        extraDetails: userBookingInfo.extraDetails || "N/A",
        isBookingForOthers: userBookingInfo.isBookingForOthers,
        purposeOfRide: "N/A",
        channel: "WEBSITE",
        paymentMethod: "ONLINE",
        discountAmount: pricing?.data.data.discountAmount,
        guestFullName: userBookingInfo.guestFullName || "",
        guestEmail: userBookingInfo.guestEmail || "",
      };
      if (userBookingInfo.recipientSecondaryPhoneNumber) {
        data = {
          ...data,
          recipientSecondaryPhoneNumber:
            userBookingInfo.recipientSecondaryPhoneNumber,
        };
      }
    }

    try {
      const booking: any = await createData("/api/v1/bookings", data);
      const bookingId = booking?.data?.data?.bookingId;

      if (!bookingId) {
        throw new Error("Booking ID not returned from API");
      }

      let authUrl = "";

      if (paymentGateway === "MONNIFY") {
        // --- MONNIFY FLOW ---
        const payment = await createData("/api/v1/payments/initiate", {
          bookingId: bookingId,
        });
        authUrl = payment?.data?.data?.authorizationUrl;
      } else if (paymentGateway === "PAYSTACK") {
        const payment = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {}
        );
        authUrl = payment?.data?.data;
      }

      if (!authUrl) {
        throw new Error("Payment authorization URL missing");
      }

      router.push(authUrl);
    } catch (err) {
      console.error("Booking or payment failed:", err);
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

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">
                Select Payment Method
              </h3>
              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setPaymentGateway("MONNIFY")}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                    paymentGateway === "MONNIFY"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-100 bg-white hover:border-blue-200"
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

                <div
                  onClick={() => setPaymentGateway("PAYSTACK")}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                    paymentGateway === "PAYSTACK"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-100 bg-white hover:border-blue-200"
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
