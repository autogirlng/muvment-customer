"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CityArea } from "@/data/lagosAreas";
import { useGoogleMaps } from "@/components/general/forms/GoogleMapsLocationInput";
import { GOOGLE_PLACES_COUNTRY_RESTRICTION } from "@/context/Constarain";

export interface SelectedArea {
  name: string;
  lat: number | null;
  lng: number | null;
  isOutskirts: boolean;
  custom?: boolean;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

type AreaOfUseSelectProps = {
  areas: CityArea[];
  value: SelectedArea[];
  onChange: (areas: SelectedArea[]) => void;
  city?: string;
  disabled?: boolean;
};

const AreaOfUseSelect = ({
  areas,
  value,
  onChange,
  city,
  disabled,
}: AreaOfUseSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const valueRef = useRef(value);
  const autoServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const apiLoaded = useGoogleMaps(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (apiLoaded && window.google && !autoServiceRef.current) {
      autoServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      );
    }
  }, [apiLoaded]);

  const has = (name: string) =>
    value.some((v) => v.name.toLowerCase() === name.toLowerCase());

  const addArea = (a: SelectedArea) => {
    if (has(a.name)) return;
    onChange([...valueRef.current, a]);
  };

  const remove = (name: string) =>
    onChange(
      valueRef.current.filter(
        (v) => v.name.toLowerCase() !== name.toLowerCase(),
      ),
    );

  const toggleCurated = (a: CityArea) => {
    if (has(a.name)) {
      remove(a.name);
      return;
    }
    addArea({
      name: a.name,
      lat: a.lat,
      lng: a.lng,
      isOutskirts: a.isOutskirts,
    });
  };

  const fetchPredictions = (input: string) => {
    if (!autoServiceRef.current || !input.trim()) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }
    autoServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: GOOGLE_PLACES_COUNTRY_RESTRICTION },
        types: ["establishment", "geocode"],
      },
      (results: any, status: any) => {
        setIsSearching(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      },
    );
  };

  const handleQuery = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const selectPrediction = (pred: PlacePrediction) => {
    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      { placeId: pred.place_id, fields: ["name", "formatted_address", "geometry"] },
      (place: any, status: any) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const lat = place.geometry?.location?.lat() ?? null;
          const lng = place.geometry?.location?.lng() ?? null;
          const name =
            place.name ||
            pred.structured_formatting?.main_text ||
            pred.description;
          addArea({ name, lat, lng, isOutskirts: false, custom: true });
          setQuery("");
          setPredictions([]);
        }
      },
    );
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setPredictions([]);
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? areas.filter((a) => a.name.toLowerCase().includes(q))
    : areas;
  const hasOutskirts = value.some((v) => v.isOutskirts);

  const chip = (v: SelectedArea) => (
    <span
      key={v.name}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        v.isOutskirts
          ? "bg-[#FAEEDA] text-[#854F0B]"
          : "bg-[#EAF2FF] text-[#0673ff]"
      }`}
    >
      {v.name}
      {v.isOutskirts ? " · outskirts" : ""}
      <button
        type="button"
        onClick={() => remove(v.name)}
        className="opacity-70 transition-opacity hover:opacity-100"
        aria-label={`Remove ${v.name}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );

  return (
    <div className="w-full">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">{value.map(chip)}</div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className="flex h-[48px] w-full items-center gap-2 rounded-[12px] border border-gray-300 bg-white px-3 text-left text-sm text-gray-400 transition-colors hover:border-gray-400 disabled:opacity-60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <span className="flex-1 truncate">
          {value.length ? "Add or edit areas" : "Search and add areas"}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-400"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {hasOutskirts && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-snug text-[#854F0B]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" />
          </svg>
          Some selected areas are outskirts and may add a surcharge, shown when
          you estimate the price.
        </p>
      )}

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={close}
              aria-hidden
            />
            <div className="relative z-[10000] flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">
                    Area of use
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Pick from common areas, or search any location. Add as many
                    as you like.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 pb-2">
                <div className="relative">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => handleQuery(e.target.value)}
                    placeholder="Search any area or place..."
                    className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0673FF]"
                  />
                </div>
                {value.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {value.map(chip)}
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                {filtered.map((a) => {
                  const sel = has(a.name);
                  return (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => toggleCurated(a)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border ${
                            sel
                              ? "border-transparent bg-[#0673ff] text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {sel && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate text-sm text-gray-800">
                          {a.name}
                        </span>
                      </span>
                      {a.isOutskirts && (
                        <span className="shrink-0 rounded-full bg-[#FAEEDA] px-2 py-0.5 text-[11px] font-medium text-[#854F0B]">
                          Outskirts · may add fee
                        </span>
                      )}
                    </button>
                  );
                })}

                {q && (predictions.length > 0 || isSearching) && (
                  <div className="mt-1 border-t border-gray-100 pt-1">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Other locations
                    </p>
                    {isSearching && predictions.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-400">
                        Searching locations...
                      </p>
                    )}
                    {predictions.map((pred) => (
                      <button
                        key={pred.place_id}
                        type="button"
                        onClick={() => selectPrediction(pred)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 text-gray-400"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-gray-800">
                            {pred.structured_formatting?.main_text ||
                              pred.description}
                          </span>
                          {pred.structured_formatting?.secondary_text && (
                            <span className="block truncate text-xs text-gray-400">
                              {pred.structured_formatting.secondary_text}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {q &&
                  filtered.length === 0 &&
                  predictions.length === 0 &&
                  !isSearching && (
                    <p className="px-3 py-6 text-center text-sm text-gray-400">
                      No matches. Try a different search.
                    </p>
                  )}

                {!q && filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-gray-400">
                    Search any location above to add it.
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 p-4">
                <button
                  type="button"
                  onClick={close}
                  className="h-11 w-full rounded-xl bg-[#0673ff] text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Done{value.length ? ` · ${value.length} selected` : ""}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AreaOfUseSelect;
