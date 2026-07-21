import { format } from "date-fns";

// Booking trip times and dates arrive in more than one shape depending on where
// they were created: a full date string (Date.toString), an ISO string, or a
// bare "HH:mm" time. new Date("14:00") is an Invalid Date, and passing that to
// date-fns format throws "Invalid time value", which crashed the booking
// summary. These helpers accept any of those shapes and never throw, returning a
// fallback instead so a display value can never break the page.

const toValidDate = (input: unknown): Date | null => {
  if (input == null || input === "") return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input !== "string") return null;

  const raw = input.trim();
  if (!raw) return null;

  // Direct parse first (handles full date strings and ISO datetimes).
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct;

  // Bare time like "14:00" or "14:00:00": anchor it to today's date so it
  // becomes a valid Date we can format.
  const timeMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const [, hh, mm, ss] = timeMatch;
    const d = new Date();
    d.setHours(Number(hh), Number(mm), ss ? Number(ss) : 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

export const safeFormatDate = (
  input: unknown,
  fmt = "do MMM yyyy",
  fallback = "",
): string => {
  const d = toValidDate(input);
  if (!d) return fallback;
  try {
    return format(d, fmt);
  } catch {
    return fallback;
  }
};

export const safeFormatTime = (
  input: unknown,
  fmt = "hh:mma",
  fallback = "",
): string => {
  const d = toValidDate(input);
  if (!d) return fallback;
  try {
    return format(d, fmt);
  } catch {
    return fallback;
  }
};
