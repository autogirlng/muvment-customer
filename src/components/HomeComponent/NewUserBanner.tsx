"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiTag, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "newUserOfferBannerDismissed";

const NewUserBanner: React.FC = () => {
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
    <div className="w-full bg-gradient-to-r from-[#0673ff] to-[#0560d6] text-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 pr-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center sm:text-left">
          <span className="hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
            <FiTag className="h-5 w-5" />
          </span>
          <p className="text-sm sm:text-[15px] font-medium leading-snug">
            New to Muvment? <span className="font-bold">Get 10% off</span> your
            first booking, up to ₦10,000, when you create an account.
          </p>
          <Link
            href="/auth/register"
            className="flex-shrink-0 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#0673ff] transition-colors hover:bg-[#eaf2ff]"
          >
            Create account
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss offer"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/70 transition-colors hover:text-white"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NewUserBanner;
