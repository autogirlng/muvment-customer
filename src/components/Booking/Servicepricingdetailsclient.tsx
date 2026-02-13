"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiLoader,
  FiCalendar,
  FiTag,
  FiDollarSign,
  FiInfo,
  FiMapPin,
  FiClock,
  FiChevronDown,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import Footer from "../HomeComponent/Footer";
import { ServicePricingShowcase } from "@/types/Servicepricing";
import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { ServicePricingStorage } from "@/utils/Servicepricingstorage";
import DateInput, { CalendarValue } from "@/components/general/forms/DateInput";
import TimeInput from "@/components/general/forms/TimeInput";
import SelectInput from "@/components/general/forms/select";
import { GoogleMapsLocationInput } from "@/components/general/forms/GoogleMapsLocationInput";
import Cookies from "js-cookie";

interface TripDetails {
  id: string;
  bookingType: string;
  tripStartDate: string;
  tripStartTime: string;
  pickupLocation: string;
  pickupCoordinates: { lat: number; lng: number } | null;
  dropoffLocation: string;
  dropoffCoordinates: { lat: number; lng: number } | null;
}

interface Trip {
  id: string;
  tripDetails: Partial<TripDetails>;
}

const ServicePricingBookingPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const yearRangeId = params?.yearRangeId as string;
  const servicePricingId = params?.id as string;

  const [pricing, setPricing] = useState<ServicePricingShowcase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([
    { id: "trip-0", tripDetails: {} },
  ]);
  const [openTripIds, setOpenTripIds] = useState<Set<string>>(
    new Set(["trip-0"]),
  );
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    fetchPricingData();
  }, [yearRangeId, servicePricingId]);

  useEffect(() => {
    const allTripsComplete = trips.every((trip) => {
      const details = trip.tripDetails;
      return (
        details.bookingType &&
        details.tripStartDate &&
        details.tripStartTime &&
        details.pickupLocation &&
        details.pickupCoordinates &&
        details.dropoffLocation &&
        details.dropoffCoordinates
      );
    });
    setCanProceed(allTripsComplete && trips.length > 0);
    Cookies.remove("servicePricingBookingId");
  }, [trips]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedData: any = ServicePricingStorage.getFromStorage();

      if (
        storedData &&
        storedData.yearRangeId === yearRangeId &&
        storedData.servicePricingId === servicePricingId
      ) {
        setPricing(storedData.data[0]);
        setLoading(false);
        return;
      }

      const data =
        await ServicePricingService.getServicePricingById(servicePricingId);

      if (!data) {
        setError("Service pricing not found");
        setLoading(false);
        return;
      }
      setPricing(data);
      ServicePricingStorage.saveToStorage(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pricing details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    ServicePricingStorage.clearStorage();
    router.back();
  };

  const addTrip = () => {
    const newId = `trip-${trips.length}`;
    setTrips([...trips, { id: newId, tripDetails: {} }]);
    setOpenTripIds(new Set([...openTripIds, newId]));
  };

  const deleteTrip = (id: string) => {
    if (trips.length === 1) return;
    setTrips(trips.filter((trip) => trip.id !== id));
    const newOpenIds = new Set(openTripIds);
    newOpenIds.delete(id);
    setOpenTripIds(newOpenIds);
    setPriceEstimate(null);
  };

  const toggleTrip = (id: string) => {
    const newOpenIds = new Set(openTripIds);
    if (newOpenIds.has(id)) {
      newOpenIds.delete(id);
    } else {
      newOpenIds.add(id);
    }
    setOpenTripIds(newOpenIds);
  };

  const updateTrip = (id: string, field: string, value: any) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.id === id) {
          const updatedDetails = {
            ...trip.tripDetails,
            [field]: value,
          };
          return {
            ...trip,
            tripDetails: updatedDetails,
          };
        }
        return trip;
      }),
    );
    setPriceEstimate(null);
  };

  const estimatePrice = async () => {
    if (!canProceed) return;

    setIsEstimating(true);
    setError(null);

    try {
      const firstTrip = trips[0].tripDetails;

      const pickupCoords = firstTrip.pickupCoordinates || {
        lat: 0.1,
        lng: 0.1,
      };
      const dropoffCoords = firstTrip.dropoffCoordinates || {
        lat: 0.1,
        lng: 0.1,
      };

      if (!pickupCoords || !dropoffCoords) {
        toast.error("Please select both pickup and dropoff locations");
        setIsEstimating(false);
        return;
      }

      if (pickupCoords.lat === 0.1 && pickupCoords.lng === 0.1) {
        toast.error("Please select a valid pickup location");
        setIsEstimating(false);
        return;
      }

      if (dropoffCoords.lat === 0.1 && dropoffCoords.lng === 0.1) {
        toast.error("Please select a valid dropoff location");
        setIsEstimating(false);
        return;
      }

      const requestBody = {
        servicePricingId: servicePricingId,
        bookingTypeId: firstTrip.bookingType,
        pickupLatitude: pickupCoords.lat || 0.1,
        pickupLongitude: pickupCoords.lng || 0.1,
        dropoffLatitude: dropoffCoords.lat || 0.1,
        dropoffLongitude: dropoffCoords.lng || 0.1,
      };

      const response =
        await ServicePricingService.calulateSpecialBooking(requestBody);

      if (!response) {
        return toast.error("Unexpected Error");
      }
      const data = response.data;

      setPriceEstimate(data);
      toast.success("Price estimated successfully!,");
    } catch (error: any) {
      console.error("Failed to estimate price:", error);
      toast.error(
        error.message || "Failed to estimate price. Please try again.",
      );
      setError(error.message);
    } finally {
      setIsEstimating(false);
    }
  };

  const proceedToCheckout = () => {
    if (!priceEstimate) return;

    sessionStorage.setItem("servicePricingTrips", JSON.stringify(trips));
    sessionStorage.setItem(
      "servicePricingEstimate",
      JSON.stringify(priceEstimate),
    );
    sessionStorage.setItem("servicePricingId", servicePricingId);
    sessionStorage.setItem("yearRangeId", yearRangeId);

    router.push(`/booking/${servicePricingId}/special-checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {error ? "Error Loading Details" : "Service Not Found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "The service pricing you're looking for doesn't exist."}
            </p>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bookingOptions =
    pricing.prices?.map((price) => ({
      option: price.bookingTypeName,
      value: price.bookingTypeId,
    })) || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen ">
        <div className="h-[10vh]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 "
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start">
                  <div className="">
                    <h1 className="text-2xl md:text-3x1 font-bold text-gray-900 mb-3">
                    {pricing.servicePricingName}
                  </h1>
                  <p className="text-gray-600 text-base mb-4">{pricing.name}</p>
                  
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md font-medium">
                      {pricing.minYear} - {pricing.maxYear}
                    </span>
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md font-medium">
                      {pricing.rideType}
                    </span>
                  </div>
                </div>

                {/* Vehicle Image */}
                <div className=" mb-6">
                  <div className="flex items-center justify-center">
                    <img
                      src={pricing.imageUrl}
                      alt={pricing.servicePricingName}
                      className="w-full max-w-2xl h-auto object-contain"
                      style={{ maxHeight: '700px' }}
                    />
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiTag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Service Type</p>
                        <p className="text-base font-semibold text-gray-900">{pricing.rideType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <FiCalendar className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Year Range</p>
                        <p className="text-base font-semibold text-gray-900">
                          {pricing.minYear} - {pricing.maxYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Book Your Trip
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Customize your itinerary
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {trips.map((trip, index) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      index={index}
                      isOpen={openTripIds.has(trip.id)}
                      onToggle={() => toggleTrip(trip.id)}
                      onDelete={() => deleteTrip(trip.id)}
                      onUpdate={updateTrip}
                      bookingOptions={bookingOptions}
                      canDelete={trips.length > 1}
                    />
                  ))}
                </div>

                {/* Price Estimate Section */}
                {priceEstimate && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-base font-bold text-gray-900 mb-4">
                      Price Estimate
                    </h3>
                    <div className="space-y-3">
                      <PriceRow
                        label="Base Fare"
                        value={priceEstimate.basePrice || 0}
                      />
                      {priceEstimate.platformFeeAmount > 0 && (
                        <PriceRow
                          label="Platform Fee"
                          value={priceEstimate.platformFeeAmount}
                        />
                      )}
                      {priceEstimate.vatAmount &&
                        priceEstimate.vatAmount > 0 && (
                          <PriceRow
                            label="VAT"
                            value={priceEstimate.vatAmount}
                            subLabel={`${priceEstimate.vatPercentage || 0}%`}
                          />
                        )}
                      {priceEstimate.discountAmount > 0 && (
                        <PriceRow
                          label="Discount"
                          value={priceEstimate.discountAmount}
                          isDiscount
                        />
                      )}
                      <div className="pt-3 border-t border-gray-300">
                        <PriceRow
                          label="Total Amount"
                          value={priceEstimate.totalPrice || 0}
                          isTotal
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Note */}
                <div className="mt-5 p-3.5 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2.5">
                    <FiInfo className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-900 mb-0.5">
                        Important Note
                      </h4>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        All prices are estimates. Final pricing will be
                        confirmed during checkout.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {!priceEstimate ? (
                    <button
                      onClick={estimatePrice}
                      disabled={!canProceed || isEstimating}
                      className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all ${
                        canProceed && !isEstimating
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isEstimating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Estimating Price...
                        </div>
                      ) : (
                        "Estimate Price"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={proceedToCheckout}
                      className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-all"
                    >
                      Continue to Checkout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const TripCard = ({
  trip,
  index,
  isOpen,
  onToggle,
  onDelete,
  onUpdate,
  bookingOptions,
  canDelete,
}: {
  trip: Trip;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  bookingOptions: { option: string; value: string }[];
  canDelete: boolean;
}) => {
  const details = trip.tripDetails;
  const tripStartDate = details.tripStartDate
    ? new Date(details.tripStartDate)
    : null;
  const tripStartTime = details.tripStartTime
    ? new Date(details.tripStartTime)
    : null;

  const dateLabel = tripStartDate
    ? `Day ${index + 1}: ${format(tripStartDate, "MMM do yyyy")}`
    : `Day ${index + 1}: Choose Date`;

  const handleCoordinates = (
    type: string,
    coordinates: { lat: number; lng: number },
  ) => {
    onUpdate(trip.id, type, coordinates);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Card Header */}
      <div
        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">
                {index + 1}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{dateLabel}</h3>
              {details.tripStartTime && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <FiClock className="w-3.5 h-3.5" />
                  {format(new Date(details.tripStartTime), "h:mm a")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
            <FiChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Card Content */}
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
          {/* Booking Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Booking type
            </label>
            <SelectInput
              id={`bookingType-${trip.id}`}
              placeholder="Select Duration"
              variant="outlined"
              options={bookingOptions}
              value={details.bookingType || ""}
              onChange={(value) => onUpdate(trip.id, "bookingType", value)}
            />
          </div>

          {/* Location Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-blue-600" />
                Pickup Location
              </label>
              <GoogleMapsLocationInput
                value={details.pickupLocation || ""}
                onChange={(value) => onUpdate(trip.id, "pickupLocation", value)}
                placeholder="Enter Pick Up Address"
                coordinates={handleCoordinates}
                type="pickupCoordinates"
                disabled={false}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-red-600" />
                Drop-off Location
              </label>
              <GoogleMapsLocationInput
                value={details.dropoffLocation || ""}
                onChange={(value) =>
                  onUpdate(trip.id, "dropoffLocation", value)
                }
                placeholder="Enter Drop-off Location"
                coordinates={handleCoordinates}
                type="dropoffCoordinates"
                disabled={false}
              />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Trip Date
              </label>
              <DateInput
                name={`startDate-${trip.id}`}
                value={tripStartDate}
                onChange={(value: CalendarValue) => {
                  onUpdate(trip.id, "tripStartDate", value?.toString() || "");
                }}
                minDate={new Date()}
                disabled={false}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Trip Time
              </label>
              <TimeInput
                name={`startTime-${trip.id}`}
                value={tripStartTime}
                onChange={(date: Date) =>
                  onUpdate(trip.id, "tripStartTime", date.toString())
                }
                timeType="start"
                disabled={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceRow = ({
  label,
  value,
  isDiscount = false,
  isTotal = false,
  subLabel = null,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
  isTotal?: boolean;
  subLabel?: string | null;
}) => {
  if (value === 0 && !isTotal) return null;

  return (
    <div className="flex justify-between items-center">
      <div>
        <span
          className={`${
            isTotal
              ? "text-sm font-bold text-gray-900"
              : "text-xs text-gray-600"
          }`}
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-xs text-gray-400 block">{subLabel}</span>
        )}
      </div>
      <span
        className={`font-semibold ${
          isTotal
            ? "text-lg text-gray-900"
            : isDiscount
              ? "text-green-600 text-sm"
              : "text-gray-700 text-sm"
        }`}
      >
        {isDiscount ? "-" : ""}₦
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
};

export default ServicePricingBookingPage;