"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMapPin, FiX, FiNavigation, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { getBookingOption } from "@/context/Constarain";
import { GoogleMapsLocationInput } from "@/components/general/forms/GoogleMapsLocationInput";

interface StatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

type Origin = { name: string; lat: number; lng: number };
type Destination = { stateId: string; name: string; country: string };
type Step = "locating" | "needLocation" | "loadingDest" | "destinations";

export default function StatePickerModal({
  isOpen,
  onClose,
  title = "Choose your destination",
  subtitle = "We find rides from where you are",
}: StatePickerModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("locating");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState("");
  const [manualText, setManualText] = useState("");
  const interstateTypeIdRef = useRef("");
  const manualTextRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const resolveInterstateTypeId = async (): Promise<string> => {
    if (interstateTypeIdRef.current) return interstateTypeIdRef.current;
    try {
      const { rawBookingOptions } = await getBookingOption();
      const id =
        (rawBookingOptions || []).find((t: any) =>
          String(t?.name || "")
            .toLowerCase()
            .includes("interstate"),
        )?.id || "";
      interstateTypeIdRef.current = id;
      return id;
    } catch {
      return "";
    }
  };

  const loadDestinations = async (o: Origin) => {
    setStep("loadingDest");
    setError("");
    try {
      const typeId = await resolveInterstateTypeId();
      const list = await VehicleSearchService.getInterstateDestinations(
        o.lat,
        o.lng,
        typeId,
      );
      setDestinations(
        (list || []).map((d) => ({
          stateId: d.stateId,
          name: d.name,
          country: d.country,
        })),
      );
      setStep("destinations");
    } catch {
      setDestinations([]);
      setError("Could not load destinations. Please try again.");
      setStep("destinations");
    }
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStep("needLocation");
      return;
    }
    setStep("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o: Origin = {
          name: "Your location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setOrigin(o);
        loadDestinations(o);
      },
      () => {
        setStep("needLocation");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    setStep("locating");
    setOrigin(null);
    setDestinations([]);
    setError("");
    setManualText("");
    manualTextRef.current = "";
    useMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onManualCoords = (
    _type: string,
    c: { lat: number; lng: number } | null,
  ) => {
    if (!c) return;
    const o: Origin = {
      name: manualTextRef.current || "Selected location",
      lat: c.lat,
      lng: c.lng,
    };
    setOrigin(o);
    loadDestinations(o);
  };

  const goSearch = async (dest: Destination) => {
    if (!origin) return;
    const next = new Date();
    next.setHours(0, 0, 0, 0);
    next.setDate(next.getDate() + 1);
    const typeId = await resolveInterstateTypeId();
    const url = await VehicleSearchService.buildSearchUrl(
      origin,
      typeId,
      undefined,
      next,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      dest.stateId,
    );
    onClose();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:navstart"));
    }
    router.push(url);
  };

  const grouped = useMemo(() => {
    const groups: Record<string, Destination[]> = {};
    destinations.forEach((d) => {
      const c = d.country?.trim() || "Nigeria";
      if (!groups[c]) groups[c] = [];
      groups[c].push(d);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [destinations]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-[10000] flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <FiMapPin className="h-5 w-5 text-blue-600" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {step === "destinations" && origin
                  ? `Destinations from ${origin.name}`
                  : subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {step === "locating" && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-500">Finding your location...</p>
            </div>
          )}

          {step === "needLocation" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Turn on location
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Allow location to see rides from where you are, or enter a
                  starting point below. If no prompt appears, your browser may
                  have it blocked.
                </p>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0673FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6]"
                >
                  <FiNavigation className="h-4 w-4" />
                  Use my location
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Or enter your starting point
                </p>
                <GoogleMapsLocationInput
                  value={manualText}
                  onChange={(v) => {
                    setManualText(v);
                    manualTextRef.current = v;
                  }}
                  placeholder="Enter a city, area, or address"
                  disabled={false}
                  type="origin"
                  coordinates={onManualCoords}
                />
              </div>
            </div>
          )}

          {step === "loadingDest" && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-500">
                Finding destinations from {origin?.name || "your location"}...
              </p>
            </div>
          )}

          {step === "destinations" && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep("needLocation")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0673FF] hover:underline"
              >
                <FiArrowLeft className="h-4 w-4" />
                Change starting point
              </button>

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {!error && destinations.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  No destinations available from here yet. Try a different
                  starting point.
                </p>
              )}

              {grouped.map(([country, list]) => (
                <section key={country}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {country}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {list.map((d) => (
                      <button
                        key={d.stateId}
                        type="button"
                        onClick={() => goSearch(d)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FiMapPin className="h-4 w-4 shrink-0 text-blue-500" />
                        {d.name}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
