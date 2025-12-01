"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTableData, createData } from "@/controllers/connnector/app.callers";
import { format } from "date-fns"

import {
  FiHeart,
  FiLoader,
  FiArrowLeft,
  FiBell,

  FiShare2
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { Carousel } from "@/components/utils/Carousel";
import { TripAccordion } from "@/components/Booking/TripAccordion";
import { useItineraryForm } from "@/components/general/forms/useItenaryForm";
import { VehicleDetailsPageProps, BookingOptions, EstimatedBookingPrice } from "@/types/vehicleDetails";

const IconButton = ({ children, className = '', onClick }: { children: any, className: any, onClick: any }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition duration-150 ${className}`}
  >
    {children}
  </button>
);


const VehicleDetailsPage: React.FC<VehicleDetailsPageProps> = () => {
  const router = useRouter();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOptions, setBookingOptions] = useState<{ option: string, value: string }[]>([])
  const [pricing, setPricing] = useState<EstimatedBookingPrice>()

  const {
    setTrips,
    trips,
    deleteTrip,
    onChangeTrip,
    addTrip,
    toggleOpen,
    openTripIds,

    isTripFormsComplete
  } = useItineraryForm()

  const generateBookingOptions = useCallback(async (): Promise<{ option: string, value: string }[]> => {

    const bookingTypes = await getTableData("/api/v1/booking-types")
    const types: BookingOptions = bookingTypes?.data


    const options = types.data.map((type) => {
      return { option: type.name, value: type.id }
    })

    return options;
  }, [])



  useEffect(() => {
    let mounted = true;
    generateBookingOptions().then((options) => {
      setBookingOptions(options)
    })
    return () => {
      mounted = false;
    }
  }, [generateBookingOptions])

  useEffect(() => {


    sessionStorage.removeItem("trips")
    setTrips([{ id: "trip-0", tripDetails: {} }])

  }, [])


  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const data = await VehicleSearchService.getVehicleById(id as string);
        setVehicle(data[0].data);
        setError(null);
      } catch (err) {
        setError("Failed to load vehicle details");

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);







  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <FiLoader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-red-600 mb-4">
            {error || "Vehicle not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  const VehicleDetailsChip = ({ label, value }: { label: string, value: string }) => (
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


  const DiscountRow = ({ days, discount, color }: { days: string, discount: string, color: string }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 border border-[#D0D5DD] rounded-lg">
      <span className="text-sm font-medium text-gray-700">{days}</span>
      <span className={`text-sm font-bold ${color}`}>{discount}</span>
    </div>
  );



  const estimatePrice = async (): Promise<EstimatedBookingPrice> => {

    const tripSegments = trips.map((trip) => {
      const details = trip?.tripDetails
      const pickupCoordinates: { lat: number; lng: number } = JSON.parse(`${details?.pickupCoordinates}`)
      const dropoffCoordinates: { lat: number; lng: number } = JSON.parse(`${details?.dropoffCoordinates}`)
      const areaOfUseCoordinates: { lat: number; lng: number } = JSON.parse(`${details?.areaOfUseCoordinates}`)

      return {
        bookingTypeId: details?.bookingType,
        startDate: format(new Date(details?.tripStartDate || ""), "yyyy-MM-dd"),
        startTime: format(new Date(details?.tripStartTime || ""), "HH:mm:ss"),
        pickupLatitude: pickupCoordinates.lat,
        pickupLongitude: pickupCoordinates.lng,
        dropoffLatitude: dropoffCoordinates.lat,
        dropoffLongitude: dropoffCoordinates.lng,
        pickupLocationString: details?.pickupLocation,
        dropoffLocationString: details?.dropoffLocation,
        areaOfUse: [
          {
            areaOfUseLatitude: areaOfUseCoordinates.lat,
            areaOfUseLongitude: areaOfUseCoordinates.lng,
            areaOfUseName: details?.areaOfUse
          }
        ]

      }
    })

    const data = { vehicleId: vehicle.id, segments: tripSegments }
    const pricing = await createData("/api/v1/public/bookings/calculate", data) as EstimatedBookingPrice
    setPricing(pricing)
    return pricing;
  }





  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-50 mt-10">

        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center flex-col">
          <div className="max-w-4xl flex flex-col w-full">
            <div className=" rounded-xl  flex-shrink p-4 sm:p-6 space-y-4">

              <button className="cursor-pointer flex items-center space-x-1" onClick={() => router.back()}>
                <FiArrowLeft size={24} />
                <span>Back</span>
              </button>
              <header className="flex flex-row  justify-between items-start sm:items-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">{vehicle.name || ""} </h1>
                <div className="flex items-center space-x-3">
                  <IconButton
                    className="bg-gray-900 hover:bg-gray-800 cursor-pointer text-[white]"
                    onClick={() => { }}>
                    <FiShare2 size={18} />
                  </IconButton>
                  <IconButton className="bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer" onClick={() => { }}>
                    <FiHeart size={18} />
                  </IconButton>

                </div>
              </header>


              <Carousel urls={vehicle.photos.map((photo: any) => {
                return {
                  url: photo.cloudinaryUrl, id: photo.cloudinaryPublicId
                }
              })} />
            </div>

            <div className="bg-[#F7F9FC] py-3 w-full  px-3 flex items-center space-x-2 rounded-t-xl">
              <FiBell size={40} color="#F38218 " className="p-2 bg-[#FBE2B7] rounded-lg border-[#F38218] border-1" />
              <span className="text-sm font-medium text-gray-800">1 day advance notice required before booking</span>
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              {/* LEFT HAND SIDE */}
              <div className="w-full md:w-3/5 space-y-8 mt-5">

                <div className="space-y-2">
                  <h2 className="text-lg text-gray-800 pb-1">Vehicle Details</h2>
                  <div className="flex flex-wrap items-center gap-4">
                    <VehicleDetailsChip label="Make" value={vehicle.vehicleMakeName || "N/A"} />
                    <VehicleDetailsChip label="Model" value={vehicle.vehicleModelName || "N/A"} />
                    <VehicleDetailsChip label="Year" value={vehicle.year || "N/A"} />
                    <VehicleDetailsChip label="Colour" value={vehicle.vehicleColorName || "N/A"} />
                    <VehicleDetailsChip label="City" value={vehicle.city || "N/A"} />
                    <VehicleDetailsChip label="Vehicle type" value={vehicle.vehicleTypeName?.replaceAll("_", " ")} />
                    <VehicleDetailsChip label="Seating Capacity" value={vehicle.numberOfSeats} />


                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg">Description</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {vehicle.description || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg text-gray-800">Features</h2>
                  <div className="flex flex-wrap gap-2">


                    {
                      vehicle.vehicleFeatures.length > 0 && vehicle.vehicleFeatures.map((feature: string) => {
                        return <FeatureTag>{feature}   </FeatureTag>;
                      })
                    }

                  </div>
                </div>


              </div>

              {/* RIGHT HAND SIDE */}
              <div className="w-full md:w-2/5 border-1 p-5 rounded-xl border-[#E4E7EC]">
                <div>
                  <h1 className="font-bold text-[17px]">Add Booking Details</h1>
                  <p className="text-sm my-4">Trip per day</p>

                  {
                    trips.map((key, index) => {
                      return <TripAccordion key={key.id}
                        day={`${index + 1}`}
                        id={key.id}
                        vehicle={vehicle}
                        deleteMethod={deleteTrip}
                        disabled={false}
                        onChangeTrip={onChangeTrip}
                        isCollapsed={!openTripIds.has(key.id)}
                        toggleOpen={() => toggleOpen(key.id)}
                        bookingOptions={bookingOptions}
                      />
                    })
                  }
                  <button onClick={() => addTrip(`trip-${trips.length}`)} className="text-[#0673ff] mt-3 text-sm cursor-pointer border-0 bg-white">+ Add Trip</button>

                  {
                    pricing?.data && <div className="flex justify-between mt-4">
                      <div className="flex flex-col">

                        <span className="text-xs">TOTAL</span>
                      </div>

                      <span className="font-bold">NGN{pricing.data.data.finalPrice}</span>

                    </div>
                  }

                </div>



                {/* Book Ride Button */}
                <button
                  className="w-full py-5 mt-4 text-xs cursor-pointer bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed  text-white rounded-full shadow-md hover:bg-blue-700 transition duration-150"
                  disabled={!isTripFormsComplete}
                  onClick={estimatePrice}>
                  Estimate Price
                </button>

                {/* Discounts Section */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-lg font-bold text-gray-800">Discounts</h3>
                  {vehicle.discounts.length > 0 && vehicle.discounts.map((discount: any, index: number) => (
                    <DiscountRow key={index} days={discount.durationName + " trips"} discount={discount.percentage + "% off"} color={"text-[#0aaf24]"} />
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>


      </div>
    </>
  );
};

export default VehicleDetailsPage;
