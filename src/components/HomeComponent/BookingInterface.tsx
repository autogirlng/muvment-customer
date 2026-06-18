"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
} from "react";
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
import { BookingService } from "@/controllers/booking/bookingService";
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
const barFieldClass =
  "flex w-full items-center justify-between gap-2 bg-transparent px-3 py-2.5 text-left text-sm text-gray-800 outline-none";
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
  compact = false,
  initial = null,
}: {
  label: string;
  placeholder: string;
  onSelect: (
    loc: { name: string; lat: number | null; lng: number | null } | null,
  ) => void;
  compact?: boolean;
  initial?: { name: string; lat: number | null; lng: number | null } | null;
}) {
  const search = useLocationSearch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const userTypedRef = useRef(false);

  // Reflect an externally supplied value (detected location, or a restored
  // search) until the person edits the field themselves.
  useEffect(() => {
    if (userTypedRef.current) return;
    if (initial && initial.name) {
      setDisplay(initial.name);
      setQuery(initial.name);
    }
  }, [initial?.name, initial?.lat, initial?.lng]);

  const handleQuery = (q: string) => {
    userTypedRef.current = true;
    setQuery(q);
    setDisplay("");
    onSelect(null);
    search.handleSearchInputChange(q);
  };
  const pick = async (item: any) => {
    userTypedRef.current = true;
    const sel = await search.handleLocationSelect(item);
    setDisplay(sel.name);
    setQuery(sel.name);
    onSelect({ name: sel.name, lat: sel.lat, lng: sel.lng });
    search.setShowLocationDropdown(false);
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative">
      {!compact && <label className={labelClass}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact ? barFieldClass : `${inputClass} flex items-center justify-between text-left`
        }
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
  compact = false,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={anchorRef} className="relative">
      {!compact && <label className={labelClass}>Vehicle type</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact ? barFieldClass : `${inputClass} flex items-center justify-between text-left`
        }
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
  compact = false,
}: {
  direction: "pickup" | "dropoff";
  userLoc: { lat: number; lng: number };
  onSelect: (
    a: { name: string; lat: number | null; lng: number | null } | null,
  ) => void;
  compact?: boolean;
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
      {!compact && (
        <label className={labelClass}>
          {direction === "pickup" ? "Destination airport" : "Arrival airport"}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact ? barFieldClass : `${inputClass} flex items-center justify-between text-left`
        }
      >
        <span className={`truncate ${display ? "text-gray-800" : "text-gray-400"}`}>
          {display || (compact ? "Airport" : "Choose an airport")}
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
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
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
        className={
          compact ? barFieldClass : `${inputClass} flex items-center justify-between text-left`
        }
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
  compact = false,
}: {
  label: string;
  value: Date | null;
  onChange: (v: Date) => void;
  minDate?: Date;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchorRef} className="relative">
      {!compact && <label className={labelClass}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact ? barFieldClass : `${inputClass} flex items-center justify-between text-left`
        }
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value ? format(value, "d MMM yyyy") : compact ? label : "Select date"}
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
  compact = false,
}: {
  value: any;
  onChange: (v: any) => void;
  compact?: boolean;
}) {
  const from: Date | null = Array.isArray(value) ? value[0] || null : null;
  const until: Date | null = Array.isArray(value) ? value[1] || null : null;
  const [openWhich, setOpenWhich] = useState<"from" | "until" | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const untilRef = useRef<HTMLDivElement>(null);
  const boxClass = compact
    ? barFieldClass
    : `${inputClass} flex items-center justify-between text-left`;

  return (
    <div className={compact ? "flex items-center gap-1" : "grid grid-cols-2 gap-3"}>
      <div ref={fromRef} className="relative min-w-0 flex-1">
        {!compact && <label className={labelClass}>From</label>}
        <button
          type="button"
          onClick={() => setOpenWhich("from")}
          className={boxClass}
        >
          <span className={from ? "text-gray-800" : "text-gray-400"}>
            {from ? format(from, "d MMM") : compact ? "From" : "Select date"}
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
      {compact && <span className="flex-shrink-0 text-gray-300">–</span>}
      <div ref={untilRef} className="relative min-w-0 flex-1">
        {!compact && <label className={labelClass}>Until (optional)</label>}
        <button
          type="button"
          onClick={() => setOpenWhich(from ? "until" : "from")}
          className={boxClass}
        >
          <span className={until ? "text-gray-800" : "text-gray-400"}>
            {until ? format(until, "d MMM") : compact ? "Until" : "Same day"}
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

function BookingSearchInner({
  variant = "hero",
}: {
  variant?: "hero" | "bar" | "modal";
}) {
  const router = useRouter();
  const { location: userLoc } = useLocationDetection();

  // Tracks whether the person has edited a location field, and whether we have
  // already restored a search from the URL, so neither overwrites the other.
  const whereTouched = useRef(false);
  const rehydratedFromSearch = useRef(false);

  const [bookingType, setBookingType] = useState<BookingType>("within-state");
  // The bar shows an empty booking-type label until a type is actively chosen
  // (or a real search is restored from the URL). Where and When still default.
  const [typeChosen, setTypeChosen] = useState(false);

  // Compact bar: trip-type menu open state
  const [barTypeOpen, setBarTypeOpen] = useState(false);
  const barTypeRef = useRef<HTMLDivElement>(null);

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
  const [durationId, setDurationId] = useState("12h");
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
  // Boat spots are priced as their own booking types, so the dropdown carries
  // each spot's booking type id and the search runs on that id.
  const [boatSpotIds, setBoatSpotIds] = useState<string[]>([]);
  const [boatReady, setBoatReady] = useState(false);
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

        // Each boat spot is priced as its own booking type. The Boat Trip type
        // carries the curated spot names; we match those names to the booking
        // type of the same name and use that booking type id for the search.
        const curated = ids.boat
          ? await VehicleSearchService.getDestinations(ids.boat)
          : [];
        let spots: { id: string; name: string }[] = [];
        try {
          const allTypes = await BookingService.getAllBookingTypes();
          const norm = (s: string) => String(s || "").trim().toLowerCase();
          const aliases: Record<string, string> = { ilashe: "illashe" };
          const typeByName = new Map<string, string>();
          (allTypes || []).forEach((t: any) => {
            if (t?.id) typeByName.set(norm(t.name), t.id);
          });
          spots = (curated || [])
            .map((d: any) => {
              const key = norm(d?.name);
              const id = typeByName.get(key) || typeByName.get(aliases[key]) || "";
              return id ? { id, name: d?.name } : null;
            })
            .filter((s): s is { id: string; name: string } => !!s);
        } catch {
          spots = [];
        }
        if (alive) {
          setBoatDestinations(spots);
          setBoatSpotIds(spots.map((s) => s.id));
        }
      } catch {
        // Leave destinations empty; the fields show an empty state.
      } finally {
        if (alive) {
          setDestLoading(false);
          setBoatReady(true);
        }
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

  // Interstate destinations come from the chosen origin: the states that hosts
  // based in the origin will drive to. Refetched whenever the origin changes.
  useEffect(() => {
    if (bookingType !== "interstate") return;
    const lat = selectedLocation?.lat;
    const lng = selectedLocation?.lng;
    if (!typeIds.interstate || lat == null || lng == null) {
      setInterstateDestinations([]);
      return;
    }
    let alive = true;
    setDestLoading(true);
    VehicleSearchService.getInterstateDestinations(lat, lng, typeIds.interstate)
      .then((list) => {
        if (!alive) return;
        const mapped = (list || []).map((d) => ({
          id: d.stateId,
          name: d.name,
        }));
        setInterstateDestinations(mapped);
        setDestId((prev) => (mapped.some((m) => m.id === prev) ? prev : ""));
      })
      .finally(() => {
        if (alive) setDestLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [
    bookingType,
    selectedLocation?.lat,
    selectedLocation?.lng,
    typeIds.interstate,
  ]);

  const boatDest = boatDestinations.find((b) => b.id === boatDestId);

  // Wrap the location setters so any edit (typing or picking) marks the field
  // as touched, which stops the auto-fill from the detected location.
  const onPickPickup = (v: typeof pickup) => {
    whereTouched.current = true;
    setPickup(v);
  };
  const onPickInterstate = (v: typeof selectedLocation) => {
    whereTouched.current = true;
    setSelectedLocation(v);
  };
  const onPickAddress = (v: typeof selectedAddress) => {
    whereTouched.current = true;
    setSelectedAddress(v);
  };

  // Switching trip type starts the new type's "where" fresh, so it picks up the
  // detected location again.
  const changeBookingType = (t: BookingType) => {
    whereTouched.current = false;
    setBookingType(t);
    setTypeChosen(true);
    setError("");
  };

  // Restore a search from the results-page URL (and the saved snapshot for the
  // bits the URL does not carry). Runs once, after the booking-type ids load.
  useEffect(() => {
    if (rehydratedFromSearch.current) return;
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const hasSearch = !!(sp.get("location") || sp.get("bookingType"));
    if (!hasSearch) return;
    const btId = sp.get("bookingType") || "";
    const typeIdsReady = Object.values(typeIds).some(Boolean);
    if (btId && (!typeIdsReady || !boatReady)) return;

    let snap: any = null;
    try {
      const raw = sessionStorage.getItem("muvment:lastSearch");
      if (raw) snap = JSON.parse(raw);
    } catch {
      snap = null;
    }

    let bt: BookingType = "within-state";
    let dur = "12h";
    if (btId === typeIds.airport) bt = "airport";
    else if (btId === typeIds.interstate) bt = "interstate";
    else if (btId === typeIds.boat || boatSpotIds.includes(btId)) bt = "boat";
    else if (btId === typeIds.twentyFourH) dur = "24h";
    else if (btId === typeIds.twelveH) dur = "12h";
    else if (btId === typeIds.monthly) dur = "monthly";
    setBookingType(bt);
    setDurationId(dur);
    if (btId) setTypeChosen(true);
    if (snap?.airportDirection) setAirportDirection(snap.airportDirection);

    const name = sp.get("location") || "";
    const lat = Number(sp.get("lat"));
    const lng = Number(sp.get("lng"));
    const loc =
      name && !Number.isNaN(lat) && !Number.isNaN(lng)
        ? { name, lat, lng }
        : null;

    const urlDest = sp.get("destinationId") || "";
    const urlDestState = sp.get("destinationStateId") || "";
    if (bt === "within-state") {
      setPickup(loc ?? snap?.pickup ?? null);
    } else if (bt === "interstate") {
      setSelectedLocation(loc ?? snap?.selectedLocation ?? null);
      const d = urlDestState || snap?.destId;
      if (d) setDestId(d);
    } else if (bt === "boat") {
      const d = boatSpotIds.includes(btId) ? btId : snap?.boatDestId;
      if (d) setBoatDestId(d);
    } else {
      setSelectedAirport(loc ?? snap?.selectedAirport ?? null);
      setSelectedAddress(
        snap?.selectedAddress ?? {
          name: userLoc.name,
          lat: userLoc.lat,
          lng: userLoc.lng,
        },
      );
    }

    const parseDate = (s: string | null) => {
      if (!s) return null;
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const sDate = parseDate(sp.get("startDate"));
    const eDate = parseDate(sp.get("endDate"));
    if (bt === "within-state" && dur !== "monthly") {
      if (sDate) setRangeValue([sDate, eDate]);
    } else if (sDate) {
      setSingleDate(sDate);
    }

    const st = sp.get("startTime");
    if (st) setTime(st.slice(0, 5));
    const cat = sp.get("category");
    if (cat) setCategory(cat);

    rehydratedFromSearch.current = true;
    whereTouched.current = true;
  }, [typeIds, userLoc.name, boatReady, boatSpotIds]);

  // Default every "where" field to the detected location until the person
  // edits it (or a search was restored from the URL).
  useEffect(() => {
    if (whereTouched.current || rehydratedFromSearch.current) return;
    if (!userLoc) return;
    const v = { name: userLoc.name, lat: userLoc.lat, lng: userLoc.lng };
    setPickup(v);
    setSelectedLocation(v);
    setSelectedAddress(v);
  }, [userLoc.name, userLoc.lat, userLoc.lng, bookingType]);

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
      let airportDropoff: { name: string; lat: number; lng: number } | null =
        null;

      if (bookingType === "airport") {
        bookingValue = typeIds.airport;
        fromDate = singleDate ?? undefined;
        const air = selectedAirport;
        const addr = selectedAddress;
        if (airportDirection === "pickup") {
          // Ride to the airport: pickup is the address, drop-off is the airport.
          if (addr?.lat && addr?.lng) {
            loc = {
              name: addr.name || "Pickup location",
              lat: addr.lat,
              lng: addr.lng,
            };
          }
          if (air?.lat && air?.lng) {
            airportDropoff = { name: air.name, lat: air.lat, lng: air.lng };
          }
        } else {
          // Ride from the airport: pickup is the airport, drop-off is the address.
          if (air?.lat && air?.lng) {
            loc = { name: air.name, lat: air.lat, lng: air.lng };
          }
          if (addr?.lat && addr?.lng) {
            airportDropoff = {
              name: addr.name || "Drop-off location",
              lat: addr.lat,
              lng: addr.lng,
            };
          }
        }
      } else if (bookingType === "boat") {
        // boatDestId holds the chosen spot's booking type id; the boat is priced
        // under that type, so the search runs on it directly.
        bookingValue = boatDestId;
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
      // Boat searches on the spot's booking type id; interstate uses a state.
      const destinationId = undefined;
      const destinationStateId =
        bookingType === "interstate" ? destId : undefined;
      const url = await VehicleSearchService.buildSearchUrl(
        loc,
        bookingValue,
        category || undefined,
        fromDate,
        untilDate,
        startTime,
        endTime,
        selectedCategory?.label,
        destinationId || undefined,
        destinationStateId || undefined,
      );
      trackVehicleSearch({
        searchTerm: `${bookingType} ${bookingValue}`.trim(),
        location: loc.name,
      });
      try {
        const toIso = (d: Date | null | undefined) =>
          d ? new Date(d).toISOString() : null;
        const range = Array.isArray(rangeValue) ? rangeValue : [];
        sessionStorage.setItem(
          "muvment:lastSearch",
          JSON.stringify({
            bookingType,
            durationId,
            airportDirection,
            pickup,
            selectedLocation,
            selectedAddress,
            selectedAirport,
            destId,
            boatDestId,
            singleDate: toIso(singleDate),
            fromDate: toIso(range[0]),
            untilDate: toIso(range[1]),
            time,
            category,
            categoryName: selectedCategory?.label || "",
            bookingValue,
          }),
        );
      } catch {
        // sessionStorage may be unavailable; the URL still carries the search.
      }
      let finalUrl = url;
      if (airportDropoff) {
        const sep = url.includes("?") ? "&" : "?";
        finalUrl = `${url}${sep}dropoffLocation=${encodeURIComponent(
          airportDropoff.name,
        )}&dropoffLat=${airportDropoff.lat}&dropoffLng=${airportDropoff.lng}`;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:navstart"));
      }
      router.push(finalUrl);
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
            onSelect={onPickPickup}
            initial={pickup}
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
                onSelect={onPickAddress}
                initial={selectedAddress}
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
                onSelect={onPickAddress}
                initial={selectedAddress}
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
            onSelect={onPickInterstate}
            initial={selectedLocation}
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

  // ---- Compact bar layout (navbar + results page) ----
  // Same engine as the hero; only the presentation differs.
  const BAR_TYPE_OPTIONS: {
    label: string;
    type: BookingType;
    duration?: string;
    airportDirection?: "pickup" | "dropoff";
  }[] = [
    { label: "Within state · 12 hours", type: "within-state", duration: "12h" },
    { label: "Within state · 24 hours", type: "within-state", duration: "24h" },
    { label: "Monthly", type: "within-state", duration: "monthly" },
    { label: "Airport pickup", type: "airport", airportDirection: "pickup" },
    { label: "Airport drop-off", type: "airport", airportDirection: "dropoff" },
    { label: "Interstate", type: "interstate" },
    { label: "Boat trip", type: "boat" },
  ];

  const barTypeLabel = (() => {
    if (variant === "bar" && !typeChosen) return "Booking type";
    if (bookingType === "within-state")
      return durationId === "12h"
        ? "Within state · 12h"
        : durationId === "monthly"
          ? "Monthly"
          : "Within state · 24h";
    if (bookingType === "airport")
      return airportDirection === "pickup" ? "Airport pickup" : "Airport drop-off";
    if (bookingType === "interstate") return "Interstate";
    return "Boat trip";
  })();

  const barCell = (node: React.ReactNode) => (
    <div className="min-w-0 flex-auto px-1">{node}</div>
  );
  // Date and time read at a fixed size so they never truncate.
  const barCellFixed = (node: React.ReactNode) => (
    <div className="flex-none px-1">{node}</div>
  );
  // Optional cell (vehicle category): hidden below xl so the primary fields
  // keep their width on small-laptop widths and do not truncate.
  const barCellOptional = (node: React.ReactNode) => (
    <div className="hidden min-w-0 flex-auto px-1 xl:block">{node}</div>
  );

  const barDestinationSelect = (
    list: { id: string; name: string }[],
    value: string,
    onChange: (v: string) => void,
  ) => (
    <select
      className="w-full truncate bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={destLoading || list.length === 0}
    >
      <option value="">
        {destLoading
          ? "Loading..."
          : list.length === 0
            ? "No destinations"
            : "Destination"}
      </option>
      {list.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );

  const renderBarCells = () => {
    if (bookingType === "within-state") {
      return (
        <>
          {barCell(
            <LocationField
              compact
              label="Location"
              placeholder="Location"
              onSelect={onPickPickup}
              initial={pickup}
            />,
          )}
          {durationId === "monthly"
            ? barCellFixed(
                <DateField
                  compact
                  label="Start date"
                  value={singleDate}
                  onChange={(v) => setSingleDate(v)}
                />,
              )
            : barCell(
                <FromUntilField
                  compact
                  value={rangeValue}
                  onChange={setRangeValue}
                />,
              )}
          {barCellOptional(
            <CategoryField
              compact
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />,
          )}
        </>
      );
    }
    if (bookingType === "airport") {
      const airportField = (
        <AirportField
          compact
          direction={airportDirection}
          userLoc={userLoc}
          onSelect={setSelectedAirport}
        />
      );
      const addressField = (
        <LocationField
          compact
          label={airportDirection === "pickup" ? "Pickup" : "Drop-off"}
          placeholder={airportDirection === "pickup" ? "Pickup" : "Drop-off"}
          onSelect={onPickAddress}
          initial={selectedAddress}
        />
      );
      return (
        <>
          {barCell(airportDirection === "pickup" ? addressField : airportField)}
          {barCell(airportDirection === "pickup" ? airportField : addressField)}
          {barCellFixed(
            <DateField
              compact
              label="Date"
              value={singleDate}
              onChange={(v) => setSingleDate(v)}
            />,
          )}
          {barCellFixed(<TimeField compact value={time} onChange={setTime} />)}
          {barCellOptional(
            <CategoryField
              compact
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />,
          )}
        </>
      );
    }
    if (bookingType === "interstate") {
      return (
        <>
          {barCell(
            <LocationField
              compact
              label="From"
              placeholder="From"
              onSelect={onPickInterstate}
              initial={selectedLocation}
            />,
          )}
          {barCell(barDestinationSelect(interstateDestinations, destId, setDestId))}
          {barCellFixed(
            <DateField
              compact
              label="Date"
              value={singleDate}
              onChange={(v) => setSingleDate(v)}
            />,
          )}
          {barCellFixed(<TimeField compact value={time} onChange={setTime} />)}
          {barCellOptional(
            <CategoryField
              compact
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />,
          )}
        </>
      );
    }
    // boat
    return (
      <>
        {barCell(barDestinationSelect(boatDestinations, boatDestId, setBoatDestId))}
        {barCellFixed(
          <DateField
            compact
            label="Date"
            value={singleDate}
            onChange={(v) => setSingleDate(v)}
          />,
        )}
        {barCellFixed(<TimeField compact value={time} onChange={setTime} />)}
      </>
    );
  };

  if (variant === "modal") {
    return (
      <div className="w-full text-left">
        <p className="mb-3 text-sm font-semibold text-gray-900">
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
                onClick={() => changeBookingType(t.id)}
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
    );
  }

  if (variant === "bar") {
    return (
      <div className="w-full max-w-4xl">
        <div className="flex w-full min-w-0 items-stretch divide-x divide-gray-200 rounded-full border border-gray-200 bg-white py-1 pl-2 pr-1 shadow-sm">
          <div ref={barTypeRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setBarTypeOpen((o) => !o)}
              className="flex h-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800"
            >
              <span
                className={`truncate max-w-[150px] ${
                  variant === "bar" && !typeChosen ? "text-gray-400" : ""
                }`}
              >
                {barTypeLabel}
              </span>
              <FaChevronDown className="flex-shrink-0 text-gray-400" />
            </button>
            <Popover
              open={barTypeOpen}
              onClose={() => setBarTypeOpen(false)}
              anchorRef={barTypeRef}
            >
              <div className="max-h-[65vh] overflow-y-auto lg:max-h-80">
                {BAR_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      changeBookingType(opt.type);
                      if (opt.duration) setDurationId(opt.duration);
                      if (opt.airportDirection)
                        setAirportDirection(opt.airportDirection);
                      setBarTypeOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                      opt.label === barTypeLabel
                        ? "text-[#0673FF]"
                        : "text-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Popover>
          </div>

          {renderBarCells()}

          <div className="flex flex-shrink-0 items-center pl-1">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              title="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0673FF] text-white transition-colors hover:bg-[#0560d6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error ? (
          <p className="mt-1 px-4 text-center text-xs text-[#D42620]">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden mt-[5rem] min-h-[calc(100svh-5rem)] lg:min-h-[calc(100vh-5rem)]">
      <BackgroundCarousel
        images={HERO_IMAGES}
        alts={HERO_ALTS}
        interval={6000}
        overlay="bg-gradient-to-b from-gray-900/75 via-gray-900/55 to-gray-900/75"
      />

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col items-center justify-start px-4 py-10 text-center lg:min-h-[calc(100vh-5rem)] lg:px-8">
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
                  onClick={() => changeBookingType(t.id)}
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

export default function HeroBookingSection() {
  return <BookingSearchInner variant="hero" />;
}

export function BookingSearchBar() {
  return <BookingSearchInner variant="bar" />;
}

export function BookingSearchModalForm() {
  return <BookingSearchInner variant="modal" />;
}
