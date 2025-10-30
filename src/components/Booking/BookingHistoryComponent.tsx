"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiList, FiCalendar, FiSearch, FiShare2 } from "react-icons/fi";
import {
  Booking,
  BookingFilters,
  BookingService,
} from "@/controllers/booking/bookingService";
import { CalendarView } from "@/components/Booking/CalendarView";
import { BookingModal } from "@/components/Booking/BookingModal";
import Dropdown from "@/components/utils/DropdownCustom";
import DataTable, {
  SeeMoreData,
  TableColumn,
} from "@/components/utils/TableComponent";
import { toast } from "react-toastify";

interface BookingHistoryComponentProps {
  showHeader?: boolean; // hide header in dashboard
  limit?: number; // allow limiting rows in dashboard
}

const BookingHistoryComponent: React.FC<BookingHistoryComponentProps> = ({
  showHeader = true,
  limit = 10,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({ page: 0, size: 10 });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadBookings();
  }, [filters.page, filters.size, filters.bookingStatus]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadBookings();
    }, 800);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [filters.searchTerm]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getMyBookings(filters);
      const data = limit
        ? response.data.content.slice(0, limit)
        : response.data.content;
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBookings([booking]);
    setIsModalOpen(true);
  };

  const handleShareBooking = (booking: Booking) => {
    const shareText = `Check out my booking for ${
      booking.vehicleName
    } on ${new Date(booking.createdAt).toLocaleDateString()}`;
    const shareUrl = `${window.location.origin}/booking-tracking?bookingId=${booking.bookingId}`;

    if (navigator.share) {
      navigator.share({
        title: "My Booking",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Booking link copied to clipboard!");
    }
  };

  const handleDateClick = (date: Date, dateBookings: Booking[]) => {
    if (dateBookings.length > 0) {
      setSelectedBookings(dateBookings);
      setIsModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) =>
    amount
      ? `₦${amount.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₦0.00";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      FAILED_AVAILABILITY: "bg-red-100 text-red-800",
      CANCELLED_BY_USER: "bg-gray-100 text-gray-800",
      CANCELLED_BY_HOST: "bg-gray-100 text-gray-800",
      CANCELLED_BY_ADMIN: "bg-gray-100 text-gray-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      NO_SHOW: "bg-orange-100 text-orange-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const tableColumns: TableColumn<Booking & { id: number }>[] = useMemo(
    () => [
      {
        key: "vehicleName",
        label: "Vehicle",
        render: (value, row) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.city}</div>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Date",
        render: (value) => (
          <span className="text-sm text-gray-900">{formatDate(value)}</span>
        ),
      },
      {
        key: "bookingStatus",
        label: "Status",
        render: (value) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              value
            )}`}
          >
            {value.replace(/_/g, " ")}
          </span>
        ),
      },
      { key: "bookingType", label: "Type" },
      {
        key: "price",
        label: "Amount",
        render: (value: number) => (
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(value)}
          </span>
        ),
      },
    ],
    []
  );

  const seeMoreActions: SeeMoreData[] = useMemo(
    () => [
      {
        name: "View Details",
        handleAction: handleBookingClick,
        icon: FiCalendar,
      },
      {
        name: "Share Booking",
        handleAction: handleShareBooking,
        icon: FiShare2,
      },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All Status" },
      { value: "PENDING_PAYMENT", label: "Pending Payment" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "FAILED_AVAILABILITY", label: "Failed Availability" },
      { value: "CANCELLED_BY_USER", label: "Cancelled by User" },
      { value: "CANCELLED_BY_HOST", label: "Cancelled by Host" },
      { value: "CANCELLED_BY_ADMIN", label: "Cancelled by Admin" },
      { value: "IN_PROGRESS", label: "In Progress" },
      { value: "COMPLETED", label: "Completed" },
      { value: "NO_SHOW", label: "No Show" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      bookings.map((b, i) => ({
        ...b,
        id: i,
      })),
    [bookings]
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {showHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking History</h2>
            <p className="text-gray-600">View and manage your past bookings</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex bg-gray-100 rounded-lg overflow-hidden">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("list")}
              >
                <FiList className="inline mr-1" /> List
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("calendar")}
              >
                <FiCalendar className="inline mr-1" /> Calendar
              </button>
            </div>

            <div className="relative">
              <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                placeholder="Search bookings..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
            </div>

            <Dropdown
              options={statusOptions}
              selectedValue={filters.bookingStatus}
              onSelect={(value) =>
                setFilters((prev) => ({ ...prev, bookingStatus: value }))
              }
              placeholder="All Status"
              className="w-40"
              isOpen={statusDropdownOpen}
              onToggle={() => setStatusDropdownOpen(!statusDropdownOpen)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : viewMode === "list" ? (
        <DataTable<Booking & { id: number }>
          columns={tableColumns}
          data={tableData as any}
          height="max-h-[600px]"
          seeMoreData={seeMoreActions}
          pageSize={10}
        />
      ) : (
        <CalendarView bookings={bookings} onDateClick={handleDateClick} />
      )}

      <BookingModal
        bookings={selectedBookings}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShare={handleShareBooking}
      />
    </div>
  );
};

export default BookingHistoryComponent;
