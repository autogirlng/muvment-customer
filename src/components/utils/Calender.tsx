"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCalendar } from "react-icons/fi";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  customTrigger?: React.ReactNode;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  className = "",
  customTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Default trigger for the calendar
  const defaultTrigger = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center gap-2 focus:outline-none group w-full"
    >
      <span className="text-sm font-medium text-gray-900">
        {formatDateForDisplay(selectedDate)}
      </span>
      <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </button>
  );

  // Calendar logic for generating days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month's days
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    const prevMonthDays = getDaysInMonth(prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevMonth);
      date.setDate(prevMonthDays - i);
      days.push({ date, isCurrentMonth: false, isDisabled: true });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth);
      date.setDate(i);
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: isDateDisabled(date),
      });
    }

    // Next month's days to fill the grid
    const totalCells = 42; // 6 weeks
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      const date = new Date(currentMonth);
      date.setMonth(currentMonth.getMonth() + 1);
      date.setDate(nextMonthDay);
      days.push({ date, isCurrentMonth: false, isDisabled: true });
      nextMonthDay++;
    }

    return days;
  };

  const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (!isDisabled) {
      onDateSelect(date);
      setIsOpen(false);
    }
  };

  const monthNames = [
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
    <div ref={calendarRef} className={`relative ${className}`}>
      {/* Calendar Trigger */}
      {customTrigger || defaultTrigger}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          className="
          absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
          z-50 animate-fadeIn p-4 min-w-64
        "
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map(
              ({ date, isCurrentMonth, isDisabled }, index) => {
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date, isDisabled)}
                    disabled={isDisabled}
                    className={`
                    w-8 h-8 text-xs rounded transition-colors
                    ${isSelected ? "bg-blue-600 text-white" : ""}
                    ${
                      !isSelected && isCurrentMonth && !isDisabled
                        ? "hover:bg-gray-100 text-gray-900"
                        : ""
                    }
                    ${
                      !isCurrentMonth || isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  `}
                  >
                    {date.getDate()}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
