import { useState, useRef, useEffect } from "react";
import Icons from "./icons";

type Props = {
  name: string;
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
  width?: string;
  showArrow?: boolean;
  timeType?: "start" | "end" | "all";
  disabled?: boolean; // Add disabled prop
};

// Generate time options based on type
const generateTimeOptions = (timeType: "start" | "end" | "all" = "all") => {
  const times = [];

  // For start time: 6:00 AM to 11:30 PM
  // For end time: 12:00 AM to 5:30 AM
  // For all: full range

  if (timeType === "start") {
    // Start from 6:00 AM
    for (let hour = 6; hour < 24; hour++) {
      // On the hour
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      let displayHour = hour;
      const ampm = hour >= 12 ? "PM" : "AM";

      if (displayHour > 12) {
        displayHour = displayHour - 12;
      }

      const label = `${displayHour.toString().padStart(2, "0")}:00${ampm}`;
      times.push({ label, value: timeString });

      // 30 minutes past the hour
      const timeString30 = `${hour.toString().padStart(2, "0")}:30`;
      const label30 = `${displayHour.toString().padStart(2, "0")}:30${ampm}`;
      times.push({ label: label30, value: timeString30 });
    }
  } else if (timeType === "end") {
    // From 6:30 AM to 5:30 AM (next day) - full range

    // Start from 6:30 AM
    for (let hour = 6; hour < 24; hour++) {
      // 30 minutes past the hour first
      const timeString30 = `${hour.toString().padStart(2, "0")}:30`;
      let displayHour = hour;
      const ampm = hour >= 12 ? "PM" : "AM";

      if (displayHour > 12) {
        displayHour = displayHour - 12;
      }

      const label30 = `${displayHour.toString().padStart(2, "0")}:30${ampm}`;
      times.push({ label: label30, value: timeString30 });

      // Then on the hour (except for the last iteration to avoid 24:00)
      if (hour < 23) {
        const nextHour = hour + 1;
        const timeString = `${nextHour.toString().padStart(2, "0")}:00`;
        let nextDisplayHour = nextHour;
        const nextAmpm = nextHour >= 12 ? "PM" : "AM";

        if (nextDisplayHour > 12) {
          nextDisplayHour = nextDisplayHour - 12;
        }

        const label = `${nextDisplayHour
          .toString()
          .padStart(2, "0")}:00${nextAmpm}`;
        times.push({ label, value: timeString });
      }
    }

    // Add early morning times: 12:00 AM to 5:30 AM
    times.push({ label: "Midnight", value: "00:00" });

    for (let hour = 0; hour <= 5; hour++) {
      if (hour === 0) {
        // Skip midnight as it's already added, add 12:30AM
        times.push({ label: "12:30AM", value: "00:30" });
        continue;
      }

      // On the hour
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      let displayHour = hour;
      const ampm = "AM";

      const label = `${displayHour.toString().padStart(2, "0")}:00${ampm}`;
      times.push({ label, value: timeString });

      // 30 minutes past the hour (only up to 5:30 AM)
      if (hour <= 5) {
        const timeString30 = `${hour.toString().padStart(2, "0")}:30`;
        const label30 = `${displayHour.toString().padStart(2, "0")}:30${ampm}`;
        times.push({ label: label30, value: timeString30 });
      }
    }
  } else {
    // Full range (original behavior)
    // Add midnight first
    times.push({ label: "Midnight", value: "00:00" });

    // Generate times from 12:30 AM to 11:30 PM
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 30; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        let displayHour = hour;
        const ampm = hour >= 12 ? "PM" : "AM";

        if (displayHour === 0) {
          displayHour = 12;
        } else if (displayHour > 12) {
          displayHour = displayHour - 12;
        }

        const displayMinute = minute.toString().padStart(2, "0");
        const label = `${displayHour
          .toString()
          .padStart(2, "0")}:${displayMinute}${ampm}`;

        times.push({ label, value: timeString });
      }

      // Add the next hour (on the hour)
      if (hour < 23) {
        const nextHour = hour + 1;
        const timeString = `${nextHour.toString().padStart(2, "0")}:00`;
        let displayHour = nextHour;
        const ampm = nextHour >= 12 ? "PM" : "AM";

        if (displayHour === 0) {
          displayHour = 12;
        } else if (displayHour > 12) {
          displayHour = displayHour - 12;
        }

        const label = `${displayHour.toString().padStart(2, "0")}:00${ampm}`;

        times.push({ label, value: timeString });
      }
    }
  }

  return times;
};

function TimePicker({
  name,
  value,
  onChange,
  className = "",
  width = "",
  showArrow = true,
  timeType = "all",
  disabled = false, // Add disabled prop with default
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const timeOptions = generateTimeOptions(timeType);

  // Set initial selected time from value prop
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);
    } else {
      setSelectedTime("");
    }
  }, [value]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeSelect = (timeValue: string) => {
    if (disabled) return; // Prevent selection if disabled

    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);

    setSelectedTime(timeValue);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const getDisplayTime = () => {
    if (!selectedTime) {
      return "Select time"; // Always show placeholder until user picks time
    }

    const [hour, minute] = selectedTime.split(":").map(Number);
    if (hour === 0 && minute === 0) {
      return "Midnight";
    }

    let displayHour = hour;
    const ampm = hour >= 12 ? "PM" : "AM";

    if (displayHour === 0) {
      displayHour = 12;
    } else if (displayHour > 12) {
      displayHour = displayHour - 12;
    }

    return `${displayHour}:${minute.toString().padStart(2, "0")}${ampm}`;
  };

  return (
    <div className={`relative ${width} ${className}`}>
      {/* Time Picker Trigger */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={`flex items-center gap-1 transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:text-grey-700"
        }`}
        style={disabled ? { pointerEvents: "none" } : {}}
      >
        <span
          className={`text-xs xl:text-sm transition-colors ${
            disabled
              ? "text-gray-400"
              : selectedTime
                ? "text-gray-800"
                : "text-gray-400"
          } whitespace-nowrap`}
        >
          {getDisplayTime()}
        </span>
        {showArrow && (
          <div
            className={`transition-transform duration-200 ${
              isOpen && !disabled ? "rotate-180" : ""
            } ${disabled ? "text-grey-400" : ""}`}
          >
            {Icons.ic_chevron_down}
          </div>
        )}
      </div>

      {/* Time Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-[120px] bg-white border border-grey-200 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] z-50 max-h-[300px] overflow-hidden"
        >
          <div className="py-2 overflow-y-auto max-h-[280px] custom-scrollbar">
            {timeOptions.map((time, index) => (
              <div
                key={index}
                onClick={() => handleTimeSelect(time.value)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 ease-in-out hover:bg-grey-50 ${
                  selectedTime === time.value
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-grey-700"
                }`}
              >
                {time.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default TimePicker;
