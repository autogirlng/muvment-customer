"use client";

import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  customerStatusKey,
  customerCalendarStyle,
  CUSTOMER_CALENDAR_STYLES,
  CUSTOMER_CALENDAR_LEGEND,
} from "@/utils/bookingStatus";

interface CalendarProps {
  bookings: any[];
  onDateClick: (date: Date, bookings: any[]) => void;
}

const tripDate = (b: any): string => b?.startDateTime || b?.createdAt || "";

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
      const dayTrips = bookings.filter((b) => {
        const d = tripDate(b);
        if (!d) return false;
        return new Date(d).toDateString() === date.toDateString();
      });

      const counts = dayTrips.reduce(
        (acc, b) => {
          const key = customerStatusKey(b.bookingStatus);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const mainKey =
        Object.keys(counts).length > 0
          ? Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))
          : null;

      days.push({
        date: new Date(date),
        trips: dayTrips,
        statusKeys: [
          ...new Set(dayTrips.map((b) => customerStatusKey(b.bookingStatus))),
        ],
        mainKey,
        isCurrentMonth: date.getMonth() === month,
        tripCount: dayTrips.length,
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

  const cellClasses = (key: string | null) =>
    key ? customerCalendarStyle(key).cell : "bg-white border-[#d0d5dd]";

  const textClasses = (key: string | null) =>
    key ? customerCalendarStyle(key).text : "text-gray-400";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Previous month"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
            className="text-xl font-semibold text-gray-900 transition hover:text-[#0673ff]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0673ff]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0673ff]"
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
                    className="flex-1 px-3 py-2 bg-[#0673ff] text-white rounded-md hover:opacity-90 transition"
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
          aria-label="Next month"
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
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() =>
              day.tripCount > 0 && onDateClick(day.date, day.trips)
            }
            className={`
              min-h-[72px] sm:min-h-[100px] md:min-h-[120px]
              p-1 sm:p-2
              border
              transition
              active:scale-[0.98]
              ${cellClasses(day.mainKey)}
              ${!day.isCurrentMonth ? "opacity-60" : ""}
              ${day.tripCount > 0 ? "cursor-pointer" : "cursor-default"}
            `}
          >
            {/* Date */}
            <div
              className={`text-xs sm:text-sm text-end mb-0.5 sm:mb-1 ${
                day.mainKey ? textClasses(day.mainKey) : ""
              }`}
            >
              {day.date.getDate()}
            </div>

            {day.tripCount > 0 && (
              <div className="space-y-0.5 sm:space-y-1">
                {/* Status bars */}
                {day.statusKeys.slice(0, 3).map((key, i) => (
                  <div
                    key={i}
                    className={`
                      h-1 sm:h-2
                      rounded-full
                      ${customerCalendarStyle(key).dot}
                      ${i > 0 ? "hidden sm:block" : ""}
                    `}
                    title={customerCalendarStyle(key).label}
                  />
                ))}

                {/* + more (hidden on mobile) */}
                {day.statusKeys.length > 3 && (
                  <div
                    className={`hidden sm:block text-xs text-center ${textClasses(
                      day.mainKey,
                    )}`}
                  >
                    +{day.statusKeys.length - 3} more
                  </div>
                )}

                {/* Trip count (hidden on mobile) */}
                <div
                  className={`hidden sm:block text-xs text-center font-medium ${textClasses(
                    day.mainKey,
                  )}`}
                >
                  {day.tripCount} trip
                  {day.tripCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status legend</h3>
        <div className="flex flex-wrap gap-3">
          {CUSTOMER_CALENDAR_LEGEND.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${CUSTOMER_CALENDAR_STYLES[key].dot}`}
              />
              <span className="text-xs text-gray-600">
                {CUSTOMER_CALENDAR_STYLES[key].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
