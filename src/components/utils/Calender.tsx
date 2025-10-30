"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from "date-fns";
import { FiChevronLeft, FiChevronRight, FiX, FiCalendar } from "react-icons/fi";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const today = startOfDay(new Date());

  // Detect available space above/below the trigger
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 320px roughly equals the height of the calendar
    if (spaceBelow < 320 && spaceAbove > spaceBelow) {
      setPosition("top");
    } else {
      setPosition("bottom");
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const previousMonthDays = Array.from(
    { length: startDay === 0 ? 6 : startDay - 1 },
    (_, i) => {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (startDay === 0 ? 6 : startDay - 1) + i);
      return date;
    }
  );

  const endDay = monthEnd.getDay();
  const nextMonthDays = Array.from(
    { length: endDay === 0 ? 0 : 7 - endDay },
    (_, i) => {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i + 1);
      return date;
    }
  );

  const allDays = [...previousMonthDays, ...days, ...nextMonthDays];

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isBefore(startOfDay(maxDate), date)) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(date);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={`relative ${className}`}>
      {/* Calendar Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select date"}
        </span>
        <FiCalendar className="w-5 h-5 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute z-50 w-[280px] md:w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h3>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 px-4 pt-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {allDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const disabled = isDateDisabled(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={`h-10 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      !isCurrentMonth
                        ? "text-gray-400"
                        : "text-gray-900 hover:bg-gray-100"
                    }
                    ${
                      isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ""
                    }
                    ${
                      isTodayDate && !isSelected
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : ""
                    }
                    ${
                      disabled
                        ? "opacity-30 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
