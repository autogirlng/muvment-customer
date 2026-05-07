"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiShare2, FiChevronLeft } from "react-icons/fi";
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
  const [totalElements, setTotalElements] = useState<number | null>(null);
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
        if (reset) setTotalElements(response.data.totalItems ?? null);
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

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden h-40 sm:h-52"
        style={{ background: "linear-gradient(135deg, #93c5fd 0%, #3b82f6 45%, #0ea5e9 100%)" }}
      >
        {/* Decorative card — back-right */}
        <div className="absolute top-[-10%] right-[5%] w-52 sm:w-64 h-32 sm:h-40 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm rotate-15" />
        {/* Decorative card — front-right */}
        <div className="absolute top-[10%] right-[12%] w-48 sm:w-60 h-28 sm:h-36 rounded-2xl border border-white/40 bg-white/20 backdrop-blur-sm rotate-6 shadow-xl">
          {/* Chip */}
          <div className="absolute top-4 left-4 w-8 h-6 rounded bg-white/40 grid grid-cols-2 gap-0.5 p-0.5">
            <div className="bg-white/60 rounded-sm" />
            <div className="bg-white/60 rounded-sm" />
            <div className="bg-white/60 rounded-sm" />
            <div className="bg-white/60 rounded-sm" />
          </div>
          {/* Card lines */}
          <div className="absolute bottom-5 left-4 right-4 space-y-1.5">
            <div className="h-1.5 bg-white/30 rounded-full w-3/4" />
            <div className="h-1.5 bg-white/30 rounded-full w-1/2" />
          </div>
          {/* Toggle pill */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-white/40" />
            <div className="w-5 h-5 rounded-full bg-white/60 -ml-2" />
          </div>
        </div>

        {/* Flowing arrow lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0,120 Q200,60 400,100 T800,80" stroke="white" strokeWidth="2" fill="none" />
          <path d="M0,160 Q200,100 400,140 T800,120" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M200,0 Q300,80 250,160" stroke="white" strokeWidth="1" fill="none" />
        </svg>

        {/* Back button */}
        <div className="relative z-10 px-6 sm:px-10 pt-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition"
          >
            <FiChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Title */}
        <div className="relative z-10 px-6 sm:px-10 mt-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Payments</h1>
        </div>
      </div>

      {/* Stat Card */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 inline-block min-w-55">
          <p className="text-xs text-gray-500 mb-1">Total Number Of Rides Booked</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalElements !== null ? totalElements : "—"}
          </p>
        </div>
      </div>

      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">

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