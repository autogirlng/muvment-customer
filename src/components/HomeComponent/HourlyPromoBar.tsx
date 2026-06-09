"use client";

import React, { useEffect, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";

const STORAGE_KEY = "hourlyPromoDismissed";

const HourlyPromoBar: React.FC = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage unavailable, continue without persistence
    }

    const onScroll = () => {
      setShow(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const goToHourly = () => {
    const el = document.getElementById("hourly-rentals");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (dismissed || !show) return null;

  return (
    <div className="fixed z-40 bottom-20 left-4 lg:bottom-6 lg:left-6 max-w-[calc(100vw-2rem)] animate-fadeIn">
      <div className="flex items-center gap-3 rounded-full bg-[#101928] text-white pl-4 pr-2 py-2 shadow-2xl border border-white/10">
        <FiClock className="hidden sm:block w-5 h-5 text-[#5AA2FF] flex-shrink-0" />
        <div className="text-sm leading-tight min-w-0">
          <span className="font-semibold">Just need a few hours?</span>
          <span className="hidden sm:inline text-white/70">
            {" "}
            Hourly rentals with a driver, fuel included.
          </span>
        </div>
        <button
          onClick={goToHourly}
          className="flex-shrink-0 bg-[#0673FF] hover:bg-[#0560d6] text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors whitespace-nowrap"
        >
          See hourly rates
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-white/50 hover:text-white p-1 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HourlyPromoBar;
