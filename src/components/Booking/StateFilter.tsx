"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { TravelState, buildStateExploreUrl } from "@/types/state";
import { useRouter } from "next/navigation";

interface StateFilterProps {
  states: TravelState[];
  onClose?: () => void;
  compact?: boolean;
}

export default function StateFilter({
  states,
  onClose,
  compact = false,
}: StateFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = states.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.stateName.toLowerCase().includes(q) ||
      s.countryName?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (state: TravelState) => {
    onClose?.();
    router.push(buildStateExploreUrl(state));
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 ${
        compact ? "p-3 w-full" : "p-4 w-80 max-w-[90vw]"
      }`}
    >
      <input
        type="text"
        placeholder="Search state or country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ul className="max-h-64 overflow-y-auto space-y-1">
        {filtered.length === 0 && (
          <li className="text-sm text-gray-500 py-4 text-center">
            No states found
          </li>
        )}
        {filtered.map((state) => (
          <li key={state.stateId}>
            <button
              type="button"
              onClick={() => handleSelect(state)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <FiMapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="font-medium">{state.stateName}</span>
              {state.countryName && (
                <span className="text-gray-400 text-xs ml-auto truncate">
                  {state.countryName}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface StateFilterButtonProps {
  states: TravelState[];
  label?: string;
}

export function StateFilterButton({
  states,
  label = "Destination",
}: StateFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:border-gray-400"
      >
        <FiMapPin className="w-4 h-4 text-blue-500" />
        <span>{label}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <StateFilter states={states} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
