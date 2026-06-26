"use client";

import { useEffect, useRef, useState } from "react";
import DateInput from "../general/forms/DateInput";
import TimeInput from "../general/forms/TimeInput";
import { GoogleMapsLocationInput } from "../general/forms/GoogleMapsLocationInput";
import { FiPlus, FiMinus } from "react-icons/fi";

type Coord = { lat: number; lng: number } | null;
type Trip = { id: string; tripDetails: Record<string, string> };

interface InterstateRoundTripProps {
  interstateTypeId: string;
  dayTypeId: string;
  onTripsChange: (trips: Trip[]) => void;
  onRegionValidChange?: (valid: boolean) => void;
  initialStartDateStr?: string;
  initialLocalDays?: number;
  seedVersion?: number;
}

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const defaultTime = () => {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
};

const applyTime = (date: Date, time: Date | null) => {
  const d = new Date(date);
  if (time) d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  else d.setHours(8, 0, 0, 0);
  return d;
};

const pad = (n: number) => String(n).padStart(2, "0");

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;

const isoDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:00`;

const coordStr = (c: Coord) => (c ? JSON.stringify(c) : "");

const dayLabel = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select the start date above";

export default function InterstateRoundTrip({
  interstateTypeId,
  dayTypeId,
  onTripsChange,
  onRegionValidChange,
  initialStartDateStr,
  initialLocalDays,
  seedVersion = 0,
}: InterstateRoundTripProps) {
  // Interstate out
  const [outPickup, setOutPickup] = useState("");
  const [outPickupCoord, setOutPickupCoord] = useState<Coord>(null);
  const [destination, setDestination] = useState("");
  const [destinationCoord, setDestinationCoord] = useState<Coord>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [outTime, setOutTime] = useState<Date | null>(defaultTime());

  // Local days
  const [localDays, setLocalDays] = useState(1);
  const [localTime, setLocalTime] = useState<Date | null>(defaultTime());

  // Interstate back
  const [backPickup, setBackPickup] = useState("");
  const [backPickupCoord, setBackPickupCoord] = useState<Coord>(null);
  const [backDropoff, setBackDropoff] = useState("");
  const [backDropoffCoord, setBackDropoffCoord] = useState<Coord>(null);
  const [backTime, setBackTime] = useState<Date | null>(defaultTime());

  const [outPickupState, setOutPickupState] = useState("");
  const [destinationState, setDestinationState] = useState("");
  const [backPickupState, setBackPickupState] = useState("");
  const [backDropoffState, setBackDropoffState] = useState("");

  // Seed the start date and the number of local days from the searched range:
  // the first day is the trip out, the last is the trip back, and the days in
  // between are local. Runs on first availability and again whenever the dates
  // are changed from the availability calendar (seedVersion bump). It never
  // overrides addresses or times the traveller has already entered.
  const lastSeed = useRef<number | null>(null);
  useEffect(() => {
    if (lastSeed.current === seedVersion) return;
    if (initialStartDateStr) {
      const d = new Date(initialStartDateStr);
      if (!isNaN(d.getTime())) {
        setStartDate(d);
        setLocalDays(Math.max(0, initialLocalDays ?? 1));
        lastSeed.current = seedVersion;
      }
    }
  }, [seedVersion, initialStartDateStr, initialLocalDays]);

  useEffect(() => {
    const trips: Trip[] = [];

    // Interstate out: origin to destination
    trips.push({
      id: "trip-0",
      tripDetails: {
        bookingType: interstateTypeId,
        tripStartDate: startDate ? isoDate(startDate) : "",
        tripStartTime: startDate
          ? isoDateTime(applyTime(startDate, outTime))
          : "",
        pickupLocation: outPickup,
        pickupCoordinates: coordStr(outPickupCoord),
        dropoffLocation: destination,
        dropoffCoordinates: coordStr(destinationCoord),
      },
    });

    // Local days at the destination, charged as a 24 hour booking each
    for (let i = 0; i < localDays; i++) {
      const lDate = startDate ? addDays(startDate, i + 1) : null;
      trips.push({
        id: `trip-${i + 1}`,
        tripDetails: {
          bookingType: dayTypeId,
          tripStartDate: lDate ? isoDate(lDate) : "",
          tripStartTime: lDate ? isoDateTime(applyTime(lDate, localTime)) : "",
          pickupLocation: destination,
          pickupCoordinates: coordStr(destinationCoord),
          dropoffLocation: destination,
          dropoffCoordinates: coordStr(destinationCoord),
        },
      });
    }

    // Interstate back: destination to origin
    const backDate = startDate ? addDays(startDate, localDays + 1) : null;
    trips.push({
      id: `trip-${localDays + 1}`,
      tripDetails: {
        bookingType: interstateTypeId,
        tripStartDate: backDate ? isoDate(backDate) : "",
        tripStartTime: backDate
          ? isoDateTime(applyTime(backDate, backTime))
          : "",
        pickupLocation: backPickup,
        pickupCoordinates: coordStr(backPickupCoord),
        dropoffLocation: backDropoff,
        dropoffCoordinates: coordStr(backDropoffCoord),
      },
    });

    onTripsChange(trips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    outPickup,
    outPickupCoord,
    destination,
    destinationCoord,
    startDate,
    outTime,
    localDays,
    localTime,
    backPickup,
    backPickupCoord,
    backDropoff,
    backDropoffCoord,
    backTime,
    interstateTypeId,
    dayTypeId,
  ]);

  const localDates = startDate
    ? Array.from({ length: localDays }, (_, i) => addDays(startDate, i + 1))
    : [];
  const backDate = startDate ? addDays(startDate, localDays + 1) : null;

  // Region checks. States are compared only when both sides are known, so a
  // missing or unparsed state never blocks the trip. The out leg must cross into
  // a different state, and the back leg must start in the destination state and
  // end in the origin state.
  const normState = (s: string) =>
    s.trim().toLowerCase().replace(/\s+state$/, "");
  const outP = normState(outPickupState);
  const dest = normState(destinationState);
  const backP = normState(backPickupState);
  const backD = normState(backDropoffState);

  const outSameRegion = !!outP && !!dest && outP === dest;
  const backPickupWrong = !!backP && !!dest && backP !== dest;
  const backDropoffWrong = !!backD && !!outP && backD !== outP;
  const regionValid = !outSameRegion && !backPickupWrong && !backDropoffWrong;

  useEffect(() => {
    if (onRegionValidChange) onRegionValidChange(regionValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionValid]);

  const regionNote = (text: string) => (
    <p className="mt-1 text-xs text-red-600">{text}</p>
  );

  const sectionTitle = (n: number, label: string) => (
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0673ff] text-xs font-bold text-white">
        {n}
      </span>
      <h3 className="text-sm font-bold text-[#101928]">{label}</h3>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-3 py-2 text-xs text-[#0560d6]">
        An interstate trip is a round trip: the drive out, the days you keep the
        car at your destination, and the drive back. Each part is priced
        separately.
      </div>

      {/* Interstate out */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        {sectionTitle(1, "Interstate out")}
        <div className="space-y-3">
          <GoogleMapsLocationInput
            type="outPickup"
            value={outPickup}
            placeholder="Pickup address"
            onChange={setOutPickup}
            coordinates={(_t, v) => setOutPickupCoord(v)}
            onRegion={(_t, r) => setOutPickupState(r.state)}
            disabled={false}
          />
          <GoogleMapsLocationInput
            type="destination"
            value={destination}
            placeholder="Destination address"
            onChange={setDestination}
            coordinates={(_t, v) => setDestinationCoord(v)}
            onRegion={(_t, r) => setDestinationState(r.state)}
            disabled={false}
          />
          {outSameRegion &&
            regionNote(
              `Your destination is in ${destinationState}, the same state as your pickup. An interstate trip has to cross into another state.`,
            )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DateInput
              name="interstateStartDate"
              label="Start date"
              value={startDate}
              onChange={(v) => setStartDate((v as Date) || null)}
              blockPastDates
            />
            <TimeInput
              name="interstateOutTime"
              label="Pickup time"
              value={outTime}
              onChange={(d) => setOutTime(d)}
            />
          </div>
        </div>
      </div>

      {/* Local days */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        {sectionTitle(2, "Local days")}
        <p className="mb-3 text-xs text-gray-500">
          Days you keep the car around your destination. Each is charged as a 24
          hour booking and uses the destination address above.
        </p>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
          <span className="text-sm font-medium text-gray-700">
            Number of local days
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocalDays((n) => Math.max(0, n - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              disabled={localDays <= 0}
              aria-label="Remove a local day"
            >
              <FiMinus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-gray-900">
              {localDays}
            </span>
            <button
              type="button"
              onClick={() => setLocalDays((n) => Math.min(30, n + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              aria-label="Add a local day"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <TimeInput
            name="interstateLocalTime"
            label="Daily pickup time"
            value={localTime}
            onChange={(d) => setLocalTime(d)}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">
              Local day dates
            </p>
            {localDates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {localDates.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {d.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Set the start date to see your local days.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interstate back */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        {sectionTitle(3, "Interstate back")}
        <p className="mb-3 text-xs text-gray-500">
          The return leg on {dayLabel(backDate)}.
        </p>
        <div className="space-y-3">
          <GoogleMapsLocationInput
            type="backPickup"
            value={backPickup}
            placeholder="Return pickup address"
            onChange={setBackPickup}
            coordinates={(_t, v) => setBackPickupCoord(v)}
            onRegion={(_t, r) => setBackPickupState(r.state)}
            disabled={false}
          />
          <GoogleMapsLocationInput
            type="backDropoff"
            value={backDropoff}
            placeholder="Return drop-off address"
            onChange={setBackDropoff}
            coordinates={(_t, v) => setBackDropoffCoord(v)}
            onRegion={(_t, r) => setBackDropoffState(r.state)}
            disabled={false}
          />
          {backPickupWrong &&
            regionNote(
              `Your return should start in ${destinationState}, where the trip out ends.`,
            )}
          {backDropoffWrong &&
            regionNote(
              `Your return should end in ${outPickupState}, where the trip started.`,
            )}
          <div className="sm:w-1/2">
            <TimeInput
              name="interstateBackTime"
              label="Return time"
              value={backTime}
              onChange={(d) => setBackTime(d)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
