"use client";
import React, { useEffect } from "react";
import { FiX, FiLogIn, FiHeart } from "react-icons/fi";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfterLogin?: string;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  redirectAfterLogin,
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

  const handleLogin = () => {
    const redirect = redirectAfterLogin || window.location.pathname;
    window.location.href = `/auth/login?redirect=${encodeURIComponent(redirect)}`;
    onClose();
  };

  const handleSignUp = () => {
    const redirect = redirectAfterLogin || window.location.pathname;
    window.location.href = `/auth/register?redirect=${encodeURIComponent(redirect)}`;
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Hero section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 pt-10 pb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FiHeart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <h2
              id="login-modal-title"
              className="text-2xl font-bold mb-2"
            >
              Save Your Favourites
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign in to save vehicles to your favourites list and access them
              anytime, anywhere.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Benefits */}
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              {[
                "Save and revisit your favourite vehicles",
                "Get notified about price changes",
                "Faster booking with saved preferences",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                <FiLogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Create an Account
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-blue-500 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-500 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPromptModal;