"use client";
import Button from "@/components/utils/Button";
import { AuthService } from "@/controllers/auth/auth";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "react-toastify";
import CountryCodeSelect from "@/components/general/forms/countryCodeSelect";
import { getCountryCallingCode } from "react-phone-number-input";
import { validatePhoneNumber } from "@/utils/validationSchema";
import { CountryCode } from "libphonenumber-js";
import { useAuth } from "@/context/AuthContext";

const MAX_NAME_LENGTH = 60;
const MAX_COMPANY_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 64;
const PENDING_ORG_KEY = "muvment_pending_org";

// Normalise the entered phone into national digits, stripping a pasted country
// code or a leading trunk zero so it is never double-prefixed on submit.
const normalizePhoneDigits = (raw: string, callingCode: string): string => {
  let digits = (raw || "").replace(/\D/g, "");
  const cc = (callingCode || "").replace(/\D/g, "");
  if (cc && digits.startsWith(cc) && digits.length > cc.length) {
    digits = digits.slice(cc.length);
  }
  digits = digits.replace(/^0+/, "");
  return digits;
};

interface SignupFormValues {
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  referralCode: string;
  companyName: string;
  password: string;
}


const makeInitialValues = (): SignupFormValues => ({
  firstName: "",
  lastName: "",
  country: "NG",
  countryCode: "+234",
  phoneNumber: "",
  email: "",
  referralCode: "",
  companyName: "",
  password: "",
});

