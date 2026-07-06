"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiTag, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "welcomeOfferSearchNoteDismissed";

const WelcomeOfferNote: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (isLoading || isAuthenticated || dismissed) return null;

  return (
    <div className="relative mb-4 flex items-center gap-2 rounded-xl border border-[#0673ff]/20 bg-[#EAF2FF] px-3 py-2.5 pr-9">
      <FiTag className="h-4 w-4 flex-shrink-0 text-[#0673FF]" />
      <p className="text-xs text-[#0560d6] sm:text-sm">
        First booking: <span className="font-semibold">10% off, up to ₦10,000</span>,
        applied automatically at checkout.{" "}
        <Link href="/auth/register" className="font-semibold underline">
          Create account
        </Link>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss offer"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#0673ff]/60 transition-colors hover:text-[#0673ff]"
      >
        <FiX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default WelcomeOfferNote;
