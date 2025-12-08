"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "../utils/DropdownCustom";
import Calendar from "../utils/Calender";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { getBookingOption } from "@/context/Constarain";

export const NavbarSearchBar = () => {
  const router = useRouter();

  // Form state
  const [bookingType, setBookingType] = useState(undefined);
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [category, setCategory] = useState(undefined);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Location state
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryOptions, setcategoryOptions] = useState([]);
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

  // const bookingOptions = bookingOptionsData;
  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
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
  };

  const onLocationSelect = async (location: any) => {
    const selected = await handleLocationSelect(location);
    setSelectedLocation(selected);
    setSearchValue(selected.name);
  };

  const handleSearch = async () => {
    if (
      !searchValue.trim() ||
      !selectedLocation ||
      !selectedLocation.lat ||
      !selectedLocation.lng
    ) {
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
      window.location.href = searchUrl;
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-4">
      <div className="bg-white  px-6 py-2">
        <div className="flex items-center gap-0 divide-x divide-gray-200">
          {/* Booking Type */}
          <div className="flex-shrink-0 pr-3">
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
          <div className="flex-1 px-3 relative min-w-0">
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

          {/* Until Date */}
          <div className="flex-shrink-0 px-3">
            <div className="relative">
              <Calendar
                selectedDate={untilDate}
                onDateSelect={(date: any) => handleDateSelect(date, "until")}
                minDate={fromDate}
              />
            </div>
          </div>

          {/* Category */}
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
      </div>
    </div>
  );
};
