"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiRefreshCw,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import {
  OrganizationWalletInfo,
  WalletTransaction,
} from "@/types/Organization.type";
import DataTable, { TableColumn } from "@/components/utils/TableComponent";
import FundWalletModal from "@/components/Dashboard/FundWalletModal";

type TxnRow = WalletTransaction & { id: string };

const PAGE_SIZE = 20;

const naira = (value?: number) =>
  `\u20A6${Number(value ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

export default function WalletPage() {
  const { user, isLoading } = useAuth();
  const corp = useCorporateMembership();
  const router = useRouter();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<OrganizationWalletInfo | null>(null);
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);

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
      router.replace("/login");
      return;
    }
    if (!corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    const id = corp.org?.id ?? null;
    setOrgId(id);
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      await load(id);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isLoading, corp.loading, corp.isOwnerLike, corp.org?.id, user, router, load]);

  // A bank transfer lands via a Paystack webhook, so the balance changes without any
  // action here. Poll quietly while the page is open and the tab is visible.
  useEffect(() => {
    if (!orgId) return;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      load(orgId);
    }, 20000);
    return () => clearInterval(id);
  }, [orgId, load]);

  const handleRefresh = async () => {
    if (!orgId || refreshing) return;
    setRefreshing(true);
    await load(orgId);
    setRefreshing(false);
  };

  if (isLoading || corp.loading || loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0673ff]" />
        </div>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your business first
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create your business account to get a wallet you can fund.
          </p>
        </div>
      </div>
    );
  }

  const columns: TableColumn<TxnRow>[] = [
    {
      key: "description",
      label: "Description",
      render: (value: unknown, row: TxnRow) => {
        const credit = row.transactionType === "CREDIT";
        return (
          <div className="flex items-center gap-3">
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
            <span className="font-medium text-gray-900">
              {(value as string) || (credit ? "Wallet funding" : "Booking")}
            </span>
          </div>
        );
      },
    },
    {
      key: "staffName",
      label: "By",
      render: (value: unknown) =>
        value ? (
          <span className="text-gray-700">{value as string}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value: unknown) => (
        <span className="text-gray-500">{formatDate(value as string)}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: unknown, row: TxnRow) => {
        const credit = row.transactionType === "CREDIT";
        return (
          <span
            className={`font-semibold ${credit ? "text-green-600" : "text-gray-900"}`}
          >
            {credit ? "+" : "-"}
            {naira(value as number)}
          </span>
        );
      },
    },
  ];

  const data = txns.map((t) => ({ ...t, id: t.transactionId }));
  const hasMore = page + 1 < totalPages;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm text-gray-500">Wallet balance</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {naira(wallet?.balance)}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFundOpen(true)}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:flex-none"
            style={{ backgroundColor: "#0673ff" }}
          >
            Fund wallet
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="shrink-0 rounded-lg border border-gray-300 bg-white p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <DataTable<TxnRow>
        columns={columns}
        data={data}
        height="max-h-none"
        itemLabel="transaction"
        hideMobileActions
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        emptyTitle="No transactions yet"
        emptyMessage="Fund your wallet to get started, and every funding and booking will show here."
        renderMobileCard={(t) => {
          const credit = t.transactionType === "CREDIT";
          return (
            <div className="flex items-center gap-3">
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
                  {t.staffName ? ` \u00B7 ${t.staffName}` : ""}
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
            </div>
          );
        }}
      />

      <FundWalletModal
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        wallet={wallet}
      />
    </div>
  );
}
