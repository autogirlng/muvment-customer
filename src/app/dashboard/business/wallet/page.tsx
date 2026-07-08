"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCopy, FiCheck, FiRefreshCw, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import {
  OrganizationWalletInfo,
  WalletTransaction,
} from "@/types/Organization.type";

const PAGE_SIZE = 20;

const naira = (value?: number) =>
  `₦${Number(value ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function BusinessWalletPage() {
  const { user, isLoading } = useAuth();
  const corp = useCorporateMembership();
  const router = useRouter();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [noOrg, setNoOrg] = useState(false);
  const [wallet, setWallet] = useState<OrganizationWalletInfo | null>(null);
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (id: string) => {
    const [info, list] = await Promise.all([
      OrganizationService.getWalletInfo(id),
      OrganizationService.getWalletTransactions(id, 0, PAGE_SIZE),
    ]);
    setWallet(info);
    setTxns(list.content);
    setPage(list.currentPage);
    setTotalPages(list.totalPages);
  }, []);

  const loadMore = async () => {
    if (!orgId || loadingMore) return;
    setLoadingMore(true);
    const next = await OrganizationService.getWalletTransactions(
      orgId,
      page + 1,
      PAGE_SIZE,
    );
    setTxns((prev) => [...prev, ...next.content]);
    setPage(next.currentPage);
    setTotalPages(next.totalPages);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (isLoading || corp.loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!corp.loading && !corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    let active = true;
    (async () => {
      const orgs = await OrganizationService.getMyOrganizations();
      if (!active) return;
      const org = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;
      if (!org?.id) {
        setNoOrg(true);
        setLoading(false);
        return;
      }
      setOrgId(org.id);
      await load(org.id);
      if (!active) return;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isLoading, corp.loading, corp.isOwnerLike, user, router, load]);

  // A bank transfer lands via a Paystack webhook, so the balance changes without
  // any action here. Poll quietly while the page is open and the tab is visible.
  useEffect(() => {
    if (!orgId) return;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      load(orgId);
    }, 20000);
    return () => clearInterval(id);
  }, [orgId, load]);

  const handleRefresh = async () => {
    if (!orgId) return;
    setRefreshing(true);
    await load(orgId);
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!wallet?.virtualAccountNumber) return;
    try {
      await navigator.clipboard.writeText(wallet.virtualAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
      </div>
    );
  }

  if (noOrg) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your business first
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create your business account to get a wallet you can fund.
          </p>
          <button
            onClick={() => router.push("/business-setup")}
            className="mt-4 rounded-xl bg-[#0673FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0560d6]"
          >
            Set up business
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Business wallet
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Fund your wallet to pay for staff trips.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Balance */}
      <div className="rounded-2xl bg-[#0673FF] p-6 text-white shadow-sm">
        <p className="text-sm text-white/80">Available balance</p>
        <p className="mt-1 text-3xl font-bold">{naira(wallet?.balance)}</p>
      </div>

      {/* Fund */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          Add money to your wallet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Transfer any amount to the account below from your bank app. Your
          balance updates automatically, usually within a few minutes.
        </p>

        {wallet?.virtualAccountNumber ? (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Account number</p>
                <p className="text-lg font-bold tracking-wide text-gray-900">
                  {wallet.virtualAccountNumber}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <FiCheck className="h-4 w-4 text-green-600" /> Copied
                  </>
                ) : (
                  <>
                    <FiCopy className="h-4 w-4" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
              <div>
                <p className="text-xs text-gray-500">Bank</p>
                <p className="text-sm font-medium text-gray-900">
                  {wallet.bankName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account name</p>
                <p className="text-sm font-medium text-gray-900">
                  {wallet.accountName || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            Your funding account is being set up. Tap refresh in a moment to see
            the account details.
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Transactions
          </h2>
        </div>
        {txns.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No transactions yet. Fund your wallet to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {txns.map((t) => {
              const credit = t.transactionType === "CREDIT";
              return (
                <li
                  key={t.transactionId}
                  className="flex items-center gap-3 p-4 sm:px-5"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      credit ? "bg-green-50" : "bg-gray-100"
                    }`}
                  >
                    {credit ? (
                      <FiArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <FiArrowUpRight className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {t.description || (credit ? "Wallet funding" : "Booking")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(t.createdAt)}
                      {t.staffName ? ` · ${t.staffName}` : ""}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      credit ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {credit ? "+" : "-"}
                    {naira(t.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {page + 1 < totalPages && (
          <div className="border-t border-gray-100 p-4 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
