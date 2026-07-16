"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import {
  ProfileFormData,
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
import { allowedCountries } from "@/components/general/forms/icons";
import { validatePhoneNumber } from "@/utils/validationSchema";

const BRAND = "#0673ff";

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

const dialFor = (country: string) =>
  (allowedCountries as any[]).find((c) => c.value === country)?.option ||
  "+234";

const splitPhone = (raw?: string) => {
  if (!raw) return { country: "NG", countryCode: "+234", local: "" };
  const e164 = raw.startsWith("+") ? raw : "+" + raw.replace(/^0+/, "");
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed && parsed.country) {
    return {
      country: parsed.country as string,
      countryCode: "+" + parsed.countryCallingCode,
      local: parsed.nationalNumber as string,
    };
  }
  let local = raw.replace(/[^\d]/g, "");
  if (local.startsWith("234")) local = local.slice(3);
  local = local.replace(/^0+/, "");
  return { country: "NG", countryCode: "+234", local };
};

const fieldClasses =
  "w-full h-[56px] px-4 rounded-[12px] border bg-white text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF]";

export default function EditProfilePage() {
  const router = useRouter();
  const { setTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [country, setCountry] = useState("NG");
  const [countryCode, setCountryCode] = useState("+234");
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    error: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getMyProfile();
      let profileData: UserProfile | null = null;
      const respData = response?.data;

      if (Array.isArray(respData)) {
        const first: any = respData[0];
        profileData = (first && (first.data ?? first)) as UserProfile | null;
      } else {
        profileData = respData as UserProfile | null;
      }

      setProfile(profileData);
      const phone = splitPhone(profileData?.phoneNumber);
      setCountry(phone.country);
      setCountryCode(phone.countryCode);
      setFormData({
        firstName: profileData?.firstName || "",
        lastName: profileData?.lastName || "",
        phoneNumber: phone.local,
      });
      setEmail(profileData?.email || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(file.type))
      return "Please select a valid image file (PNG, JPG, JPEG)";
    if (file.size > maxSize) return "Image size must be less than 10MB";
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setImageState({ file: null, preview: null, error });
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      await ProfileService.updateProfilePicture(data);
      await fetchProfile();
      setImageState({ file: null, preview: null, error: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setImageState((prev) => ({
        ...prev,
        error: "Failed to upload image. Please try again.",
      }));
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !validatePhoneNumber(
        `${countryCode}${formData.phoneNumber}`,
        country as CountryCode,
      )
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setEmailError(null);
    if (!validateForm()) return;

    const trimmedEmail = email.trim().toLowerCase();
    const currentEmail = (profile?.email || "").trim().toLowerCase();
    const emailChanged = Boolean(trimmedEmail) && trimmedEmail !== currentEmail;

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setUpdating(true);
    try {
      const result = await ProfileService.updateProfile({
        ...formData,
        phoneNumber: `${countryCode}${formData.phoneNumber}`,
        countryCode,
        // Only send email when it actually changed, since this is a PATCH.
        ...(emailChanged ? { email: trimmedEmail } : {}),
      });

      // Changing the email reissues tokens; persist them so subsequent requests
      // are authenticated against the updated identity.
      if (result.accessToken && result.refreshToken) {
        setTokens(result.accessToken, result.refreshToken);
      }

      if (emailChanged) {
        toast.success(
          "Email updated. Please check your inbox to verify the new address.",
        );
      }

      router.push("/dashboard/settings");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update profile. Please try again.";
      if (/email/i.test(message)) {
        setEmailError(message);
      } else if (/phone/i.test(message)) {
        setErrors((prev) => ({ ...prev, phoneNumber: message }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => router.back();

  const displayImage = imageState.preview || profile?.profilePictureUrl;
  const initial =
    profile?.firstName?.charAt(0)?.toUpperCase() ||
    profile?.lastName?.charAt(0)?.toUpperCase() ||
    "?";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">Failed to load profile</p>
          <button
            onClick={fetchProfile}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: BRAND }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <button
        onClick={handleCancel}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E7F1FF]">
                <span className="text-2xl font-bold text-[#0673ff]">
                  {initial}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
              aria-label="Change photo"
            >
              <FiCamera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Change photo"}
            </button>
            <p className="mt-2 text-xs text-gray-400">PNG or JPG, up to 10MB</p>
            {imageState.error && (
              <p className="mt-1 text-sm text-red-600">{imageState.error}</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Details */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Personal details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={`${fieldClasses} ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={`${fieldClasses} ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <PhoneNumberAndCountryField
          label="Phone number"
          inputName="phoneNumber"
          inputPlaceholder="Enter phone number"
          selectValue={country}
          selectOnChange={(val: string) => {
            setCountry(val);
            setCountryCode(dialFor(val));
            if (errors.phoneNumber)
              setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
          }}
          inputValue={formData.phoneNumber}
          inputOnChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(
              "phoneNumber",
              e.target.value.replace(/[^\d]/g, ""),
            )
          }
          inputError={errors.phoneNumber}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            className={`w-full rounded-[12px] border px-4 py-3 text-sm text-gray-900 focus:border-[#0673ff] focus:outline-none ${
              emailError ? "border-red-500" : "border-gray-300"
            }`}
          />
          {emailError ? (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          ) : profile.verified ? (
            <p className="mt-1 text-xs text-green-600">
              Verified. Changing your email will require verifying the new
              address.
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              This email is not verified yet.
            </p>
          )}
        </div>
      </form>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={updating}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: BRAND }}
        >
          {updating ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
