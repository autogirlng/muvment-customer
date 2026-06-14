"use client";

import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./booking-calendar.css";
import {
  FaCar,
  FaCarSide,
  FaBus,
  FaShuttleVan,
  FaPlane,
  FaRoad,
  FaShip,
  FaCheck,
  FaStar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChevronDown,
  FaArrowLeft,
} from "react-icons/fa";
import { DropdownOption } from "@/types/HeroSectionTypes";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { getBookingOption } from "@/context/Constarain";
import { trackVehicleSearch } from "@/services/analytics";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import BackgroundCarousel from "./Backgroundcarousel";

// Search origin used when handing off to the results page. The interstate flow
// supplies its own coordinates from the Google-powered field.
const DEFAULT_LOCATION = { name: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 };

const HERO_IMAGES = [
  "/images/landing/hero-friends.webp",
  "/images/landing/lady-in-car.webp",
  "/images/landing/hero-arrival.webp",
  "/images/landing/lagos-bridge.webp",
];
const HERO_ALTS = [
  "Friends enjoying a chauffeured ride in Lagos with Muvment by Autogirl",
  "Relaxed passenger in a chauffeured car with Muvment by Autogirl",
  "Arriving in style at a Lagos event with a Muvment chauffeur",
  "Car rental in Lagos near the Lekki-Ikoyi Link Bridge",
];

type BookingType = "within-state" | "airport" | "interstate" | "boat";

const TYPES: { id: BookingType; label: string; hint: string; Icon: any }[] = [
  {
    id: "within-state",
    label: "Within state",
    hint: "12h, 24h or monthly",
    Icon: FaCar,
  },
  { id: "airport", label: "Airport", hint: "Pickup or drop-off", Icon: FaPlane },
  {
    id: "interstate",
    label: "Interstate",
    hint: "Between states or countries",
    Icon: FaRoad,
  },
  {
    id: "boat",
    label: "Boat trip",
    hint: "Round trip to a beach or island",
    Icon: FaShip,
  },
];

const DURATIONS = [
  { id: "12h", label: "12h / day" },
  { id: "24h", label: "24h / day" },
  { id: "monthly", label: "Monthly" },
];

function iconForVehicleType(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("suv")) return <FaCarSide />;
  if (n.includes("bus") || n.includes("coaster")) return <FaBus />;
  if (n.includes("van")) return <FaShuttleVan />;
  return <FaCar />;
}

// Airports Muvment operates at. Used for the default suggestions and to check
// that a searched airport is one we serve.
type SupportedAirport = {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  keywords: string;
};

