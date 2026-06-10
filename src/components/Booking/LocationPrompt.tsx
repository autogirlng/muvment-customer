// components/LocationPrompt.tsx
"use client";
import { useState, useEffect } from "react";
import { FiMapPin, FiX } from "react-icons/fi";

interface LocationPromptProps {
  isDefault: boolean;
  status: "idle" | "detecting" | "granted" | "denied" | "default";
  onRequestLocation: () => void;
  isDetecting: boolean;
}

export default function LocationPrompt({
  status,
  onRequestLocation,
  isDetecting,
}: LocationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (status === "granted") setIsDismissed(true);
  }, [status]);

  // Only prompt when we genuinely have no location and permission is undecided.
  // Hidden when granted, denied, detecting, idle, or dismissed.
  if (isDismissed || status !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:bottom-6 lg:right-6 lg:left-auto lg:w-[380px]">
      <div className="animate-slide-up relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
        {/* Close */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Dismiss"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0673FF]/10">
            <FiMapPin className="h-5 w-5 text-[#0673FF]" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Enable location services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              See vehicles available near you for more relevant results.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Not now
          </button>
          <button
            onClick={onRequestLocation}
            disabled={isDetecting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0673FF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0560d6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDetecting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Detecting...
              </>
            ) : (
              "Enable"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
