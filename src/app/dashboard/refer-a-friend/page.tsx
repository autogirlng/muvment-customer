"use client";

import { Navbar } from "@/components/Navbar";
import DataTable, { TableColumn } from "@/components/utils/TableComponent";
import {
  ProfileService,
  UserProfile,
} from "@/controllers/user/profile.service";
import { ReferralService } from "@/controllers/utils/referalService";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiCopy, FiShare2, FiUser } from "react-icons/fi";

interface ReferralData {
  id: number;
  fullName: string;
  referredAt: string;
}

const PAGE_SIZE = 10;

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
  const [userData, setProfile] = useState<UserProfile | null>(null);
  const [codeGenerated, setCodeGenerated] = useState(false);

  // Fetch profile once on mount (and after code generation)
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
          `${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/register?code=${profileData.referralCode}`,
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  // Fetch a page of referred users
  const fetchReferralPage = useCallback(async (pageNumber: number, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);

      const getcode = await ReferralService.getReferralCode();

      const result = getcode?.data[0].data;
      const content: ReferralData[] = result?.referredUsers?.content ?? [];
      const totalPages: number = result?.referredUsers?.totalPages ?? 1;
      const totalElements: number = result?.referredUsers?.totalElements ?? content.length;

      setReferrals((prev) => (reset ? content : [...prev, ...content]));
      setTotalReferrals(totalElements);
      setHasMore(pageNumber + 1 < totalPages);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProfile();
    setPage(0);
    setHasMore(true);
    fetchReferralPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeGenerated]);

  // Load next page when page increments
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
    setCodeGenerated(true);
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

  const columns: TableColumn<ReferralData>[] = [
    {
      key: "fullName",
      label: "Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser className="text-blue-600" />
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "referredAt",
      label: "Date Joined",
      render: (value) => (
        <span className="text-sm text-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Referrals
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Share your referral code and earn rewards when your friends join
            </p>
          </div>

          {/* Referral Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center sm:text-left">
              Your Referral Code
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={userData?.referralCode ?? ""}
                    readOnly
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-base sm:text-lg"
                  />
                  {!referralCode ? (
                    <button
                      onClick={generateReferralCode}
                      className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiCopy />
                      Generate
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiCopy />
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Link
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm truncate"
                  />
                  <button
                    onClick={handleShare}
                    className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiShare2 />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center sm:text-left">
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Total Referrals
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {totalReferrals}
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="mt-4 text-gray-600">Loading referrals...</p>
              </div>
            ) : (
              <div className="min-w-[700px] sm:min-w-full">
                <DataTable<ReferralData>
                  columns={columns}
                  data={referrals}
                  title="Your Referrals"
                  height="max-h-[500px]"
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}