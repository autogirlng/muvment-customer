import React, { JSX, useEffect, useRef, useState } from "react";
import { FiClock, FiHome, FiMapPin } from "react-icons/fi"; // ⏰ import your icon
export const getLocationIcon = (iconType: string, locationType: string) => {
  // If it's a Google location, always use map pin
  if (locationType === "google") return <FiMapPin size={18} />;

  const iconMap: Record<string, JSX.Element> = {
    location: <FiMapPin size={18} />,
    clock: <FiClock size={18} />,
    home: <FiHome size={18} />,
  };

  // Default to map pin if the iconType isn't found
  return iconMap[iconType] ?? <FiMapPin size={18} />;
};

export const buildSearchUrl = (
  searchValue: string,
  fromDateValue: Date | null,
  fromTimeValue: Date | null,
  untilDateValue: Date | null,
  untilTimeValue: Date | null
): string => {
  const params = new URLSearchParams({ search: searchValue });

  const { startDateTime, endDateTime } = combineDateTime(
    fromDateValue?.toISOString() || "",
    fromTimeValue?.toISOString() || "",
    untilDateValue?.toISOString() || "",
    untilTimeValue?.toISOString() || ""
  );

  params.set("startDateTime", startDateTime);
  params.set("endDateTime", endDateTime);

  return `/explore/search?${params.toString()}`;
};

export function combineDateTime(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): { startDateTime: string; endDateTime: string } {
  // Helper function to combine date and time
  const combine = (dateStr: string, timeStr: string): string => {
    const datePart = new Date(dateStr).toISOString().split("T")[0];
    const timePart = new Date(timeStr).toISOString().split("T")[1];
    return `${datePart}T${timePart}`;
  };

  return {
    startDateTime: combine(startDate, startTime),
    endDateTime: combine(endDate, endTime),
  };
}
