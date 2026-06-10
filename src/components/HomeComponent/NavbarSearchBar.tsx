"use client";
import {
  useState,
  useRef,
  useEffect,
  Suspense,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCar, FaCarSide, FaBus, FaShuttleVan } from "react-icons/fa";
import Dropdown from "../utils/DropdownCustom";
import Calendar from "../utils/Calender";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { getBookingOption } from "@/context/Constarain";
import { trackCategoryClick, trackVehicleSearch } from "@/services/analytics";

const formatCategoryLabel = (name: string) =>
  name
    .replace(/_/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bSuv\b/g, "SUV")
    .replace(/\bVip\b/g, "VIP");

const categoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("bus")) return <FaBus />;
  if (n.includes("van") || n.includes("shuttle")) return <FaShuttleVan />;
  if (n.includes("suv")) return <FaCarSide />;
  return <FaCar />;
};

const DEFAULT_LOCATION = { name: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 };
const COTONOU = { name: "Cotonou", lat: 6.3703, lng: 2.3912 };

const STANDARD_BOOKING_NAMES = [
  "12 hours",
  "24 hours",
  "airport pickup",
  "monthly booking",
];
const INTERSTATE_KEYWORDS = [
  "cotonou",
  "benin republic",
  "accra",
  "ghana",
  "lome",
  "togo",
];
const BOAT_VALUE = "__boat_trip__";
const INTERSTATE_VALUE = "__interstate_trip__";

type TripGroup = "standard" | "interstate" | "boat";

const classifyBookingType = (label?: string): TripGroup => {
  const n = (label || "").trim().toLowerCase();
  if (INTERSTATE_KEYWORDS.some((k) => n.includes(k))) return "interstate";
  if (STANDARD_BOOKING_NAMES.includes(n)) return "standard";
  return "boat";
};
const cleanLabel = (label?: string) => (label || "").trim();

const NavbarSearchBarContent = () => {
  const router = useRouter();
  const params = useSearchParams();

  // Form state
  const [bookingType, setBookingType] = useState<string>();
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [category, setCategory] = useState<string>();
  const [destination, setDestination] = useState<string | undefined>(undefined);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
  const [categoryOptions, setcategoryOptions] = useState<
    { value: any; label: string; icon?: ReactNode }[]
  >([]);
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (!params.get("bookingType") && opts.length > 0) {
      const standard = opts.filter(
        (o: any) => classifyBookingType(o.label) === "standard",
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

  useEffect(() => {
    getBookingOptions();
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
      if (date > untilDate) setUntilDate(date);
    } else {
      setUntilDate(date);
    }
  };

  const getvechileType = async () => {
    const result = await VehicleSearchService.getVechielType();
    const transformedOptions = (result || []).map((item: any) => ({
      value: item.id,
      label: formatCategoryLabel(item.name),
      icon: categoryIcon(item.name),
    }));
    setcategoryOptions(transformedOptions);
  };

  useEffect(() => {
    getvechileType();

    const locationParam = params.get("location") ?? "";
    const lngParam = params.get("lng");
    const latParam = params.get("lat");
    const lng =
      lngParam !== null && !isNaN(Number(lngParam)) ? Number(lngParam) : null;
    const lat =
      latParam !== null && !isNaN(Number(latParam)) ? Number(latParam) : null;
    const bookingTypeParam = params.get("bookingType");
    const fromDateParam =
      params.get("startDate") ?? params.get("fromDate") ?? "";
    const untilDateParam =
      params.get("endDate") ?? params.get("untilDate") ?? "";
    const vehicleTypeIdParam = params.get("vehicleTypeId") ?? "";

    if (bookingTypeParam) setBookingType(bookingTypeParam);
    if (fromDateParam) setFromDate(new Date(fromDateParam));
    if (untilDateParam) setUntilDate(new Date(untilDateParam));
    if (vehicleTypeIdParam) setCategory(vehicleTypeIdParam);
    if (locationParam) {
      setSearchValue(locationParam);
      setSelectedLocation({ name: locationParam, lng, lat });
    }
  }, [params]);

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
  const boatDestinations = bookingOptions
    .filter((o: any) => classifyBookingType(o.label) === "boat")
    .map((o: any) => ({ ...o, label: cleanLabel(o.label) }));
  const interstateDestinations = bookingOptions
    .filter((o: any) => classifyBookingType(o.label) === "interstate")
    .map((o: any) => ({ ...o, label: cleanLabel(o.label) }));
  const standardBookingOptions = bookingOptions
    .filter((o: any) => classifyBookingType(o.label) === "standard")
    .map((o: any) => ({ ...o, label: cleanLabel(o.label) }));
  const displayBookingOptions = [
    ...standardBookingOptions,
    ...(interstateDestinations.length
      ? [{ value: INTERSTATE_VALUE, label: "Interstate Trip" }]
      : []),
    ...(boatDestinations.length
      ? [{ value: BOAT_VALUE, label: "Boat Trip" }]
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
    if (value === BOAT_VALUE) setDestination(boatDestinations[0]?.value);
    else if (value === INTERSTATE_VALUE)
      setDestination(interstateDestinations[0]?.value);
    else setDestination(undefined);
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
    if (category && tripMode !== "boat") trackCategoryClick(category);

    setIsSearching(true);
    try {
      const searchUrl = await VehicleSearchService.buildSearchUrl(
        loc,
        effectiveBookingType,
        tripMode === "boat" ? undefined : category,
        fromDate,
        tripMode === "standard" ? untilDate : undefined,
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:navstart"));
      }
      router.push(searchUrl);
    } catch (error) {
      setErrorMessage("Failed to search vehicles. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-4">
      <div className="px-6 py-2">
        <div className="flex items-center gap-0 divide-x divide-gray-200">
          {/* Booking Type */}
          <div className="flex-shrink-0 pr-3">
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
          <div className="flex-1 px-3 relative min-w-0">
            {tripMode === "standard" ? (
              <>
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
                <div className="absolute top-full left-0 w-full z-50 mt-2">
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

          {/* From Date */}
          <div className="flex-shrink-0 px-3">
            <div className="relative">
              <Calendar
                selectedDate={fromDate}
                onDateSelect={(date: any) => handleDateSelect(date, "from")}
                minDate={new Date()}
              />
            </div>
          </div>

          {/* Until Date (standard bookings only) */}
          {tripMode === "standard" && (
            <div className="flex-shrink-0 px-3">
              <div className="relative">
                <Calendar
                  selectedDate={untilDate}
                  onDateSelect={(date: any) => handleDateSelect(date, "until")}
                  minDate={fromDate}
                />
              </div>
            </div>
          )}

          {/* Category (hidden for boat trips) */}
          {tripMode !== "boat" && (
            <div className="flex-shrink-0 px-3">
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
          )}

          {/* Search Button */}
          <div className="flex-shrink-0 pl-3">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Search"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
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

        {errorMessage && (
          <div className="mt-1 text-xs text-red-600">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export const NavbarSearchBar = () => (
  <Suspense fallback={null}>
    <NavbarSearchBarContent />
  </Suspense>
);
