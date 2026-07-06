"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "signupOfferModalSeenAt";
// Don't show again for a week after it's been seen or dismissed.
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 4000;

const SignupPromoModal: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    let seenAt = 0;
    try {
      seenAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    } catch {
      seenAt = 0;
    }
    if (seenAt && Date.now() - seenAt < SNOOZE_MS) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setShown(true));
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const remember = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const close = () => {
    setShown(false);
    remember();
    window.setTimeout(() => setOpen(false), 200);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="First booking offer"
      onClick={close}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          <FiX className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-[#0673ff] to-[#0560d6] px-6 py-8 text-center text-white">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            First booking offer
          </span>
          <div className="mt-4 text-5xl font-extrabold leading-none">
            10% OFF
          </div>
          <div className="mt-1 text-sm font-medium text-white/85">
            your first booking, up to ₦10,000
          </div>
        </div>

        <div className="px-6 py-6 text-center">
          <h2 className="text-xl font-bold text-[#101928]">
            Sign up and save on your first ride
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Create a free Muvment account and your first booking is 10% off,
            capped at ₦10,000. It applies automatically at checkout.
          </p>

          <Link
            href="/auth/register"
            onClick={close}
            className="mt-5 block w-full rounded-full bg-[#0673ff] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0560d6]"
          >
            Create account
          </Link>
          <button
            onClick={close}
            className="mt-3 w-full text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            Maybe later
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              onClick={close}
              className="font-semibold text-[#0673ff] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPromoModal;
