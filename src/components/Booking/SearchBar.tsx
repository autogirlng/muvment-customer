import React, { useState, useRef } from "react";
import {
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Dropdown from "../utils/DropdownCustom";
import Calendar from "../utils/Calender";
import LocationDropdown from "../utils/LocationDropdown";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { bookingOptionsData } from "@/context/Constarain";

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isSearching?: boolean;
  variant?: "hero" | "navbar";
}

export interface SearchParams {
  bookingType: string;
  location: { name: string; lat: number | null; lng: number | null } | null;
  fromDate: Date;
  untilDate: Date;
  category: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isSearching = false,
  variant = "hero",
}) => {
  const [bookingType, setBookingType] = useState("12-hours");
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [category, setCategory] = useState("suv-electric");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [showAllFields, setShowAllFields] = useState(false);

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

  const handleSearch = () => {
    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      return;
    }

    onSearch({
      bookingType,
      location: selectedLocation,
      fromDate,
      untilDate,
      category,
    });
  };

  const isCompact = variant === "navbar";

  return (
    <div
      className={`flex flex-col gap-4 bg-white rounded-2xl ${
        isCompact ? "p-2" : "p-2 md:p-4"
      }`}
    >
      {/* Mobile: Show only location by default */}
      <div className="flex md:hidden flex-col gap-4">
        {/* Location - Always visible on mobile */}
        <div className="relative w-full">
          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <FiMapPin className="w-4 h-4 text-gray-500 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search location"
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                handleSearchInputChange(e.target.value);
              }}
              onFocus={handleSearchInputFocus}
            />
          </div>
          <LocationDropdown
            isOpen={showLocationDropdown}
            suggestions={locationSuggestions}
            isLoading={isLoadingPlaces}
            error={searchError}
            onLocationSelect={async (location) => {
              const selected = await handleLocationSelect(location);
              setSelectedLocation(selected);
              setSearchValue(selected.name);
            }}
            dropdownRef={locationDropdownRef}
          />
        </div>

        {/* Show all fields when expanded */}
        {showAllFields && (
          <>
            {/* Booking Type */}
            <div className="relative w-full">
              <Dropdown
                options={bookingOptionsData}
                selectedValue={bookingType}
                onSelect={setBookingType}
                placeholder="Select booking type"
                isOpen={openDropdown === "booking"}
                onToggle={() =>
                  setOpenDropdown(openDropdown === "booking" ? null : "booking")
                }
              />
            </div>

            {/* From Date */}
            <div className="relative w-full">
              <Calendar
                selectedDate={fromDate}
                onDateSelect={setFromDate}
                minDate={new Date()}
              />
            </div>

            {/* Until Date */}
            <div className="relative w-full">
              <Calendar
                selectedDate={untilDate}
                onDateSelect={setUntilDate}
                minDate={fromDate}
              />
            </div>

            {/* Category */}
            <div className="relative w-full">
              <Dropdown
                options={categoryOptions}
                selectedValue={category}
                onSelect={setCategory}
                placeholder="Category"
                isOpen={openDropdown === "category"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "category" ? null : "category"
                  )
                }
              />
            </div>
          </>
        )}

        {/* View All / View Less Button */}
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {showAllFields ? (
            <>
              <span>View Less</span>
              <FiChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View All Search Options</span>
              <FiChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiSearch className="w-5 h-5" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>

      {/* Desktop: Show all fields in a row */}
      <div className="hidden  gap-4 items-center">
        {/* Booking Type */}
        <div
          className={`relative flex-1 ${
            isCompact ? "md:min-w-24" : "md:min-w-32"
          }`}
        >
          <Dropdown
            options={bookingOptionsData}
            selectedValue={bookingType}
            onSelect={setBookingType}
            placeholder="Select booking type"
            isOpen={openDropdown === "booking"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "booking" ? null : "booking")
            }
          />
        </div>

        {!isCompact && <div className="w-px h-10 bg-gray-200" />}

        {/* Location */}
        <div
          className={`relative flex-1 ${
            isCompact ? "md:min-w-32" : "md:min-w-32"
          }`}
        >
          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <FiMapPin className="w-4 h-4 text-gray-500 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search location"
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                handleSearchInputChange(e.target.value);
              }}
              onFocus={handleSearchInputFocus}
            />
          </div>
          <LocationDropdown
            isOpen={showLocationDropdown}
            suggestions={locationSuggestions}
            isLoading={isLoadingPlaces}
            error={searchError}
            onLocationSelect={async (location) => {
              const selected = await handleLocationSelect(location);
              setSelectedLocation(selected);
              setSearchValue(selected.name);
            }}
            dropdownRef={locationDropdownRef}
          />
        </div>

        {!isCompact && <div className="w-px h-10 bg-gray-200" />}

        {/* From Date */}
        <div
          className={`relative flex-1 ${
            isCompact ? "md:min-w-24" : "md:min-w-32"
          }`}
        >
          <Calendar
            selectedDate={fromDate}
            onDateSelect={setFromDate}
            minDate={new Date()}
          />
        </div>

        {!isCompact && <div className="w-px h-10 bg-gray-200" />}

        {/* Until Date */}
        <div
          className={`relative flex-1 ${
            isCompact ? "md:min-w-24" : "md:min-w-32"
          }`}
        >
          <Calendar
            selectedDate={untilDate}
            onDateSelect={setUntilDate}
            minDate={fromDate}
          />
        </div>

        {!isCompact && <div className="w-px h-10 bg-gray-200" />}

        {/* Category */}
        <div
          className={`relative flex-1 ${
            isCompact ? "md:min-w-24" : "md:min-w-32"
          }`}
        >
          <Dropdown
            options={categoryOptions}
            selectedValue={category}
            onSelect={setCategory}
            placeholder="Category"
            isOpen={openDropdown === "category"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "category" ? null : "category")
            }
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className={`flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg disabled:opacity-50 ${
            isCompact ? "p-2" : "p-3"
          }`}
        >
          {isSearching ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiSearch className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
