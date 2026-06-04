// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import Button from "@/components/utils/Button";
import { Navbar } from "@/components/Navbar";
import { MdCalendarToday } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { FaUser } from "react-icons/fa";

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
      <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-md">
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
        <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 text-center shadow-md">
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

  const initials = profile.firstName
    ? profile.firstName.charAt(0).toUpperCase()
    : profile.lastName
    ? profile.lastName.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="bg-[#EFF6FF] min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-widest uppercase">
              Profile Information
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your personal information and account details
            </p>
          </div>
          <Button
            onClick={handleEditProfile}
            color="primary"
            variant="outline"
            className="px-6 py-2 md:py-2.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition font-medium w-full sm:w-auto"
          >
            Edit Profile
          </Button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Left: Profile Details */}
            <div className="flex-1 p-6 sm:p-8">

              {/* Profile Picture */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Profile Picture
                </p>
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile.profilePictureUrl ? (
                      <img
                        src={profile.profilePictureUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-500">
                        {initials}
                      </span>
                    )}
                  </div>
                  {/* Pencil edit button */}
                  <button
                    onClick={handleEditProfile}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                    aria-label="Edit profile picture"
                  >
                    <FiEdit2 className="text-white w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    First name
                  </label>
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <p className="text-gray-700">{profile.firstName || "-"}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Last name
                  </label>
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <p className="text-gray-700">{profile.lastName || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="bg-gray-100 rounded-xl px-4 py-3">
                  <p className="text-gray-700">{profile.phoneNumber || "-"}</p>
                </div>
              </div>

              {/* Email */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <div className="bg-gray-100 rounded-xl px-4 py-3">
                  <p className="text-gray-700 break-all">{profile.email}</p>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-400 rounded-full font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MdCalendarToday className="w-4 h-4" />
                <span>Last updated: 2 days ago</span>
              </div>
            </div>

            {/* Right: Decorative Panel */}
            <div className="relative lg:w-[42%] min-h-[320px] lg:min-h-0 overflow-hidden">
              <Image
                src="/images/my-bookings-hero.webp"
                alt="Profile decoration"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent" />

              {/* Text content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                  <FaUser className="text-white w-5 h-5" />
                </div>
                <h2 className="text-white text-2xl font-bold leading-tight mb-2">
                  Your Profile,<br />Your Control
                </h2>
                <p className="text-blue-100 text-sm">
                  Keep your details up to date<br />for a seamless experience.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