const SUPPORTED_AIRPORTS: SupportedAirport[] = [
  // Lagos: one international terminal and two domestic terminals (GAT and MMA2)
  { code: "LOS-INT", name: "Lagos International (MMIA, Murtala Muhammed)", city: "Lagos", lat: 6.5774, lng: 3.3212, keywords: "los mmia mma1 mm1 murtala muhammed ikeja terminal 1 terminal 2 international" },
  { code: "LOS-MMA2", name: "Lagos Domestic (MMA2)", city: "Lagos", lat: 6.5839, lng: 3.3214, keywords: "los mma2 mm2 bi-courtney murtala muhammed ikeja domestic local terminal 2 ibom dana valuejet air peace" },
  { code: "LOS-GAT", name: "Lagos Domestic (GAT)", city: "Lagos", lat: 6.5836, lng: 3.3210, keywords: "los gat general aviation terminal murtala muhammed ikeja domestic local air peace arik" },
  // Abuja: separate international and domestic terminals
  { code: "ABV-INT", name: "Abuja International (Nnamdi Azikiwe)", city: "Abuja", lat: 9.0067, lng: 7.2631, keywords: "abv nnamdi azikiwe naia international" },
  { code: "ABV-DOM", name: "Abuja Domestic (Nnamdi Azikiwe)", city: "Abuja", lat: 9.0067, lng: 7.2631, keywords: "abv nnamdi azikiwe naia domestic local" },
  // Port Harcourt (Omagwa): international and domestic
  { code: "PHC-INT", name: "Port Harcourt International (Omagwa)", city: "Port Harcourt", lat: 5.0153, lng: 6.9500, keywords: "phc phia omagwa rivers international" },
  { code: "PHC-DOM", name: "Port Harcourt Domestic (Omagwa)", city: "Port Harcourt", lat: 5.0153, lng: 6.9500, keywords: "phc phia omagwa rivers domestic local" },
  // Enugu (Akanu Ibiam): international and domestic
  { code: "ENU-INT", name: "Enugu International (Akanu Ibiam)", city: "Enugu", lat: 6.4739, lng: 7.5611, keywords: "enu akanu ibiam emene international" },
  { code: "ENU-DOM", name: "Enugu Domestic (Akanu Ibiam)", city: "Enugu", lat: 6.4739, lng: 7.5611, keywords: "enu akanu ibiam emene domestic local" },
  // Benin City: single airport, mostly domestic
  { code: "BNI", name: "Benin Airport", city: "Benin City", lat: 6.3169, lng: 5.5995, keywords: "bni benin city ogba domestic local" },
  // Accra (Kotoka): Terminal 3 international, Terminal 2 domestic
  { code: "ACC-T3", name: "Accra International (Kotoka, Terminal 3)", city: "Accra", lat: 5.6061, lng: -0.1682, keywords: "acc kotoka kia ghana terminal 3 t3 international" },
  { code: "ACC-T2", name: "Accra Domestic (Kotoka, Terminal 2)", city: "Accra", lat: 5.6061, lng: -0.1682, keywords: "acc kotoka kia ghana terminal 2 t2 domestic local" },
];

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#0673FF]";
const labelClass = "block text-left text-xs font-medium text-gray-600 mb-1.5";
const toggleClass = (active: boolean) =>
  `flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
    active
      ? "border-[#0673FF] bg-[#0673FF]/5 text-[#0673FF]"
      : "border-gray-200 text-gray-700 hover:border-gray-300"
  }`;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1021px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

// Renders its content as an anchored panel on desktop and a bottom sheet on
// mobile, through a portal so it is never clipped by the hero's overflow.
function Popover({
  open,
  onClose,
  anchorRef,
  children,
  minWidth = 288,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const isDesktop = useIsDesktop();
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !isDesktop) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, minWidth);
      let left = r.left;
      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - width - 8);
      }
      setPos({ top: r.bottom + 6, left, width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, isDesktop, anchorRef, minWidth]);

  if (!open || !mounted) return null;

  if (isDesktop) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-[1000]" onClick={onClose} />
        <div
          className="mv-cal fixed z-[1001] rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
          style={
            pos
              ? { top: pos.top, left: pos.left, width: pos.width }
              : { visibility: "hidden" }
          }
        >
          {children}
        </div>
      </>,
      document.body,
    );
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1000] bg-black/40" onClick={onClose} />
      <div className="mv-cal fixed inset-x-0 bottom-0 z-[1001] max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white p-4 pb-6 shadow-2xl">
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
        >
          Done
        </button>
      </div>
    </>,
    document.body,
  );
}

function SearchOverlay({
  open,
  onClose,
  anchorRef,
  query,
  onQueryChange,
  placeholder,
  children,
  minWidth = 288,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const isDesktop = useIsDesktop();
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !isDesktop) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, minWidth);
      let left = r.left;
      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - width - 8);
      }
      setPos({ top: r.bottom + 6, left, width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, isDesktop, anchorRef, minWidth]);

  // Focus the field's own input once it is in the DOM so the keyboard opens
  // against this view, not the card behind it.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [open]);

  if (!open || !mounted) return null;

  const inputEl = (
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-800 outline-none focus:bg-gray-50"
    />
  );

  if (isDesktop) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-[1000]" onClick={onClose} />
        <div
          className="fixed z-[1001] rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
          style={
            pos
              ? { top: pos.top, left: pos.left, width: pos.width }
              : { visibility: "hidden" }
          }
        >
          <div className="mb-1">{inputEl}</div>
          <div className="max-h-72 overflow-y-auto">{children}</div>
        </div>
      </>,
      document.body,
    );
  }

  // Mobile: full screen with the input pinned at the top. The keyboard rises
  // from the bottom over the empty lower area; results scroll between the two.
  return createPortal(
    <div className="fixed inset-0 z-[1001] flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 p-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="p-1 text-gray-600"
        >
          <FaArrowLeft />
        </button>
        <div className="flex-1">{inputEl}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{children}</div>
    </div>,
    document.body,
  );
}

