"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { toast } from "react-toastify";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import BusinessSetupGate from "@/components/Dashboard/BusinessSetupGate";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { OrganizationBooking } from "@/types/Organization.type";
import { naira } from "@/utils/corporateAllowance";

const PAGE_SIZE = 10;

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

const bookedBy = (b: OrganizationBooking) => {
  const name = [b.user?.firstName, b.user?.lastName].filter(Boolean).join(" ");
  return name.trim() || b.user?.email || "A team member";
};

const passenger = (b: OrganizationBooking) => {
  const forOthers = b.isBookingForOthers ?? b.bookingForOthers ?? false;
  if (!forOthers) return null;
  return b.recipientFullName?.trim() || b.guestFullName?.trim() || "Guest";
};

export default function ApprovalsPage() {
  const router = useRouter();
  const corp = useCorporateMembership();

  const [items, setItems] = useState<OrganizationBooking[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const orgId = corp.org?.id ?? null;

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!orgId) return;
      const res = await OrganizationService.getPendingApprovals(
        orgId,
        nextPage,
        PAGE_SIZE,
      );
      setItems((prev) => (append ? [...prev, ...res.content] : res.content));
      setPage(res.currentPage);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    },
    [orgId],
  );

  useEffect(() => {
    if (corp.loading) return;
    if (!corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    if (!orgId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      await loadPage(0, false);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [corp.loading, corp.isOwnerLike, orgId, router, loadPage]);

  const act = async (b: OrganizationBooking, approve: boolean) => {
    if (!orgId || busyId) return;
    const label = approve ? "Approve" : "Decline";
    if (!window.confirm(`${label} this booking of ${naira(b.totalPrice)}?`)) return;
    setBusyId(b.bookingId);
    const res = approve
      ? await OrganizationService.approveBooking(orgId, b.bookingId)
      : await OrganizationService.declineBooking(orgId, b.bookingId);
    setBusyId(null);
    if (res.error) {
      toast.error(res.message || `Could not ${label.toLowerCase()} the booking.`);
      return;
    }
    toast.success(approve ? "Booking approved and charged." : "Booking declined.");
    setItems((prev) => prev.filter((x) => x.bookingId !== b.bookingId));
    setTotalItems((n) => Math.max(0, n - 1));
  };

  if (corp.loading || loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0673ff]" />
        </div>
      </div>
    );
  }

  if (!corp.loading && corp.isOwnerLike && !corp.org) {
    return (
      <BusinessSetupGate
        hasOrg={false}
        title="Approvals is a business feature"
        message="Finish setting up your business to review and approve team bookings."
      />
    );
  }

  if (!corp.org) return null;

  const hasMore = page + 1 < totalPages;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FF]">
            <FiClock className="h-6 w-6 text-[#0673ff]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending approvals</p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {totalItems}
            </p>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-gray-400 sm:block">
          Bookings held because they met a member's approval threshold. Approving
          charges the wallet.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
            <FiCheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">Nothing to approve</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Bookings that need your approval will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => {
            const rider = passenger(b);
            const busy = busyId === b.bookingId;
            return (
              <li
                key={b.bookingId}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {b.invoiceNumber || "Booking"}
                      </p>
                      <span className="text-lg font-bold text-gray-900">
                        {naira(b.totalPrice)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      By {bookedBy(b)}
                      {rider ? ` · for ${rider} (guest)` : ""}
                      {b.bookedAt ? ` · ${formatDate(b.bookedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/business/approvals/${b.bookingId}`,
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View details
                    </button>
                    <button
                      onClick={() => act(b, true)}
                      disabled={busy}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: "#0673ff" }}
                    >
                      {busy ? "Working..." : "Approve"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={async () => {
              if (loadingMore) return;
              setLoadingMore(true);
              await loadPage(page + 1, true);
              setLoadingMore(false);
            }}
            disabled={loadingMore}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
