
import cn from "classnames";
import { useEffect, useState } from "react";
import { format, addHours } from "date-fns";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/controllers/connnector/app.callers";
import { EstimatedBookingPrice } from "@/types/vehicleDetails";
import { Trips } from "@/types/vehicleDetails";


interface BookingResponse {
    status: string,
    message: string,
    errorCode: string,
    data: {
        bookingId: string,
        invoiceNumber: string,
        vehicleId: string,
        calculationId: string,
        userId: string,
        status: string,
        totalPrice: number,
        bookedAt: string,
        primaryPhoneNumber: string,
        secondaryPhoneNumber: string,
        guestFullName: string,
        guestEmail: string,
        recipientFullName: string,
        recipientEmail: string,
        recipientPhoneNumber: string,
        recipientSecondaryPhoneNumber: string,
        user: {
            id: string,
            firstName: string,
            lastName: string,
            email: string,
            phoneNumber: string,
            userType: string,
            departmentName: string,
            active: boolean
        },
        extraDetails: string,
        purposeOfRide: string,
        bookingRef: string,
        segments: [
            {
                additionalProp1: {},
                additionalProp2: {},
                additionalProp3: {}
            }
        ],
        bookingForOthers: true
    },
    timestamp: "2025-12-02T20:35:04.509Z"
}

interface PaymentResponse {
    data: {
        status: string,
        message: string,
        data: {
            paymentReference: string,
            authorizationUrl: string
        },
        timestamp: string
    },
    message: string,
    error: boolean
}
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

const CostBreakdown = ({ vehicleId, trips }: { vehicleId: string, trips: Trips[] }) => {
    const [estimatedPriceId, setEstimatedPriceId] = useState<string>("")
    const [priceReEstimated, setPriceReEstimated] = useState<boolean>(false)
    const [pricing, setPricing] = useState<EstimatedBookingPrice>()
    const router = useRouter()

    useEffect(() => {
        const estimatedPriceId = sessionStorage.getItem("priceEstimateId") || ""
        setEstimatedPriceId(estimatedPriceId)
        setPriceReEstimated(false)
    }, [])


    const estimatePrice = async () => {
        // @ts-ignore
        const tripSegments = trips[0]?.tripDetails?.map((trip, index) => {

            const pickupCoordinates: { lat: number; lng: number } = JSON.parse(`${trip?.pickupCoordinates}`)
            const dropoffCoordinates: { lat: number; lng: number } = JSON.parse(`${trip?.dropoffCoordinates}`)
            const areaOfUseCoordinates: { lat: number; lng: number } = JSON.parse(`${trip?.areaOfUseCoordinates}`)

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
                areaOfUse: [
                    {
                        areaOfUseLatitude: areaOfUseCoordinates.lat,
                        areaOfUseLongitude: areaOfUseCoordinates.lng,
                        areaOfUseName: trip?.areaOfUse
                    }
                ]

            }
        })

        const data = { vehicleId: vehicleId, segments: tripSegments }


        const pricing = await updateData(`/api/v1/public/bookings/calculate`, estimatedPriceId, data) as EstimatedBookingPrice
        sessionStorage.setItem("priceEstimateId", pricing.data.data.calculationId)
        setPricing(pricing)
        setPriceReEstimated(true);
        return pricing;
    }

    const processPayment = async () => {


        const userBookingInfo: PersonalInformationMyselfValues = JSON.parse(sessionStorage.getItem("userBookingInformation") || "")

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
            discountAmount: pricing?.data.data.discountAmount
        }

        try {
            const booking: any = await createData("/api/v1/bookings", data);

            if (!booking?.data?.data?.bookingId) {
                throw new Error("Booking ID not returned from API");
            }
            const payment = await createData(
                "/api/v1/payments/initiate",
                { bookingId: booking?.data?.data?.bookingId }
            );


            const authUrl = payment?.data?.data?.authorizationUrl;

            if (!authUrl) {
                throw new Error("Payment authorization URL missing");
            }

            router.push(authUrl);

        } catch (err) {
            console.error("Booking or payment failed:", err);
        }




    }
    return (
        <>
            <div className="rounded-2xl w-full md:w-[450px] p-5 m-2 border border-[#98a2b3]">
                {priceReEstimated && <section>


                    <h2 className="font-bold">Cost Breakdown</h2>
                    <div className="border-b border-grey-200 pb-4">

                        <div className="w-full text-sm flex text-black justify-between mt-3">
                            <span>Base Price</span>
                            <span>NGN  {pricing?.data.data.basePrice}</span>
                        </div>
                        <div className="w-full  text-sm flex justify-between mt-4">
                            <span>Platform Fee</span>
                            <span>NGN  {pricing?.data.data.platformFeeAmount}</span>
                        </div>
                        {<div className="w-full  text-sm flex justify-between mt-4">
                            <span>Discount</span>
                            <span>NGN {pricing?.data.data.discountAmount}</span>
                        </div>}

                    </div>
                    <div className="w-full text-sm flex justify-between mt-4">
                        <span>Total</span>
                        <span className="font-bold">NGN {pricing?.data.data.finalPrice}</span>
                    </div>

                </section>}
                {
                    priceReEstimated ? <button
                        onClick={processPayment}
                        className="bg-[#0673ff] cursor-pointer mt-3  hover:opacity-90 w-full p-3 text-white rounded-full">
                        Proceed to Payment
                    </button> : <div className="text-xs">
                        Get cost breakdown before payment
                        <button
                            onClick={estimatePrice}
                            className="bg-[#0673ff] cursor-pointer hover:opacity-90 w-full p-3 text-white rounded-full">
                            Calculate
                        </button>
                    </div>
                }

            </div>


        </>
    );
};


export default CostBreakdown;
