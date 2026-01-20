"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiX } from "react-icons/fi";
import Image from "next/image";
import Dropdown from "../utils/DropdownCustom";
import Calendar from "../utils/Calender";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { getBookingOption } from "@/context/Constarain";
import { GoogleMapsService } from "@/context/googleMapConnector";
import { trackCategoryClick, trackVehicleSearch } from "@/services/analytics";

const DEFAULT_LOCATION = {
  name: "Lagos, Nigeria",
  lat: 6.5244,
  lng: 3.3792,
};

export default function HeroBookingSection() {
  const router = useRouter();

  // Form state
  const [bookingType, setBookingType] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [category, setCategory] = useState(undefined);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);

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

  const [error, setError] = useState<string | null>(null);


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

  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
    if (data.dropdownOptions?.length > 0) {
      setBookingType(data.dropdownOptions[0].value);
    }
  };
  const initGoogleMaps = async () => {
    try {
      googleMapsServiceRef.current = new GoogleMapsService();
      await googleMapsServiceRef.current.initialize();
    } catch (error) {
      console.error("Failed to initialize Google Maps:", error);
    }
  };



  const [location, setLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,

  });


  const revertToDefaultLocation = () => {
    setLocationPermissionStatus("denied");
    setUserLocation("Lagos, Nigeria");
    setSearchValue(DEFAULT_LOCATION.name);
    setSelectedLocation({
      name: DEFAULT_LOCATION.name,
      lat: DEFAULT_LOCATION.lat,
      lng: DEFAULT_LOCATION.lng,
    });


  }


  const getLongitudeLatitude = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setUserLocation("Detecting location...");


    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError(null);

        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,

        });
      },
      (err) => {
        switch (err.code) {
          case 1:
            setError("Location permission denied");
            break;
          case 2:
            setError("Location unavailable. Please turn on location services.");
            break;

          default:
            setError("Unable to get location");
        }

        revertToDefaultLocation();
      },
      {
        enableHighAccuracy: false, // 🔑 important
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const getLocationInformation = () => {

    setUserLocation("Detecting Location...")
    if (typeof window === "undefined" || !window.google) return;

    if (location.lat == null && location.lng == null) {
      getLongitudeLatitude()
    }
    try {
      const geocoder = new google.maps.Geocoder();
      if (location.lat != null && location.lng != null) {
        geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
          if (status !== "OK" || !results?.[0]) return;
          const components = results[0].address_components;
          const state = components.find((c) => c.types.includes("administrative_area_level_1"))?.long_name || "";
          const country = components.find((c) => c.types.includes("country"))?.long_name || "";
          const locationName = state + ", " + country
          setUserLocation(locationName);
          setSearchValue(locationName);
          setSelectedLocation({
            name: locationName,
            lat: location.lat,
            lng: location.lng,
          });

          sessionStorage.setItem(
            "userLocation",
            JSON.stringify({
              name: locationName,
              lat: location.lat,
              lng: location.lng,
              timestamp: Date.now(),
            })
          );
        })

        setLocationPermissionStatus("granted");

      }
    } catch (error) {
      revertToDefaultLocation()
    }
  }


  useEffect(() => {
    if (location.lat == null || location.lng == null) return;

    getLocationInformation();
  }, [location.lat, location.lng]);






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
    getLongitudeLatitude();
    getBookingOptions();
    initGoogleMaps();
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

    trackVehicleSearch({
      searchTerm: `${selectedLocation.name} ${bookingType || ""} ${fromDate || ""
        }   ${untilDate || ""}`.trim(),
      category,
      location: selectedLocation.name,
    });
    if (category) {
      trackCategoryClick(category);
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

  return (
    <div className="relative w-full h-screen overflow-hidden mt-[5rem] md:mt-0">
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
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            Find your perfect ride
          </h1>
          <p className="text-base md:text-lg text-gray-200">
            Browse and book cars effortlessly from our wide selection
          </p>
        </div>

        {/* Booking Form */}
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

              {/* Location Input */}
              <div className="flex-1 min-w-0 py-2 md:py-0 md:px-4 border-b md:border-b-0 md:border-r border-gray-200 relative">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Where
                </label>
                <div className="flex items-center relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by city, airport, address"
                    className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                    value={searchValue}
                    onChange={handleSearchInputChangeEvent}
                    onFocus={handleSearchInputFocus}
                  />
                </div>

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
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-full p-3 md:p-3.5 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            className={`w-6 h-6 ${locationPermissionStatus === "granted"
              ? "text-blue-400"
              : locationPermissionStatus === "denied"
                ? "text-red-400"
                : "text-yellow-400"
              }`}
          />

          <span>{userLocation} {locationPermissionStatus === "denied" && "(Default Location)"}</span>
          {locationPermissionStatus === "denied" && (
            <button
              onClick={getLocationInformation}
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
