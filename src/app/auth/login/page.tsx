"use client";
import { AuthService } from "@/controllers/auth/auth";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext hook
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: false,
};

export default function LoginComponent() {
  const router = useRouter();
  const { login } = useAuth(); // Get login method from AuthContext

  const [formValues, setFormValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string | boolean) => {
    setFormValues({ ...formValues, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formValues.password) {
      newErrors.password = "Password is required";
    } else if (formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const loginData = {
        email: formValues.email,
        password: formValues.password,
      };

      const response = await AuthService.login(loginData);

      if (response.error) {
        if (
          response.message === "Please verify your email before logging in."
        ) {
          toast.error(response.message);
          router.push(
            `/auth/account-verification?email=${encodeURIComponent(
              formValues.email
            )}`
          );
          return;
        }
        setErrors({
          submit:
            response.message || "Login failed. Please check your credentials.",
        });
        toast.error(response.message);
      } else {
        const user = response.data.data;
        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;

        login(user, {
          accessToken,
          refreshToken,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formValues.email.trim() &&
      formValues.password.trim() &&
      formValues.password.length >= 8 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left Side - Background Image */}
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth/login_bg.png')",
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="absolute inset-0 flex items-start justify-start p-8">
            <div
              className="text-white cursor-pointer"
              onClick={() => router.push(`/`)}
            >
              <h1 className="text-4xl font-bold mb-2">Muvment</h1>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col bg-white overflow-y-auto h-screen px-6 pt-16">
          <div className="max-w-[90%] m-auto w-full flex flex-col justify-center min-h-screen py-12">
            <div className="mb-8">
              <h1 className="md:text-5xl text-4xl font-bold text-black mb-3">
                Welcome back
              </h1>
              <p className="text-base text-gray-500">
                Log in to pick up where you left off.
              </p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formValues.rememberMe}
                    onChange={(e) =>
                      handleChange("rememberMe", e.target.checked)
                    }
                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-500 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
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
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Sign Up Link */}
              <p className="text-sm text-gray-600 text-center">
                Not a user?{" "}
                <a
                  href="/signup"
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign Up
                </a>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-600 mt-12">
              By signing in you agree to Muvment's{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
