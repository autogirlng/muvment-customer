"use client";
import { useState, useRef, useEffect } from "react";
import { AuthService } from "@/controllers/auth/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Button from "@/components/utils/Button";
import OtpInput from "@/components/AuthComponent/OTPInput";

export default function VerifyAccountComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email] = useState(emailFromUrl); // Email is read-only, set from URL
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first OTP input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Redirect to signup if no email in URL
  useEffect(() => {
    if (!emailFromUrl) {
      toast.error("Email is required. Please sign up first.");
      router.push("/auth/register");
    }
  }, [emailFromUrl, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    setOtp(otp);
  });

  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.verifyAccount({
        email,
        otp: otpValue,
      });

      if (response.error) {
        toast.error(
          response.message || "Verification failed. Please try again."
        );
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.success("Account verified successfully!");

        // Redirect to login after successful verification
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsResending(true);

    try {
      const response = await AuthService.resendVerificationOTP({ email });

      if (response.error) {
        toast.error(
          response.message || "Failed to resend code. Please try again."
        );
      } else {
        toast.success("Verification code sent successfully!");
        setResendTimer(60);
        // Clear current OTP
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth/reset_password_bg.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
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
                onClick={() => router.push("/auth/register")}
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
                Verify your account
              </h1>
              <p className="text-base text-gray-500">
                We've sent a 6-digit code to <strong>{email}</strong>. Please
                enter it below.
              </p>
            </div>

            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Verification Code
                </label>
                <div className="flex gap-3 justify-between">
                  <OtpInput
                    length={6}
                    onChange={(value) => {
                      setOtp(value.split(""));
                    }}
                  />
                </div>
              </div>

              {/* Resend Code */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || resendTimer > 0}
                  className={`text-sm font-medium ${isResending || resendTimer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:underline"
                    }`}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : isResending
                      ? "Sending..."
                      : "Resend Code"}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || otp.join("").length !== 6}
                className={`w-full py-5 rounded-2xl font-medium transition-all duration-200 text-sm ${isLoading || otp.join("").length !== 6
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-900 active:scale-95"
                  }`}
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-12">
              Need help?{" "}
              <a
                href="/support"
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
