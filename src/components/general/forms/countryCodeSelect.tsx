"use client";

import { useEffect, useRef, useState } from "react";
import { allowedCountries } from "./icons";

type CountryCodeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  buttonClassName?: string;
};

const CountryCodeSelect = ({
  value,
  onChange,
  error,
  disabled,
  buttonClassName,
}: CountryCodeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = allowedCountries.find((c) => c.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? allowedCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.option.toLowerCase().includes(q) ||
          c.value.toLowerCase().includes(q),
      )
    : allowedCountries;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={
          buttonClassName ||
          `flex items-center justify-between w-full h-[56px] px-4 rounded-[12px] border bg-white text-sm outline-none transition-colors focus:ring-2 focus:ring-[#0673FF] disabled:opacity-60 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-300"
          }`
        }
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.flag}
              <span className="font-medium">{selected.option}</span>
            </>
          ) : (
            <span className="text-gray-400">+234</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
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
        <div className="absolute z-50 top-full left-0 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0673FF]"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onChange(c.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    c.value === value
                      ? "bg-blue-50 text-[#0673ff]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {c.flag}
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-gray-500">{c.option}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-gray-400">
                No match found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;
