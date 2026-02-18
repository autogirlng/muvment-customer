"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiShare2 } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import {
  Payment,
  PaymentFilters,
  PaymentService,
} from "@/controllers/booking/paymentService";
import DataTable, {
  SeeMoreData,
  TableColumn,
} from "@/components/utils/TableComponent";
import Dropdown from "@/components/utils/DropdownCustom";
import { toast } from "react-toastify";
import { FaReceipt } from "react-icons/fa6";
import { BookingService } from "@/controllers/booking/bookingService";

interface BookingPayment extends Payment {
  paymentProvider: string;
  bookingId: string;
}

const PAGE_SIZE = 10;

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Omit<PaymentFilters, "page" | "size">>({});
  const [isStatusOpen, setIsStatusOpen] = useState(false);

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

  const handleSharePayment = (payment: Payment) => {
    const shareText = `Payment for ${payment.vehicleName} - ${formatCurrency(payment.amountPaid)}`;
    const shareUrl = `${window.location.origin}/booking-tracking?paymentId=${payment.id}&bookingId=${payment.bookingId}`;
    if (navigator.share) {
      navigator.share({ title: "Payment Receipt", text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Payment tracking link copied to clipboard!");
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
      { key: "transactionReference", label: "Reference" },
      {
        key: "vehicleName",
        label: "Vehicle",
        render: (_, row) => (
          <div className="text-sm font-medium text-gray-900">{row.vehicleName}</div>
        ),
      },
      {
        key: "createdAt",
        label: "Date",
        render: (val) => (
          <span className="text-sm text-gray-700">{formatDate(val)}</span>
        ),
      },
      {
        key: "paymentStatus",
        label: "Status",
        render: (val) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(val)}`}
          >
            {val}
          </span>
        ),
      },
      {
        key: "totalPayable",
        label: "Total Payable",
        render: (val) => (
          <span className="text-sm font-medium text-gray-900">{formatCurrency(val)}</span>
        ),
      },
      {
        key: "amountPaid",
        label: "Amount Paid",
        render: (val) => (
          <span className="text-sm font-medium text-gray-900">{formatCurrency(val)}</span>
        ),
      },
    ],
    [],
  );

  const seeMoreData: SeeMoreData[] = useMemo(
    () => [
      { name: "Download Receipt", handleAction, icon: FaReceipt },
      { name: "Share Payment", handleAction: handleSharePayment, icon: FiShare2 },
    ],
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto py-8 mt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">View and download your payment receipts</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
          </div>

          <Dropdown
            options={statusOptions}
            selectedValue={filters.paymentStatus}
            onSelect={(value) =>
              setFilters((prev) => ({ ...prev, paymentStatus: value }))
            }
            isOpen={isStatusOpen}
            onToggle={() => setIsStatusOpen(!isStatusOpen)}
            placeholder="Filter by status"
            className="w-full sm:w-64 border border-gray-300 rounded-lg p-3"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : (
          <DataTable<Payment>
            columns={columns}
            data={payments}
            height="max-h-[600px]"
            seeMoreData={seeMoreData}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;