"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiFileText, FiArrowRight } from "react-icons/fi";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { OrganizationBooking } from "@/types/Organization.type";
import { naira } from "@/utils/corporateAllowance";
import DataTable, { TableColumn } from "@/components/utils/TableComponent";

type BookingRow = OrganizationBooking & { id: string };

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

const bookedBy = (b: OrganizationBooking) => {
  const name = [b.user?.firstName, b.user?.lastName].filter(Boolean).join(" ");
  return name.trim() || b.user?.email || null;
};

const passenger = (b: OrganizationBooking) => {
  if (!isForGuest(b)) return null;
  return b.recipientFullName?.trim() || b.guestFullName?.trim() || "Guest";
};

const StatusPill = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusStyle(
      status,
    )}`}
  >
    {prettyStatus(status)}
  </span>
);

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
      setBookings((prev) => (append ? [...prev, ...res.content] : res.content));
      setPage(res.currentPage);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    },
    [orgId],
  );

  useEffect(() => {
    if (corp.loading) return;
    // Company bookings is an admin view. Staff see their own sponsored bookings under
    // My bookings, so they are sent there instead.
    if (!corp.isOwnerLike) {
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
  }, [corp.loading, corp.isOwnerLike, corp.isMember, corp.org?.id, router, loadPage]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await loadPage(page + 1, true);
    setLoadingMore(false);
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

  if (!corp.org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your business first
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Company bookings appear here once your business account exists.
          </p>
          <button
            onClick={() => router.push("/business-setup")}
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#0673ff" }}
          >
            Set up business <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const columns: TableColumn<BookingRow>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      render: (value: unknown) => (
        <span className="font-medium text-gray-900">
          {(value as string) || "-"}
        </span>
      ),
    },
    ...(corp.isAdmin
      ? [
          {
            key: "bookingId",
            label: "Booked by",
            render: (_value: unknown, row: BookingRow) =>
              bookedBy(row) ?? <span className="text-gray-400">—</span>,
          } as TableColumn<BookingRow>,
        ]
      : []),
    {
      key: "recipientFullName",
      label: "Passenger",
      render: (_value: unknown, row: BookingRow) => {
        const rider = passenger(row);
        return rider ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="truncate">{rider}</span>
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
              Guest
            </span>
          </span>
        ) : (
          <span className="text-gray-400">Self</span>
        );
      },
    },
    {
      key: "bookedAt",
      label: "Date",
      render: (value: unknown) => (
        <span className="text-gray-500">{formatDate(value as string)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => <StatusPill status={value as string} />,
    },
    {
      key: "totalPrice",
      label: "Amount",
      render: (value: unknown) => (
        <span className="font-semibold text-gray-900">
          {naira(value as number)}
        </span>
      ),
    },
  ];

  const data = bookings.map((b) => ({ ...b, id: b.bookingId }));
  const hasMore = page + 1 < totalPages;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FF]">
            <FiFileText className="h-6 w-6 text-[#0673ff]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Company bookings</p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {totalItems}
            </p>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-gray-400 sm:block">
          {corp.isAdmin
            ? "Every trip booked on the company wallet, across your team."
            : "Trips you booked on the company wallet, including trips for guests."}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
            <FiFileText className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No bookings yet</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {corp.isAdmin
              ? "Trips booked with the company wallet will appear here."
              : "Trips you book with the company wallet, including for guests, appear here."}
          </p>
          <button
            onClick={() => router.push("/booking/search")}
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#0673ff" }}
          >
            Make a booking <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
      <DataTable<BookingRow>
        columns={columns}
        data={data}
        height="max-h-none"
        itemLabel="booking"
        hideMobileActions
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        emptyTitle="No bookings yet"
        emptyMessage={
          corp.isAdmin
            ? "Trips booked with the company wallet will appear here."
            : "Trips you book with the company wallet, including for guests, appear here."
        }
        renderMobileCard={(b) => {
          const rider = passenger(b);
          return (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {b.invoiceNumber || "Booking"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusPill status={b.status} />
                    <span className="text-xs text-gray-500">
                      {formatDate(b.bookedAt)}
                    </span>
                  </div>
                </div>
                <p className="shrink-0 text-base font-bold text-gray-900">
                  {naira(b.totalPrice)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                {corp.isAdmin && (
                  <span>
                    Booked by{" "}
                    <span className="text-gray-700">{bookedBy(b) ?? "—"}</span>
                  </span>
                )}
                <span>
                  Passenger{" "}
                  <span className="text-gray-700">
                    {rider ? `${rider} (guest)` : "Self"}
                  </span>
                </span>
              </div>
            </div>
          );
        }}
      />
      )}
    </div>
  );
}
