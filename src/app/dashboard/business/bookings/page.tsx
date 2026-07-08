"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiFileText } from "react-icons/fi";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
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

const statusStyle = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (["COMPLETED", "CONFIRMED", "ACTIVE"].includes(s))
    return "bg-green-50 text-green-600";
  if (["CANCELLED", "FAILED", "REJECTED"].includes(s))
    return "bg-red-50 text-red-500";
  if (["PENDING", "AWAITING_PAYMENT"].includes(s))
    return "bg-amber-50 text-amber-600";
  return "bg-gray-100 text-gray-600";
};

const prettyStatus = (status?: string) =>
  (status || "Unknown").replace(/_/g, " ").toLowerCase();

const isForGuest = (b: OrganizationBooking) =>
  b.isBookingForOthers ?? b.bookingForOthers ?? false;

// A booking made for someone else carries no user (the backend nulls it), so never
// fall back to the guest's name here: that would name the passenger as the booker.
const bookedBy = (b: OrganizationBooking) => {
  const name = [b.user?.firstName, b.user?.lastName].filter(Boolean).join(" ");
  return name.trim() || b.user?.email || null;
};

const passenger = (b: OrganizationBooking) => {
  if (!isForGuest(b)) return null;
  return b.recipientFullName?.trim() || b.guestFullName?.trim() || "Guest";
};

export default function CompanyBookingsPage() {
  const router = useRouter();
  const corp = useCorporateMembership();

  const [bookings, setBookings] = useState<OrganizationBooking[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const orgId = corp.org?.id ?? null;

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!orgId) return;
      const res = await OrganizationService.getOrganizationBookings(
        orgId,
        nextPage,
        PAGE_SIZE,
      );
      setBookings((prev) =>
        append ? [...prev, ...res.content] : res.content,
      );
      setPage(res.currentPage);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    },
    [orgId],
  );

  useEffect(() => {
    if (corp.loading) return;
    // Staff need this page too: a booking made for a guest has no user on it, so it
    // never appears in the booker's own bookings. This is their only view of it.
    if (!corp.isMember && !corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    if (!corp.org?.id) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      await loadPage(0, false);
      if (!active) return;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [corp.loading, corp.isMember, corp.isOwnerLike, corp.isAdmin, corp.org?.id, router, loadPage]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await loadPage(page + 1, true);
    setLoadingMore(false);
  };

  if (corp.loading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
      </div>
    );
  }

  if (!corp.org) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your business first
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Company bookings appear here once your business account exists.
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

  const hasMore = page + 1 < totalPages;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Company bookings
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {corp.isAdmin
            ? "Every trip booked on the company wallet."
            : "Trips you booked on the company wallet, including trips for guests."}
          {totalItems > 0 && ` ${totalItems} in total.`}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {bookings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No bookings yet</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {corp.isAdmin
                ? "Trips booked with the company wallet will appear here."
                : "Trips you book with the company wallet, including for guests, appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  {corp.isAdmin && (
                    <th className="px-4 py-3 font-medium">Booked by</th>
                  )}
                  <th className="px-4 py-3 font-medium">Passenger</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => {
                  const rider = passenger(b);
                  return (
                    <tr key={b.bookingId} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {b.invoiceNumber || "-"}
                      </td>
                      {corp.isAdmin && (
                        <td className="px-4 py-3 text-gray-700">
                          {bookedBy(b) ?? (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-700">
                        {rider ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="truncate">{rider}</span>
                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                              Guest
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Self</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(b.bookedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle(
                            b.status,
                          )}`}
                        >
                          {prettyStatus(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {naira(b.totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
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
