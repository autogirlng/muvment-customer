"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin } from "react-icons/fi";
import Image from "next/image";
import Dropdown from "../utils/DropdownCustom";
import Calendar from "../utils/Calender";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { bookingOptionsData } from "@/context/Constarain";
import { GoogleMapsService } from "@/context/googleMapConnector";

export default function HeroBookingSection() {
  const router = useRouter();

  // Form state
  const [bookingType, setBookingType] = useState("select Type");
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [category, setCategory] = useState("suv-electric");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Location state
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryOptions, setcategoryOptions] = useState([]);

  // User's current location state
  const [userLocation, setUserLocation] = useState<string>(
    "Detecting location..."
  );
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    "pending" | "granted" | "denied"
  >("pending");

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const googleMapsServiceRef = useRef<GoogleMapsService | null>(null);

  const {
    showLocationDropdown,
    setShowLocationDropdown,
    locationSuggestions,
    isLoadingPlaces,
    searchError,
    handleLocationSelect,
    handleSearchInputFocus,
    handleSearchInputChange,
  } = useLocationSearch();

  const bookingOptions = bookingOptionsData;

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

  // Reverse geocode coordinates to get location name using Google Maps
  const reverseGeocodeWithGoogle = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      // Ensure Google Maps is loaded
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps not loaded");
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      return new Promise((resolve) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            // Extract location information from address components
            const addressComponents = results[0].address_components;

            let route = "";
            let locality = "";
            let political = "";
            let adminLevel1 = "";
            let country = "";

            for (const component of addressComponents) {
              // Get route (street name)
              if (component.types.includes("route")) {
                route = component.long_name;
              }
              // Get locality (city)
              else if (component.types.includes("locality")) {
                locality = component.long_name;
              }
              // Get political area (neighborhood/district)
              else if (
                component.types.includes("administrative_area_level_3") &&
                component.types.includes("political")
              ) {
                political = component.long_name;
              }
              // Get state/region
              else if (
                component.types.includes("administrative_area_level_1")
              ) {
                adminLevel1 = component.long_name;
              }
              // Get country
              else if (component.types.includes("country")) {
                country = component.long_name;
              }
            }

            // Build location string with available information
            let locationParts = [];

            if (route) locationParts.push(route);
            if (political) locationParts.push(political);
            if (locality) locationParts.push(locality);
            if (!locality && adminLevel1) locationParts.push(adminLevel1);

            const locationName =
              locationParts.length > 0
                ? locationParts.join(", ")
                : country || "Your Location";

            resolve(locationName);
          } else {
            console.error("Geocoder failed:", status);
            resolve("Your Location");
          }
        });
      });
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return "Your Location";
    }
  };

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setUserLocation("Location not supported");
        setLocationPermissionStatus("denied");
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          }
        );

        const { latitude, longitude } = position.coords;
        setLocationPermissionStatus("granted");

        // Wait for Google Maps to be initialized
        if (googleMapsServiceRef.current) {
          await googleMapsServiceRef.current.initialize();
        }

        // Get location name from coordinates using Google Maps
        const locationName = await reverseGeocodeWithGoogle(
          latitude,
          longitude
        );
        setUserLocation(locationName);
      } catch (error: any) {
        console.error("Error getting location:", error);
        setLocationPermissionStatus("denied");

        if (error.code === 1) {
          setUserLocation("Location access denied");
        } else if (error.code === 2) {
          setUserLocation("Location unavailable");
        } else if (error.code === 3) {
          setUserLocation("Location timeout");
        } else {
          setUserLocation("Unable to detect location");
        }
      }
    };

    // Small delay to ensure Google Maps service is initialized
    const timer = setTimeout(() => {
      getUserLocation();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowLocationDropdown]);

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleDateSelect = (date: Date, type: "from" | "until") => {
    if (type === "from") {
      setFromDate(date);
      if (date > untilDate) {
        setUntilDate(date);
      }
    } else {
      setUntilDate(date);
    }
  };

  const getvechileType = async () => {
    const result = await VehicleSearchService.getVechielType();
    const data = result[0].data;
    const transformedOptions = data.map((item: any) => ({
      value: item.id,
      label: item.name.replace("_", " "),
    }));

    setcategoryOptions(transformedOptions);
  };

  useEffect(() => {
    getvechileType();
  }, []);

  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleSearchInputChangeEvent = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearchInputChange(value);
    setErrorMessage("");
  };

  const onLocationSelect = async (location: any) => {
    const selected = await handleLocationSelect(location);
    setSelectedLocation(selected);
    setSearchValue(selected.name);
  };

  const handleSearch = async () => {
    setErrorMessage("");
    if (!searchValue.trim()) {
      setErrorMessage("Please enter a location");
      return;
    }

    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      setErrorMessage("Please select a valid location from the suggestions");
      return;
    }

    setIsSearching(true);

    try {
      const searchUrl = await VehicleSearchService.buildSearchUrl(
        {
          name: selectedLocation.name,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
        bookingType,
        category,
        fromDate,
        untilDate
      );
      router.push(searchUrl);
    } catch (error) {
      setErrorMessage("Failed to search vehicles. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRetryLocation = async () => {
    setUserLocation("Detecting location...");
    setLocationPermissionStatus("pending");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      setLocationPermissionStatus("granted");

      if (googleMapsServiceRef.current) {
        await googleMapsServiceRef.current.initialize();
      }

      const locationName = await reverseGeocodeWithGoogle(latitude, longitude);
      setUserLocation(locationName);
    } catch (error) {
      setLocationPermissionStatus("denied");
      setUserLocation("Location access denied");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden mt-[7rem] md:mt-0">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/landing/hero.jpg"
          alt="Hero background"
          fill
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-800/50 to-gray-900/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3  leading-tight">
            Find your perfect ride
          </h1>
          <p className="text-base md:text-lg text-gray-200">
            Browse and book cars effortlessly from our wide selection
          </p>
        </div>

        {/* Booking Form - Simplified Layout like inspiration */}
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-3 md:px-6 md:py-4">
            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {/* Booking Type */}
              <div className="flex-1 min-w-0 py-2 md:py-0 md:pr-4 border-b md:border-b-0 md:border-r border-gray-200">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Booking Type
                </label>
                <div className="relative">
                  <Dropdown
                    options={bookingOptions}
                    selectedValue={bookingType}
                    onSelect={(value: any) => setBookingType(value)}
                    placeholder={bookingType}
                    isOpen={openDropdown === "booking"}
                    onToggle={() => handleDropdownToggle("booking")}
                  />
                </div>
              </div>

              {/* Location Input - Takes most space */}
              <div className="flex-1 min-w-0 py-2 md:py-0 md:px-4 border-b md:border-b-0 md:border-r border-gray-200 relative">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Where
                </label>
                <div className="flex items-center relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by city, airport, address"
                    className="w-full bg-transparent focus:outline-none text-sm text-gray-900 placeholder-gray-400"
                    value={searchValue}
                    onChange={handleSearchInputChangeEvent}
                    onFocus={handleSearchInputFocus}
                  />
                </div>

                {/* Make sure this sits absolutely inside a relative container */}
                <div className="absolute top-full left-0 w-full z-50">
                  <LocationDropdown
                    isOpen={showLocationDropdown}
                    suggestions={locationSuggestions}
                    isLoading={isLoadingPlaces}
                    error={searchError}
                    onLocationSelect={onLocationSelect}
                    dropdownRef={locationDropdownRef}
                  />
                </div>
              </div>

              {/* From Date */}
              <div className="flex-shrink-0 w-full md:w-auto py-2 md:py-0 md:px-4 border-b md:border-b-0 md:border-r border-gray-200">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  From
                </label>
                <div className="relative">
                  <Calendar
                    selectedDate={fromDate}
                    onDateSelect={(date: any) => handleDateSelect(date, "from")}
                    minDate={new Date()}
                  />
                </div>
              </div>

              {/* Until Date */}
              <div className="flex-shrink-0 w-full md:w-auto py-2 md:py-0 md:px-4 md:border-r border-gray-200">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Until
                </label>
                <div className="relative">
                  <Calendar
                    selectedDate={untilDate}
                    onDateSelect={(date: any) =>
                      handleDateSelect(date, "until")
                    }
                    minDate={fromDate}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex-1 w-full md:w-auto py-2 md:py-0 md:px-4 md:border-r border-gray-200">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Category
                </label>
                <div className="relative">
                  <Dropdown
                    options={categoryOptions}
                    selectedValue={category}
                    onSelect={(value: any) => setCategory(value)}
                    placeholder="Select category"
                    isOpen={openDropdown === "category"}
                    onToggle={() => handleDropdownToggle("category")}
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-center justify-center py-2 md:py-0 md:pl-4">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 md:p-3.5 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Search"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Location Badge */}
        <div className="absolute bottom-8 left-4 md:left-12 lg:left-20 xl:left-32 flex items-center gap-2 text-white text-xl md:text-2xl font-semibold">
          <FiMapPin
            className={`w-6 h-6 ${
              locationPermissionStatus === "granted"
                ? "text-blue-400"
                : locationPermissionStatus === "denied"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          />
          <span>{userLocation}</span>

          {/* Retry button if location permission was denied */}
          {locationPermissionStatus === "denied" && (
            <button
              onClick={handleRetryLocation}
              className="ml-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              title="Retry location access"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
