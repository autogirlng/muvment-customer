"use client";
import { useState, useRef, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/controllers/auth/auth";
import OtpInput from "@/components/AuthComponent/OTPInput";
import Input from "@/components/utils/InputComponent";
import { toast } from "react-toastify";

export default function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [passwordChecks, setPasswordChecks] = useState({
    digit: false,
    length: false,
    lowercase_letters: false,
    no_space: false,
    special_character: false,
    uppercase_letters: false,
  });

  const validatePassword = (password: string) => {
    return {
      digit: /\d/.test(password),
      length: password.length >= 8,
      lowercase_letters: /[a-z]/.test(password),
      no_space: !/\s/.test(password),
      special_character: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      uppercase_letters: /[A-Z]/.test(password),
    };
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordChecks(validatePassword(value));
    setError("");
  };
  useEffect(() => {
    setOtp(otp);
  });
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (otp.join("").length !== 6) {
      setError("Please enter the complete 6-digit code");
      return false;
    }

    if (!newPassword) {
      setError("New password is required");
      return false;
    }

    const checks = passwordChecks;
    if (
      !checks.digit ||
      !checks.length ||
      !checks.lowercase_letters ||
      !checks.no_space ||
      !checks.special_character ||
      !checks.uppercase_letters
    ) {
      setError("Password does not meet all requirements");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await AuthService.resetPassword({
        email,
        otp: otp.join(""),
        newPassword,
      });

      if (response.error) {
        toast.error(
          response.message || "Failed to reset password. Please try again."
        );
      } else {
        toast.success("Password reset successfully!");

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const checks = passwordChecks;
    return (
      email.trim() &&
      otp.join("").length === 6 &&
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      checks.digit &&
      checks.length &&
      checks.lowercase_letters &&
      checks.no_space &&
      checks.special_character &&
      checks.uppercase_letters
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/rest_password_bg.jpg')",
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
          <div className="max-w-[90%] m-auto w-full py-12">
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
                Create new password
              </h1>
              <p className="text-base text-gray-500">
                Enter the code sent to your email and create a new password
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

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Verification Code
                </label>
                <div className="flex gap-3 justify-between">
                  <OtpInput
                    length={6}
                    onChange={(value) => {
                      setOtp(value.split(""));
                      setError("");
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched({ ...touched, newPassword: true })}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries({
                    length: "At least 8 characters",
                    uppercase_letters: "Uppercase letter",
                    lowercase_letters: "Lowercase letter",
                    digit: "Number",
                    special_character: "Special character",
                    no_space: "No spaces",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          passwordChecks[key as keyof typeof passwordChecks]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks[key as keyof typeof passwordChecks] && (
                          <svg
                            className="w-3 h-3 text-white"
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
                      </div>
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    onBlur={() =>
                      setTouched({ ...touched, confirmPassword: true })
                    }
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.confirmPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
                {touched.confirmPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid()}
                className={`w-full py-5 rounded-2xl font-medium transition-all duration-200 text-sm ${
                  isLoading || !isFormValid()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-900 active:scale-95"
                }`}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-8">
              Remember your password?{" "}
              <a
                href="/auth/login"
                className="text-blue-500 hover:underline font-medium"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
