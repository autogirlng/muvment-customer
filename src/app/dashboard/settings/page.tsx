"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import {
  FiUser,
  FiLock,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHelpCircle,
  FiChevronDown,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { FiBriefcase } from "react-icons/fi";
import SupportTab from "@/components/Dashboard/SupportTab";
import BusinessProfileTab from "@/components/settingsComponent/BusinessProfileTab";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";

const BRAND = "#0673ff";

type TabKey = "profile" | "security" | "business" | "support";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: FiUser },
  { key: "security", label: "Account security", icon: FiLock },
  { key: "business", label: "Business profile", icon: FiBriefcase },
  { key: "support", label: "Support", icon: FiHelpCircle },
];

export default function SettingsPage() {
  const router = useRouter();
  const corp = useCorporateMembership();
  const isBusiness = corp.isOwnerLike;
  const visibleTabs = TABS.filter(
    (t) => t.key !== "business" || isBusiness,
  );
  const [active, setActive] = useState<TabKey>("profile");
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const tabMenuRef = React.useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await ProfileService.getMyProfile();
      const respData: any = response?.data;
      let profileData: UserProfile | null = null;
      if (Array.isArray(respData)) {
        const first = respData[0];
        profileData = (first && (first.data ?? first)) as UserProfile | null;
      } else {
        profileData = respData as UserProfile | null;
      }
      setProfile(profileData);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!tabMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (tabMenuRef.current && !tabMenuRef.current.contains(e.target as Node)) {
        setTabMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [tabMenuOpen]);

  const activeTab = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <p className="text-sm text-gray-500 mb-5">
        Manage your profile, security, and support.
      </p>

      <div className="sticky top-16 z-10 -mx-4 mb-6 bg-gray-50 px-4 pt-2 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div ref={tabMenuRef} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setTabMenuOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <activeTab.icon className="h-4 w-4 text-[#0673ff]" />
            {activeTab.label}
          </span>
          <FiChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              tabMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {tabMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActive(tab.key);
                    setTabMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#E7F1FF] text-[#0673ff]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden gap-1 rounded-xl bg-gray-100 p-1 sm:inline-flex">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-[#0673ff] shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>
      </div>

      {active === "profile" && (
        <ProfileTab
          profile={profile}
          loading={loading}
          error={error}
          onRetry={fetchProfile}
          onEdit={() => router.push("/dashboard/settings/edit-profile")}
        />
      )}
      {active === "security" && <SecurityTab />}
      {active === "support" && <SupportTab />}
      {active === "business" && <BusinessProfileTab />}
    </div>
  );
}

/* ---------------- Profile ---------------- */

const ProfileTab = ({
  profile,
  loading,
  error,
  onRetry,
  onEdit,
}: {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: () => void;
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="animate-pulse space-y-5">
          <div className="h-20 w-20 rounded-full bg-gray-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
        <p className="text-gray-500 mb-4">{error || "Failed to load profile"}</p>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition"
          style={{ backgroundColor: BRAND }}
        >
          Try again
        </button>
      </div>
    );
  }

  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const picture = profile.profilePictureUrl || profile.profilePicture;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Profile picture
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {picture ? (
                    <img
                      src={picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  onClick={onEdit}
                  className="rounded-full border border-[#0673ff] px-4 py-1.5 text-sm font-medium text-[#0673ff] transition-colors hover:bg-[#0673ff] hover:text-white"
                >
                  Edit profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <Field label="First name" value={profile.firstName} />
              <Field label="Last name" value={profile.lastName} />
            </div>
            <div className="mb-5">
              <Field label="Phone number" value={profile.phoneNumber} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-gray-700 break-all">{profile.email}</p>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-full font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="relative lg:w-[40%] min-h-[220px] lg:min-h-0 p-6 sm:p-8 flex flex-col justify-end text-white"
            style={{
              background: "linear-gradient(135deg, #0673ff 0%, #0a55c4 100%)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <FaUser className="text-white w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Your profile, your control
            </h2>
            <p className="text-white/80 text-sm">
              Keep your details up to date for a seamless booking experience.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">
      {label}
    </label>
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
      <p className="text-gray-700">{value || "-"}</p>
    </div>
  </div>
);

/* ---------------- Account security ---------------- */

const PasswordInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 focus:outline-none focus:border-[#0673ff] focus:ring-1 focus:ring-[#0673ff]"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const SecurityTab = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    if (!oldPassword || !newPassword || !confirm) {
      setState("error");
      setMessage("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setState("error");
      setMessage("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setState("error");
      setMessage("The new password and confirmation do not match.");
      return;
    }
    setState("saving");
    try {
      await ProfileService.changePassword({ oldPassword, newPassword });
      setState("done");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      setState("error");
      setMessage(
        err?.message || "Could not change your password. Please try again.",
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl">
      <div className="flex items-start gap-3 mb-6">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#E7F1FF", color: BRAND }}
        >
          <FiLock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Change password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your current password and choose a new one.
          </p>
        </div>
      </div>

      {state === "done" ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <FiCheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Password updated</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Your password has been changed. You will use it the next time you
            sign in.
          </p>
          <button
            onClick={() => setState("idle")}
            className="mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-md">
          <PasswordInput
            label="Current password"
            value={oldPassword}
            onChange={setOldPassword}
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
          />

          {state === "error" && message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={submit}
              disabled={state === "saving"}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {state === "saving" ? "Saving..." : "Update password"}
            </button>
            <Link
              href="/auth/reset-password"
              className="text-sm font-medium hover:underline text-center sm:text-left"
              style={{ color: BRAND }}
            >
              Forgot your current password?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
