"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthService } from "@/controllers/auth/auth";
import ScreenLoader from "@/components/utils/ScreenLoader";

const WHATSAPP_URL = "https://wa.me/2348167474165";
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPasswordComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const emailValid = isValidEmail(email.trim());

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!emailValid) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setNavigating(true);
    try {
      const response = await AuthService.forgotPassword({ email });
      if (response.error) {
        setError(
          response.message || "Couldn't send the reset code. Please try again."
        );
        setIsLoading(false);
        setNavigating(false);
      } else {
        toast.success("Reset code sent. Check your email.");
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
      setNavigating(false);
    }
  };

  if (navigating) return <ScreenLoader />;

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden lg:flex relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/auth/login_bg.webp')" }}
          >
            <div className="absolute inset-0 bg-[#101928]/70" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <button
              className="text-white text-left"
              onClick={() => router.push("/")}
              aria-label="Muvment home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-white.svg"
                alt="Muvment"
                className="h-10 w-auto"
              />
            </button>
            <div className="text-white max-w-sm">
              <p className="text-2xl font-semibold leading-snug">
                Premium, reliable vehicle rentals across Nigeria and Ghana.
              </p>
              <p className="mt-3 text-white/70 text-sm leading-relaxed">
                Book verified vehicles with trusted drivers in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex min-h-screen flex-col justify-center bg-white px-6 py-12">
          <div className="mx-auto w-full max-w-md">
            <button
              onClick={() => router.push("/")}
              className="lg:hidden mb-10 block w-fit"
              aria-label="Muvment home"
            >
              <Image
                src="/images/image.webp"
                alt="Muvment"
                width={150}
                height={40}
                priority
              />
            </button>

            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#101928] mb-2">
                Reset password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email and we&apos;ll email you a code to reset your
                password.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="Enter email address"
                  className={`w-full rounded-xl border px-4 py-3 text-[#101928] outline-none transition-all duration-150 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF]/15 ${
                    touched && email && !emailValid
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-[#0673FF]"
                  }`}
                />
                {touched && email && !emailValid && (
                  <p className="mt-1.5 text-sm text-red-500">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !emailValid}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-all duration-200 ${
                  isLoading
                    ? "bg-[#0673FF] text-white cursor-wait"
                    : !emailValid
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#0673FF] text-white hover:bg-[#0560d6] active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending
                  </>
                ) : (
                  "Send reset code"
                )}
              </button>

              <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#0673FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-10 flex items-center gap-2 text-sm text-gray-500">
              <span>Need help?</span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#0673FF] hover:underline"
              >
                Chat with support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
