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
    <div className="fixed z-40 bottom-5 left-4 lg:bottom-6 lg:left-6 animate-fadeIn">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#101928] py-1.5 pl-3 pr-1.5 text-white shadow-2xl">
        <button
          onClick={goToHourly}
          className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold"
        >
          <FiClock className="h-4 w-4 flex-shrink-0 text-[#5AA2FF]" />
          Try Hourly Rental
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 text-white/50 transition-colors hover:text-white"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default HourlyPromoBar;
