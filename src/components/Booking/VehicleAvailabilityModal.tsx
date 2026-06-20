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
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth(), t.getDate());
};

// For a from/to date range the whole day must be free, so only fully
// available days can be selected. PARTIALLY_BOOKED can mean zero free hours
// (for example a full day maintenance block), so it is shown but not selectable.
const isSelectableStatus = (s?: DayStatus) => s === "AVAILABLE";

const VehicleAvailabilityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleIdentifier,
  vehicleName,
  slug,
  bookingType,
  vehicleTypeName,
}) => {
  const router = useRouter();

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [dayMap, setDayMap] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
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
      const res = await VehicleSearchService.getVehicleAvailability({
        searchTerm: vehicleIdentifier || vehicleName,
        startDate: start,
        endDate: end,
        size: 20,
      });
      const list: any[] = res?.data?.data?.content || [];
      const match =
        list.find((v) => v.vehicleId === vehicleId) || list[0] || null;
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
      setNote(null);
      setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const today = todayStr();
  const canGoPrev = !(y === now.getFullYear() && m === now.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    setViewMonth(new Date(y, m - 1, 1));
  };
  const goNext = () => setViewMonth(new Date(y, m + 1, 1));

  const rangeHasBlockedDay = (a: string, b: string) => {
    const [start, end] = a <= b ? [a, b] : [b, a];
    const cur = new Date(`${start}T00:00:00`);
    const stop = new Date(`${end}T00:00:00`);
    while (cur <= stop) {
      const key = fmt(cur.getFullYear(), cur.getMonth(), cur.getDate());
      const info = dayMap[key];
      // Only block on days we have data for; unknown days are validated on booking.
      if (info && !isSelectableStatus(info.status)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const onDayClick = (dateStr: string) => {
    const info = dayMap[dateStr];
    const past = dateStr < today;
    if (past || (info && !isSelectableStatus(info.status))) return;

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
      setNote("That range includes a day that is not fully available. Pick dates that are free.");
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }
    setRangeEnd(dateStr);
  };

  const inRange = (dateStr: string) => {
    if (rangeStart && rangeEnd)
      return dateStr >= rangeStart && dateStr <= rangeEnd;
    return dateStr === rangeStart;
  };

  const dotColor = (s?: DayStatus) => {
    if (s === "AVAILABLE") return "#16a34a";
    if (s === "PARTIALLY_BOOKED") return "#d97706";
    if (s === "FULLY_BOOKED") return "#dc2626";
    return "#9ca3af";
  };

  const handleBook = () => {
    if (!rangeStart) return;
    const start = rangeStart;
    const end = rangeEnd || rangeStart;
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    params.set("startDate", start);
    params.set("endDate", end);
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
    if (!rangeStart) return "Select your dates";
    const fmtNice = (s: string) =>
      new Date(`${s}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    if (!rangeEnd || rangeEnd === rangeStart)
      return `${fmtNice(rangeStart)} (1 day)`;
    const days =
      Math.round(
        (new Date(`${rangeEnd}T00:00:00`).getTime() -
          new Date(`${rangeStart}T00:00:00`).getTime()) /
          86400000,
      ) + 1;
    return `${fmtNice(rangeStart)} to ${fmtNice(rangeEnd)} (${days} days)`;
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
              const selectable = !past && isSelectableStatus(info?.status);
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
            Only fully available days can be selected. Hover a day to see its
            status.
          </p>
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
            disabled={!rangeStart}
            className="flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
            style={rangeStart ? { backgroundColor: BRAND } : undefined}
          >
            Book these dates
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleAvailabilityModal;
