"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FiMapPin, FiBook, FiCreditCard, FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Calendar from "@/components/utils/Calender";
import Dropdown from "../utils/DropdownCustom";

import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { bookingOptionsData } from "@/context/Constarain";
import BookingHistoryComponent from "../Booking/BookingHistoryComponent";
import { BookingService } from "@/controllers/booking/bookingService";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  onViewMore: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  borderColor,
  bgColor,
  onViewMore,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>{icon}</div>
      </div>
      <button
        onClick={onViewMore}
        className="mt-4 w-full flex items-center justify-between text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
      >
        <span>View More</span>
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function Dashboard(): React.ReactElement {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<string>("12-hours");
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [untilDate, setUntilDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>("suv-electric");
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
  const [statictis, setStatictis] = useState<{
    bookings: number;
    payments: number;
  }>({
    bookings: 0,
    payments: 0,
  });
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

  const bookingOptions = bookingOptionsData;

  // Get vehicle types
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

  // Handle clicks outside location dropdown
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

  const handleDateSelect = (date: Date, type: "from" | "until"): void => {
    if (type === "from") {
      setFromDate(date);
      if (date > untilDate) {
        setUntilDate(date);
      }
    } else {
      setUntilDate(date);
    }
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (dropdownId: string): void => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleViewMore = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

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

  const handleDashboardLoad = async () => {
    try {
      const response = await BookingService.getDashboardCounts();
      setStatictis({
        bookings: response.bookings,
        payments: response.payments,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    handleDashboardLoad();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* <StatCard
            title="Wallet Balance"
            value="2,450.00"
            icon={<FaMoneyBill className="w-8 h-8 text-blue-600" />}
            borderColor="border-blue-500"
            bgColor="bg-blue-100"
            onViewMore={() => handleViewMore("/wallet")}
          /> */}
          <StatCard
            title="Total Bookings"
            value={statictis.bookings}
            icon={<FiBook className="w-8 h-8 text-green-600" />}
            borderColor="border-green-500"
            bgColor="bg-green-100"
            onViewMore={() => handleViewMore("/dashboard/my-booking")}
          />
          <StatCard
            title="Payment"
            value={statictis.payments}
            icon={<FiCreditCard className="w-8 h-8 text-purple-600" />}
            borderColor="border-purple-500"
            bgColor="bg-purple-100"
            onViewMore={() => handleViewMore("/dashboard/payment")}
          />
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Book a Car
          </h2>
          <div className="flex flex-col gap-3 md:gap-4">
            {/* First Row */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <Dropdown
                  options={bookingOptions}
                  selectedValue={bookingType}
                  onSelect={setBookingType}
                  placeholder="Select booking type"
                  isOpen={openDropdown === "booking"}
                  onToggle={() => handleDropdownToggle("booking")}
                />
              </div>

              <div className="flex-1 relative">
                <div className="flex items-center px-3 md:px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <FiMapPin className="w-4 h-4 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by city, airport, address"
                    value={searchValue}
                    onChange={handleSearchInputChangeEvent}
                    onFocus={handleSearchInputFocus}
                    className="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder-gray-500"
                  />
                </div>

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

            {/* Second Row */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Calendar
                  selectedDate={fromDate}
                  onDateSelect={(date: Date) => handleDateSelect(date, "from")}
                  minDate={new Date()}
                  className="left-0"
                />
              </div>

              <div className="relative flex-1">
                <Calendar
                  selectedDate={untilDate}
                  onDateSelect={(date: Date) => handleDateSelect(date, "until")}
                  minDate={fromDate}
                  className="left-0"
                />
              </div>

              <div className="flex-1">
                <Dropdown
                  options={categoryOptions}
                  selectedValue={category}
                  onSelect={setCategory}
                  placeholder="Select category"
                  isOpen={openDropdown === "category"}
                  onToggle={() => handleDropdownToggle("category")}
                />
              </div>
            </div>

            {/* Search Button - Full width on mobile */}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition-colors shadow-md flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden md:inline">Searching...</span>
                </>
              ) : (
                <>
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
                  <span className="hidden md:inline">Search</span>
                </>
              )}
            </button>
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
                <span className="font-medium text-sm">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Log */}
        <BookingHistoryComponent showHeader={false} limit={4} />
      </div>
    </div>
  );
}
