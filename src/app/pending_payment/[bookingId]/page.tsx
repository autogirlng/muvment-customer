"use client";
import Icons from "@/components/general/forms/icons";
import { useEffect, ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import Collapse from "@/components/general/collapsible";
import { FiBell } from "react-icons/fi";
import { format } from "date-fns";
import cn from "classnames";
import { Navbar } from "@/components/Navbar";
import { getSingleData } from "@/controllers/connnector/app.callers";
import Vehicle from "@/components/Booking/CreateBooking/Vehicle";
import { BookingService } from "@/controllers/booking/bookingService";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/general/spinner";





const VehicleDetailsChip = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="flex items-center space-x-1 px-3 font-medium text-gray-900 py-2 rounded-lg text-sm bg-[#F0F2F5]">
        <span>{label}:</span>
        <span>{value}</span>
    </div>
);

const FeatureTag = ({ children }: { children: ReactNode }) => (
    <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-lg border border-gray-200">
        {children}
    </span>
);


const PendingPayment = () => {
    const params = useParams()
    const router = useRouter()
    const bookingId = params.bookingId || ""
    const [bookingData, setBookingData] = useState<any>();
    const [vehicleData, setVehicleData] = useState<any>();
    const [vehicleImages, setVehicleImages] = useState<string[]>([])
    const [pricingData, setPricingData] = useState<any>()
    const [paymentGateway, setPaymentGateway] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)



    const fetchPageData = async () => {
        try {
            const booking = await getSingleData(`/api/v1/public/bookings/${bookingId}`);
            const bookingInfo = booking.data?.[0]?.data;
            if (!bookingInfo) return;

            setBookingData(bookingInfo);

            const vehicleId = bookingInfo.vehicle?.id;
            if (!vehicleId) throw new Error("Vehicle ID missing");

            const [pricing, vehicle] = await Promise.all([
                getSingleData(`/api/v1/public/bookings/calculate/${bookingInfo.calculationId}`),
                getSingleData(`/api/v1/public/vehicles/${vehicleId}`),
            ]);

            const pricingInfo = pricing.data?.[0]?.data ?? null;
            const vehicleInfo = vehicle.data?.[0]?.data ?? null;

            setPricingData(pricingInfo);
            setVehicleData(vehicleInfo);

            const photos = vehicleInfo?.photos?.map((photo: any) => photo.cloudinaryUrl) || [];
            setVehicleImages(photos);
        } catch (error) {
            console.error("Failed to fetch page data:", error);
        } finally {
            setLoading(false);
        }
    };

    const proceedToPayment = async () => {
        const booking = await BookingService.initiatePayment({ bookingId: `${bookingId}`, paymentProvider: paymentGateway })
        if (paymentGateway === "PAYSTACK" && booking.data) {
            // @ts-ignore
            router.push(booking.data);
        }
        else {
            if (booking.data.authorizationUrl) router.push(booking.data.authorizationUrl);

        }
    }

    useEffect(() => {
        setLoading(true)
        sessionStorage.removeItem("servicePricingBookingId")
        fetchPageData()
    }, [])


    return (
        <>

            <Navbar />
            {
                loading ? <div className="flex items-center justify-center h-screen">
                    <Spinner className="" />
                </div> : (!bookingData || !pricingData || !vehicleData) ? <div className="flex items-center justify-center h-screen">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-medium text-gray-700">Booking not found</p>
                    </div>
                </div> : <main className=" mt-10 pb-[188px] pt-[52px] md:pt-16 px-8 lg:px-[52px]">
                    <div className="flex justify-between flex-col-reverse md:flex-row items-start gap-8">
                        <div className="space-y-8 w-full md:max-w-[calc(100%-400px)]">
                            <Collapse
                                title={
                                    <p className="text-h6 3xl:text-h5 font-medium text-black">
                                        Vehicle Details
                                    </p>
                                }
                                closeText={Icons.ic_chevron_down}
                                openText={Icons.ic_chevron_up}
                                className="bg-[#F9FAFB] border border-[#98a2b3] rounded-3xl py-5 px-7"
                            >
                                <Vehicle photos={vehicleImages} />
                                <div className="bg-[#F7F9FC] py-3 w-full  px-3 flex items-center space-x-2 rounded-t-xl">
                                    <FiBell
                                        size={40}
                                        color="#F38218 "
                                        className="p-2 bg-[#FBE2B7] rounded-lg border-[#F38218] border-1"
                                    />
                                    <span className="text-sm font-medium text-gray-800">
                                        1 day advance notice required before booking
                                    </span>
                                </div>
                                <div className="w-full md:w-3/5 space-y-8 mt-5">
                                    <div className="space-y-2">
                                        <h2 className="text-lg text-gray-800 pb-1">Vehicle Details</h2>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <VehicleDetailsChip
                                                label="Make"
                                                value={vehicleData?.vehicleMakeName || "N/A"}
                                            />
                                            <VehicleDetailsChip
                                                label="Model"
                                                value={vehicleData?.vehicleModelName || "N/A"}
                                            />
                                            <VehicleDetailsChip
                                                label="Year"
                                                value={`${vehicleData?.year || "N/A"}`}
                                            />
                                            <VehicleDetailsChip
                                                label="Colour"
                                                value={vehicleData?.vehicleColorName || "N/A"}
                                            />
                                            <VehicleDetailsChip
                                                label="City"
                                                value={vehicleData?.city || "N/A"}
                                            />
                                            <VehicleDetailsChip
                                                label="Vehicle type"
                                                value={
                                                    vehicleData?.vehicleTypeName.replaceAll("_", " ") ||
                                                    "N/A"
                                                }
                                            />
                                            <VehicleDetailsChip
                                                label="Seating Capacity"
                                                value={`${vehicleData?.numberOfSeats || "N/A"}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-lg">Description</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {vehicleData?.description || "N/A"}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-lg text-gray-800">Features</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {vehicleData?.vehicleFeatures &&
                                                vehicleData.vehicleFeatures.map(
                                                    (feature: string) => {
                                                        return <FeatureTag key={feature}>{feature} </FeatureTag>;
                                                    }
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </Collapse>

                            <Collapse
                                title={
                                    <p className="text-h6 3xl:text-h5 font-medium text-black">
                                        Trip Details
                                    </p>
                                }
                                closeText={Icons.ic_chevron_down}
                                openText={Icons.ic_chevron_up}
                                isDefaultOpen
                                className="bg-[#F9FAFB] border border-[#98a2b3] mt-4 rounded-3xl py-5 px-7"
                            >
                                {
                                    bookingData?.segments.map((trip: any, index: any) => {

                                        return (
                                            <div key={trip.id}>
                                                <p>Trip {index + 1}</p>

                                                <TripInfoWrapper title="Booking Type">
                                                    <DurationDetails
                                                        date={new Date(trip?.startDateTime || "")}
                                                        time={new Date(trip?.startDateTime || "")}
                                                        icon={Icons.ic_flag}
                                                        iconColor="text-primary-500"
                                                        title="Start"
                                                    />
                                                </TripInfoWrapper>

                                                <TripInfoWrapper title="Itinerary">
                                                    <SectionDetails
                                                        title="Pick-up"
                                                        description={trip?.pickupLocation || "N/A"}
                                                        isLocation
                                                    />
                                                    <SectionDetails
                                                        title="Drop-off"
                                                        description={trip?.dropoffLocation || "N/A"}
                                                        isLocation
                                                    />
                                                    <SectionDetails
                                                        title="Areas of Use"
                                                        description={trip?.areaOfUse || "N/A"}
                                                    />
                                                </TripInfoWrapper>
                                            </div>
                                        );
                                    })
                                }
                                <></>
                            </Collapse>
                        </div>

                        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Payment Breakdown
                                </h3>
                                <span
                                    className={`
    rounded-full px-3 py-1 text-xs font-medium
    ${bookingData?.bookingStatus === "CONFIRMED"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                        }
  `}
                                >
                                    {bookingData?.bookingStatus || "N/A"}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="my-4 border-t border-gray-200" />

                            {/* Breakdown */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Base Fare</span>
                                    <span>NGN {(pricingData?.basePrice || 0) + (pricingData?.platformFeeAmount || 0)}</span>
                                </div>

                                {pricingData?.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Duration Discount</span>
                                        <span className="text-green-600">- NGN {pricingData?.discountAmount}</span>
                                    </div>
                                )}

                                {pricingData?.couponDiscountAmount && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>
                                            Coupon Discount ({pricingData?.appliedCouponCode})
                                        </span>
                                        <span>- NGN {pricingData?.couponDiscountAmount}</span>
                                    </div>
                                )}

                            </div>
                            <div className="my-4 border-t border-dashed border-gray-300" />

                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-gray-900">
                                    Total
                                </span>
                                <span className="text-xl font-bold text-gray-900">
                                    NGN {pricingData?.finalPrice}
                                </span>
                            </div>



                            <div className="mb-6 mt-3">
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
                            <button
                                onClick={proceedToPayment}
                                disabled={bookingData?.bookingStatus === "CONFIRMED"}
                                className={`
    mt-3 w-full p-3 rounded-full font-medium text-white
    ${bookingData?.bookingStatus === "CONFIRMED"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#0673ff] hover:opacity-90 cursor-pointer"
                                    }
  `}
                            >
                                Proceed to Payment (
                                {paymentGateway === "MONNIFY" ? "Monnify" : "Paystack"})
                            </button>
                        </div>



                    </div>
                </main>
            }


        </>

    )
}
export default PendingPayment


const TripInfoWrapper = ({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) => (
    <div className="bg-white rounded-3xl py-4 px-5 md:px-7 mb-3 space-y-5 shadow-sm">
        <p className="text-sm md:text-base font-semibold text-grey-800">{title}</p>
        <div className="space-y-6">{children}</div>
    </div>
);

const SectionDetails = ({
    title,
    description,
    isLocation,
}: {
    title: string;
    description: string | string[];
    isLocation?: boolean;
}) => (
    <div className="space-y-3 text-sm md:text-base">
        <div className="flex items-center gap-2">
            {isLocation && Icons.ic_location}
            <p className="text-grey-800 font-medium">{title}</p>
        </div>

        {Array.isArray(description) ? (
            <ul className="space-y-2 text-[#98a2b3] text-xs">
                {description.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        ) : (
            <p className="text-[#98a2b3]">{description}</p>
        )}
    </div>
);

const DurationDetails = ({
    date,
    time,
    icon,
    iconColor,
    title,
}: {
    date: Date;
    time: Date;
    icon: ReactNode;
    iconColor: string;
    title: string;
}) => (
    <div className="flex text-xs justify-between mb-3items-center text-sm md:text-base">
        <p className="flex items-center gap-2">
            <span className={cn("*:w-5 *:h-5", iconColor)}>{icon}</span>
            <span>{title}</span>
        </p>
        <p>
            {format(date, "do MMM yyyy")} | {format(time, "hh:mma")}
        </p>
    </div>
);
