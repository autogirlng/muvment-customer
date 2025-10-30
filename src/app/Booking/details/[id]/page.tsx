"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FiMapPin,
  FiUser,
  FiDroplet,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiLoader,
  FiShield,
} from "react-icons/fi";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

import { Navbar } from "@/components/Navbar";
import { GoogleMapsService } from "@/context/googleMapConnector";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { getDisplayLabel } from "@/app/services/vechilePriceUtiles";
import Calendar from "@/components/utils/Calender";
import TimeSelector from "@/components/utils/TimeSelector";
import { useBookingStore } from "@/hooks/bookingStore";

interface VehicleDetailsPageProps {
  params: {
    id: string;
  };
}

interface CaseDetails {
  caseNumber?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  createdAt?: string;
  lastUpdated?: string;
}

const VehicleDetailsPage: React.FC<VehicleDetailsPageProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleMapsServiceRef = useRef<GoogleMapsService | null>(null);
  const { id } = useParams();

  // State
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedBookingType, setSelectedBookingType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("06:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState({ lat: 0, lng: 0 });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 0, lng: 0 });
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [calculatedPrice, setCalculatedPriceSummary] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);

  // Initialize Google Maps Service
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        googleMapsServiceRef.current = new GoogleMapsService();
        await googleMapsServiceRef.current.initialize();
      } catch (error) {
        console.error("Failed to initialize Google Maps:", error);
      }
    };
    initGoogleMaps();
  }, []);

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const data = await VehicleSearchService.getVehicleById(id as string);
        console.log("Fetched vehicle data:", data);
        setVehicle(data[0].data);
        setError(null);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle details");
        setCaseDetails(null); // Ensure case details are null on error
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);
  useEffect(() => {
    const bookingTypeParam = searchParams.get("bookingType");
    const convertedParams = getDisplayLabel(bookingTypeParam);
    if (vehicle?.allPricingOptions && vehicle.allPricingOptions.length > 0) {
      if (bookingTypeParam) {
        console.log("Booking type param found:", bookingTypeParam);
        const matchingOption = vehicle.allPricingOptions.find(
          (opt: any) =>
            opt.bookingTypeName === convertedParams ||
            opt.bookingTypeId === bookingTypeParam
        );
        if (matchingOption) {
          setSelectedBookingType(matchingOption.bookingTypeId);
        } else {
          setSelectedBookingType(vehicle.allPricingOptions[0].bookingTypeId);
        }
      } else {
        setSelectedBookingType(vehicle.allPricingOptions[0].bookingTypeId);
      }
    }
  }, [vehicle, searchParams]);

  // Get images with primary first
  const images = useMemo(() => {
    if (!vehicle?.photos || vehicle.photos.length === 0) return [];
    const sorted = [...vehicle.photos].sort((a: any, b: any) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });
    return sorted
      .map((p: any) => p.cloudinaryUrl)
      .filter((url: string) => url && url.startsWith("http"));
  }, [vehicle?.photos]);

  // Get location suggestions from Google Maps
  const getLocationSuggestions = async (input: string) => {
    if (!input || input.length < 3) return [];

    try {
      if (!googleMapsServiceRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!window.google || !window.google.maps) {
        console.error("Google Maps not loaded");
        return [];
      }

      const service = new window.google.maps.places.AutocompleteService();

      return new Promise((resolve) => {
        service.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: "ng" },
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              resolve(predictions);
            } else {
              resolve([]);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };

  // Handle pickup location input
  const handlePickupLocationChange = async (value: string) => {
    setPickupLocation(value);
    if (value.length >= 3) {
      const suggestions = await getLocationSuggestions(value);
      setPickupSuggestions(suggestions as any[]);
    } else {
      setPickupSuggestions([]);
    }
  };

  // Handle dropoff location input
  const handleDropoffLocationChange = async (value: string) => {
    setDropoffLocation(value);
    if (value.length >= 3) {
      const suggestions = await getLocationSuggestions(value);
      setDropoffSuggestions(suggestions as any[]);
    } else {
      setDropoffSuggestions([]);
    }
  };

  const getCoordinatesFromPlaceId = async (placeId: string) => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not loaded");
      }

      const geocoder = new window.google.maps.Geocoder();

      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        geocoder.geocode({ placeId }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            reject(new Error("Geocoding failed"));
          }
        });
      });
    } catch (error) {
      console.error("Error getting coordinates:", error);
      throw error;
    }
  };

  // Select pickup location
  const selectPickupLocation = async (suggestion: any) => {
    setPickupLocation(suggestion.description);
    setPickupSuggestions([]);
    try {
      const coords = await getCoordinatesFromPlaceId(suggestion.place_id);
      setPickupCoords(coords);
    } catch (error) {
      console.error("Error getting pickup coordinates:", error);
    }
  };

  // Select dropoff location
  const selectDropoffLocation = async (suggestion: any) => {
    setDropoffLocation(suggestion.description);
    setDropoffSuggestions([]);
    try {
      const coords = await getCoordinatesFromPlaceId(suggestion.place_id);
      setDropoffCoords(coords);
    } catch (error) {
      console.error("Error getting dropoff coordinates:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const selectedPricing = useMemo(() => {
    return vehicle?.allPricingOptions?.find(
      (opt: any) => opt.bookingTypeId === selectedBookingType
    );
  }, [selectedBookingType, vehicle]);

  const handleCalculateBooking = async () => {
    if (!startDate || !pickupLocation || !dropoffLocation) {
      alert("Please fill in all required fields");
      return;
    }

    if (pickupCoords.lat === 0 || dropoffCoords.lat === 0) {
      alert("Please select valid locations from the suggestions");
      return;
    }

    setIsCalculating(true);

    try {
      const calculationRequest = {
        vehicleId: id as string,
        segments: [
          {
            bookingTypeId: selectedBookingType,
            startDate: startDate!.toISOString().split("T")[0],
            startTime: startTime,
            pickupLatitude: pickupCoords.lat,
            pickupLongitude: pickupCoords.lng,
            dropoffLatitude: dropoffCoords.lat,
            dropoffLongitude: dropoffCoords.lng,
            pickupLocationString: pickupLocation,
            dropoffLocationString: dropoffLocation,
          },
        ],
      };
      const result = await VehicleSearchService.calculateBooking(
        calculationRequest
      );
      const { setVehicle, setSegments, setCalculatedPrice } =
        useBookingStore.getState();

      // Store vehicle data
      setVehicle({
        id: vehicle.id,
        name: vehicle.name,
        photos: vehicle.photos,
        city: vehicle.city,
        vehicleTypeName: vehicle.vehicleTypeName,
        numberOfSeats: vehicle.numberOfSeats,
        year: vehicle.year,
        description: vehicle.description,
        willProvideDriver: vehicle.willProvideDriver,
        willProvideFuel: vehicle.willProvideFuel,
        extraHourlyRate: vehicle.extraHourlyRate,
      });

      // Store segments
      setSegments(calculationRequest.segments);
      // Cast result to any to satisfy the expected store setter type (BookingCalculationResponse -> CalculatedPrice)
      setCalculatedPrice(result as any);
      setCalculatedPriceSummary(result);
    } catch (error) {
      console.error("Error calculating booking:", error);
      alert("Failed to calculate booking. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBookNow = () => {
    if (!calculatedPrice) {
      alert("Please calculate booking first");
      return;
    }

    // Navigate to checkout or booking confirmation page
    router.push(
      `/Booking/checkout/${id}?calculationId=${calculatedPrice.calculationId}`
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10"></div>

      <div className=" mx-auto px-4 py-6">
        <div className=" mx-auto  py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex-1">
            {vehicle.name}
          </h1>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiHeart
              className={`w-6 h-6 ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details Banner */}
            {/* {caseDetails && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <FiShield className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Case Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Case Number
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {caseDetails.caseNumber || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          caseDetails.status as string
                        )}`}
                      >
                        {caseDetails.status || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Priority
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          caseDetails.priority as string
                        )}`}
                      >
                        {caseDetails.priority || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Assigned To
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {caseDetails.assignedTo || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Created
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {caseDetails.createdAt
                          ? formatDate(caseDetails.createdAt)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Last Updated
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {caseDetails.lastUpdated
                          ? formatDate(caseDetails.lastUpdated)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                {images[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {images.length > 0 && (
                  <>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                        >
                          <FiChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                        >
                          <FiChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Grid */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Vehicle Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.city}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.vehicleTypeName?.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Seats</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.numberOfSeats}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Make</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.vehicleMakeName || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Model</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.vehicleModelName || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Year</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.year || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {vehicle.description}
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <FiUser className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Driver Available
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.willProvideDriver ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <FiDroplet className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Fuel Included
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.willProvideFuel ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <MdAirlineSeatReclineNormal className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Seating Capacity
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.numberOfSeats} Seats
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Features */}
              {vehicle.vehicleFeatures &&
                vehicle.vehicleFeatures.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.vehicleFeatures.map(
                        (feature: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {feature}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trip Details
                </h3>

                {/* Booking Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Type
                  </label>
                  <select
                    value={selectedBookingType}
                    onChange={(e) => setSelectedBookingType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {vehicle.allPricingOptions?.map((option: any) => (
                      <option
                        key={option.bookingTypeId}
                        value={option.bookingTypeId}
                      >
                        {option.bookingTypeName} -{" "}
                        {formatCurrency(option.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Price Display */}
                {selectedPricing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(selectedPricing.price)}
                      </span>
                    </div>
                    {vehicle.extraHourlyRate > 0 && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                        <span className="text-xs text-gray-600">
                          Extra Hour Rate
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(vehicle.extraHourlyRate)}/hr
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    Start Date
                  </label>
                  <Calendar
                    selectedDate={startDate || undefined}
                    onDateSelect={(date: Date) => setStartDate(date)}
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>

                {/* Time Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline w-4 h-4 mr-1" />
                    Start Time
                  </label>
                  <TimeSelector value={startTime} onChange={setStartTime} />
                </div>

                {/* Pickup Location */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-1" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => handlePickupLocationChange(e.target.value)}
                    placeholder="Enter pickup address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {pickupSuggestions.map((suggestion: any) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => selectPickupLocation(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {suggestion.structured_formatting.main_text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropoff Location */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-1" />
                    Drop-off Location
                  </label>
                  <input
                    type="text"
                    value={dropoffLocation}
                    onChange={(e) =>
                      handleDropoffLocationChange(e.target.value)
                    }
                    placeholder="Enter drop-off address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {dropoffSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {dropoffSuggestions.map((suggestion: any) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => selectDropoffLocation(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {suggestion.structured_formatting.main_text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculateBooking}
                  disabled={isCalculating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCalculating ? "Calculating..." : "Calculate Price"}
                </button>

                {/* Calculated Price Display */}
                {calculatedPrice && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-semibold">
                        {formatCurrency(calculatedPrice.basePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee </span>
                      <span className="font-semibold">
                        {formatCurrency(calculatedPrice.platformFeeAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount </span>
                      <span className="font-semibold">
                        {formatCurrency(calculatedPrice.discountAmount)}
                      </span>
                    </div>

                    <div className="border-t border-green-200 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(calculatedPrice.finalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Now Button */}
                <button
                  onClick={handleBookNow}
                  disabled={!calculatedPrice}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>

                {/* Advance Notice */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <FiClock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    {vehicle.advanceNotice || "1 day"} advance notice required
                    before booking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
