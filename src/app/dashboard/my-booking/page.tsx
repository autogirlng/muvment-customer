"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { FiList, FiCalendar, FiSearch, FiShare2, FiPlus } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
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
import { useRouter } from "next/navigation";

type ViewMode = "list" | "calendar";

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Omit<BookingFilters, "page" | "size">>({});
  const PAGE_SIZE = 10;

  const router = useRouter();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Transform raw API item to flat booking object
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

  // Fetch a specific page; if reset=true, replace bookings instead of appending
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
        const transformed = content.map(transformItem);

        setBookings((prev) => (reset ? transformed : [...prev, ...transformed]));
        setHasMore(pageNumber + 1 < totalPages);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // Reset to page 0 whenever filters change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bookingStatus]);

  // Debounce search term changes
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

  // Load next page when page state increments (triggered by DataTable sentinel)
  useEffect(() => {
    if (page === 0) return; // page 0 is handled by the filter effects above
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const handleBookingClick = async (booking: Booking) => {
    const result = await BookingService.getBookingById(booking?.bookingId as string);
    console.log(result);
    setSelectedBookings([booking]);
    setIsModalOpen(true);
  };

  const handleShareBooking = (booking: Booking) => {
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

  const handleDateClick = (date: Date, dateBookings: Booking[]) => {
    if (dateBookings.length > 0) {
      setSelectedBookings(dateBookings);
      setIsModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
        render: (value: string, row: Booking & { id: number }) => (
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
        label: "Total Price",
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
        handleAction: (row: Booking) => handleBookingClick(row),
        icon: FiCalendar,
      },
      {
        name: "Share Booking",
        handleAction: (row: Booking) => handleShareBooking(row),
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
    () =>
      bookings.map((booking, index) => ({
        ...(booking as Omit<Booking, "id">),
        id: index,
      })),
    [bookings],
  );

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto py-8 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          </div>

          <button
            onClick={() => router.push("/booking/search")}
            className="w-full sm:w-auto cursor-pointer px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiList className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiCalendar className="w-4 h-4" />
                Calendar
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="w-full sm:w-48">
            <Dropdown
              options={statusOptions}
              selectedValue={filters.bookingStatus}
              onSelect={(value) =>
                setFilters((prev) => ({ ...prev, bookingStatus: value }))
              }
              placeholder="All Status"
              className="w-full"
              isOpen={statusDropdownOpen}
              onToggle={() => setStatusDropdownOpen(!statusDropdownOpen)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <DataTable<Booking & { id: number }>
              columns={tableColumns}
              data={tableData as any}
              height="max-h-[600px]"
              seeMoreData={seeMoreActions}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <CalendarView bookings={bookings} onDateClick={handleDateClick} />
          </div>
        )}

        <BookingModal
          bookings={selectedBookings}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onShare={handleShareBooking}
        />
      </div>
    </div>
  );
};

export default BookingHistoryPage;