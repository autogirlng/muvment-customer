"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiShare2, FiCopy, FiCheck, FiEye, FiCreditCard } from "react-icons/fi";
import {
  Payment,
  PaymentFilters,
  PaymentService,
} from "@/controllers/booking/paymentService";
import DataTable, {
  SeeMoreData,
  TableColumn,
} from "@/components/utils/TableComponent";
import StatusFilter from "@/components/utils/StatusFilter";
import { toast } from "react-toastify";
import { FaReceipt } from "react-icons/fa6";
import { BookingService } from "@/controllers/booking/bookingService";

interface BookingPayment extends Payment {
  paymentProvider: string;
  bookingId: string;
}

const PAGE_SIZE = 10;

const ReferenceCell = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-sm text-gray-400">—</span>;
  const short =
    value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm text-gray-700" title={value}>
        {short}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy reference"
        className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0673ff]"
      >
        {copied ? (
          <FiCheck className="h-3.5 w-3.5" />
        ) : (
          <FiCopy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
};

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Omit<PaymentFilters, "page" | "size">>({});

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const fetchPage = useCallback(
    async (pageNumber: number, reset = false) => {
      try {
        reset ? setLoading(true) : setLoadingMore(true);

        const response = await PaymentService.getMyPayments({
          ...filters,
          page: pageNumber,
          size: PAGE_SIZE,
        });

        const content: Payment[] = response.data.content;
        const totalPages: number = response.data.totalPages ?? 1;

        setPayments((prev) => (reset ? content : [...prev, ...content]));
        setHasMore(pageNumber + 1 < totalPages);
      } catch (error) {
        console.error("Error loading payments:", error);
        toast.error("Failed to load payments.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // Reset and reload when status filter changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.paymentStatus]);

  // Total amount spent across all successful payments (independent of filters)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await PaymentService.getMyPayments({ page: 0, size: 1000 });
        const all: Payment[] = res.data.content ?? [];
        const sum = all
          .filter((p) => String(p.paymentStatus).toUpperCase() === "SUCCESSFUL")
          .reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
        if (active) setTotalSpent(sum);
      } catch (error) {
        console.error("Error computing total spent:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(0);
      setHasMore(true);
      fetchPage(0, true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm]);

  // Fetch next page when page increments
  useEffect(() => {
    if (page === 0) return;
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const handleSharePayment = async (payment: Payment) => {
    if (payment.paymentStatus !== "SUCCESSFUL") {
      return toast.warn("Receipt is available once payment is successful.");
    }
    const filename = `muvment-receipt-${payment.transactionReference || payment.id}.pdf`;
    try {
      const blob = await PaymentService.getReceiptBlob(payment.bookingId);
      const file = new File([blob], filename, { type: "application/pdf" });
      const nav: any = typeof navigator !== "undefined" ? navigator : undefined;

      if (nav?.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: "Payment receipt",
            text: `Payment receipt for ${payment.vehicleName}`,
          });
        } catch (err: any) {
          if (err?.name !== "AbortError") throw err;
        }
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded. You can share the PDF from your files.");
    } catch (error) {
      console.error("Error sharing receipt:", error);
      toast.error("Could not prepare the receipt to share.");
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(amount)) return "₦0.00";
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SUCCESSFUL: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      ABANDONED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (payment.paymentStatus !== "SUCCESSFUL") {
      return toast.warn("Payment still pending, try again later");
    }
    try {
      await PaymentService.getPDFFile(payment.bookingId);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt. Please try again.");
    }
  };

  const makePayment = async (payment: BookingPayment) => {
    const booking = await BookingService.initiatePayment({
      bookingId: payment.bookingId,
      paymentProvider: payment.paymentProvider,
    });
    if (payment.paymentProvider === "PAYSTACK" && booking.data) {
      router.push(booking.data as any);
    } else {
      if (booking.data.authorizationUrl) router.push(booking.data.authorizationUrl);
    }
  };

  const handleAction = (payment: any) => {
    if (payment.paymentStatus === "SUCCESSFUL") return handleDownloadReceipt(payment);
    if (payment.paymentStatus === "PENDING") return makePayment(payment);
  };

  const columns: TableColumn<Payment>[] = useMemo(
    () => [
      {
        key: "vehicleName",
        label: "Vehicle",
        render: (_, row) => (
          <div className="text-sm font-medium text-gray-900">
            {row.vehicleName}
          </div>
        ),
      },
      {
        key: "totalPayable",
        label: "Amount",
        render: (val) => (
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(val)}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        label: "Status",
        render: (val) => (
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(val)}`}
          >
            {String(val ?? "").toLowerCase()}
          </span>
        ),
      },
      {
        key: "paidAt",
        label: "Date",
        render: (_, row) => (
          <span className="text-sm text-gray-700">
            {formatDate(
              row.paymentStatus === "SUCCESSFUL" && row.paidAt
                ? row.paidAt
                : row.createdAt,
            )}
          </span>
        ),
      },
      {
        key: "invoiceNumber",
        label: "Invoice",
        render: (val) => <ReferenceCell value={String(val ?? "")} />,
      },
    ],
    [],
  );

  const seeMoreData: SeeMoreData[] = useMemo(
    () => [
      {
        name: (row: any) =>
          row.paymentStatus === "SUCCESSFUL" ? "Download receipt" : "Pay now",
        handleAction,
        icon: FaReceipt,
      },
      {
        name: "View booking",
        handleAction: (row: any) =>
          router.push(`/dashboard/booking/${row.bookingId}`),
        icon: FiEye,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "SUCCESSFUL", label: "Successful" },
    { value: "FAILED", label: "Failed" },
    { value: "ABANDONED", label: "Abandoned" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FF]">
            <FiCreditCard className="h-6 w-6 text-[#0673ff]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total spent</p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-gray-400 sm:block">
          Every booking transaction on your account, with receipts and
          references in one place.
        </p>
      </div>

      <div>

        <div className="sticky top-16 z-20 -mx-4 mb-4 flex items-center gap-3 bg-gray-50 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#0673ff] focus:border-transparent"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
          </div>

          <StatusFilter
            options={statusOptions}
            value={filters.paymentStatus}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, paymentStatus: value }))
            }
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0673ff] mx-auto" />
          </div>
        ) : (
          <DataTable<Payment>
            columns={columns}
            data={payments}
            height="max-h-none"
            seeMoreData={seeMoreData}
            itemLabel="payment"
            isFiltered={!!(filters.searchTerm || filters.paymentStatus)}
            hideMobileActions
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            renderMobileCard={(p) => {
              const isSuccess = p.paymentStatus === "SUCCESSFUL";
              const isPending = p.paymentStatus === "PENDING";
              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {p.vehicleName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getStatusColor(
                            p.paymentStatus,
                          )}`}
                        >
                          {String(p.paymentStatus ?? "").toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(
                            isSuccess && p.paidAt ? p.paidAt : p.createdAt,
                          )}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Invoice</span>
                        <ReferenceCell
                          value={String(p.invoiceNumber ?? "")}
                        />
                      </div>
                    </div>
                    <p className="shrink-0 text-base font-bold text-gray-900">
                      {formatCurrency(p.totalPayable)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    {isSuccess ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePayment(p);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0673ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        <FiShare2 className="h-3.5 w-3.5" />
                        Share receipt
                      </button>
                    ) : isPending ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          makePayment(p as any);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0673ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        <FaReceipt className="h-3.5 w-3.5" />
                        Pay now
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/booking/${p.bookingId}`);
                      }}
                      className="text-xs font-medium text-[#0673ff] hover:underline"
                    >
                      View booking
                    </button>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;