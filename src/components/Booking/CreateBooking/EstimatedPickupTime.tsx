import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

// Add these helper functions at the top of your file, after imports
const isToday = (date: Date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const formatDate = (date: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
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

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const suffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${dayName}, ${monthName} ${day}${suffix(day)}, ${year}`;
};

// Add this component before your BookingSummary component
const EstimatedPickupTime = ({
  tripStartDate,
  tripStartTime,
}: {
  tripStartDate: string;
  tripStartTime: string;
}) => {
  const [estimatedPickupTime, setEstimatedPickupTime] = useState<Date | null>(
    null,
  );

  useEffect(() => {
    const calculatePickupTime = () => {
      const tripDate = new Date(tripStartDate);
      const tripTime = new Date(tripStartTime);

      // Only show if trip date is today
      if (!isToday(tripDate)) {
        setEstimatedPickupTime(null);
        return;
      }

      // ⚠️ ADJUST DELIVERY TIME HERE ⚠️
      // Change the number 2 to increase/decrease hours
      const DELIVERY_HOURS = 2; // <-- Change this value (e.g., 3 for 3 hours, 1.5 for 90 minutes)

      // Add DELIVERY_HOURS to trip start time for estimated pickup
      const estimatedTime = new Date(
        tripTime.getTime() + DELIVERY_HOURS * 60 * 60 * 1000,
      );

      setEstimatedPickupTime(estimatedTime);
    };

    calculatePickupTime();

    // Recalculate when component mounts or dependencies change
    const interval = setInterval(calculatePickupTime, 60000);

    return () => clearInterval(interval);
  }, [tripStartDate, tripStartTime]);

  if (!estimatedPickupTime) return null;

  return (
    <div className="bg-[#F0F9FF] border border-[#0EA5E9] rounded-xl p-4 mt-4">
      <div className="flex items-start space-x-3">
        <FiClock size={24} className="text-[#0EA5E9] flex-shrink-0 mt-0.5" />
        <div className="space-y-2 w-full">
          <p className="text-sm font-semibold text-gray-900">
            Same-Day Booking Confirmed
          </p>

          {/* Pickup Details */}
          <div className="space-y-2 bg-white rounded-lg p-3 border border-[#0EA5E9]/20">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-600">
                Pickup Date:
              </span>
              <span className="text-xs font-semibold text-gray-900 text-right">
                {formatDate(new Date(tripStartDate))}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-600">
                Requested Pickup Time:
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {formatTime(new Date(tripStartTime))}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-[#0EA5E9]">
                  Estimated Vehicle Arrival:
                </span>
                <span className="text-sm font-bold text-[#0EA5E9]">
                  {formatTime(estimatedPickupTime)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 italic">
            Your vehicle will be delivered within 1-2 hours of your requested
            pickup time, regardless of its current location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EstimatedPickupTime;
