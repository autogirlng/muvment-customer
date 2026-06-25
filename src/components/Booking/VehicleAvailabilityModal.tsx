"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

const BRAND = "#0673FF";

type DayStatus =
  | "AVAILABLE"
  | "PARTIALLY_BOOKED"
  | "FULLY_BOOKED"
  | "UNAVAILABLE";

interface DayInfo {
  status: DayStatus;
  summary?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleIdentifier?: string;
  vehicleName?: string;
  slug?: string;
  bookingType?: string;
  vehicleTypeName?: string;
  onConfirm?: (ranges: { start: string; end: string }[]) => void;
  initialRanges?: { start: string; end: string }[];
  requireFullDay?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth(), t.getDate());
};

// Booked and unavailable days cannot be selected. A partially booked day is
// selectable because the booking flow lets the customer pick from the free
// hours on that day via the per-day time slots.
const isSelectableStatus = (s?: DayStatus) =>
  s === "AVAILABLE" || s === "PARTIALLY_BOOKED";

const VehicleAvailabilityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleIdentifier,
  vehicleName,
  slug,
  bookingType,
  vehicleTypeName,
  onConfirm,
  initialRanges,
  requireFullDay,
}) => {
  const router = useRouter();

  // Interstate legs occupy whole days, so a partially booked day cannot hold
  // them. When requireFullDay is set, only fully available days are selectable.
  const isSelectable = (s?: DayStatus) =>
    requireFullDay ? s === "AVAILABLE" : isSelectableStatus(s);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [dayMap, setDayMap] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [committed, setCommitted] = useState<{ start: string; end: string }[]>(
    [],
  );
  const [note, setNote] = useState<string | null>(null);

  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const loadMonth = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    try {
      const start = fmt(y, m, 1);
      const lastDay = new Date(y, m + 1, 0).getDate();
      const end = fmt(y, m, lastDay);
      const res = await VehicleSearchService.getVehicleAvailabilityRange(
        vehicleId,
        start,
        end,
      );
      const match = res?.data?.data || null;
      const map: Record<string, DayInfo> = {};
      (match?.availability || []).forEach((d: any) => {
        if (d?.date) map[d.date] = { status: d.status, summary: d.summary };
      });
      setDayMap(map);
    } catch (e) {
      setError("Could not load availability. Please try again.");
      setDayMap({});
    } finally {
      setLoading(false);
    }
  }, [isOpen, y, m, vehicleId, vehicleIdentifier, vehicleName]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    if (isOpen) {
      setRangeStart(null);
      setRangeEnd(null);
      const seed = initialRanges || [];
      setCommitted(seed);
      setNote(null);
      const firstStart = seed.length ? seed[0].start : null;
      const base = firstStart ? new Date(`${firstStart}T00:00:00`) : now;
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Once availability for the visible month loads, drop any pre-filled range that
  // crosses a day this vehicle cannot take, so a seeded selection never shows a
  // booked or unavailable day as chosen.
  useEffect(() => {
    if (Object.keys(dayMap).length === 0) return;
    const hasUnavailable = (a: string, b: string) => {
      const [s, e] = a <= b ? [a, b] : [b, a];
      const cur = new Date(`${s}T00:00:00`);
      const stop = new Date(`${e}T00:00:00`);
      while (cur <= stop) {
        const key = fmt(cur.getFullYear(), cur.getMonth(), cur.getDate());
        const info = dayMap[key];
        if (info && !isSelectable(info.status)) return true;
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    };
    setCommitted((prev) => prev.filter((r) => !hasUnavailable(r.start, r.end)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayMap]);

  if (!isOpen) return null;

  const today = todayStr();
  const canGoPrev = !(y === now.getFullYear() && m === now.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    setViewMonth(new Date(y, m - 1, 1));
  };
  const goNext = () => setViewMonth(new Date(y, m + 1, 1));

  const inCommitted = (dateStr: string) =>
    committed.some((r) => dateStr >= r.start && dateStr <= r.end);

  const rangeHasBlockedDay = (a: string, b: string) => {
    const [start, end] = a <= b ? [a, b] : [b, a];
    const cur = new Date(`${start}T00:00:00`);
    const stop = new Date(`${end}T00:00:00`);
    while (cur <= stop) {
      const key = fmt(cur.getFullYear(), cur.getMonth(), cur.getDate());
      const info = dayMap[key];
      // Block on days we have data for, and on days already in another range.
      if (info && !isSelectable(info.status)) return true;
      if (inCommitted(key)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const onDayClick = (dateStr: string) => {
    const info = dayMap[dateStr];
    const past = dateStr < today;
    if (past || inCommitted(dateStr) || (info && !isSelectable(info.status)))
      return;

    setNote(null);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }
    if (dateStr === rangeStart) return;
    if (dateStr < rangeStart) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }
    if (rangeHasBlockedDay(rangeStart, dateStr)) {
      setNote("That range includes a booked or unavailable day. Pick dates that are free.");
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }
    setRangeEnd(dateStr);
  };

  const inRange = (dateStr: string) => {
    if (inCommitted(dateStr)) return true;
    if (rangeStart && rangeEnd)
      return dateStr >= rangeStart && dateStr <= rangeEnd;
    return dateStr === rangeStart;
  };

  const daysBetween = (a: string, b: string) =>
    Math.round(
      (new Date(`${b}T00:00:00`).getTime() -
        new Date(`${a}T00:00:00`).getTime()) /
        86400000,
    ) + 1;

  const allRanges = (): { start: string; end: string }[] => {
    const r = [...committed];
    if (rangeStart) r.push({ start: rangeStart, end: rangeEnd || rangeStart });
    return r.sort((x, y) => x.start.localeCompare(y.start));
  };

  const totalDays = allRanges().reduce(
    (sum, r) => sum + daysBetween(r.start, r.end),
    0,
  );

  const addAnotherRange = () => {
    if (!rangeStart) return;
    setCommitted((prev) =>
      [...prev, { start: rangeStart, end: rangeEnd || rangeStart }].sort((a, b) =>
        a.start.localeCompare(b.start),
      ),
    );
    setRangeStart(null);
    setRangeEnd(null);
    setNote(null);
  };

  const removeRange = (i: number) =>
    setCommitted((prev) => prev.filter((_, idx) => idx !== i));

  const dotColor = (s?: DayStatus) => {
    if (s === "AVAILABLE") return "#16a34a";
    if (s === "PARTIALLY_BOOKED") return "#d97706";
    if (s === "FULLY_BOOKED") return "#dc2626";
    return "#9ca3af";
  };

  const handleBook = () => {
    const ranges = allRanges();
    if (ranges.length === 0) return;

    if (onConfirm) {
      onConfirm(ranges);
      onClose();
      return;
    }

    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (ranges.length === 1) {
      params.set("startDate", ranges[0].start);
      params.set("endDate", ranges[0].end);
      params.delete("ranges");
    } else {
      params.set(
        "ranges",
        ranges.map((r) => `${r.start}:${r.end}`).join(","),
      );
      params.set("startDate", ranges[0].start);
      params.set("endDate", ranges[ranges.length - 1].end);
    }
    if (vehicleTypeName) params.set("vehicleType", vehicleTypeName);
    if (bookingType) params.set("bookingType", bookingType);
    router.push(`/booking/details/${slug || vehicleId}?${params.toString()}`);
  };

  const startWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prettyRange = () => {
    const ranges = allRanges();
    if (ranges.length === 0) return "Select your dates";
    const fmtNice = (s: string) =>
      new Date(`${s}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    if (ranges.length === 1) {
      const r = ranges[0];
      if (r.end === r.start) return `${fmtNice(r.start)} (1 day)`;
      return `${fmtNice(r.start)} to ${fmtNice(r.end)} (${daysBetween(
        r.start,
        r.end,
      )} days)`;
    }
    return `${ranges.length} ranges (${totalDays} days)`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="h-5 w-5" style={{ color: BRAND }} />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Availability
              </h3>
              {vehicleName && (
                <p className="text-xs text-gray-500">{vehicleName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {monthLabel}
            </span>
            <button
              onClick={goNext}
              aria-label="Next month"
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-[11px] font-medium text-gray-400">
                {w}
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-7 gap-1">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div
                  className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: BRAND, borderTopColor: "transparent" }}
                />
              </div>
            )}
            {cells.map((d, i) => {
              if (d === null) return <div key={`e-${i}`} />;
              const dateStr = fmt(y, m, d);
              const info = dayMap[dateStr];
              const past = dateStr < today;
              const selectable = !past && isSelectable(info?.status);
              const selected = inRange(dateStr);
              const isEnd =
                dateStr === rangeStart ||
                (rangeEnd && dateStr === rangeEnd);

              return (
                <button
                  key={dateStr}
                  onClick={() => onDayClick(dateStr)}
                  disabled={!selectable}
                  title={info?.summary || ""}
                  className={[
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition",
                    selected ? "text-white" : "text-gray-800",
                    !selectable
                      ? "cursor-not-allowed text-gray-400"
                      : "hover:bg-[#EAF2FF]",
                  ].join(" ")}
                  style={
                    selected
                      ? {
                          backgroundColor: isEnd ? BRAND : "#cfe0fb",
                          color: isEnd ? "#fff" : "#0b3a86",
                        }
                      : undefined
                  }
                >
                  <span>{d}</span>
                  {!selected && (
                    <span
                      className="mt-0.5 h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: past
                          ? "transparent"
                          : dotColor(info?.status),
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
              {error}
            </p>
          )}
          {note && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
              {note}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#16a34a" }}
              />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#d97706" }}
              />
              Partly booked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#dc2626" }}
              />
              Booked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#9ca3af" }}
              />
              Unavailable
            </span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            {requireFullDay
              ? "Only fully available days can be selected. Booked, partly booked, and unavailable days are greyed out. Hover a day to see its status."
              : "Booked and unavailable days cannot be selected. On a partly booked day you choose from the free hours at the next step. Hover a day to see its status."}
          </p>

          {(committed.length > 0 || rangeStart) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {committed.map((r, i) => {
                const lbl = (s: string) =>
                  new Date(`${s}T00:00:00`).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                return (
                  <span
                    key={`${r.start}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[11px] font-medium text-[#0b3a86]"
                  >
                    {lbl(r.start)}
                    {r.end !== r.start ? ` - ${lbl(r.end)}` : ""}
                    <button
                      type="button"
                      onClick={() => removeRange(i)}
                      aria-label="Remove range"
                      className="text-[#0b3a86]/70 hover:text-[#0b3a86]"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {rangeStart && (
                <button
                  type="button"
                  onClick={addAnotherRange}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#0673FF] px-2.5 py-1 text-[11px] font-medium text-[#0673FF] hover:bg-[#EAF2FF]"
                >
                  + Add another range
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-gray-400">Selected</p>
            <p className="truncate text-sm font-medium text-gray-900">
              {prettyRange()}
            </p>
          </div>
          <button
            onClick={handleBook}
            disabled={allRanges().length === 0}
            className="flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
            style={allRanges().length > 0 ? { backgroundColor: BRAND } : undefined}
          >
            {onConfirm ? "Use these dates" : "Book these dates"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleAvailabilityModal;
