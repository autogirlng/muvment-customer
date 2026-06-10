"use client";
import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { AuthService } from "@/controllers/auth/auth";
import OtpInput from "@/components/AuthComponent/OTPInput";
import ScreenLoader from "@/components/utils/ScreenLoader";

const WHATSAPP_URL = "https://wa.me/2348167474165";

interface PasswordChecks {
  digit: boolean;
  length: boolean;
  lowercase_letters: boolean;
  no_space: boolean;
  special_character: boolean;
  uppercase_letters: boolean;
}

const PASSWORD_RULES: { key: keyof PasswordChecks; label: string }[] = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase_letters", label: "Uppercase letter" },
  { key: "lowercase_letters", label: "Lowercase letter" },
  { key: "digit", label: "Number" },
  { key: "special_character", label: "Special character" },
  { key: "no_space", label: "No spaces" },
];

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [passwordChecks, setPasswordChecks] = useState<PasswordChecks>({
    digit: false,
    length: false,
    lowercase_letters: false,
    no_space: false,
    special_character: false,
    uppercase_letters: false,
  });

  const validatePassword = (password: string): PasswordChecks => ({
    digit: /\d/.test(password),
    length: password.length >= 8,
    lowercase_letters: /[a-z]/.test(password),
    no_space: !/\s/.test(password) && password.length > 0,
    special_character: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    uppercase_letters: /[A-Z]/.test(password),
  });

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordChecks(validatePassword(value));
    if (error) setError("");
  };

  const allChecksPass = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    !!email && otp.length === 6 && allChecksPass && passwordsMatch;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setNavigating(true);
    setError("");
    try {
      const res = await AuthService.resetPassword({ email, otp, newPassword });
      if (res.error) {
        setError(res.message || "Couldn't reset your password. Please try again.");
        setIsLoading(false);
        setNavigating(false);
      } else {
        toast.success("Password updated.");
        router.push("/auth/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
      setNavigating(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border px-4 py-3 text-[#101928] outline-none transition-all duration-150 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF]/15";

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
                Create new password
              </h1>
              <p className="text-sm text-gray-500">
                Enter the code sent to your email, then choose a new password.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-900">
                  Verification code
                </label>
                <OtpInput
                  length={6}
                  value={otp}
                  align="start"
                  disabled={isLoading}
                  onChange={(v) => {
                    setOtp(v);
                    if (error) setError("");
                  }}
                />
              </div>

              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched({ ...touched, newPassword: true })}
                    placeholder="Enter new password"
                    className={`${inputBase} pr-12 ${
                      touched.newPassword && newPassword && !allChecksPass
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#0673FF]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {PASSWORD_RULES.map(({ key, label }) => {
                      const ok = passwordChecks[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                              ok ? "bg-[#0673FF]" : "bg-gray-200"
                            }`}
                          >
                            {ok && (
                              <svg
                                className="h-2.5 w-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs ${
                              ok ? "text-gray-700" : "text-gray-400"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={() =>
                      setTouched({ ...touched, confirmPassword: true })
                    }
                    placeholder="Re-enter new password"
                    className={`${inputBase} pr-12 ${
                      touched.confirmPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#0673FF]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-500">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-all duration-200 ${
                  isLoading
                    ? "bg-[#0673FF] text-white cursor-wait"
                    : !isFormValid
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#0673FF] text-white hover:bg-[#0560d6] active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Updating
                  </>
                ) : (
                  "Reset password"
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

export default function ResetPasswordComponent() {
  return (
    <Suspense fallback={<ScreenLoader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
