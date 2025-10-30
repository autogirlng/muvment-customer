"use client";
import Button from "@/components/utils/Button";
import { AuthService } from "@/controllers/auth/auth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { JSX, useState } from "react";
import { toast } from "react-toastify";

interface SignupFormValues {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  email: string;
  password: string;
  referralCode: string;
  passwordChecks: {
    digit: boolean;
    length: boolean;
    lowercase_letters: boolean;
    no_space: boolean;
    special_character: boolean;
    uppercase_letters: boolean;
  };
}

interface Country {
  value: string;
  label: string;
  code: string;
  flag: JSX.Element;
}

const FLAGS = {
  NG: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip0_7024_34985)">
        <path
          d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
          fill="#F0F0F0"
        />
        <path
          d="M0 12.0006C0 17.1603 3.2565 21.5587 7.82611 23.2543V0.74707C3.2565 2.44254 0 6.8411 0 12.0006Z"
          fill="#6DA544"
        />
        <path
          d="M23.998 12.0006C23.998 6.8411 20.7415 2.44254 16.1719 0.74707V23.2543C20.7415 21.5587 23.998 17.1603 23.998 12.0006Z"
          fill="#6DA544"
        />
      </g>
    </svg>
  ),
  GH: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip0_7024_34992)">
        <path
          d="M0 12.0003C0 13.4682 0.264047 14.8743 0.746391 16.1742L12 16.696L23.2536 16.1743C23.736 14.8743 24 13.4682 24 12.0003C24 10.5325 23.736 9.12644 23.2536 7.82645L12 7.30469L0.746391 7.82641C0.264047 9.12644 0 10.5325 0 12.0003H0Z"
          fill="#FFDA44"
        />
        <path
          d="M12.0036 0C6.84403 0 2.44552 3.2565 0.75 7.82611H23.2573C21.5617 3.2565 17.1632 0 12.0036 0Z"
          fill="#D80027"
        />
        <path
          d="M23.2572 16.1738H0.75C2.44552 20.7434 6.84403 23.9999 12.0036 23.9999C17.1632 23.9999 21.5617 20.7434 23.2572 16.1738Z"
          fill="#496E2D"
        />
        <path
          d="M11.998 7.82617L13.0339 11.0146H16.3868L13.6745 12.9854L14.7104 16.174L11.998 14.2033L9.28558 16.174L10.3217 12.9854L7.60938 11.0146H10.9621L11.998 7.82617Z"
          fill="black"
        />
      </g>
    </svg>
  ),
};

const COUNTRIES: Country[] = [
  { value: "NG", label: "+234", code: "NG", flag: FLAGS.NG },
  { value: "GH", label: "+233", code: "GH", flag: FLAGS.GH },
];

const INITIAL_VALUES: SignupFormValues = {
  firstName: "",
  lastName: "",
  country: "NG",
  phoneNumber: "",
  email: "",
  password: "",
  referralCode: "",
  passwordChecks: {
    digit: false,
    length: false,
    lowercase_letters: false,
    no_space: false,
    special_character: false,
    uppercase_letters: false,
  },
};

