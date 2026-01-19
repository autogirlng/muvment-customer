"use client";

import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CalendarProps {
  bookings: Array<{
    createdAt: string;
    bookingStatus: string;
    vehicleName: string;
    price: number;
  }>;
  onDateClick: (date: Date, bookings: any[]) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  FAILED_AVAILABILITY: "bg-red-500",
  CANCELLED_BY_USER: "bg-gray-500",
  CANCELLED_BY_HOST: "bg-gray-400",
  CANCELLED_BY_ADMIN: "bg-gray-600",
  IN_PROGRESS: "bg-purple-500",
  COMPLETED: "bg-blue-500",
  NO_SHOW: "bg-orange-500",
};

const STATUS_BG_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  CONFIRMED: "bg-green-100 border-green-300 hover:bg-green-200",
  FAILED_AVAILABILITY: "bg-red-100 border-red-300 hover:bg-red-200",
  CANCELLED_BY_USER: "bg-gray-100 border-gray-300 hover:bg-gray-200",
  CANCELLED_BY_HOST: "bg-gray-100 border-gray-300 hover:bg-gray-200",
  CANCELLED_BY_ADMIN: "bg-gray-100 border-gray-300 hover:bg-gray-200",
  IN_PROGRESS: "bg-purple-100 border-purple-300 hover:bg-purple-200",
  COMPLETED: "bg-blue-100 border-blue-300 hover:bg-blue-200",
  NO_SHOW: "bg-orange-100 border-orange-300 hover:bg-orange-200",
};

export const CalendarView: React.FC<CalendarProps> = ({
  bookings,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const date = new Date(current);
      const dateBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === date.toDateString();
      });

      const dominantStatus =
        dateBookings.length > 0
          ? dateBookings.reduce((acc, booking) => {
            acc[booking.bookingStatus] =
              (acc[booking.bookingStatus] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
          : {};

      const mainStatus =
        Object.keys(dominantStatus).length > 0
          ? Object.keys(dominantStatus).reduce((a, b) =>
            dominantStatus[a] > dominantStatus[b] ? a : b
          )
          : null;

      days.push({
        date: new Date(date),
        bookings: dateBookings,
        statuses: [...new Set(dateBookings.map((b) => b.bookingStatus))],
        mainStatus,
        isCurrentMonth: date.getMonth() === month,
        bookingCount: dateBookings.length,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, bookings]);


  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const goToYearMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    setShowYearMonthPicker(false);
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status] || "bg-gray-400";

  const getStatusBgColor = (status: string | null) =>
    status
      ? STATUS_BG_COLORS[status] ||
      "bg-gray-50 border-gray-200 hover:bg-gray-100"
      : "bg-white";

  const getStatusTextColor = (status: string | null) => {
    if (!status) return "text-gray-400";
    const map: Record<string, string> = {
      PENDING_PAYMENT: "text-yellow-800",
      CONFIRMED: "text-green-800",
      FAILED_AVAILABILITY: "text-red-800",
      CANCELLED_BY_USER: "text-gray-800",
      CANCELLED_BY_HOST: "text-gray-800",
      CANCELLED_BY_ADMIN: "text-gray-800",
      IN_PROGRESS: "text-purple-800",
      COMPLETED: "text-blue-800",
      NO_SHOW: "text-orange-800",
    };
    return map[status] || "text-gray-800";
  };

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const getDayNames = () => ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition"
          >
            {formatMonthYear(currentDate)}
          </button>

          {showYearMonthPicker && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowYearMonthPicker(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goToYearMonth}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {getDayNames().map((day) => (
          <div
            key={day}
            className="text-start text-sm font-sm text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() =>
              day.bookingCount > 0 && onDateClick(day.date, day.bookings)
            }
            className={`
              min-h-[72px] sm:min-h-[100px] md:min-h-[120px] py-2 border border-[#d0d5dd] transition
              ${getStatusBgColor(day.mainStatus)}
              ${!day.isCurrentMonth ? "opacity-60" : ""}
              ${day.bookingCount > 0 ? "cursor-pointer" : "cursor-default"}
            `}
          >
            <div
              className={`text-sm text-end m-2 me-2 ${day.mainStatus ? getStatusTextColor(day.mainStatus) : ""
                }`}
            >
              {day.date.getDate()}
            </div>

            {day.bookingCount > 0 && (
              <div className="space-y-1">
                {day.statuses.slice(0, 3).map((status, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${getStatusColor(status)}`}
                    title={status.replace(/_/g, " ")}
                  />
                ))}
                {day.statuses.length > 3 && (
                  <div
                    className={`text-xs text-center ${getStatusTextColor(
                      day.mainStatus
                    )}`}
                  >
                    +{day.statuses.length - 3} more
                  </div>
                )}
                <div
                  className={`text-xs text-center font-medium ${getStatusTextColor(
                    day.mainStatus
                  )}`}
                >
                  {day.bookingCount} booking
                  {day.bookingCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        ))} */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() =>
              day.bookingCount > 0 && onDateClick(day.date, day.bookings)
            }
            className={`
      min-h-[72px] sm:min-h-[100px] md:min-h-[120px]
      p-1 sm:p-2
      border border-[#d0d5dd]
      transition
      active:scale-[0.98]
      ${getStatusBgColor(day.mainStatus)}
      ${!day.isCurrentMonth ? "opacity-60" : ""}
      ${day.bookingCount > 0 ? "cursor-pointer" : "cursor-default"}
    `}
          >
            {/* Date */}
            <div
              className={`text-xs sm:text-sm text-end mb-0.5 sm:mb-1 ${day.mainStatus ? getStatusTextColor(day.mainStatus) : ""
                }`}
            >
              {day.date.getDate()}
            </div>

            {day.bookingCount > 0 && (
              <div className="space-y-0.5 sm:space-y-1">
                {/* Status bars */}
                {day.statuses.slice(0, 3).map((status, i) => (
                  <div
                    key={i}
                    className={`
              h-1 sm:h-2
              rounded-full
              ${getStatusColor(status)}
              ${i > 0 ? "hidden sm:block" : ""}
            `}
                    title={status.replace(/_/g, " ")}
                  />
                ))}

                {/* + more (hidden on mobile) */}
                {day.statuses.length > 3 && (
                  <div
                    className={`hidden sm:block text-xs text-center ${getStatusTextColor(day.mainStatus)
                      }`}
                  >
                    +{day.statuses.length - 3} more
                  </div>
                )}

                {/* Booking count (hidden on mobile) */}
                <div
                  className={`hidden sm:block text-xs text-center font-medium ${getStatusTextColor(day.mainStatus)
                    }`}
                >
                  {day.bookingCount} booking
                  {day.bookingCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        ))}

      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-xs text-gray-600 capitalize">
                {status.toLowerCase().replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
