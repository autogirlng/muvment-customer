"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiDownload, FiShare2 } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import {
  Payment,
  PaymentFilters,
  PaymentService,
  ReceiptGenerator,
} from "@/controllers/booking/paymentService";
import DataTable, {
  SeeMoreData,
  TableColumn,
} from "@/components/utils/TableComponent";
import Dropdown from "@/components/utils/DropdownCustom";
import { toast } from "react-toastify";

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({ page: 0, size: 10 });
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPayments();
  }, [filters.page, filters.size, filters.paymentStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await PaymentService.getMyPayments(filters);
      setPayments(response.data.content);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadPayments();
    }, 2000);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [filters.searchTerm]);

  const handleDownloadReceipt = async (payment: Payment) => {
    if (payment.paymentStatus !== "SUCCESSFUL") {
      return toast.warn("Payment still pending, try again later");
    }
    // console.log(payment);
    try {
      await PaymentService.getPDFFile(payment.bookingId);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const handleSharePayment = (payment: Payment) => {
    const shareText = `Payment for ${payment.vehicleName} - ${formatCurrency(
      payment.amountPaid
    )}`;
    const shareUrl = `${window.location.origin}/booking-tracking?paymentId=${payment.id}&bookingId=${payment.bookingId}`;
    if (navigator.share) {
      navigator.share({
        title: "Payment Receipt",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Payment tracking link copied to clipboard!");
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

  const columns: TableColumn<Payment>[] = [
    { key: "transactionReference", label: "Reference" },
    {
      key: "vehicleName",
      label: "Vehicle",
      render: (_, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.vehicleName}
          </div>
        </div>
      ),
    },
    { key: "createdAt", label: "Date", render: (val) => formatDate(val) },
    {
      key: "paymentStatus",
      label: "Status",
      render: (val) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            val
          )}`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "totalPayable",
      label: "Total Payable",
      render: (val) => formatCurrency(val),
    },
    {
      key: "amountPaid",
      label: "Amount Paid",
      render: (val) => formatCurrency(val),
    },
  ];

  const seeMoreData: SeeMoreData[] = [
    {
      name: "Download Receipt",
      handleAction: handleDownloadReceipt,
      icon: FiDownload,
    },
    { name: "Share Payment", handleAction: handleSharePayment, icon: FiShare2 },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment History
          </h1>
          <p className="text-gray-600">
            View and download your payment receipts
          </p>
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
            className="w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8  mx-auto"></div>
          </div>
        ) : (
          <DataTable<Payment>
            columns={columns}
            data={payments}
            seeMoreData={seeMoreData}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
