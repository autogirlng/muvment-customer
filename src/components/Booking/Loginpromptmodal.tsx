"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiHeart, FiCheck } from "react-icons/fi";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfterLogin?: string;
  vehicleName?: string;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  redirectAfterLogin,
  vehicleName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const go = (path: string) => {
    const redirect = redirectAfterLogin || window.location.pathname;
    window.location.href = `${path}?redirect=${encodeURIComponent(redirect)}`;
    onClose();
  };

  const benefits = [
    "Keep your favourite cars in one place",
    "Book faster with your details saved",
    "Get alerts on price drops and availability",
  ];

  const content = (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0673ff] to-[#0b2c66] px-8 pt-10 pb-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiHeart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <h2 id="login-modal-title" className="text-2xl font-bold mb-2">
            {vehicleName
              ? `Save the ${vehicleName}`
              : "Save the cars you love"}
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Create a free account to keep your favourites and pick up right
            where you left off.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <ul className="space-y-3 mb-6 text-sm text-gray-700">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCheck className="w-3 h-3 text-[#0673ff]" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* Primary: drive sign-up */}
          <button
            onClick={() => go("/auth/register")}
            className="w-full bg-[#0673ff] hover:bg-[#0560d6] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Create free account
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Free, and takes less than a minute.
          </p>

          {/* Secondary: existing users */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <span className="text-sm text-gray-500">
              Already have an account?{" "}
            </span>
            <button
              onClick={() => go("/auth/login")}
              className="text-sm font-semibold text-[#0673ff] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-[#0673ff] hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[#0673ff] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
};

export default LoginPromptModal;
