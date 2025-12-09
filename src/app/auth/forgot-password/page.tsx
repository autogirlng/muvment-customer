"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { AuthService } from "@/controllers/auth/auth";
import Link from "next/link";

export default function ForgotPasswordComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword({ email });

      if (response.error) {
        setError(
          response.message || "Failed to send reset email. Please try again."
        );
      } else {
        setSuccessMessage(
          "Password reset instructions have been sent to your email!"
        );

        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(email)}`
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth/login_bg.png')",
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="absolute inset-0 flex items-start justify-start p-8">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Muvment</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white overflow-y-auto h-screen px-6 pt-16">
          <div className="max-w-[90%] m-auto w-full flex flex-col justify-center min-h-screen py-12">
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center text-blue-500 hover:text-blue-600 mb-6"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>

              <h1 className="md:text-5xl text-4xl font-bold text-black mb-3">
                Reset password
              </h1>
              <p className="text-base text-gray-500">
                Enter your email, and we'll send you instructions to regain
                access
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched && error ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                />
                {touched && error && !successMessage && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !email.trim()}
                className={`w-full py-5 rounded-2xl font-medium transition-all duration-200 text-sm ${
                  isLoading || !email.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-900 active:scale-95"
                }`}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </button>

              <p className="text-sm text-gray-600 text-center">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <p className="text-center text-sm text-gray-600 mt-12">
              Need help?{" "}
              <a
                href="/contact-us"
                className="text-blue-500 hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
