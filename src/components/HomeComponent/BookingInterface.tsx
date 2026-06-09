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
import { getBookingOption } from "@/context/Constarain";
import { GoogleMapsService } from "@/context/googleMapConnector";
import { trackCategoryClick, trackVehicleSearch } from "@/services/analytics";
import TimePicker from "../Booking/BookingTimePicker";
import BackgroundCarousel from "./Backgroundcarousel";

const DEFAULT_LOCATION = {
  name: "Lagos, Nigeria",
  lat: 6.5244,
  lng: 3.3792,
};

const COTONOU = {
  name: "Cotonou",
  lat: 6.3703,
  lng: 2.3912,
};

// Some backend "booking types" are really trip destinations. We group them in
// the UI ("Boat Trip", "Interstate Trip") but still send the destination's own
// booking-type id to the backend.
const BOAT_DESTINATION_NAMES = [
  "Ishahayi",
  "Ikare",
  "Ibeshe",
  "Tarkwa Bay",
  "Ilashe",
];
const INTERSTATE_DESTINATION_NAMES = ["Cotonou"];
const BOAT_VALUE = "__boat_trip__";
const INTERSTATE_VALUE = "__interstate_trip__";

const matchesName = (list: string[], name?: string) =>
  list.some((x) => x.toLowerCase() === (name || "").toLowerCase());

export default function HeroBookingSection() {
  const router = useRouter();

  // Form state
  const [bookingType, setBookingType] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [fromTime, setFromTime] = useState("14:30"); // Default time
  const [untilTime, setUntilTime] = useState("14:30"); // Default time
  const [category, setCategory] = useState(undefined);
  const [destination, setDestination] = useState<string | undefined>(undefined);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);

  // Location state
  const [searchValue, setSearchValue] = useState(DEFAULT_LOCATION.name);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>({
    name: DEFAULT_LOCATION.name,
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryOptions, setcategoryOptions] = useState<{
    value: any;
    label: string;
  }[]>([]);

  const [error, setError] = useState<string | null>(null);

  // User's current location state
  const [userLocation, setUserLocation] = useState<string>(
    "Detecting location...",
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
    const opts = data.dropdownOptions || [];
    setBookingOptions(opts);
    if (opts.length > 0) {
      const standard = opts.filter(
        (o: any) =>
          !matchesName(BOAT_DESTINATION_NAMES, o.label) &&
          !matchesName(INTERSTATE_DESTINATION_NAMES, o.label),
      );
      const twelveHours = standard.find((o: any) =>
        /12\s*hours?/i.test(o.label || ""),
      );
      setBookingType(
        (prev) =>
          prev ?? (twelveHours?.value ?? standard[0]?.value ?? opts[0].value),
      );
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
  };

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
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const getLocationInformation = async () => {
    setUserLocation("Detecting Location...");
    if (typeof window === "undefined") return;
    await initGoogleMaps();
    if (!window.google) return;

    if (location.lat == null && location.lng == null) {
      getLongitudeLatitude();
    }
    try {
      const geocoder = new google.maps.Geocoder();
      if (location.lat != null && location.lng != null) {
        geocoder.geocode(
          { location: { lat: location.lat, lng: location.lng } },
          (results, status) => {
            if (status !== "OK" || !results?.[0]) return;
            const components = results[0].address_components;
            const state =
              components.find((c) =>
                c.types.includes("administrative_area_level_1"),
              )?.long_name || "";
            const country =
              components.find((c) => c.types.includes("country"))?.long_name ||
              "";
            const locationName = state + ", " + country;
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
              }),
            );
          },
        );

        setLocationPermissionStatus("granted");
      }
    } catch (error) {
      revertToDefaultLocation();
    }
  };

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
  
    const data = result;
  
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
  }, []);

  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleSearchInputChangeEvent = (
    e: React.ChangeEvent<HTMLInputElement>,
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

  // Group booking types: standard durations vs trip destinations.
  const boatDestinations = bookingOptions.filter((o: any) =>
    matchesName(BOAT_DESTINATION_NAMES, o.label),
  );
  const interstateDestinations = bookingOptions.filter((o: any) =>
    matchesName(INTERSTATE_DESTINATION_NAMES, o.label),
  );
  const standardBookingOptions = bookingOptions.filter(
    (o: any) =>
      !matchesName(BOAT_DESTINATION_NAMES, o.label) &&
      !matchesName(INTERSTATE_DESTINATION_NAMES, o.label),
  );
  const displayBookingOptions = [
    ...standardBookingOptions,
    ...(boatDestinations.length
      ? [{ value: BOAT_VALUE, label: "Boat Trip" }]
      : []),
    ...(interstateDestinations.length
      ? [{ value: INTERSTATE_VALUE, label: "Interstate Trip" }]
      : []),
  ];
  const tripMode =
    bookingType === BOAT_VALUE
      ? "boat"
      : bookingType === INTERSTATE_VALUE
        ? "interstate"
        : "standard";
  const destinationOptions =
    tripMode === "boat"
      ? boatDestinations
      : tripMode === "interstate"
        ? interstateDestinations
        : [];

  const handleBookingTypeChange = (value: string) => {
    setBookingType(value);
    if (value === BOAT_VALUE) {
      setDestination(boatDestinations[0]?.value);
    } else if (value === INTERSTATE_VALUE) {
      setDestination(interstateDestinations[0]?.value);
    } else {
      setDestination(undefined);
    }
  };

  const handleSearch = async () => {
    setErrorMessage("");

    let loc: { name: string; lat: number; lng: number };
    let effectiveBookingType: string | undefined;

    if (tripMode === "standard") {
      if (!searchValue.trim()) {
        setErrorMessage("Please enter a location");
        return;
      }
      if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
        setErrorMessage("Please select a valid location from the suggestions");
        return;
      }
      loc = {
        name: selectedLocation.name,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      };
      effectiveBookingType = bookingType;
    } else {
      if (!destination) {
        setErrorMessage("Please choose a destination");
        return;
      }
      const destOption = destinationOptions.find(
        (o: any) => o.value === destination,
      );
      const coords = tripMode === "interstate" ? COTONOU : DEFAULT_LOCATION;
      loc = {
        name: destOption?.label || coords.name,
        lat: coords.lat,
        lng: coords.lng,
      };
      effectiveBookingType = destination;
    }

    trackVehicleSearch({
      searchTerm: `${loc.name} ${effectiveBookingType || ""}`.trim(),
      category,
      location: loc.name,
    });
    if (category && tripMode !== "boat") {
      trackCategoryClick(category);
    }

    setIsSearching(true);
    try {
      const searchUrl = await VehicleSearchService.buildSearchUrl(
        loc,
        effectiveBookingType,
        tripMode === "boat" ? undefined : category,
        fromDate,
        tripMode === "standard" ? untilDate : undefined,
        fromTime,
        tripMode === "standard" ? untilTime : undefined,
      );
      router.push(searchUrl);
    } catch (error) {
      setErrorMessage("Failed to search vehicles. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

const HERO_IMAGES = [
  "/images/landing/hero-friends.webp",
  "/images/landing/lady-in-car.webp",
  "/images/landing/hero-arrival.webp",
  "/images/landing/lagos-bridge.webp",
];

const HERO_ALTS = [
  "Friends enjoying a chauffeured ride in Lagos with Muvment by Autogirl",
  "Relaxed passenger in a chauffeured car with Muvment by Autogirl",
  "Arriving in style at a Lagos event with a Muvment chauffeur",
  "Car rental in Lagos near the Lekki-Ikoyi Link Bridge",
];

  return (
    <div className="relative w-full overflow-hidden mt-[5rem] md:mt-0 min-h-[calc(100svh-5rem)] lg:min-h-0 lg:h-screen">

       <BackgroundCarousel
        images={HERO_IMAGES}
        alts={HERO_ALTS}
        interval={6000}
        overlay="bg-gradient-to-r from-gray-900/70 via-gray-800/50 to-gray-900/30"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 py-6 pb-16 lg:px-12 lg:py-0 lg:pb-0 xl:px-20">
        {/* Header */}
        <div className="mb-4 max-w-2xl lg:mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 lg:mb-3 leading-tight">
            Rent a Car in Nigeria's Top Cities
          </h1>
          <p className="text-sm lg:text-lg text-gray-200">
            Book a car with a professional driver in just a few taps.
          </p>

          {/* Social proof */}
          <div className="mt-3 lg:mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/95 text-xs lg:text-sm">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#5AA2FF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                <span className="font-bold">70,000+</span> rides completed
              </span>
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
              <span>
                <span className="font-bold">4.6</span> rating on Google
              </span>
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#5AA2FF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13l2-5a2 2 0 011.9-1.4h10.2A2 2 0 0119 8l2 5m-18 0v4a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-4m-18 0h18"
                />
              </svg>
              <span>
                <span className="font-bold">1,000+</span> premium vehicles
              </span>
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-2.5 lg:px-6 lg:py-4">
            <div className="flex flex-col xl:flex-row xl:items-stretch divide-y xl:divide-y-0 xl:divide-x divide-gray-200">
              {/* Booking Type */}
              <div className="flex-1 min-w-0 xl:min-w-[110px] py-1.5 xl:py-0 xl:pr-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Booking Type
                </label>
                <div className="relative">
                  <Dropdown
                    options={displayBookingOptions}
                    selectedValue={bookingType}
                    onSelect={(value: any) => handleBookingTypeChange(value)}
                    placeholder="Select"
                    isOpen={openDropdown === "booking"}
                    onToggle={() => handleDropdownToggle("booking")}
                  />
                </div>
              </div>

              {/* Where / Destination */}
              <div className="flex-[2] min-w-0 xl:min-w-[170px] py-1.5 xl:py-0 xl:px-3 relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {tripMode === "standard" ? "Where" : "Destination"}
                </label>

                {tripMode === "standard" ? (
                  <>
                    <div className="flex items-center relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="City, airport, or full address"
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
                  </>
                ) : (
                  <div className="relative">
                    <Dropdown
                      options={destinationOptions}
                      selectedValue={destination}
                      onSelect={(value: any) => setDestination(value)}
                      placeholder="Select destination"
                      isOpen={openDropdown === "destination"}
                      onToggle={() => handleDropdownToggle("destination")}
                    />
                  </div>
                )}
              </div>

              {/* From Date & Time */}
              <div className="flex-shrink-0 w-full xl:w-auto py-1.5 xl:py-0 xl:px-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  From
                </label>
                <div className="flex items-center gap-2">
                  <Calendar
                    selectedDate={fromDate}
                    onDateSelect={(date: any) => handleDateSelect(date, "from")}
                    minDate={new Date()}
                  />
                  <TimePicker
                    selectedTime={fromTime}
                    onTimeSelect={setFromTime}
                  />
                </div>
              </div>

              {/* Until Date & Time (standard bookings only) */}
              {tripMode === "standard" && (
                <div className="flex-shrink-0 w-full xl:w-auto py-1.5 xl:py-0 xl:px-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Until
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar
                      selectedDate={untilDate}
                      onDateSelect={(date: any) =>
                        handleDateSelect(date, "until")
                      }
                      minDate={fromDate}
                    />
                    <TimePicker
                      selectedTime={untilTime}
                      onTimeSelect={setUntilTime}
                    />
                  </div>
                </div>
              )}

              {/* Category (hidden for boat trips) */}
              {tripMode !== "boat" && (
                <div className="flex-1 w-full xl:w-auto xl:min-w-[110px] py-1.5 xl:py-0 xl:px-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <Dropdown
                      options={categoryOptions}
                      selectedValue={category}
                      onSelect={(value: any) => setCategory(value)}
                      placeholder="Select"
                      isOpen={openDropdown === "category"}
                      onToggle={() => handleDropdownToggle("category")}
                    />
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex items-center justify-center py-3 xl:py-0 xl:pl-3">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full xl:w-auto bg-[#0673FF] hover:bg-[#0560d6] cursor-pointer text-white rounded-full p-3.5 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Search"
                  aria-label="Search cars"
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

          {/* Trust line */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/85">
            {[
              "Free cancellation window",
              "Verified professional drivers",
              "Fuel included on chauffeured trips",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0 text-[#5AA2FF]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t}
              </span>
            ))}
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

        {/* Location line */}
        <div className="absolute bottom-5 left-4 flex flex-wrap items-center gap-2 text-white/85 text-xs lg:bottom-8 lg:left-12 lg:text-sm xl:left-20">
          <FiMapPin className="w-4 h-4 text-[#5AA2FF]" />
          <span>
            {locationPermissionStatus === "pending"
              ? "Detecting your location..."
              : `Showing cars near ${userLocation}`}
          </span>
          {locationPermissionStatus === "denied" && (
            <button
              onClick={getLocationInformation}
              className="ml-1 underline underline-offset-2 text-white/70 hover:text-white transition-colors"
            >
              Use my location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}