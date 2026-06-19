export type BookingTypeKind = "per_day" | "single_day" | "whole_booking";

// Classify a booking type by how it fits a multi-day itinerary, using its
// display name. Hourly and daily plans repeat per day. Airport, interstate, and
// boat trips are single occurrences that cannot be the plan for every day.
// Monthly covers one continuous period, so the day count does not apply.
export function classifyBookingTypeName(name?: string): BookingTypeKind {
  const n = String(name || "").toLowerCase();
  if (n.includes("month")) return "whole_booking";
  if (n.includes("airport")) return "single_day";
  if (n.includes("interstate")) return "single_day";
  if (n.includes("boat")) return "single_day";
  return "per_day";
}

export function kindFromValue(
  value: string | undefined,
  options: { value: string; option: string }[] | undefined,
): BookingTypeKind {
  if (!value) return "per_day";
  const name = options?.find((o) => o.value === value)?.option;
  return classifyBookingTypeName(name);
}

export const isMultiDayRepeatable = (
  value: string | undefined,
  options: { value: string; option: string }[] | undefined,
): boolean => kindFromValue(value, options) === "per_day";
