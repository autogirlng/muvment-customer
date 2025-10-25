"use client";

import { useState, useCallback } from "react";
import {
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiBook,
  FiCreditCard,
  FiChevronRight,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Calendar from "@/components/utils/Calender";
import { DropdownOption } from "@/types/HeroSectionTypes";
import Dropdown from "../utils/DropdownCustom";
import DataTable, { TableColumn } from "../utils/TableComponent";
import { FaMoneyBill } from "react-icons/fa";

interface BookingHistoryItem {
  id: number;
  date: string;
  car: string;
  location: string;
  amount: string;
  status: "Completed" | "Cancelled";
}

interface StatCardProps {
  title: string;
  value: string;
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
  const [fromDate, setFromDate] = useState<Date>(new Date(2025, 9, 17));
  const [untilDate, setUntilDate] = useState<Date>(new Date(2025, 9, 17));
  const [category, setCategory] = useState<string>("suv-electric");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");

  const bookingOptions: DropdownOption[] = [
    { value: "1-hour", label: "1 Hour" },
    { value: "3-hours", label: "3 Hours" },
    { value: "6-hours", label: "6 Hours" },
    { value: "12-hours", label: "12 Hours" },
    { value: "24-hours", label: "24 Hours" },
    { value: "airport", label: "Airport Transfers" },
  ];

  const categoryOptions: DropdownOption[] = [
    { value: "suv-electric", label: "SUV (Electric)" },
    { value: "sedan-electric", label: "Sedan (Electric)" },
    { value: "bus", label: "Bus" },
    { value: "track", label: "Track" },
  ];
  const [bookings] = useState<BookingHistoryItem[]>([
    {
      id: 1,
      date: "Oct 15, 2025",
      car: "Tesla Model S",
      location: "Downtown",
      amount: "$125",
      status: "Completed",
    },
    {
      id: 2,
      date: "Oct 12, 2025",
      car: "BMW i7",
      location: "Airport",
      amount: "$95",
      status: "Completed",
    },
    {
      id: 3,
      date: "Oct 10, 2025",
      car: "Audi e-tron",
      location: "Business District",
      amount: "$150",
      status: "Completed",
    },
    {
      id: 4,
      date: "Oct 8, 2025",
      car: "Mercedes EQS",
      location: "Airport",
      amount: "$110",
      status: "Cancelled",
    },
    {
      id: 5,
      date: "Oct 5, 2025",
      car: "Tesla Model 3",
      location: "City Center",
      amount: "$85",
      status: "Completed",
    },
    {
      id: 6,
      date: "Oct 1, 2025",
      car: "Nissan Leaf",
      location: "Mall Area",
      amount: "$75",
      status: "Completed",
    },
    {
      id: 7,
      date: "Sep 28, 2025",
      car: "Hyundai Ioniq",
      location: "Highway",
      amount: "$200",
      status: "Completed",
    },
    {
      id: 8,
      date: "Sep 25, 2025",
      car: "Tesla Model X",
      location: "Beach Road",
      amount: "$140",
      status: "Completed",
    },
  ]);

  const tableColumns: TableColumn<BookingHistoryItem>[] = [
    { key: "date", label: "Date" },
    { key: "car", label: "Car" },
    { key: "location", label: "Location" },
    { key: "amount", label: "Amount" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "Completed"
              ? "bg-green-100 text-green-600 border border-green-400"
              : "bg-red-100 text-red-600 border border-red-400"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const seeMoreActions = [
    { name: "Edit", icon: FiEdit, handleAction: () => handleEdit() },
    { name: "Delete", icon: FiTrash2, handleAction: () => handleDelete() },
  ];

  const handleEdit = () => {};

  const handleDelete = () => {};
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Wallet Balance"
            value="2,450.00"
            icon={<FaMoneyBill className="w-8 h-8 text-blue-600" />}
            borderColor="border-blue-500"
            bgColor="bg-blue-100"
            onViewMore={() => handleViewMore("/wallet")}
          />
          <StatCard
            title="Total Bookings"
            value="24"
            icon={<FiBook className="w-8 h-8 text-green-600" />}
            borderColor="border-green-500"
            bgColor="bg-green-100"
            onViewMore={() => handleViewMore("/bookings")}
          />
          <StatCard
            title="Transactions"
            value="18"
            icon={<FiCreditCard className="w-8 h-8 text-purple-600" />}
            borderColor="border-purple-500"
            bgColor="bg-purple-100"
            onViewMore={() => handleViewMore("/transactions")}
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

              <div className="flex-1">
                <div className="flex items-center px-3 md:px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <FiMapPin className="w-4 h-4 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search location"
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    className="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <button
                  onClick={() => handleDropdownToggle("from")}
                  className="w-full px-3 md:px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-sm text-gray-700 font-medium"
                >
                  <span>{formatDateForDisplay(fromDate)}</span>
                  <FiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </button>
                <Calendar
                  selectedDate={fromDate}
                  onDateSelect={(date: Date) => handleDateSelect(date, "from")}
                  minDate={new Date()}
                  isOpen={openDropdown === "from"}
                  onClose={() => setOpenDropdown(null)}
                  className="left-0"
                />
              </div>

              <div className="relative flex-1">
                <button
                  onClick={() => handleDropdownToggle("until")}
                  className="w-full px-3 md:px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-sm text-gray-700 font-medium"
                >
                  <span>{formatDateForDisplay(untilDate)}</span>
                  <FiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </button>
                <Calendar
                  selectedDate={untilDate}
                  onDateSelect={(date: Date) => handleDateSelect(date, "until")}
                  minDate={fromDate}
                  isOpen={openDropdown === "until"}
                  onClose={() => setOpenDropdown(null)}
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
            <button className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition-colors shadow-md flex items-center justify-center gap-2 font-medium">
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
            </button>
          </div>
        </div>

        {/* Booking Log */}
        <DataTable
          title="Booking History"
          columns={tableColumns}
          data={bookings}
          seeMoreData={seeMoreActions}
          height="max-h-[400px]"
          pageSize={4}
        />
      </div>
    </div>
  );
}