export default function SignupComponent() {
  const [formValues, setFormValues] =
    useState<SignupFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const searchParams = useSearchParams();
  const ReferalCode = searchParams.get("code");
  const route = useRouter();
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

  INITIAL_VALUES.referralCode = ReferalCode as string;

  const getPhoneNumberPlaceholder = (country: string): string => {
    if (country === "NG") return "8012345678";
    if (country === "GH") return "201234567";
    return "Enter phone number";
  };

  const handleChange = (name: string, value: string) => {
    if (name === "phoneNumber") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;
      if (formValues.country === "NG") formatted = cleaned.slice(0, 10);
      else if (formValues.country === "GH") formatted = cleaned.slice(0, 9);
      setFormValues({ ...formValues, [name]: formatted });
    } else if (name === "country") {
      setFormValues({ ...formValues, [name]: value, phoneNumber: "" });
      setShowCountryDropdown(false);
    } else if (name === "password") {
      const checks = validatePassword(value);
      setFormValues({ ...formValues, password: value, passwordChecks: checks });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formValues.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formValues.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formValues.password) newErrors.password = "Password is required";

    const checks = formValues.passwordChecks;
    if (
      !checks.digit ||
      !checks.length ||
      !checks.lowercase_letters ||
      !checks.no_space ||
      !checks.special_character ||
      !checks.uppercase_letters
    ) {
      newErrors.password = "Password does not meet all requirements";
    }

    // Store field-level errors so inputs can display them
    setErrors(newErrors);

    // If there are errors, show a combined toast message (string) instead of passing an object
    if (Object.keys(newErrors).length > 0) {
      const message = Object.values(newErrors).join(". ");
      toast.error(message);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("fytuyio");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);
    formValues.referralCode = ReferalCode as string;
    try {
      const signupData = formValues.referralCode
        ? {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            password: formValues.password,
            phoneNumber: formValues.phoneNumber,
            userType: "CUSTOMER" as const,
            referralCode: formValues.referralCode || undefined,
          }
        : {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            password: formValues.password,
            phoneNumber: formValues.phoneNumber,
            userType: "CUSTOMER" as const,
          };

      const response = await AuthService.signup(signupData);
      if (response.error) {
        toast.error(response.message);
      } else {
        toast.success(response.data.message || "Account created successfully!");
        setFormValues(INITIAL_VALUES);
        setTouched({});
        route.push(
          `/auth/account-verification?email=${encodeURIComponent(
            formValues.email
          )}`
        );
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message);
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

  const selectedCountry = COUNTRIES.find((c) => c.value === formValues.country);

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth/signup_bg.jpg')",
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
          <div className="max-w-[90%] m-auto w-full pb-12">
            <div>
              <h1 className="md:text-5xl text-3xl font-bold text-black">
                Sign Up
              </h1>
              <p className="text-sm text-gray-500 pb-8 mt-2">
                Fuel your next adventure with a ride from Muvment.
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Wrap the form inputs in a form element */}
            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formValues.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.firstName && errors.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formValues.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.lastName && errors.lastName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowCountryDropdown(!showCountryDropdown)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowCountryDropdown(false), 200)
                      }
                      className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 min-w-[130px]"
                    >
                      {selectedCountry && (
                        <>
                          {selectedCountry.flag}
                          <span className="font-medium">
                            {selectedCountry.label}
                          </span>
                        </>
                      )}
                      <svg
                        className={`w-4 h-4 ml-auto transition-transform ${
                          showCountryDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.value}
                            type="button"
                            onClick={() =>
                              handleChange("country", country.value)
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg text-left"
                          >
                            {country.flag}
                            <span className="font-medium">{country.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formValues.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder={getPhoneNumberPlaceholder(
                        formValues.country
                      )}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        touched.phoneNumber && errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-gray-800`}
                    />
                  </div>
                </div>
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

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
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}

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
                          formValues.passwordChecks[
                            key as keyof typeof formValues.passwordChecks
                          ]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {formValues.passwordChecks[
                          key as keyof typeof formValues.passwordChecks
                        ] && (
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

              {ReferalCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Referral Code
                  </label>
                  <input
                    name="referralCode"
                    type="text"
                    value={formValues.referralCode}
                    // onChange={(e) => handleChange("referralCode", e.target.value)}
                    placeholder="Enter referral code (optional)"
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
              )}

              <p className="text-sm text-gray-600">
                Already a user?{" "}
                <a
                  href="/auth/login"
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign In
                </a>
              </p>

              {/* Change button type to "submit" */}
              <Button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className={`w-full py-5 rounded-2xl font-medium transition-all duration-200 text-sm ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-900 active:scale-95"
                }`}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-8">
              By signing up you agree to Muvment's{" "}
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
