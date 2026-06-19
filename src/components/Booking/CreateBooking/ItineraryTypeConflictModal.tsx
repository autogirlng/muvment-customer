"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import { BookingTypeKind } from "@/utils/bookingTypeRules";

export interface TypeConflict {
  kind: Exclude<BookingTypeKind, "per_day">;
  value: string;
  typeName: string;
  via: "shared" | "per_day";
}

export interface ConflictDay {
  label: string;
  dateLabel?: string;
}

interface Props {
  conflict: TypeConflict | null;
  days: ConflictDay[];
  onSingleDay: () => void;
  onOneSpecificDay: (dayIndex: number) => void;
  onMonthly: () => void;
  onCancel: () => void;
}

export default function ItineraryTypeConflictModal({
  conflict,
  days,
  onSingleDay,
  onOneSpecificDay,
  onMonthly,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<"choices" | "pick">("choices");
  const [selected, setSelected] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Reset to the first screen whenever a new conflict appears.
  useEffect(() => {
    if (conflict) {
      setMode("choices");
      setSelected(0);
    }
  }, [conflict?.value]);

  useEffect(() => {
    if (conflict) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [conflict]);

  if (!conflict) return null;
  if (typeof document === "undefined") return null;

  const { kind, typeName } = conflict;
  const isMonthly = kind === "whole_booking";
  const showArrows = days.length > 3;

  const scrollBy = (dir: number) =>
    scrollerRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });

  const primaryBtn =
    "w-full rounded-full bg-[#0673FF] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6]";
  const outlineBtn =
    "w-full rounded-full border border-[#0673FF] py-3.5 text-sm font-semibold text-[#0673FF] transition-colors hover:bg-[#EAF2FF]";
  const ghostBtn =
    "w-full rounded-full py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50";

  const title =
    mode === "pick"
      ? `Which day is the ${typeName}?`
      : isMonthly
        ? `${typeName} covers one booking`
        : `${typeName} is a single trip`;

  const content = (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative z-[10001] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start gap-4 px-6 pt-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#0673FF]">
            <FiAlertCircle className="h-6 w-6" />
          </span>
          <h2 className="min-w-0 flex-1 pt-1 text-lg font-bold leading-tight text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="-mr-1.5 -mt-1.5 shrink-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-3">
          {mode === "choices" ? (
            <>
              <p className="text-sm leading-relaxed text-gray-600">
                {isMonthly
                  ? `A ${typeName.toLowerCase()} runs as one continuous booking, not separate days. Switch your ${days.length}-day plan to a single ${typeName.toLowerCase()}?`
                  : `${typeName} is a one-time transfer, not a daily plan. Book it on its own as a single day, or keep your days and set just one of them to ${typeName}.`}
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                {isMonthly ? (
                  <button type="button" onClick={onMonthly} className={primaryBtn}>
                    Switch to a single {typeName.toLowerCase()}
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={onSingleDay} className={primaryBtn}>
                      Use a single day
                    </button>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMode("pick")}
                        className={outlineBtn}
                      >
                        Make one day {typeName}, keep the rest
                      </button>
                    )}
                  </>
                )}
                <button type="button" onClick={onCancel} className={ghostBtn}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-gray-600">
                Pick the day for your {typeName.toLowerCase()}. Every other day
                keeps your current plan.
              </p>

              <div className="mt-4 flex items-center gap-2">
                {showArrows && (
                  <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    aria-label="Scroll left"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC] text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div
                  ref={scrollerRef}
                  className="flex flex-1 snap-x gap-2.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {days.map((d, i) => {
                    const active = i === selected;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelected(i)}
                        className={`relative flex h-[84px] w-[88px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border-2 transition-colors ${
                          active
                            ? "border-[#0673FF] bg-[#EAF2FF]"
                            : "border-[#E4E7EC] bg-white hover:border-[#0673FF]/40"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0673FF] text-white">
                            <FiCheck className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <span
                          className={`text-sm font-bold ${
                            active ? "text-[#0673FF]" : "text-gray-800"
                          }`}
                        >
                          {d.label}
                        </span>
                        {d.dateLabel && (
                          <span
                            className={`mt-0.5 text-[11px] leading-tight ${
                              active ? "text-[#0560d6]" : "text-gray-400"
                            }`}
                          >
                            {d.dateLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {showArrows && (
                  <button
                    type="button"
                    onClick={() => scrollBy(1)}
                    aria-label="Scroll right"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC] text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onOneSpecificDay(selected)}
                  className={primaryBtn}
                >
                  Set {days[selected]?.label || "this day"} as {typeName}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("choices")}
                  className={ghostBtn}
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
