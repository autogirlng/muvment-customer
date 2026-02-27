"use client";
import { useState, useRef, useEffect } from "react";
import { FiClock } from "react-icons/fi";

interface TimePickerProps {
  selectedTime: string; // Format: "HH:MM" (24-hour)
  onTimeSelect: (time: string) => void;
  label?: string;
  minTime?: string;
}

export default function TimePicker({
  selectedTime,
  onTimeSelect,
  label = "Time",
  minTime,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [initialized, setInitialized] = useState(false);

  // Initialize time only once on mount
  useEffect(() => {
    if (!initialized) {
      if (selectedTime) {
        const [h, m] = selectedTime.split(":");
        setHours(h || "00");
        setMinutes(m || "00");
      } else {
        // Set to current time + 1 minute as default
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        setHours(now.getHours().toString().padStart(2, "0"));
        setMinutes(now.getMinutes().toString().padStart(2, "0"));
        onTimeSelect(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
      }
      setInitialized(true);
    }
  }, [initialized, selectedTime]);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen && hoursRef.current && minutesRef.current) {
      setTimeout(() => {
        const hourElement = hoursRef.current?.querySelector(
          `[data-value="${hours}"]`
        );
        const minuteElement = minutesRef.current?.querySelector(
          `[data-value="${minutes}"]`
        );

        if (hourElement) {
          hourElement.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        if (minuteElement) {
          minuteElement.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 50);
    }
  }, [isOpen]);

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

  const handleTimeSelect = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    onTimeSelect(`${newHours}:${newMinutes}`);
  };

  const formatDisplayTime = () => {
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const value = i.toString().padStart(2, "0");
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const period = i >= 12 ? "PM" : "AM";
    return { value, label: `${hour} ${period}` };
  });

  // Generate minute options (0-59, every minute)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const value = i.toString().padStart(2, "0");
    return { value, label: value };
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <FiClock className="w-4 h-4 text-gray-500" />
        <span className="font-medium">{formatDisplayTime()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="flex">
            {/* Hours Column */}
            <div
              ref={hoursRef}
              className="w-28 h-64 overflow-y-auto border-r border-gray-200"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#CBD5E1 transparent",
              }}
            >
              {hourOptions.map((option) => {
                const isSelected = hours === option.value;
                
                return (
                  <button
                    key={option.value}
                    data-value={option.value}
                    onClick={() => handleTimeSelect(option.value, minutes)}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div
              ref={minutesRef}
              className="w-20 h-64 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#CBD5E1 transparent",
              }}
            >
              {minuteOptions.map((option) => {
                const isSelected = minutes === option.value;
                
                return (
                  <button
                    key={option.value}
                    data-value={option.value}
                    onClick={() => handleTimeSelect(hours, option.value)}
                    className={`w-full px-4 py-2.5 text-sm text-center transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}