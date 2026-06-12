"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { formatCurrency } from "@/services/vechilePriceUtiles";
import { VehicleDetailsPublic } from "@/types/vehicleDetails";

type TripRecap = {
  days: number;
  startDate: string;
  startTime: string;
  pickup: string;
  dropoff: string;
  areas: string;
};

const readTripRecap = (): TripRecap | null => {
  try {
    const raw = sessionStorage.getItem("trips");
    if (!raw) return null;
    const list = JSON.parse(raw) as any[];
    if (!Array.isArray(list) || list.length === 0) return null;
    const first = list[0] || {};

    let startDate = "";
    if (first.tripStartDate) {
      const d = new Date(first.tripStartDate);
      if (!isNaN(d.getTime())) startDate = format(d, "do MMM yyyy");
    }
    let startTime = "";
    if (first.tripStartTime) {
      const t = new Date(first.tripStartTime);
      if (!isNaN(t.getTime())) startTime = format(t, "hh:mma");
    }

    let areas = "";
    try {
      const parsed = first.areasOfUse ? JSON.parse(first.areasOfUse) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        areas = parsed.map((a: any) => a.name).filter(Boolean).join(", ");
      }
    } catch {}
    if (!areas) areas = first.areaOfUse || "";

    return {
      days: list.length,
      startDate,
      startTime,
      pickup: first.pickupLocation || "",
      dropoff: first.dropoffLocation || "",
      areas,
    };
  } catch {
    return null;
  }
};

const RecapRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2 text-sm text-grey-800">
    <span className="text-grey-400 flex-shrink-0 mt-0.5">{icon}</span>
    <span>
      <span className="text-grey-500">{label}: </span>
      {value}
    </span>
  </div>
);

const BookingVehicleAside = ({
  vehicle,
  vehicleImages,
}: {
  vehicle: VehicleDetailsPublic | null;
  vehicleImages: string[];
}) => {
  const [recap, setRecap] = useState<TripRecap | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let last = "";
    const sync = () => {
      const next = readTripRecap();
      const serialized = JSON.stringify(next);
      if (serialized !== last) {
        last = serialized;
        setRecap(next);
      }
    };
    sync();
    const id = window.setInterval(sync, 2000);
    return () => window.clearInterval(id);
  }, []);

  const data = vehicle?.data;
  const images = (vehicleImages || []).filter(Boolean);
  const hasImages = images.length > 0;
  const safeIndex = hasImages ? index % images.length : 0;
  const image = hasImages ? images[safeIndex] : "";
  const price = data?.allPricingOptions?.price ?? 0;
  const priceLabel = (data?.allPricingOptions?.bookingTypeName || "")
    .toString()
    .replaceAll("_", " ");

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  const mobileTripLine = recap
    ? recap.startDate
      ? `${recap.startDate}${recap.days > 1 ? ` · ${recap.days} days` : ""}`
      : recap.pickup || ""
    : "";

  return (
    <aside className="w-full lg:w-[380px] lg:flex-shrink-0">
      {/* Mobile: compact one-line card */}
      <div className="lg:hidden flex items-center gap-3 rounded-2xl border border-[#D0D5DD] bg-white p-3">
        <div className="w-20 h-16 rounded-xl overflow-hidden bg-grey-100 flex-shrink-0">
          {image ? (
            <img src={image} alt={data?.name || "Vehicle"} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-grey-900 truncate">
            {data?.name || "Selected vehicle"}
          </p>
          <p className="text-xs text-grey-500 truncate">
            {data?.vehicleTypeName?.replaceAll("_", " ") || ""}
          </p>
          {mobileTripLine && (
            <p className="text-xs text-grey-700 truncate mt-0.5">
              {mobileTripLine}
            </p>
          )}
        </div>
        {price > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-grey-500">{priceLabel || "From"}</p>
            <p className="font-bold text-grey-900">{formatCurrency(price)}</p>
          </div>
        )}
      </div>

      {/* Desktop: full sticky card with slider + detailed recap */}
      <div className="hidden lg:block lg:sticky lg:top-6 rounded-2xl border border-[#D0D5DD] bg-white overflow-hidden">
        <div className="relative w-full h-[190px] bg-grey-100">
          {image ? (
            <img src={image} alt={data?.name || "Vehicle"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-400 text-sm">
              No image
            </div>
          )}
          {data?.city && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1">
              <FiMapPin className="w-3.5 h-3.5 text-grey-700" />
              <span className="text-xs font-semibold text-grey-700 uppercase">
                {data.city}
              </span>
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-grey-900">
              {data?.name || "Selected vehicle"}
            </h3>
            {data?.vehicleTypeName && (
              <p className="text-sm text-grey-500 mt-0.5">
                {data.vehicleTypeName.replaceAll("_", " ")}
              </p>
            )}
          </div>

          {price > 0 && (
            <div className="flex items-end justify-between border-y border-grey-100 py-3">
              <span className="text-sm text-grey-500">
                {priceLabel || "Starting from"}
              </span>
              <span className="text-lg font-bold text-grey-900">
                {formatCurrency(price)}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-grey-700">
            {typeof data?.numberOfSeats === "number" && (
              <span className="flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-grey-400" />
                {data.numberOfSeats} seats
              </span>
            )}
            {data?.willProvideDriver !== undefined && (
              <span>Driver: {data.willProvideDriver ? "Yes" : "No"}</span>
            )}
            {data?.willProvideFuel !== undefined && (
              <span>Fuel: {data.willProvideFuel ? "Yes" : "No"}</span>
            )}
          </div>

          {recap &&
            (recap.startDate ||
              recap.pickup ||
              recap.dropoff ||
              recap.areas) && (
              <div className="rounded-xl bg-[#F7F9FC] p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-grey-500">
                  Your trip so far
                </p>
                {recap.startDate && (
                  <RecapRow
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="When"
                    value={`${recap.startDate}${
                      recap.days > 1 ? ` · ${recap.days} days` : ""
                    }`}
                  />
                )}
                {recap.startTime && (
                  <RecapRow
                    icon={<FiClock className="w-4 h-4" />}
                    label="Start time"
                    value={recap.startTime}
                  />
                )}
                {recap.pickup && (
                  <RecapRow
                    icon={<FiMapPin className="w-4 h-4" />}
                    label="Pick-up"
                    value={recap.pickup}
                  />
                )}
                {recap.dropoff && (
                  <RecapRow
                    icon={<FiMapPin className="w-4 h-4" />}
                    label="Drop-off"
                    value={recap.dropoff}
                  />
                )}
                {recap.areas && (
                  <RecapRow
                    icon={<FiMapPin className="w-4 h-4" />}
                    label="Areas"
                    value={recap.areas}
                  />
                )}
              </div>
            )}
        </div>
      </div>
    </aside>
  );
};

export default BookingVehicleAside;
