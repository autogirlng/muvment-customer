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
  isDefault,
  status,
  onRequestLocation,
  isDetecting,
}: LocationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Reset dismissed state when status changes
    if (status === "granted") {
      setIsDismissed(true);
    }
  }, [status]);

  // Don't show if dismissed, granted, or currently detecting
  if (isDismissed || status === "granted" || !isDefault) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 relative animate-slide-up">
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
          <FiMapPin className="w-7 h-7 text-blue-600" />
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Enable Location Services
          </h3>
          <p className="text-sm text-gray-600">
            Get better search results and find vehicles near you. We'll show you
            cars available in your area.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={onRequestLocation}
            disabled={isDetecting}
            className="flex-1 px-4 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDetecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Detecting...
              </>
            ) : (
              "Enable Location"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
