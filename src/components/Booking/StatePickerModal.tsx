"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiMapPin, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { TravelState, buildStateExploreUrl } from "@/types/state";

interface StatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function StatePickerModal({
  isOpen,
  onClose,
  title = "Choose your destination",
  subtitle = "Select a state to see vehicles that travel there",
}: StatePickerModalProps) {
  const router = useRouter();
  const [states, setStates] = useState<TravelState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStates = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await VehicleSearchService.getStates();
        setStates(data);
      } catch {
        setError("Could not load destinations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const groupedStates = useMemo(() => {
    const groups: Record<string, TravelState[]> = {};
    states.forEach((state) => {
      const country = state.countryName?.trim() || "Other";
      if (!groups[country]) groups[country] = [];
      groups[country].push(state);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [states]);

  const handleSelect = (state: TravelState) => {
    onClose();
    router.push(buildStateExploreUrl(state));
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <ModalRoot>
      <ModalBackdrop onClose={onClose} />
      <ModalPanel>
        <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
        <ModalBody
          loading={loading}
          error={error}
          groupedStates={groupedStates}
          onSelect={handleSelect}
        />
      </ModalPanel>
    </ModalRoot>,
    document.body,
  );
}

function ModalRoot({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

function ModalBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden
    />
  );
}

function ModalPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-[10000] w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
      {children}
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
          <FiMapPin className="w-5 h-5 text-blue-600" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Close"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
}

function ModalBody({
  loading,
  error,
  groupedStates,
  onSelect,
}: {
  loading: boolean;
  error: string;
  groupedStates: [string, TravelState[]][];
  onSelect: (state: TravelState) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </p>
      )}

      {!loading && !error && groupedStates.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No destinations available right now.
        </p>
      )}

      {!loading &&
        groupedStates.map(([country, countryStates]) => (
          <section key={country}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              {country}
            </h3>
            <StateChipRow>
              {countryStates.map((state) => (
                <button
                  key={state.stateId}
                  type="button"
                  onClick={() => onSelect(state)}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                >
                  <FiMapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  {state.stateName}
                </button>
              ))}
            </StateChipRow>
          </section>
        ))}
    </div>
  );
}

function StateChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">{children}</div>
  );
}
