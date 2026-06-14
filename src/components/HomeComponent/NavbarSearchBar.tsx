"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingSearchBar } from "./BookingInterface";

// Keys on the search-defining params only (not the sidebar filters), so the bar
// re-syncs when the search itself changes (for example after the interstate
// prompt switches the trip), without remounting on every filter tweak.
const SYNC_PARAMS = [
  "lat",
  "lng",
  "location",
  "bookingType",
  "destinationStateId",
  "category",
  "startDate",
  "startTime",
  "endDate",
  "endTime",
];

const KeyedBookingSearchBar = () => {
  const sp = useSearchParams();
  const syncKey = SYNC_PARAMS.map((k) => sp.get(k) ?? "").join("|");
  return <BookingSearchBar key={syncKey} />;
};

export const NavbarSearchBar = () => (
  <Suspense fallback={null}>
    <KeyedBookingSearchBar />
  </Suspense>
);
