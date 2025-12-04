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
    <div className="p-1">
      <p className={cn("text-sm 3xl:text-base", `text-${textColor}`)}>
        {title}
      </p>
      <div className="flex items-center gap-3">{children}</div>
      {error && <p className="text-error-500 text-sm">{error}</p>}
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
}: ITripPerDaySelect) => {
  const [date, setDate] = useState(`Day ${day}: Choose Date`);
  const [bookingType, setBookingType] = useState(
    initialValues?.bookingType || ""
  );
  const initialTripStartTime = initialValues
    ? new Date(`${initialValues.tripStartTime}`)
    : null;
  const initialTripStartDate = initialValues
    ? new Date(`${initialValues.tripStartDate}`)
    : null;
  const [tripStartDate, setTripStartDate] = useState<Date | null>(
    initialTripStartDate
  );
  const [tripStartTime, setTripStartTime] = useState<Date | null>(
    initialTripStartTime
  );
  const [pickupLocation, setPickupLocation] = useState(
    initialValues?.pickupLocation || ""
  );
  const [dropoffLocation, setDropoffLocation] = useState(
    initialValues?.dropoffLocation || ""
  );
  const [areaOfUse, setAreaOfUse] = useState(initialValues?.areaOfUse || "");

  const onChange = (key: string, value: string) => {
    const trips: TripDetails[] = JSON.parse(
      sessionStorage.getItem("trips") || "[]"
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

  useEffect(() => {

    if (initialTripStartDate) {
      const formattedDate = format(initialTripStartDate, "MMM do yyyy");
      setDate(`Day ${day}: ${formattedDate}`);
    }

  }, [])

  const coordinates = (type: string, value: { lat: number; lng: number }) => {
    onChange(type, JSON.stringify(value));
  };

  return (
    <>
      <div className="rounded-2xl px-4 p-2 mt-1 border border-[#E4E7EC]">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleOpen()}
        >
          <div className="flex items-center space-x-2 text-gray-600">
            {Icons.ic_calendar}
            <span className="text-sm">{date}</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-5">
            {day !== "1" && deleteMethod ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMethod(id);
                }}
                className="w-5 h-5 text-gray-600 cursor-pointer"
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
            ) : (
              <div className="w-5 h-5" />
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"
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
          <div className="mt-2 pt-2 space-y-4">
            <div>
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

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                {/* Dropdown Arrow Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2"
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

            <div>
              <InputSection title="Trip Start" textColor="[#0673ff]">
                <DateInput
                  name="startDate"
                  value={tripStartDate}
                  disabled={disabled}
                  onChange={(value: CalendarValue) => {
                    onChange("tripStartDate", value?.toString() || "");
                  }}
                  minDate={new Date()}
                />
                <TimeInput
                  name="startTime"
                  disabled={disabled}
                  value={tripStartTime}
                  onChange={(date: Date) =>
                    onChange("tripStartTime", date.toString())
                  }
                  timeType="start"
                />

              </InputSection>
            </div>
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
