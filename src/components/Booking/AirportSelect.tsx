"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlane } from "react-icons/fa";
import { SUPPORTED_AIRPORTS } from "@/data/airports";

type Props = {
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onSelect: (
    airport: { name: string; lat: number; lng: number } | null,
  ) => void;
};

/**
 * Airport picker for the booking details form. The list is fixed, the same one
 * the search form offers, so a customer can only choose a terminal we actually
 * serve and the coordinates are always exact. Typing filters on the airport
 * name, city and the codes people actually use, so "MM2" or "Ikeja" both find
 * the Lagos domestic terminal.
 */
export default function AirportSelect({
  value,
  disabled,
  placeholder = "Choose an airport",
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUPPORTED_AIRPORTS;
    return SUPPORTED_AIRPORTS.filter((a) =>
      `${a.name} ${a.city} ${a.code} ${a.keywords}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div ref={boxRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-left text-sm ${
          disabled ? "cursor-not-allowed bg-gray-50" : "bg-white"
        }`}
      >
        <span className={`truncate ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <FaPlane className="ml-2 flex-shrink-0 text-gray-400" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search airports (e.g. Lagos, MM2)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0673ff] focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-500">
                No airport matches that. Try a city like Lagos or Abuja.
              </p>
            ) : (
              results.map((a) => (
                <button
                  key={a.code}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect({ name: a.name, lat: a.lat, lng: a.lng });
                    setQuery("");
                    setOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left hover:bg-[#F5F8FD]"
                >
                  <span className="block text-sm text-gray-800">{a.name}</span>
                  <span className="block text-xs text-gray-500">{a.city}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
