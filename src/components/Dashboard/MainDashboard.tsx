"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FiMapPin,
  FiBook,
  FiCreditCard,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationDropdown from "../utils/LocationDropdown";
import { bookingOptionsData } from "@/context/Constarain";
import BookingHistoryComponent from "../Booking/BookingHistoryComponent";
import { BookingService } from "@/controllers/booking/bookingService";
import { useRouter } from "next/navigation";
import DashboardDropdown from "../utils/DasboardDropdown";
import DashboardCalendar from "../utils/DashboardCalender";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  onViewDetails: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-lg border border-blue-300 shadow-[-8px_0_20px_-10px_#0673FF] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${iconBgColor} p-3 rounded-lg`}>{icon}</div>
      </div>
      <button
        onClick={onViewDetails}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
      >
        View Details
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

  // Get current user name - you can replace this with actual user data
  const userName = "Liam Michael";
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl relative">
        <div className="max-w-8xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Good Morning, {userName}
              </h1>
              <p className="text-blue-100 text-sm">Book your next rental car</p>
              <p className="text-blue-100 text-xs mt-1">{currentDate}</p>
            </div>
            {/* <div className="hidden md:block absolute right-0">
              <Image src="/images/b.png" alt="Logo" width={200} height={700} />
            </div> */}
          </div>
        </div>
      </div>

      <div className=" mx-auto  py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Bookings"
            value={statictis.bookings}
            icon={<FiBook className="w-6 h-6 text-blue-600" />}
            iconBgColor="bg-blue-100"
            onViewDetails={() => handleViewMore("/dashboard/my-booking")}
          />
          <StatCard
            title="Payments"
            value={statictis.payments}
            icon={<FiCreditCard className="w-6 h-6 text-blue-600" />}
            iconBgColor="bg-blue-100"
            onViewDetails={() => handleViewMore("/dashboard/payment")}
          />
          {/* <StatCard
            title="Pending Actions"
            value={statictis.bookings}
            icon={<FiCalendar className="w-6 h-6 text-blue-600" />}
            iconBgColor="bg-blue-100"
            onViewDetails={() => handleViewMore("/dashboard/pending")}
          /> */}
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Book a car
          </h2>
          <div className="space-y-4">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-2">
                  Booking Type
                </label>
                <div className="flex items-center px-3 md:px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <FiMapPin className="w-4 h-4 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Enter location"
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

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Pickup Date
                </label>
                <div className="relative">
                  <DashboardCalendar
                    selectedDate={fromDate}
                    onDateSelect={(date: Date) =>
                      handleDateSelect(date, "from")
                    }
                    minDate={new Date()}
                    className="left-0"
                  />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Category
                </label>
                <DashboardDropdown
                  options={categoryOptions}
                  selectedValue={category}
                  onSelect={setCategory}
                  placeholder="Choose category"
                  isOpen={openDropdown === "category"}
                  onToggle={() => handleDropdownToggle("category")}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Returned Date
                </label>
                <div className="relative">
                  <DashboardCalendar
                    selectedDate={untilDate}
                    onDateSelect={(date: Date) =>
                      handleDateSelect(date, "until")
                    }
                    minDate={fromDate}
                    className="left-0"
                  />
                </div>
              </div>
            </div>

            {/* Search Button - Centered */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-12 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
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
