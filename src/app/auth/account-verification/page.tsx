"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { AuthService } from "@/controllers/auth/auth";
import OtpInput from "@/components/AuthComponent/OTPInput";
import ScreenLoader from "@/components/utils/ScreenLoader";

const WHATSAPP_URL = "https://wa.me/2348167474165";

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      toast.error("Please sign up first.");
      router.push("/auth/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const isComplete = otp.length === 6;

  const handleSubmit = async () => {
    if (!isComplete) {
      setError("Enter the complete 6-digit code");
      return;
    }
    setIsLoading(true);
    setNavigating(true);
    setError("");
    try {
      const res = await AuthService.verifyAccount({ email, otp });
      if (res.error) {
        setError(res.message || "That code is incorrect or has expired.");
        setOtp("");
        setIsLoading(false);
        setNavigating(false);
      } else {
        toast.success("Account verified.");
        router.push("/auth/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setOtp("");
      setIsLoading(false);
      setNavigating(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendTimer > 0) return;
    setIsResending(true);
    setError("");
    try {
      const res = await AuthService.resendVerificationOTP({ email });
      if (res.error) {
        setError(res.message || "Couldn't resend the code. Please try again.");
      } else {
        toast.success("A new code is on its way.");
        setResendTimer(60);
        setOtp("");
      }
    } catch {
      setError("Couldn't resend the code. Please try again.");
    } finally {
      setIsResending(false);
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
                Verify your account
              </h1>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code we sent to{" "}
                <span className="font-medium text-[#101928] break-all">
                  {email}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <OtpInput
                  length={6}
                  value={otp}
                  align="start"
                  hasError={!!error}
                  disabled={isLoading}
                  onChange={(v) => {
                    setOtp(v);
                    if (error) setError("");
                  }}
                />
                {error && (
                  <p className="mt-3 text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-500">Didn&apos;t get the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || resendTimer > 0}
                  className={`font-medium ${
                    isResending || resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#0673FF] hover:underline"
                  }`}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : isResending
                      ? "Sending..."
                      : "Resend code"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !isComplete}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-all duration-200 ${
                  isLoading
                    ? "bg-[#0673FF] text-white cursor-wait"
                    : !isComplete
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#0673FF] text-white hover:bg-[#0560d6] active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying
                  </>
                ) : (
                  "Verify account"
                )}
              </button>

              <p className="text-sm text-gray-500">
                <Link
                  href="/auth/register"
                  className="font-medium text-[#0673FF] hover:underline"
                >
                  Back to sign up
                </Link>
              </p>
            </div>

            <div className="mt-10 flex items-center gap-2 text-sm text-gray-500">
              <span>Need help?</span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0673FF] hover:underline"
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

export default function VerifyAccountComponent() {
  return (
    <Suspense fallback={<ScreenLoader />}>
      <VerifyAccountContent />
    </Suspense>
  );
}
