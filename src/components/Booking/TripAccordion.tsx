import { useEffect, useState } from "react";
import DateInput from "../general/forms/DateInput";
import TimeInput from "../general/forms/TimeInput";
import Icons from "../general/forms/icons";
import SelectInput from "../general/forms/select";
import { ReactNode } from "react";
import cn from "classnames";
import { format } from "date-fns";
import { GoogleMapsLocationInput } from "../general/forms/GoogleMapsLocationInput";
import {
  ITripPerDaySelect,
  TripDetails,
  CalendarValue,
} from "@/types/vehicleDetails";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

export function toTitleCase(str: string): string {
  if (!str) {
    return str;
  }
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const InputSection = ({
  title,
  children,
  error,
  textColor,
}: {
  title: string;
  children: ReactNode;
  textColor?: string;
  error?: string;
}) => {
  return (
    <div>
      <p
        className={cn(
          "text-xs font-semibold mb-1.5",
          textColor ? `text-${textColor}` : "text-gray-600",
        )}
      >
        {title}
      </p>
      <div className="flex items-center gap-3">{children}</div>
      {error && <p className="text-error-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const TripAccordion = ({
  day,
  deleteMethod,
  id,
  onChangeTrip,
  initialValues,
  disabled,
  isCollapsed,
  toggleOpen,
  bookingOptions,
  vehicleId,
}: ITripPerDaySelect) => {
  const [date, setDate] = useState(`Day ${day}: Choose Date`);
  const [bookingType, setBookingType] = useState(
    initialValues?.bookingType || "",
  );
  const initialTripStartTime = initialValues?.tripStartTime
    ? new Date(`${initialValues.tripStartTime}`)
    : null;
  const initialTripStartDate = initialValues?.tripStartDate
    ? new Date(`${initialValues.tripStartDate}`)
    : null;
  const [tripStartDate, setTripStartDate] = useState<Date | null>(
    initialTripStartDate,
  );
  const [tripStartTime, setTripStartTime] = useState<Date | null>(
    initialTripStartTime,
  );
  const [pickupLocation, setPickupLocation] = useState(
    initialValues?.pickupLocation || "",
  );
  const [dropoffLocation, setDropoffLocation] = useState(
    initialValues?.dropoffLocation || "",
  );
  const [areaOfUse, setAreaOfUse] = useState(initialValues?.areaOfUse || "");
  const [availableTimes, setAvailableTimes] =
    useState<{ available: boolean; time: string }[]>();
  const [loadingAvailableTimes, setLoadingAvailableTimes] =
    useState<boolean>(false);
  const onChange = (key: string, value: string) => {
    const trips: TripDetails[] = JSON.parse(
      sessionStorage.getItem("trips") || "[]",
    );
    const tripExists = trips.some((trip) => trip.id === id);
    let updatedTrips;
    if (tripExists) {
      updatedTrips = trips.map((trip) => {
        if (trip.id === id) {
          return { ...trip, [key]: value };
        }
        return trip;
      });
    } else {
      updatedTrips = [...trips, { id, [key]: value }];
    }

    sessionStorage.setItem("trips", JSON.stringify(updatedTrips));

    onChangeTrip(id, { [key]: value });

    switch (key) {
      case "date":
        setDate(value);
        break;
      case "bookingType":
        setBookingType(value);
        break;
      case "tripStartDate":
        const date = new Date(value);
        setTripStartDate(date);
        setAvailableTimes([]);
        setTripStartTime(null);
        const formattedDate = format(date, "MMM do yyyy");
        setDate(`Day ${day}: ${formattedDate}`);
        break;
      case "tripStartTime":
        setTripStartTime(new Date(value));
        break;
      case "pickupLocation":
        setPickupLocation(value);
        break;
      case "dropoffLocation":
        setDropoffLocation(value);
        break;
      case "areaOfUse":
        setAreaOfUse(value);
        break;

      default:
        break;
    }
  };

  const fetchAvailableTimeSlots = async () => {
    setLoadingAvailableTimes(true);

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    try {
      if (vehicleId && tripStartDate) {
        const response =
          await VehicleSearchService.getVehicleAvailableTimeSlots(
            vehicleId,
            formatLocalDate(tripStartDate),
          );
        if (response[0]?.status === "SUCCESSFUL") {
          const times = response[0].data.timeSlots;

          setAvailableTimes(times);
        }
      }
    } finally {
      setLoadingAvailableTimes(false);
    }
  };

  useEffect(() => {
    fetchAvailableTimeSlots();
  }, [vehicleId, tripStartDate]);

  useEffect(() => {
    if (initialTripStartDate) {
      const formattedDate = format(initialTripStartDate, "MMM do yyyy");
      setDate(`Day ${day}: ${formattedDate}`);
    }
  }, []);

  const coordinates = (type: string, value: { lat: number; lng: number }) => {
    onChange(type, JSON.stringify(value));
  };

  return (
    <>
      <div className="rounded-2xl px-4 py-3 mt-2 border border-[#E4E7EC]">
        <div
          className="flex justify-between items-center cursor-pointer gap-3"
          onClick={() => toggleOpen()}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#EAF2FF] text-[#0673ff] shrink-0">
              {Icons.ic_calendar}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Day {day}</p>
              <p className="text-xs text-gray-500 truncate">
                {date.replace(`Day ${day}: `, "")}
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 shrink-0">
            {day !== "1" && deleteMethod ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMethod(id);
                }}
                className="w-5 h-5 text-gray-400 hover:text-red-500 transition cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            ) : null}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
            <InputSection title="Booking Type">
              <SelectInput
                disabled={disabled}
                id="bookingType"
                placeholder="Select Booking Type"
                variant="outlined"
                className=""
                options={bookingOptions}
                value={bookingType}
                onChange={(value) => onChange("bookingType", value)}
              />
            </InputSection>

            <InputSection title="Trip Start" textColor="[#0673ff]">
              <div className="flex-1 min-w-0">
                <DateInput
                  name="startDate"
                  value={tripStartDate}
                  disabled={disabled}
                  onChange={(value: CalendarValue) => {
                    onChange("tripStartDate", value?.toString() || "");
                  }}
                  minDate={new Date()}
                />
              </div>
              <div className="flex-1 min-w-0">
                <TimeInput
                  name="startTime"
                  disabled={disabled || !tripStartDate || loadingAvailableTimes}
                  value={tripStartTime}
                  onChange={(date: Date) =>
                    onChange("tripStartTime", date.toString())
                  }
                  timeType="start"
                  availableTimes={availableTimes}
                  placeholder={
                    loadingAvailableTimes
                      ? "Loading..."
                      : !tripStartDate
                        ? "Select date first"
                        : "Select time"
                  }
                />
              </div>
            </InputSection>

            <InputSection title="Pickup Location">
              <GoogleMapsLocationInput
                disabled={disabled}
                value={pickupLocation}
                onChange={(value) => onChange("pickupLocation", value)}
                placeholder="Enter location"
                coordinates={coordinates}
                type="pickupCoordinates"
              />
            </InputSection>

            <InputSection title="Drop-off Location">
              <GoogleMapsLocationInput
                disabled={disabled}
                value={dropoffLocation}
                onChange={(value) => onChange("dropoffLocation", value)}
                placeholder="Enter location"
                coordinates={coordinates}
                type="dropoffCoordinates"
              />
            </InputSection>

            <InputSection title="Area of Use">
              <GoogleMapsLocationInput
                disabled={disabled}
                value={areaOfUse}
                onChange={(value) => onChange("areaOfUse", value)}
                placeholder="Enter location"
                coordinates={coordinates}
                type="areaOfUseCoordinates"
              />
            </InputSection>
          </div>
        )}
      </div>
    </>
  );
};

export { TripAccordion };
