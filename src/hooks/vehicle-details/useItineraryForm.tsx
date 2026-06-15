import { useState, useEffect } from "react";
import { Trips, TripDetails } from "@/types/vehicleDetails";

// Shift a trip's start date forward by a number of days, tolerant of the value
// format. If the value can't be parsed it is returned untouched, so a stray
// date never crashes the itinerary.
const shiftStartDate = (start: any, offsetDays: number): any => {
  if (!start) return start;
  let d = new Date(`${String(start).slice(0, 10)}T00:00:00Z`);
  if (isNaN(d.getTime())) {
    const alt = new Date(String(start));
    if (isNaN(alt.getTime())) return start;
    d = new Date(Date.UTC(alt.getFullYear(), alt.getMonth(), alt.getDate()));
  }
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return `${d.toISOString().slice(0, 10)}T00:00:00`;
};

export const useItineraryForm = () => {
  const [trips, setTrips] = useState<Trips[]>([]);


  const [openTripIds, setOpenTripIds] = useState<Set<string>>(() => {
    const allIds = trips.map((trip) => trip.id);
    return new Set(allIds);
  });
  const [isTripFormsComplete, setIsTripFormComplete] = useState<boolean>(false);
  const [missingByTrip, setMissingByTrip] = useState<
    { id: string; fields: string[] }[]
  >([]);
  const [tripsVersion, setTripsVersion] = useState<number>(0);
  const [sameForAllDays, setSameForAllDays] = useState<boolean>(true);

  const applySharedPlanChange = (details: TripDetails) => {
    const hasDate = Object.prototype.hasOwnProperty.call(
      details,
      "tripStartDate",
    );
    setTrips((prev) => {
      const next = prev.map((t, i) => {
        if (hasDate) {
          const start = (details as any).tripStartDate;
          const dateStr = shiftStartDate(start, i);
          return {
            ...t,
            tripDetails: { ...(t.tripDetails || {}), tripStartDate: dateStr },
          };
        }
        return {
          ...t,
          tripDetails: { ...(t.tripDetails || {}), ...details },
        };
      });
      try {
        sessionStorage.setItem(
          "trips",
          JSON.stringify(next.map((t) => ({ ...t.tripDetails, id: t.id }))),
        );
      } catch {}
      return next;
    });
  };

  const setNumberOfDays = (n: number) => {
    if (n < 1 || trips.length === 0) return;
    if (n === trips.length) return;
    const base = (trips[0]?.tripDetails || {}) as any;
    const baseDateStr = base?.tripStartDate;
    let next = [...trips];
    if (n > trips.length) {
      let maxNum = trips.reduce((m, t) => {
        const num = parseInt((t.id || "").replace("trip-", ""), 10);
        return isNaN(num) ? m : Math.max(m, num);
      }, -1);
      const { id: _omitId, tripStartDate: _omitDate, ...basePlan } = base;
      for (let i = trips.length; i < n; i++) {
        maxNum += 1;
        const id = `trip-${maxNum}`;
        const dateStr = shiftStartDate(baseDateStr, i);
        next.push({ id, tripDetails: { ...basePlan, id, tripStartDate: dateStr } });
      }
    } else {
      next = trips.slice(0, n);
    }
    try {
      sessionStorage.setItem(
        "trips",
        JSON.stringify(next.map((t) => ({ ...t.tripDetails, id: t.id }))),
      );
    } catch {}
    setTrips(next);
    setOpenTripIds(new Set(next[0]?.id ? [next[0].id] : []));
    setTripsVersion((v) => v + 1);
  };

  const applyToAllTrips = (sourceId: string) => {
    const source = trips.find((t) => t.id === sourceId)?.tripDetails as any;
    if (!source) return;
    const hasSomething =
      source.bookingType ||
      source.pickupLocation ||
      source.dropoffLocation ||
      source.areasOfUse ||
      source.areaOfUse;
    if (!hasSomething) return;
    const updatedTrips = trips.map((trip) => {
      if (trip.id === sourceId) return trip;
      return {
        id: trip.id,
        tripDetails: {
          ...source,
          id: trip.id,
          tripStartDate: trip.tripDetails?.tripStartDate,
        },
      };
    });
    try {
      sessionStorage.setItem(
        "trips",
        JSON.stringify(
          updatedTrips.map((t) => ({ ...t.tripDetails, id: t.id })),
        ),
      );
    } catch {}
    setTrips(updatedTrips);
    setTripsVersion((v) => v + 1);
  };

  const toggleOpen = (id: string) => {
    setOpenTripIds((prev) =>
      prev.has(id) ? new Set<string>() : new Set<string>([id]),
    );
  };

  const addTrip = (id: string) => {
    const sessionTrips = JSON.parse(sessionStorage.getItem("trips") || "[]")
    if (sessionTrips.length > 0 && sessionTrips.length == trips.length) {
      const updatedTrips = sessionTrips.map((trip: any) => {
        return { id: trip.id, tripDetails: trip }
      })

      const lastTrip = sessionTrips[sessionTrips.length - 1];
      let prevDate = lastTrip.tripStartDate;


      if (prevDate) {
        const date = new Date(lastTrip.tripStartDate);
        prevDate = new Date(date.setDate(date.getDate() + 1)).toString();
      }

      const newTrip = {
        ...lastTrip,
        id,
        tripStartDate: prevDate
      }
      const updatedSessionTrips = [...sessionTrips, newTrip]
      sessionStorage.setItem("trips", JSON.stringify(updatedSessionTrips))
      updatedTrips.push({ id: newTrip.id, tripDetails: newTrip })
      setTrips(updatedTrips);

    } else {
      setTrips((prev) => [...prev, { id }]);

    }
    setIsTripFormComplete(false);
    setOpenTripIds(new Set([id]));
  };

  const deleteTrip = async (idToDelete: string) => {
    const trips: TripDetails[] = JSON.parse(
      sessionStorage.getItem("trips") || "[]"
    );
    const updatedTrips = trips.filter((trip) => trip.id !== idToDelete);

    sessionStorage.setItem("trips", JSON.stringify(updatedTrips));

    setTrips((prev) => prev.filter((trip) => trip.id !== idToDelete));
    setOpenTripIds((prev) => {
      const updated = new Set(prev);
      updated.delete(idToDelete);
      return updated;
    });
    const bookingTypes: string[] = [];
    updatedTrips.forEach((trip) => {
      trip.bookingType && bookingTypes.push(trip.bookingType);
    });
  };

  const onChangeTrip = (id: string, details: TripDetails) => {
    setTrips((prevTrips) => {
      return prevTrips.map((trip) => {
        if (trip.id === id) {
          const currentTripDetails = trip.tripDetails || {};
          return {
            ...trip,
            tripDetails: { ...currentTripDetails, ...details },
          };
        }
        return trip;
      });
    });
  };

  useEffect(() => {
    const requiredFields: (keyof TripDetails)[] = [
      "bookingType",
      "tripStartDate",
      "tripStartTime",
      "pickupLocation",
      "dropoffLocation",
      "dropoffCoordinates",
      "pickupCoordinates",
    ];
    const missingFields: { id: string; fields: string[] }[] = [];

    for (const trip of trips) {
      const tripId = trip.id;
      const details = trip.tripDetails;

      const fields: (keyof TripDetails)[] = [];

      if (!details) {
        continue;
      }

      for (const field of requiredFields) {
        if (!(field in details) || !details[field]) {
          fields.push(field);
        }
      }
      if (fields.length >= 1) missingFields.push({ id: tripId, fields });
    }
    setMissingByTrip(missingFields);
    setIsTripFormComplete(missingFields.length === 0);
  }, [trips]);

  const generateNextTripId = () => {
    const trips = JSON.parse(sessionStorage.getItem("trips") || "[]");

    if (trips.length === 0) return "trip-1";

    const max = Math.max(
      ...trips.map((t: any) => {
        const num = Number(t.id.split("-")[1]);
        return isNaN(num) ? 0 : num;
      })
    );
    return `trip-${max + 1}`;
  }

  return {
    setTrips,
    trips,
    deleteTrip,
    openTripIds,
    toggleOpen,
    onChangeTrip,
    addTrip,
    isTripFormsComplete,
    setIsTripFormComplete,
    missingByTrip,
    generateNextTripId,
    tripsVersion,
    applyToAllTrips,
    setNumberOfDays,
    sameForAllDays,
    setSameForAllDays,
    applySharedPlanChange,
  };
};
