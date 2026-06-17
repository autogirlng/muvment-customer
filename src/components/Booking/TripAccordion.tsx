import { useEffect, useState } from "react";
import DateInput from "../general/forms/DateInput";
import TimeInput from "../general/forms/TimeInput";
import Icons from "../general/forms/icons";
import SelectInput from "../general/forms/select";
import { ReactNode } from "react";
import cn from "classnames";
import { format } from "date-fns";
import AreaOfUseSelect, { SelectedArea } from "./AreaOfUseSelect";
import { getAreasForCity, CityArea } from "@/data/lagosAreas";
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
  dayLabel,
  daySubLabel,
  deleteMethod,
  id,
  onChangeTrip,
  initialValues,
  disabled,
  isCollapsed,
  toggleOpen,
  bookingOptions,
  vehicleId,
  vehicle,
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
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<string>(() => {
    const pc = initialValues?.pickupCoordinates as any;
    if (!pc) return "";
    return typeof pc === "string" ? pc : JSON.stringify(pc);
  });
  const [areaOfUse, setAreaOfUse] = useState(initialValues?.areaOfUse || "");
  const initialAreas: SelectedArea[] = (() => {
    if (!initialValues?.areasOfUse) return [];
    try {
      return JSON.parse(initialValues.areasOfUse);
    } catch {
      return [];
    }
  })();
  const [selectedAreas, setSelectedAreas] =
    useState<SelectedArea[]>(initialAreas);
  const [serviceAreas, setServiceAreas] = useState<CityArea[]>(() =>
    getAreasForCity(vehicle?.city),
  );
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
        if (sameAsPickup) {
          setDropoffLocation(value);
          onChange("dropoffLocation", value);
        }
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

  // Area-of-use options are dynamic to the pickup location: resolve the state
  // from the pickup coordinates and load that state's areas, including
  // outskirts. Falls back to the vehicle city list if the lookup is empty.
  useEffect(() => {
    let alive = true;
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      if (pickupCoords) {
        const c = JSON.parse(pickupCoords);
        if (typeof c?.lat === "number" && typeof c?.lng === "number") {
          lat = c.lat;
          lng = c.lng;
        }
      }
    } catch {}
    if (lat === null || lng === null) {
      setServiceAreas(getAreasForCity(vehicle?.city));
      return;
    }
    VehicleSearchService.getServiceAreas(lat, lng)
      .then((list) => {
        if (!alive) return;
        const mapped: CityArea[] = (list || []).map((a) => ({
          name: a.name,
          lat: a.latitude,
          lng: a.longitude,
          isOutskirts: !!a.isOutskirts,
        }));
        setServiceAreas(
          mapped.length > 0 ? mapped : getAreasForCity(vehicle?.city),
        );
      })
      .catch(() => {
        if (alive) setServiceAreas(getAreasForCity(vehicle?.city));
      });
    return () => {
      alive = false;
    };
  }, [pickupCoords, vehicle?.city]);

  useEffect(() => {
    if (initialTripStartDate) {
      const formattedDate = format(initialTripStartDate, "MMM do yyyy");
      setDate(`Day ${day}: ${formattedDate}`);
    }
  }, []);

  useEffect(() => {
    if (tripStartTime || !tripStartDate) return;

    const applyTime = (h: number, m: number) => {
      const d = new Date(tripStartDate);
      d.setHours(h, m, 0, 0);
      onChange("tripStartTime", d.toString());
    };

    const typeName = (
      bookingOptions?.find((o: any) => o.value === bookingType)?.option || ""
    ).toLowerCase();
    const isWithinState = /hour|month/.test(typeName);

    if (isWithinState) {
      // Within-state bookings default to 8:00 AM.
      applyTime(8, 0);
      return;
    }

    // Other types default to the first available slot once it loads.
    if (availableTimes && availableTimes.length > 0) {
      const firstAvail = availableTimes.find((t) => t.available);
      if (firstAvail?.time) {
        try {
          const [timePart, ampm] = firstAvail.time.split(" ");
          const [hStr, mStr] = timePart.split(":");
          let h = parseInt(hStr, 10);
          const m = parseInt(mStr, 10) || 0;
          if (ampm === "AM" && h === 12) h = 0;
          if (ampm === "PM" && h !== 12) h = h + 12;
          if (!isNaN(h) && h >= 0 && h <= 23) applyTime(h, m);
        } catch {}
      }
    }
  }, [availableTimes, bookingType, tripStartDate, tripStartTime, bookingOptions]);

  const coordinates = (type: string, value: { lat: number; lng: number }) => {
    onChange(type, JSON.stringify(value));
    if (type === "pickupCoordinates") {
      setPickupCoords(JSON.stringify(value));
      if (sameAsPickup) {
        onChange("dropoffCoordinates", JSON.stringify(value));
      }
    }
  };

  const handleSameAsPickup = (checked: boolean) => {
    setSameAsPickup(checked);
    if (checked) {
      setDropoffLocation(pickupLocation);
      onChange("dropoffLocation", pickupLocation);
      if (pickupCoords) onChange("dropoffCoordinates", pickupCoords);
    }
  };

  const selectedTypeName =
    bookingOptions?.find((o: any) => o.value === bookingType)?.option || "";
  const durationMatch = selectedTypeName.match(/(\d+)\s*hour/i);
  const durationHours = durationMatch ? parseInt(durationMatch[1], 10) : 0;
  const bookingEndDate =
    durationHours && tripStartDate && tripStartTime
      ? new Date(
          new Date(tripStartDate).setHours(
            tripStartTime.getHours(),
            tripStartTime.getMinutes(),
            0,
            0,
          ) +
            durationHours * 60 * 60 * 1000,
        )
      : null;
  const formattedBookingEnd = bookingEndDate
    ? format(bookingEndDate, "EEE, MMM d 'at' h:mm a")
    : "";

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
              <p className="text-sm font-semibold text-gray-900">
                {dayLabel || `Day ${day}`}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {daySubLabel ?? date.replace(`Day ${day}: `, "")}
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

            <InputSection title="Trip Start (Nigeria time)" textColor="[#0673ff]">
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

            {bookingEndDate && (
              <div className="-mt-2 flex items-center gap-2.5 rounded-xl border border-[#0673ff]/15 bg-[#EAF2FF] px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#0673ff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <p className="text-xs leading-snug text-gray-600">
                  This {durationHours}-hour booking ends{" "}
                  <span className="font-semibold text-gray-900">
                    {formattedBookingEnd}
                  </span>
                </p>
              </div>
            )}

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
              <div className="w-full space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sameAsPickup}
                    disabled={disabled}
                    onChange={(e) => handleSameAsPickup(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0673ff] focus:ring-[#0673ff]"
                  />
                  Same as pickup location
                </label>
                {!sameAsPickup && (
                  <GoogleMapsLocationInput
                    disabled={disabled}
                    value={dropoffLocation}
                    onChange={(value) => onChange("dropoffLocation", value)}
                    placeholder="Enter location"
                    coordinates={coordinates}
                    type="dropoffCoordinates"
                  />
                )}
              </div>
            </InputSection>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-xs font-semibold text-gray-600">
                  Area of use
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                  Optional · add now or later
                </span>
              </div>
              <p className="mb-2 text-[11px] leading-snug text-gray-500">
                Tell us where you plan to drive. It helps us plan your trip and
                apply the right pricing. Add as many areas as you like.
              </p>
              {serviceAreas.length > 0 ? (
                <AreaOfUseSelect
                  areas={serviceAreas}
                  value={selectedAreas}
                  city={vehicle?.city}
                  disabled={disabled}
                  onChange={(areas) => {
                    setSelectedAreas(areas);
                    onChange("areasOfUse", JSON.stringify(areas));
                  }}
                />
              ) : (
                <GoogleMapsLocationInput
                  disabled={disabled}
                  value={areaOfUse}
                  onChange={(value) => onChange("areaOfUse", value)}
                  placeholder="Enter location"
                  coordinates={coordinates}
                  type="areaOfUseCoordinates"
                />
              )}
              {selectedAreas.some((a) => a.custom) && (
                <p className="mt-1.5 text-[11px] leading-snug text-amber-600">
                  Some areas you added by search are outside our listed service
                  areas for this pickup. We will confirm they are serviceable
                  before your trip.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { TripAccordion };
