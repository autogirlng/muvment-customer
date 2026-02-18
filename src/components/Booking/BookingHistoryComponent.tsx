"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  showHeader?: boolean;
  limit?: number;
}

const PAGE_SIZE = 10;

// Transform raw API item into a flat booking object (same as BookingHistoryPage)
const transformItem = (item: any) => ({
  bookingId: item.id,
  bookingStatus: item.booking.bookingStatus,
  invoiceNumber: item.booking.invoiceNumber,
  paymentMethod: item.booking.paymentMethod,
  createdAt: item.booking.createdAt,
  price: item.booking.totalPrice,
  bookingCategory: item.booking.bookingCategory,
  bookingType: item.bookingType.name,
  startDateTime: item.startDateTime,
  endDateTime: item.endDateTime,
  pickupLocationString: item.pickupLocationString,
  dropoffLocationString: item.dropoffLocationString,
  pickupLatitude: item.pickupLatitude,
  pickupLongitude: item.pickupLongitude,
  dropoffLatitude: item.dropoffLatitude,
  dropoffLongitude: item.dropoffLongitude,
  updatedAt: item.updatedAt,
  vehicleName: item.vehicle ? item.vehicle.name : "Awaiting",
});

const BookingHistoryComponent: React.FC<BookingHistoryComponentProps> = ({
  showHeader = true,
  limit,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Omit<BookingFilters, "page" | "size">>({});
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedBookings, setSelectedBookings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchPage = useCallback(
    async (pageNumber: number, reset = false) => {
      try {
        reset ? setLoading(true) : setLoadingMore(true);

        const response = await BookingService.getMyBookings({
          ...filters,
          page: pageNumber,
          size: PAGE_SIZE,
        });

        const content = response.data.content;
        const totalPages: number = response.data.totalPages ?? 1;
        let transformed = content.map(transformItem);

        // If a limit is set (e.g. dashboard widget), cap results and disable further loading
        if (limit) {
          transformed = transformed.slice(0, limit);
          setHasMore(false);
        } else {
          setHasMore(pageNumber + 1 < totalPages);
        }

        setBookings((prev) => (reset ? transformed : [...prev, ...transformed]));
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, limit],
  );

  // Reset on status filter change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bookingStatus]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
      setHasMore(true);
      fetchPage(0, true);
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
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

  const handleBookingClick = (booking: any) => {
    setSelectedBookings([booking]);
    setIsModalOpen(true);
  };

  const handleShareBooking = (booking: any) => {
    const shareText = `Check out my booking for ${booking.vehicleName} on ${new Date(
      booking.createdAt,
    ).toLocaleDateString()}`;
    const shareUrl = `${window.location.origin}/booking-tracking?bookingId=${booking.bookingId}`;

    if (navigator.share) {
      navigator.share({ title: "My Booking", text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Booking link copied to clipboard!");
    }
  };

  const handleDateClick = (date: Date, dateBookings: any[]) => {
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

  const tableColumns: TableColumn<any>[] = useMemo(
    () => [
      {
        key: "vehicleName",
        label: "Vehicle",
        render: (value: string, row: any) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.city}</div>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Date",
        render: (value: string) => (
          <span className="text-sm text-gray-900">{formatDate(value)}</span>
        ),
      },
      {
        key: "bookingStatus",
        label: "Status",
        render: (value: string) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}
          >
            {value.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        key: "bookingType",
        label: "Type",
        render: (value: string) => (
          <span className="text-sm text-gray-900">{value}</span>
        ),
      },
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
    [],
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
    [],
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
    [],
  );

  const tableData = useMemo(
    () => bookings.map((b, i) => ({ ...b, id: i })),
    [bookings],
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {showHeader && (
        <div className="mb-2">
          <h2 className="text-xl font-bold text-gray-900">Booking History</h2>
          <p className="text-gray-600">View and manage your past bookings</p>
        </div>
      )}

      {/* Controls — always visible so calendar toggle is always accessible */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* View Toggle */}
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

        <div className="flex gap-3 items-center flex-wrap">
          {/* Search */}
          <div className="relative">
            <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              placeholder="Search bookings..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
          </div>

          {/* Status Filter */}
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

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : viewMode === "list" ? (
        <DataTable<any>
          columns={tableColumns}
          data={tableData}
          height="max-h-[600px]"
          seeMoreData={seeMoreActions}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
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