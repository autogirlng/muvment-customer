// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import Button from "@/components/utils/Button";
import { Navbar } from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setError(null);
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
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      setError(error?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/dashboard/account/edit-profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl p-6 text-center shadow-md">
            <p className="text-gray-500 mb-4">
              {error || "Failed to load profile"}
            </p>
            <Button onClick={fetchProfile} color="primary" className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className=" sm:text-[0.8rem] md:text-xl font-bold text-gray-900 tracking-wide text-center sm:text-left">
            PROFILE INFORMATION
          </h1>

          <Button
            onClick={handleEditProfile}
            color="primary"
            variant="outline"
            className="px-6 py-2 md:py-2.5 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition font-medium w-full sm:w-auto"
          >
            Edit Profile
          </Button>
        </div>

        {/* Profile Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:items-start mb-10">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Profile Picture
            </label>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-400">
                  {profile.firstName
                    ? profile.firstName.charAt(0).toUpperCase()
                    : profile.lastName
                    ? profile.lastName.charAt(0).toUpperCase()
                    : "?"}
                </span>
              )}
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                First name
              </label>
              <div className="bg-gray-100 rounded-xl px-5 py-3">
                <p className="text-gray-700 break-words">
                  {profile.firstName || "-"}
                </p>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Last name
              </label>
              <div className="bg-gray-100 rounded-xl px-5 py-3">
                <p className="text-gray-700 break-words">
                  {profile.lastName || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-gray-100 rounded-xl px-5 py-3 flex-1">
                <p className="text-gray-700 break-words">
                  {profile.phoneNumber || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <div className="bg-gray-100 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <p className="text-gray-700 flex-1 break-all">{profile.email}</p>
              {profile.verified && (
                <span className="px-4 py-1.5 text-sm bg-green-50 text-green-600 border border-green-500 rounded-full font-medium whitespace-nowrap">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
