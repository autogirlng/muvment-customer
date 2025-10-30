import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  startHour?: number;
  endHour?: number;
  interval?: number;
}

interface TimeSlot {
  value: string;
  display: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  className = "",
  startHour = 6,
  endHour = 24,
  interval = 30,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate time slots based on props
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = formatTime(timeString);
        slots.push({ value: timeString, display: displayTime });
      }
    }
    return slots;
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  };

  const timeSlots = generateTimeSlots();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTime = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      >
        <span className="text-gray-900 font-medium">
          {value ? formatTime(value) : "6:00AM"}
        </span>
        <FiChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => handleSelectTime(slot.value)}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm ${
                value === slot.value
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {slot.display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