function SuggestionList({
  items,
  loading,
  error,
  emptyText,
  onPick,
}: {
  items: any[];
  loading: boolean;
  error: string;
  emptyText: string;
  onPick: (item: any) => void;
}) {
  return (
    <div>
      {loading ? (
        <div className="px-3 py-3 text-sm text-gray-500">Searching...</div>
      ) : null}
      {error && !loading ? (
        <div className="px-3 py-2 text-sm text-red-500">{error}</div>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <div className="px-3 py-3 text-sm text-gray-400">{emptyText}</div>
      ) : null}
      {items.map((it) => (
        <button
          key={it.id || it.place_id}
          type="button"
          onClick={() => onPick(it)}
          className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="min-w-0">
            <span className="block truncate text-sm text-gray-800">
              {it.name}
            </span>
            {it.description ? (
              <span className="block truncate text-xs text-gray-500">
                {it.description}
              </span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}

function formatTypeName(raw: string) {
  return String(raw || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function LocationField({
  label,
  placeholder,
  onSelect,
}: {
  label: string;
  placeholder: string;
  onSelect: (
    loc: { name: string; lat: number | null; lng: number | null } | null,
  ) => void;
}) {
  const search = useLocationSearch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleQuery = (q: string) => {
    setQuery(q);
    setDisplay("");
    onSelect(null);
    search.handleSearchInputChange(q);
  };
  const pick = async (item: any) => {
    const sel = await search.handleLocationSelect(item);
    setDisplay(sel.name);
    setQuery(sel.name);
    onSelect({ name: sel.name, lat: sel.lat, lng: sel.lng });
    search.setShowLocationDropdown(false);
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative">
      <label className={labelClass}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={`truncate ${display ? "text-gray-800" : "text-gray-400"}`}>
          {display || placeholder}
        </span>
        <FaMapMarkerAlt className="ml-2 flex-shrink-0 text-gray-400" />
      </button>
      <SearchOverlay
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        query={query}
        onQueryChange={handleQuery}
        placeholder={placeholder}
      >
        <SuggestionList
          items={search.locationSuggestions}
          loading={search.isLoadingPlaces}
          error={search.searchError}
          emptyText={
            query.trim() ? "Keep typing to see places" : "Start typing a place"
          }
          onPick={pick}
        />
      </SearchOverlay>
    </div>
  );
}

function CategoryField({
  options,
  value,
  onChange,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={anchorRef} className="relative">
      <label className={labelClass}>Vehicle type</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon ? (
            <span className="shrink-0 text-base">{selected.icon}</span>
          ) : null}
          <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>
            {selected?.label || "Any vehicle type"}
          </span>
        </span>
        <FaChevronDown className="ml-2 flex-shrink-0 text-gray-400" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        <div className="max-h-[65vh] overflow-y-auto lg:max-h-72">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
          >
            Any vehicle type
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                o.value === value ? "text-[#0673FF]" : "text-gray-800"
              }`}
            >
              {o.icon ? <span className="shrink-0 text-base">{o.icon}</span> : null}
              {o.label}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
}

function AirportField({
  direction,
  userLoc,
  onSelect,
}: {
  direction: "pickup" | "dropoff";
  userLoc: { lat: number; lng: number };
  onSelect: (
    a: { name: string; lat: number | null; lng: number | null } | null,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);

  // The airports Muvment serves, nearest to the user first. This is a fixed
  // list, not a Google lookup, so a selection can never be rejected.
  const ordered = useMemo(
    () =>
      [...SUPPORTED_AIRPORTS].sort(
        (a, b) =>
          distanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) -
          distanceKm(userLoc.lat, userLoc.lng, b.lat, b.lng),
      ),
    [userLoc.lat, userLoc.lng],
  );

  const q = query.trim().toLowerCase();
  const items = (
    q
      ? ordered.filter((a) =>
          `${a.name} ${a.city} ${a.code} ${a.keywords}`
            .toLowerCase()
            .includes(q),
        )
      : ordered
  ).map((a) => ({ id: a.code, place_id: a.code, name: a.name, description: a.city }));

  const pick = (item: any) => {
    const a = SUPPORTED_AIRPORTS.find((x) => x.code === item.id);
    if (a) {
      setDisplay(a.name);
      setQuery(a.name);
      onSelect({ name: a.name, lat: a.lat, lng: a.lng });
    }
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative">
      <label className={labelClass}>
        {direction === "pickup" ? "Destination airport" : "Arrival airport"}
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={`truncate ${display ? "text-gray-800" : "text-gray-400"}`}>
          {display || "Choose an airport"}
        </span>
        <FaPlane className="ml-2 flex-shrink-0 text-gray-400" />
      </button>
      <SearchOverlay
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          setDisplay("");
          onSelect(null);
        }}
        placeholder="Search airports (e.g. Lagos, MM2)"
      >
        <SuggestionList
          items={items}
          loading={false}
          error=""
          emptyText="No airport matches that. Try a city like Lagos or Abuja."
          onPick={pick}
        />
      </SearchOverlay>
    </div>
  );
}

function generateTimeSlots(startHour = 6, endHour = 24, interval = 30) {
  const slots: { value: string; display: string }[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      const v = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const ampm = h >= 12 ? "PM" : "AM";
      const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
      slots.push({
        value: v,
        display: `${String(dh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`,
      });
    }
  }
  return slots;
}

function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const slots = useMemo(() => generateTimeSlots(), []);
  const current = slots.find((s) => s.value === value);
  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {current ? current.display : "Select time"}
        </span>
        <FaChevronDown className="ml-2 flex-shrink-0 text-gray-400" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        <div className="max-h-[65vh] overflow-y-auto lg:max-h-72">
          {slots.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                onChange(s.value);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                s.value === value ? "text-[#0673FF]" : "text-gray-800"
              }`}
            >
              {s.display}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: Date | null;
  onChange: (v: Date) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchorRef} className="relative">
      <label className={labelClass}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value ? format(value, "d MMM yyyy") : "Select date"}
        </span>
        <FaCalendarAlt className="ml-2 flex-shrink-0 text-gray-400" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        <ReactCalendar
          value={value}
          onChange={(v: any) => {
            onChange(v as Date);
            setOpen(false);
          }}
          minDate={minDate || new Date()}
          next2Label={null}
          prev2Label={null}
          className="!border-none !w-full !text-sm"
        />
      </Popover>
    </div>
  );
}

function FromUntilField({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const from: Date | null = Array.isArray(value) ? value[0] || null : null;
  const until: Date | null = Array.isArray(value) ? value[1] || null : null;
  const [openWhich, setOpenWhich] = useState<"from" | "until" | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const untilRef = useRef<HTMLDivElement>(null);
  const boxClass = `${inputClass} flex items-center justify-between text-left`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div ref={fromRef} className="relative">
        <label className={labelClass}>From</label>
        <button
          type="button"
          onClick={() => setOpenWhich("from")}
          className={boxClass}
        >
          <span className={from ? "text-gray-800" : "text-gray-400"}>
            {from ? format(from, "d MMM yyyy") : "Select date"}
          </span>
          <FaCalendarAlt className="ml-2 flex-shrink-0 text-gray-400" />
        </button>
        <Popover
          open={openWhich === "from"}
          onClose={() => setOpenWhich(null)}
          anchorRef={fromRef}
        >
          <ReactCalendar
            value={from}
            onChange={(v: any) => {
              const nextFrom = v as Date;
              const keepUntil = until && until > nextFrom ? until : null;
              onChange([nextFrom, keepUntil]);
              setOpenWhich(null);
            }}
            minDate={new Date()}
            next2Label={null}
            prev2Label={null}
            className="!border-none !w-full !text-sm"
          />
        </Popover>
      </div>
      <div ref={untilRef} className="relative">
        <label className={labelClass}>Until (optional)</label>
        <button
          type="button"
          onClick={() => setOpenWhich(from ? "until" : "from")}
          className={boxClass}
        >
          <span className={until ? "text-gray-800" : "text-gray-400"}>
            {until ? format(until, "d MMM yyyy") : "Same day"}
          </span>
          <FaCalendarAlt className="ml-2 flex-shrink-0 text-gray-400" />
        </button>
        <Popover
          open={openWhich === "until"}
          onClose={() => setOpenWhich(null)}
          anchorRef={untilRef}
        >
          <ReactCalendar
            value={until}
            onChange={(v: any) => {
              onChange([from, v as Date]);
              setOpenWhich(null);
            }}
            minDate={from || new Date()}
            next2Label={null}
            prev2Label={null}
            className="!border-none !w-full !text-sm"
          />
        </Popover>
      </div>
    </div>
  );
}

export default function HeroBookingSection() {
  const router = useRouter();
  const { location: userLoc } = useLocationDetection();

  const [bookingType, setBookingType] = useState<BookingType>("within-state");

  // Airport
  const [airportDirection, setAirportDirection] = useState<
    "pickup" | "dropoff"
  >("pickup");
  const [selectedAirport, setSelectedAirport] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);

  // Boat / interstate destination
  const [boatDestId, setBoatDestId] = useState("");
  const [destId, setDestId] = useState("");

  // Within state
  const [durationId, setDurationId] = useState("24h");
  const [rangeValue, setRangeValue] = useState<any>(null);

  // Shared
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Live option data resolved from the backend
  const [typeIds, setTypeIds] = useState({
    twelveH: "",
    twentyFourH: "",
    monthly: "",
    airport: "",
    interstate: "",
    boat: "",
  });
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);
  const [boatDestinations, setBoatDestinations] = useState<
    { id: string; name: string }[]
  >([]);
  const [interstateDestinations, setInterstateDestinations] = useState<
    { id: string; name: string }[]
  >([]);
  const [destLoading, setDestLoading] = useState(true);

  // Interstate origin selection (set by the location field)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);

  // Within-state location (where the car is needed)
  const [pickup, setPickup] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { rawBookingOptions } = await getBookingOption();
        const options: any[] = rawBookingOptions || [];
        const idFor = (match: (n: string) => boolean) =>
          options.find((t) => match(String(t?.name || "").toLowerCase()))?.id ||
          "";
        const ids = {
          twelveH: idFor((n) => n.includes("12")),
          twentyFourH: idFor((n) => n.includes("24")),
          monthly: idFor((n) => n.includes("month")),
          airport: idFor((n) => n.includes("airport")),
          interstate: idFor((n) => n.includes("interstate")),
          boat: idFor((n) => n.includes("boat")),
        };
        if (alive) setTypeIds(ids);

        const [boat, interstate] = await Promise.all([
          ids.boat
            ? VehicleSearchService.getDestinations(ids.boat)
            : Promise.resolve([]),
          ids.interstate
            ? VehicleSearchService.getDestinations(ids.interstate)
            : Promise.resolve([]),
        ]);
        if (alive) {
          setBoatDestinations(boat || []);
          setInterstateDestinations(interstate || []);
        }
      } catch {
        // Leave destinations empty; the fields show an empty state.
      } finally {
        if (alive) setDestLoading(false);
      }

      try {
        const types = await VehicleSearchService.getVehicleTypes();
        if (alive) {
          setCategoryOptions(
            (types || []).map((t: any) => ({
              value: t.id,
              label: formatTypeName(t.name),
              icon: iconForVehicleType(t.name),
            })),
          );
        }
      } catch {
        // Category stays optional; an empty list just means no filter.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const boatDest = boatDestinations.find((b) => b.id === boatDestId);

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (bookingType === "airport") {
      if (!(selectedAirport && selectedAirport.lat)) missing.push("Airport");
      if (!(selectedAddress && selectedAddress.lat))
        missing.push(
          airportDirection === "pickup" ? "Pickup location" : "Drop-off location",
        );
      if (!singleDate) missing.push("Date");
      if (!time) missing.push("Time");
    } else if (bookingType === "boat") {
      if (!boatDestId) missing.push("Destination");
      if (!singleDate) missing.push("Date");
      if (!time) missing.push("Time");
    } else if (bookingType === "within-state") {
      if (!(pickup && pickup.lat)) missing.push("Location");
      if (durationId === "monthly") {
        if (!singleDate) missing.push("Start date");
      } else {
        const from = Array.isArray(rangeValue)
          ? rangeValue[0]
          : rangeValue instanceof Date
            ? rangeValue
            : null;
        if (!from) missing.push("From date");
      }
    } else {
      if (!(selectedLocation && selectedLocation.lat))
        missing.push("Starting location");
      if (!destId) missing.push("Destination");
      if (!singleDate) missing.push("Date");
      if (!time) missing.push("Time");
    }
    return missing;
  };

  const handleSearch = async () => {
    const missing = getMissingFields();
    if (missing.length) {
      setError(`Please add: ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setIsSearching(true);
    try {
      let loc = DEFAULT_LOCATION;
      let bookingValue = "";
      let fromDate: Date | undefined;
      let untilDate: Date | undefined;
      let startTime: string | undefined = time || undefined;
      let endTime: string | undefined;

      if (bookingType === "airport") {
        bookingValue = typeIds.airport;
        fromDate = singleDate ?? undefined;
        if (selectedAirport?.lat && selectedAirport?.lng) {
          loc = {
            name: selectedAirport.name,
            lat: selectedAirport.lat,
            lng: selectedAirport.lng,
          };
        }
      } else if (bookingType === "boat") {
        bookingValue = typeIds.boat;
        fromDate = singleDate ?? undefined;
      } else if (bookingType === "within-state") {
        bookingValue =
          durationId === "12h"
            ? typeIds.twelveH
            : durationId === "monthly"
              ? typeIds.monthly
              : typeIds.twentyFourH;
        if (pickup?.lat && pickup?.lng) {
          loc = { name: pickup.name, lat: pickup.lat, lng: pickup.lng };
        }
        if (durationId === "monthly") {
          fromDate = singleDate ?? undefined;
          startTime = undefined; // monthly has no time
        } else {
          const from = Array.isArray(rangeValue)
            ? rangeValue[0]
            : rangeValue instanceof Date
              ? rangeValue
              : null;
          const until = Array.isArray(rangeValue) ? rangeValue[1] : null;
          fromDate = from ?? undefined;
          untilDate = until ?? undefined;
          startTime = undefined; // 12h/24h are date only
        }
      } else {
        bookingValue = typeIds.interstate;
        fromDate = singleDate ?? undefined;
        if (selectedLocation?.lat && selectedLocation?.lng) {
          loc = {
            name: selectedLocation.name,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          };
        }
      }

      const selectedCategory = categoryOptions.find(
        (o) => o.value === category,
      );
      const url = await VehicleSearchService.buildSearchUrl(
        loc,
        bookingValue,
        category || undefined,
        fromDate,
        untilDate,
        startTime,
        endTime,
        selectedCategory?.label,
      );
      trackVehicleSearch({
        searchTerm: `${bookingType} ${bookingValue}`.trim(),
        location: loc.name,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:navstart"));
      }
      router.push(url);
    } catch {
      setError("Could not start the search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const categoryField = (
    <CategoryField
      options={categoryOptions}
      value={category}
      onChange={setCategory}
    />
  );

  const singleDateTime = (
    <div className="grid grid-cols-2 gap-3">
      <DateField
        label="Date"
        value={singleDate}
        onChange={(v) => setSingleDate(v)}
      />
      <div>
        <label className={labelClass}>Time (Nigeria time)</label>
        <TimeField value={time} onChange={setTime} />
      </div>
    </div>
  );

  const renderFields = () => {
    if (bookingType === "within-state") {
      return (
        <div className="space-y-3">
          <LocationField
            label="Where do you need the car?"
            placeholder="Enter a city, area, or address"
            onSelect={setPickup}
          />
          <div>
            <label className={labelClass}>Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDurationId(d.id)}
                  className={toggleClass(durationId === d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {durationId === "monthly" ? (
            <>
              <DateField
                label="Start date"
                value={singleDate}
                onChange={(v) => setSingleDate(v)}
              />
              {categoryField}
            </>
          ) : (
            <>
              <FromUntilField value={rangeValue} onChange={setRangeValue} />
              {categoryField}
            </>
          )}
        </div>
      );
    }

    if (bookingType === "airport") {
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["pickup", "dropoff"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setAirportDirection(d)}
                className={toggleClass(airportDirection === d)}
              >
                {d === "pickup" ? "Airport pickup" : "Airport drop-off"}
              </button>
            ))}
          </div>
          {airportDirection === "pickup" ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <LocationField
                key="airport-address"
                label="Pickup location"
                placeholder="Where should the driver pick you up?"
                onSelect={setSelectedAddress}
              />
              <AirportField
                key="airport-field"
                direction="pickup"
                userLoc={userLoc}
                onSelect={setSelectedAirport}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <AirportField
                key="airport-field"
                direction="dropoff"
                userLoc={userLoc}
                onSelect={setSelectedAirport}
              />
              <LocationField
                key="airport-address"
                label="Drop-off location"
                placeholder="Where should the driver take you?"
                onSelect={setSelectedAddress}
              />
            </div>
          )}
          {categoryField}
          {singleDateTime}
        </div>
      );
    }

    if (bookingType === "interstate") {
      return (
        <div className="space-y-3">
          <LocationField
            label="Where are you starting from?"
            placeholder="Enter a city or address"
            onSelect={setSelectedLocation}
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Destination</label>
              <select
                className={inputClass}
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                disabled={destLoading || interstateDestinations.length === 0}
              >
                <option value="">
                  {destLoading
                    ? "Loading destinations..."
                    : interstateDestinations.length === 0
                      ? "No destinations available yet"
                      : "Select destination"}
                </option>
                {interstateDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {categoryField}
          </div>
          {singleDateTime}
        </div>
      );
    }

    // boat
    return (
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Destination</label>
          <select
            className={inputClass}
            value={boatDestId}
            onChange={(e) => setBoatDestId(e.target.value)}
            disabled={destLoading || boatDestinations.length === 0}
          >
            <option value="">
              {destLoading
                ? "Loading destinations..."
                : boatDestinations.length === 0
                  ? "No destinations available yet"
                  : "Select destination"}
            </option>
            {boatDestinations.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {boatDest ? (
            <p className="mt-1.5 text-left text-xs text-gray-500">
              Round trip, both ways the same day.
            </p>
          ) : null}
        </div>
        {singleDateTime}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden mt-[5rem] md:mt-0 min-h-[calc(100svh-5rem)] lg:min-h-0 lg:h-screen">
      <BackgroundCarousel
        images={HERO_IMAGES}
        alts={HERO_ALTS}
        interval={6000}
        overlay="bg-gradient-to-b from-gray-900/75 via-gray-900/55 to-gray-900/75"
      />

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center px-4 py-10 text-center lg:min-h-screen lg:px-8">
        <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white lg:whitespace-nowrap lg:text-5xl">
          Rent Cars<br className="lg:hidden" /> in Nigeria's Top Cities
        </h1>
        <p className="mt-2 hidden max-w-xl text-sm text-gray-200 lg:block lg:text-lg">
          Book a car with a professional driver in just a few taps.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-white/95 lg:text-sm">
          <span className="flex items-center gap-2">
            <FaCheck className="text-[#5AA2FF]" />
            <span>
              <span className="font-bold">70,000+</span> rides completed
            </span>
          </span>
          <span className="flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            <span>
              <span className="font-bold">4.9</span> average rating
            </span>
          </span>
        </div>

        {/* Booking card: the focal point */}
        <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-5 text-left shadow-2xl lg:p-6">
          <p className="mb-3 text-center text-sm font-semibold text-gray-900">
            What kind of trip are you booking?
          </p>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {TYPES.map((t) => {
              const active = bookingType === t.id;
              const Icon = t.Icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBookingType(t.id)}
                  className={`flex flex-row items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors lg:flex-col lg:gap-1 ${
                    active
                      ? "border-[#0673FF] bg-[#0673FF]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`text-lg ${
                      active ? "text-[#0673FF]" : "text-gray-500"
                    }`}
                  />
                  <span className="text-xs font-semibold text-gray-900">
                    {t.label}
                  </span>
                  <span className="hidden text-[11px] leading-tight text-gray-500 lg:block">
                    {t.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">{renderFields()}</div>

          {error ? (
            <p className="mt-2 text-left text-xs text-[#D42620]">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="mt-4 w-full rounded-full bg-[#0673FF] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Find a Vehicle"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-white/85">
          {[
            "Free cancellation window",
            "Verified professional drivers",
            "Fuel included on chauffeured trips",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <FaCheck className="h-3 w-3 flex-shrink-0 text-[#5AA2FF]" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
