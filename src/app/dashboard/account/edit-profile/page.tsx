"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileFormData,
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import Button from "@/components/utils/Button";
import { Navbar } from "@/components/Navbar";

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [imageState, setImageState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    error: null,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await ProfileService.getMyProfile();
      let profileData: UserProfile | null = null;
      const respData = response?.data;

      if (Array.isArray(respData)) {
        const first = respData[0];
        profileData = (first && (first.data ?? first)) as UserProfile | null;
      } else {
        profileData = respData as UserProfile | null;
      }

      setProfile(profileData);
      setFormData({
        firstName: profileData?.firstName || "",
        lastName: profileData?.lastName || "",
        phoneNumber: profileData?.phoneNumber || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB
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
      const formData = new FormData();
      formData.append("file", file);
      await ProfileService.updateProfilePicture(formData);
      await fetchProfile();
      setImageState({ file: null, preview: null, error: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
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
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setUpdating(true);
    try {
      await ProfileService.updateProfile(formData);
      router.push("/dashboard/account/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => router.back();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-11/12 sm:w-3/4 lg:w-1/2 bg-white p-6 rounded-xl shadow animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-11/12 sm:w-3/4 lg:w-1/2 bg-white p-8 rounded-xl text-center shadow">
          <p className="text-gray-500 mb-4">Failed to load profile</p>
          <Button onClick={fetchProfile} color="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayImage = imageState.preview || profile?.profilePictureUrl;

  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6 sm:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wide">
                PROFILE INFORMATION
              </h1>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-6 py-2 rounded-full border-2 border-black text-black hover:bg-gray-50 font-medium w-full sm:w-auto"
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-full bg-gray-800 text-white font-medium w-full sm:w-auto"
                  disabled={updating}
                  loading={updating}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-400">
                        {profile.firstName
                          ? profile.firstName.charAt(0).toUpperCase()
                          : profile.lastName
                          ? profile.lastName.charAt(0).toUpperCase()
                          : "?"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-start">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="px-6 py-2 rounded-full border-2 border-black text-black hover:bg-gray-50 font-medium"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Profile Image"}
                  </Button>
                  {imageState.error && (
                    <p className="text-sm text-red-600 mt-2">
                      {imageState.error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <div className="bg-gray-100 rounded-xl px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <p className="text-gray-600 flex-1 text-sm sm:text-base break-all">
                    {profile.email}
                  </p>
                  {profile.verified && (
                    <span className="px-4 py-1 text-sm bg-white text-green-600 border border-green-600 rounded-full font-medium text-center sm:text-left">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