function SignupContent() {
  const [formValues, setFormValues] = useState<SignupFormValues>(() =>
    makeInitialValues(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"individual" | "business">(
    "individual",
  );
  const searchParams = useSearchParams();
  const ReferalCode = searchParams.get("code") || "";
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Keep an already-signed-in user off the signup form.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (name: string, value: string) => {
    if (name === "accountType") {
      // handled by setAccountType; kept for safety
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear this field's error as soon as the user starts correcting it, so it
    // does not stay red until the next submit.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getPhoneError = (number: string, country: string, code: string) =>
    number.trim() &&
    !validatePhoneNumber(
      `${code}${normalizePhoneDigits(number, code)}`,
      country as CountryCode,
    )
      ? "Please enter a valid phone number"
      : "";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formValues.firstName.trim().length > MAX_NAME_LENGTH) {
      newErrors.firstName = "First name is too long";
    }

    if (!formValues.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formValues.lastName.trim().length > MAX_NAME_LENGTH) {
      newErrors.lastName = "Last name is too long";
    }

    const email = formValues.email.trim();
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formValues.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !validatePhoneNumber(
        `${formValues.countryCode}${normalizePhoneDigits(
          formValues.phoneNumber,
          formValues.countryCode,
        )}`,
        formValues.country as CountryCode,
      )
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formValues.password) {
      newErrors.password = "Password is required";
    } else if (formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formValues.password.length > MAX_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
    }

    if (accountType === "business") {
      if (!formValues.companyName.trim()) {
        newErrors.companyName = "Company name is required";
      } else if (formValues.companyName.trim().length > MAX_COMPANY_LENGTH) {
        newErrors.companyName = "Company name is too long";
      }
    }

    setTouched((prev) => ({
      ...prev,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      ...(accountType === "business" ? { companyName: true } : {}),
    }));

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted fields and try again.");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      toast.error("You appear to be offline. Check your connection and retry.");
      return;
    }

    setIsLoading(true);

    const isBusiness = accountType === "business";
    const chosenUserType: "CUSTOMER" | "ORGANIZATION_ADMIN" = isBusiness
      ? "ORGANIZATION_ADMIN"
      : "CUSTOMER";

    const email = formValues.email.trim().toLowerCase();
    const nationalPhone = normalizePhoneDigits(
      formValues.phoneNumber,
      formValues.countryCode,
    );

    try {
      const signupData = {
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email,
        password: formValues.password,
        phoneNumber: `${formValues.countryCode}${nationalPhone}`,
        userType: chosenUserType,
        ...(ReferalCode ? { referralCode: ReferalCode } : {}),
      };

      const response = await AuthService.signup(signupData);
      const dupMessage =
        response?.message || (response?.data as any)?.message || "";
      const errorCode = (response?.data as any)?.errorCode || "";
      const isDuplicate =
        /already|in use|duplicate|exists/i.test(dupMessage) ||
        errorCode === "DUPLICATE_KEY";

      if (response?.error || isDuplicate) {
        const isPhoneDup = /phone/i.test(dupMessage);
        const isEmailDup = /email/i.test(dupMessage);
        if (isPhoneDup) {
          const phoneMsg =
            "This phone number is already in use by another account.";
          toast.error(phoneMsg);
          setErrors((prev) => ({ ...prev, phoneNumber: phoneMsg }));
        } else if (isEmailDup) {
          const emailMsg = "This email is already registered.";
          toast.error(`${emailMsg} Try signing in instead.`);
          setErrors((prev) => ({ ...prev, email: emailMsg }));
        } else if (isDuplicate) {
          toast.error(
            "An account with these details already exists. Try signing in instead.",
          );
        } else {
          toast.error(
            response?.message || "Signup failed. Please try again.",
          );
        }
        return;
      }

      // Success: only now record the pending company name, keyed to the email
      // so it cannot bleed into another account on a shared browser.
      if (isBusiness) {
        try {
          localStorage.setItem(
            PENDING_ORG_KEY,
            JSON.stringify({ email, name: formValues.companyName.trim() }),
          );
        } catch {
          // non-blocking: setup still works without a pre-filled name
        }
      } else {
        try {
          localStorage.removeItem(PENDING_ORG_KEY);
        } catch {
          // ignore
        }
      }

      toast.success(
        (response?.data as any)?.message || "Account created successfully!",
      );
      setFormValues(makeInitialValues());
      setTouched({});
      setAccountType("individual");
      router.push(
        `/auth/account-verification?email=${encodeURIComponent(email)}`,
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const isFormValid = () => {
  //   const checks = formValues.passwordChecks;
  //   const isPhoneValid = validatePhoneNumber(
  //     formValues.phoneNumber,
  //     formValues.country
  //   );
  //   return (
  //     formValues.firstName.trim() &&
  //     formValues.lastName.trim() &&
  //     formValues.email.trim() &&
  //     isPhoneValid &&
  //     checks.digit &&
  //     checks.length &&
  //     checks.lowercase_letters &&
  //     checks.no_space &&
  //     checks.special_character &&
  //     checks.uppercase_letters
  //   );
  // };


  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth/signup_bg.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-[#101928]/70"></div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <button
              className="text-white text-left"
              onClick={() => router.push(`/`)}
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

        <div className="flex min-h-screen flex-col justify-center bg-white px-6 py-12">
          <div className="mx-auto w-full max-w-md">
            <button
              onClick={() => router.push("/")}
              className="lg:hidden mb-8 block w-fit"
              aria-label="Muvment home"
            >
              <Image
                src="/images/image.png"
                alt="Muvment"
                width={150}
                height={40}
              />
            </button>
            <div>
              <h1 className="md:text-5xl text-3xl font-bold text-[#101928]">
                Sign Up
              </h1>
              <p className="text-sm text-gray-500 pb-8 mt-2">
                Fuel your next adventure with a ride from Muvment.
              </p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span
                  id="account-type-label"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  I am signing up as
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="account-type-label"
                  className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-gray-100"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={accountType === "individual"}
                    onClick={() => {
                      setAccountType("individual");
                      setFormValues((prev) => ({ ...prev, companyName: "" }));
                      setErrors((prev) => ({ ...prev, companyName: "" }));
                    }}
                    className={`py-2.5 rounded-md text-sm font-medium transition-colors ${
                      accountType === "individual"
                        ? "bg-white text-[#0673FF] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    An individual
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={accountType === "business"}
                    onClick={() => setAccountType("business")}
                    className={`py-2.5 rounded-md text-sm font-medium transition-colors ${
                      accountType === "business"
                        ? "bg-white text-[#0673FF] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    A business
                  </button>
                </div>
                {accountType === "business" && (
                  <p className="mt-2 text-xs text-gray-500">
                    Create a company account to book trips for your staff and
                    manage them in one place. You will set up your company after
                    verifying your email.
                  </p>
                )}
              </div>

              {accountType === "business" && (
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Company name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    autoFocus
                    maxLength={MAX_COMPANY_LENGTH}
                    type="text"
                    value={formValues.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                    onBlur={() => handleBlur("companyName")}
                    placeholder="Enter your company name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.companyName && errors.companyName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#0673FF]`}
                  />
                  {touched.companyName && errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    maxLength={MAX_NAME_LENGTH}
                    type="text"
                    value={formValues.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.firstName && errors.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#0673FF]`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    maxLength={MAX_NAME_LENGTH}
                    type="text"
                    value={formValues.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.lastName && errors.lastName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#0673FF]`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Phone Number
                </label>
                <div className="flex items-stretch gap-2">
                  <div className="shrink-0 w-[140px]">
                    <CountryCodeSelect
                      value={formValues.country}
                      onChange={(value: string) => {
                        const code = `+${getCountryCallingCode(value as any)}`;
                        setFormValues({
                          ...formValues,
                          country: value,
                          countryCode: code,
                        });
                        if (touched.phoneNumber) {
                          setErrors((prev) => ({
                            ...prev,
                            phoneNumber: getPhoneError(
                              formValues.phoneNumber,
                              value,
                              code,
                            ),
                          }));
                        }
                      }}
                    />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    autoComplete="tel"
                    type="tel"
                    value={formValues.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormValues({ ...formValues, phoneNumber: val });
                      if (touched.phoneNumber) {
                        setErrors((prev) => ({
                          ...prev,
                          phoneNumber: getPhoneError(
                            val,
                            formValues.country,
                            formValues.countryCode,
                          ),
                        }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("phoneNumber");
                      setErrors((prev) => ({
                        ...prev,
                        phoneNumber: getPhoneError(
                          formValues.phoneNumber,
                          formValues.country,
                          formValues.countryCode,
                        ),
                      }));
                    }}
                    placeholder="Enter phone number"
                    className={`flex-1 min-w-0 h-[56px] px-4 rounded-[12px] border text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF] ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#0673FF]`}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    maxLength={MAX_PASSWORD_LENGTH}
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#0673FF]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                <p className="mt-1.5 text-xs text-gray-500">
                  Use at least 8 characters.
                </p>
              </div>

              {ReferalCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Referral Code
                  </label>
                  <input
                    name="referralCode"
                    type="text"
                    value={ReferalCode}
                    placeholder="Enter referral code (optional)"
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0673FF]"
                  />
                </div>
              )}

              <p className="text-sm text-gray-600">
                Already a user?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#0673FF] hover:underline font-medium"
                >
                  Sign In
                </Link>
              </p>

              <div>
                <p className="text-sm text-gray-600">
                  By signing up you agree to Muvment&apos;s{" "}
                  <Link
                    href="/policy/privacy-policy"
                    className="text-[#0673FF] hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/policy/terms-conditions"
                    className="text-[#0673FF] hover:underline font-medium"
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>

              {/* Change button type to "submit" */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-full font-semibold transition-all duration-200 text-sm ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#0673FF] text-white hover:bg-[#0560d6] active:scale-95"
                }`}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupComponent() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
