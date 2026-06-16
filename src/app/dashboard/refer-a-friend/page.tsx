"use client";

import DataTable, { TableColumn } from "@/components/utils/TableComponent";
import {
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import { ReferralService } from "@/controllers/utils/referalService";
import React, { useState, useEffect, useCallback } from "react";
import { FiCopy, FiShare2 } from "react-icons/fi";

interface ReferralData {
  id: string;
  referee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    departmentName: string;
    referredById: string;
    active: boolean;
  };
  creditedAmount: number;
}

const PAGE_SIZE = 10;

const formatNaira = (amount?: number) =>
  typeof amount === "number" ? `₦${amount.toLocaleString("en-NG")}` : "₦0";

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-sm sm:p-4">
    <p className="text-lg font-bold text-gray-900 sm:text-2xl">{value}</p>
    <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{label}</p>
  </div>
);

const columns: TableColumn<ReferralData>[] = [
  {
    key: "referee",
    label: "Name",
    render: (value) => {
      const initials =
        `${value?.firstName?.[0] ?? ""}${value?.lastName?.[0] ?? ""}`.toUpperCase() ||
        "?";
      const name = `${value?.firstName ?? ""} ${value?.lastName ?? ""}`.trim();
      return (
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: "#0673ff" }}
          >
            {initials}
          </div>
          <span className="font-medium text-gray-900">{name || "—"}</span>
        </div>
      );
    },
  },
  {
    key: "referee",
    label: "Email",
    render: (value) => (
      <span className="text-sm text-gray-700">{value?.email || "—"}</span>
    ),
  },
  {
    key: "referee",
    label: "Phone",
    render: (value) => (
      <span className="text-sm text-gray-700">{value?.phoneNumber || "—"}</span>
    ),
  },
  {
    key: "referee",
    label: "Status",
    render: (value) => (
      <span
        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
          value?.active
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
      >
        {value?.active ? "Active" : "Pending"}
      </span>
    ),
  },
  {
    key: "creditedAmount",
    label: "Reward",
    render: (value) => (
      <span className="text-sm font-semibold text-gray-900">
        {formatNaira(value)}
      </span>
    ),
  },
];

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);

  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [, setProfile] = useState<UserProfile | null>(null);
  const [codeGenerated, setCodeGenerated] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await ProfileService.getMyProfile();
      const respData = response?.data;
      let profileData: UserProfile | null = null;

      if (Array.isArray(respData)) {
        const first = respData[0];
        profileData = (first && (first.data ?? first)) as UserProfile | null;
      } else {
        profileData = respData as UserProfile | null;
      }

      setProfile(profileData);

      if (profileData?.referralCode) {
        setReferralCode(profileData.referralCode);
        setReferralLink(
          `${process.env.NEXT_PUBLIC_VERCEL_URL || (typeof window !== "undefined" ? window.location.origin : "")}/auth/register?code=${profileData.referralCode}`,
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchReferralPage = useCallback(
    async (pageNumber: number, reset = false) => {
      try {
        reset ? setLoading(true) : setLoadingMore(true);

        const result = await ReferralService.getMyReferees({
          page: pageNumber,
          size: PAGE_SIZE,
        });
        const data = result?.data?.data ?? result?.data;
        const content: ReferralData[] = data?.referees ?? [];
        const totalPages: number = data?.totalPages ?? 1;
        const totalElements: number = data?.totalElements ?? content.length;

        setReferrals((prev) => (reset ? content : [...prev, ...content]));
        setTotalReferrals(totalElements);
        setHasMore(pageNumber + 1 < totalPages);
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchProfile();
    setPage(0);
    setHasMore(true);
    fetchReferralPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeGenerated]);

  useEffect(() => {
    if (page === 0) return;
    fetchReferralPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const generateReferralCode = async () => {
    await ReferralService.generateReferralCode();
    setCodeGenerated((v) => !v);
  };

  const handleCopyCode = () => {
    if (referralCode) navigator.clipboard.writeText(referralCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join with my referral code",
          text: `Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  const activeCount = referrals.filter((r) => r.referee?.active).length;
  const totalEarned = referrals.reduce(
    (sum, r) => sum + (r.creditedAmount || 0),
    0,
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Share card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div
            className="p-5 text-white sm:p-6"
            style={{
              background: "linear-gradient(135deg, #0673ff 0%, #0a55c4 100%)",
            }}
          >
            <h2 className="text-lg font-bold sm:text-xl">
              Invite friends, earn rewards
            </h2>
            <p className="mt-1 text-sm text-white/85">
              Share your code or link. When a friend signs up with it, you earn
              rewards.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Referral code
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    placeholder="Not generated yet"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono text-base sm:flex-1"
                  />
                  {!referralCode ? (
                    <button
                      onClick={generateReferralCode}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0673ff] px-4 py-2.5 font-medium text-white transition hover:opacity-90"
                    >
                      Generate
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0673ff] px-4 py-2.5 font-medium text-white transition hover:opacity-90"
                    >
                      <FiCopy /> {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Referral link
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    placeholder="Generate a code to get your link"
                    className="w-full truncate rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm sm:flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      disabled={!referralLink}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                    >
                      <FiCopy /> Copy
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={!referralLink}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0673ff] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:flex-none"
                    >
                      <FiShare2 /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Referrals" value={String(totalReferrals)} />
          <StatCard label="Active" value={String(activeCount)} />
          <StatCard label="Earned" value={formatNaira(totalEarned)} />
        </div>

        {/* Referrals list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Your referrals
          </h3>
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0673ff]" />
              <p className="mt-4 text-gray-600">Loading referrals...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-gray-900">No referrals yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                Share your link with friends. Once they sign up with your code,
                they will show up here.
              </p>
            </div>
          ) : (
            <DataTable<ReferralData>
              columns={columns}
              data={referrals}
              itemLabel="referral"
              height="max-h-none"
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </div>
    </div>
  );
}
