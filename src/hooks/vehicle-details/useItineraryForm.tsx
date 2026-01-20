import { useState, useEffect } from "react";
import { Trips, TripDetails } from "@/types/vehicleDetails";

export const useItineraryForm = () => {
  const [trips, setTrips] = useState<Trips[]>([]);

  const [openTripIds, setOpenTripIds] = useState<Set<string>>(() => {
    const allIds = trips.map((trip) => trip.id);
    return new Set(allIds);
  });
  const [isTripFormsComplete, setIsTripFormComplete] = useState<boolean>(false);

  const toggleOpen = (id: string) => {
    setOpenTripIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addTrip = (id: string) => {
    const sessionTrips = JSON.parse(sessionStorage.getItem("trips") || "[]")
    if (sessionTrips.length > 0 && sessionTrips.length == trips.length) {
      const updatedTrips = sessionTrips.map((trip: any) => {
        return { id: trip.id, tripDetails: trip }
      })
      const newTrip = { id, tripDetails: sessionTrips[0] }
      sessionStorage.setItem("trips", JSON.stringify([...sessionTrips, { ...newTrip.tripDetails, id: newTrip.id }]))
      updatedTrips.push(newTrip)
      setTrips(updatedTrips)
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
    setIsTripFormComplete(missingFields.length === 0);
  }, [trips]);

  return {
    setTrips,
    trips,
    deleteTrip,
    openTripIds,
    toggleOpen,
    onChangeTrip,
    addTrip,
    isTripFormsComplete,
  };
};
