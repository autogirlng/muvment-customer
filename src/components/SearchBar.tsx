"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

type Value = Date | null;

const BookingSearchBar: React.FC = () => {
  const router = useRouter();

  const [bookingType, setBookingType] = useState("TWELVE_HOURS");
  const [type, setType] = useState("SUVElectric");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<Value>(new Date());
  const [untilDate, setUntilDate] = useState<Value>(new Date());
  const [openPicker, setOpenPicker] = useState<"from" | "until" | null>(null);

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

  const locationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      )
        setShowLocationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowLocationDropdown]);

  const filteredCategories = useMemo(() => {
    const hourlyOnly = ["AN_HOUR", "THREE_HOURS", "SIX_HOURS"];
    return hourlyOnly.includes(bookingType)
      ? ["SUVElectric", "SedanElectric"]
      : vehicleTypeArray;
  }, [bookingType]);

  // Ensure valid date range
  useEffect(() => {
    if (fromDate && untilDate && untilDate < fromDate) setUntilDate(fromDate);
  }, [fromDate, untilDate]);

  // Ensure category consistency
  useEffect(() => {
    if (!filteredCategories.includes(type)) setType(filteredCategories[0]);
  }, [filteredCategories, type]);

  const formatDate = (date: Value) =>
    date
      ? date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "Select Date";

  const handleSearch = () => {
    const toIsoDate = (date: Value) =>
      date ? date.toISOString().split("T")[0] : "";

    const params = new URLSearchParams({
      bookingType,
      type,
      location,
      latitude: latitude?.toString() || "",
      longitude: longitude?.toString() || "",
      fromDate: toIsoDate(fromDate),
      untilDate: toIsoDate(untilDate),
    });

    router.push(`/explore/results?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-2xl lg:rounded-[25px] flex flex-col lg:flex-row items-center p-2">
      <div className="flex flex-col lg:flex-row flex-1 items-center divide-y lg:divide-x divide-gray-200 lg:divide-y-0">
        {/* Booking Type */}
        <CustomDropdown
          label="Booking Type"
          options={bookingTypeOptions}
          value={bookingType}
          onChange={setBookingType}
          className="lg:w-[175px]"
        />

        {/* Location */}
        <div ref={locationRef} className="relative w-full p-4 lg:px-5">
          <label className="block text-xs font-medium text-[#98A2B3]">
            Where
          </label>
          <input
            type="text"
            value={location}
            onFocus={handleSearchInputFocus}
            onChange={(e) => {
              setLocation(e.target.value);
              setLatitude(null);
              setLongitude(null);
              handleSearchInputChange(e.target.value);
            }}
            placeholder="Search by city, airport, address"
            className="w-full bg-transparent border-none focus:ring-0 mt-1 font-semibold text-[#98A2B3] text-xs outline-none"
            autoComplete="off"
          />
          <LocationDropdown
            isOpen={showLocationDropdown}
            suggestions={locationSuggestions}
            isLoading={isLoadingPlaces}
            error={searchError}
            onLocationSelect={async (place) => {
              const selected = await handleLocationSelect(place);
              if (selected) {
                setLocation(selected.name);
                setLatitude(selected.lat);
                setLongitude(selected.lng);
              }
            }}
            dropdownRef={locationRef}
          />
        </div>

        {/* Date Pickers */}
        {["from", "until"].map((key) => (
          <div key={key} className="w-full p-4 lg:w-[160px]">
            <label className="block text-xs font-medium text-[#98A2B3] capitalize">
              {key}
            </label>
            <DatePicker
              value={key === "from" ? fromDate : untilDate}
              onChange={(val) =>
                key === "from"
                  ? setFromDate(val as Value)
                  : setUntilDate(val as Value)
              }
              isOpen={openPicker === key}
              handleIsOpen={(open) =>
                setOpenPicker(open ? (key as "from" | "until") : null)
              }
              minDate={key === "until" ? fromDate : undefined}
              disabled={key === "until" && !fromDate}
            >
              <div className="flex items-center justify-between mt-1 cursor-pointer">
                <span>{formatDate(key === "from" ? fromDate : untilDate)}</span>
                <ChevronDown size={20} />
              </div>
            </DatePicker>
          </div>
        ))}

        {/* Category */}
        <CustomDropdown
          label="Category"
          options={filteredCategories}
          value={type}
          onChange={setType}
          className="lg:w-[130px]"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 flex items-center justify-center w-full lg:w-auto mt-4 lg:mt-0 lg:ml-2 transition-colors"
      >
        <Search size={24} className="lg:hidden mr-2" />
        <span className="lg:hidden font-semibold">Search</span>
        <Search size={24} className="hidden lg:block" />
      </button>
    </div>
  );
};

export default BookingSearchBar;
