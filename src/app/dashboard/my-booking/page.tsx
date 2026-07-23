"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/controllers/connnector/queryKeys";
import DashboardLoader from "@/components/general/DashboardLoader";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  FiList,
  FiCalendar,
  FiSearch,
  FiShare2,
  FiPlus,
  FiEye,
} from "react-icons/fi";
import {
  Booking,
  BookingFilters,
  BookingService,
} from "@/controllers/booking/bookingService";
import { CalendarView } from "@/components/Booking/CalendarView";
import { BookingModal } from "@/components/Booking/BookingModal";
import StatusFilter from "@/components/utils/StatusFilter";
import DataTable, {
  SeeMoreData,
  TableColumn,
} from "@/components/utils/TableComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";
import {
  customerBookingStatus,
  CUSTOMER_STATUS_FILTERS,
} from "@/utils/bookingStatus";

type ViewMode = "list" | "calendar";

const BookingHistoryPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Omit<BookingFilters, "page" | "size">>(
    {},
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    undefined,
  );
  const PAGE_SIZE = 10;

  const router = useRouter();
  const setup = useBusinessSetup();
  // Only creating the business gates booking. An unfunded wallet is still
  // prompted for on the dashboard, but they can pay by card in the meantime.
  const needsSetup = setup.isBusiness && !setup.canBook;
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Transform raw API item to flat booking object
  const transformItem = (item: any) => ({
    bookingId: item.booking.bookingId,
    segmentId: item.id,
    bookingStatus: item.booking.bookingStatus,
    invoiceNumber: item.booking.invoiceNumber,
    paymentMethod: item.booking.paymentMethod,
    createdAt: item.booking.createdAt,
    declineReason: item.booking.declineReason,
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

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.searchTerm), 500);
    return () => clearTimeout(t);
  }, [filters.searchTerm]);

  // Pages are cached per filter combination, so returning to this screen shows
  // what was already loaded without calling the API again. Changing a filter is
  // a different key and fetches once.
  const {
    data: pagedData,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      ...queryKeys.myBookings,
      filters.bookingStatus ?? "all",
      debouncedSearch ?? "",
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await BookingService.getMyBookings({
        ...filters,
        searchTerm: debouncedSearch,
        page: pageParam as number,
        size: PAGE_SIZE,
      });
      return {
        items: (response.data.content || []).map(transformItem),
        page: pageParam as number,
        totalPages: response.data.totalPages ?? 1,
      };
    },
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
  });

  const bookings = useMemo(
    () => (pagedData?.pages ?? []).flatMap((p) => p.items),
    [pagedData],
  );
  const hasMore = !!hasNextPage;

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchNextPage();
    }
  }, [loadingMore, hasMore, fetchNextPage]);

  // The calendar needs every trip, not just the loaded list pages. Cached per
  // status filter and only fetched once the calendar view is opened, so the
  // large call is not repeated each time the view is switched back.
  const {
    data: calendarTrips = [],
    isLoading: calendarLoading,
    isFetched: calendarLoaded,
  } = useQuery({
    queryKey: [...queryKeys.myBookings, "calendar", filters.bookingStatus ?? "all"],
    enabled: viewMode === "calendar",
    queryFn: async () => {
      const response = await BookingService.getMyBookings({
        bookingStatus: filters.bookingStatus,
        page: 0,
        size: 1000,
      });
      return (response.data.content || []).map(transformItem);
    },
  });


  const handleBookingClick = (booking: Booking) => {
    router.push(`/dashboard/booking/${booking.bookingId}`);
  };

  const handleShareBooking = (booking: Booking) => {
    const shareText = `Check out my booking for ${booking.vehicleName} on ${new Date(
      booking.createdAt,
    ).toLocaleDateString()}`;
    const shareUrl = `${window.location.origin}/track-booking?bookingId=${booking.bookingId}`;

    if (navigator.share) {
      navigator.share({ title: "My Booking", text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Booking link copied to clipboard!");
    }
  };

  const handleDateClick = (_date: Date, dateBookings: any[]) => {
    if (dateBookings.length === 1) {
      const t: any = dateBookings[0];
      const segId = t.segmentId || t.id;
      if (t.bookingId && segId) {
        router.push(`/dashboard/booking/${t.bookingId}/trip/${segId}`);
        return;
      }
    }
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

  const tableColumns: TableColumn<any>[] = useMemo(
    () => [
      {
        key: "vehicleName",
        label: "Vehicle",
        render: (value: string, row: any) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {row.segmentCount > 1 ? `${row.segmentCount} trips` : row.city}
            </div>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Trip date",
        render: (_value: string, row: any) =>
          row.segmentCount > 1 ? (
            <span className="text-sm text-gray-900">
              {formatDate(row.firstStart)} - {formatDate(row.lastStart)}
            </span>
          ) : (
            <span className="text-sm text-gray-900">
              {formatDate(row.firstStart || row.createdAt)}
            </span>
          ),
      },
      {
        key: "bookedOn",
        label: "Booked on",
        render: (_value: string, row: any) => (
          <span className="text-sm text-gray-900">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "bookingStatus",
        label: "Status",
        render: (value: string, row: any) => {
          const s = customerBookingStatus(value);
          return (
            <div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.classes}`}
              >
                {s.label}
              </span>
              {row?.declineReason && (
                <p className="mt-1 max-w-[220px] text-xs text-gray-500">
                  Reason: {row.declineReason}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "bookingType",
        label: "Type",
        render: (value: string, row: any) => (
          <span className="text-sm text-gray-900">
            {value}
            {row.segmentCount > 1 ? ` × ${row.segmentCount}` : ""}
          </span>
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
        icon: FiEye,
      },
      {
        name: "Share Booking",
        handleAction: (row: Booking) => handleShareBooking(row),
        icon: FiShare2,
      },
    ],
    [],
  );

  const statusOptions = CUSTOMER_STATUS_FILTERS;

  // Group segments into one row per parent booking for the list view.
  // The calendar keeps the raw per-day segments.
  const groupedBookings = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of bookings as any[]) {
      const key = b.bookingId ?? b.segmentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.values()).map((segs, index) => {
      const first = segs[0];
      const starts = segs
        .map((s) => s.startDateTime)
        .filter(Boolean)
        .sort();
      return {
        ...first,
        id: index,
        segmentCount: segs.length,
        firstStart: starts[0] ?? first.startDateTime ?? first.createdAt,
        lastStart:
          starts[starts.length - 1] ?? first.startDateTime ?? first.createdAt,
      };
    });
  }, [bookings]);

  // Calendar search runs over the full loaded trip set so results are instant.
  const calendarFiltered = useMemo(() => {
    const q = (filters.searchTerm || "").trim().toLowerCase();
    if (!q) return calendarTrips;
    return calendarTrips.filter((t) => {
      const hay = [
        t.vehicleName,
        t.bookingType,
        t.pickupLocationString,
        t.dropoffLocationString,
        t.invoiceNumber,
        customerBookingStatus(t.bookingStatus).label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [calendarTrips, filters.searchTerm]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="hidden sm:flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-500">
          Track and manage all your trips.
        </p>
        <button
          onClick={() =>
            router.push(needsSetup ? "/business-setup" : "/booking/search")
          }
          className="cursor-pointer px-4 py-2 text-white text-sm font-medium rounded-full hover:opacity-90 transition inline-flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: "#0673ff" }}
        >
          <FiPlus className="w-4 h-4" />
          <span>{needsSetup ? "Set up business" : "Book a vehicle"}</span>
        </button>
      </div>

      <div>

        {/* Controls */}
        <div className="sticky top-16 z-30 -mx-4 mb-4 flex flex-col gap-3 bg-gray-50 px-4 py-3 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 py-2 rounded-md transition ${
                viewMode === "list"
                  ? "bg-[#0673ff] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiList className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 py-2 rounded-md transition ${
                viewMode === "calendar"
                  ? "bg-[#0673ff] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              Calendar
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0673ff] focus:border-transparent"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
              />
            </div>
            <StatusFilter
              options={statusOptions}
              value={filters.bookingStatus}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, bookingStatus: value }))
              }
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <DashboardLoader />
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <DataTable<Booking & { id: number }>
              columns={tableColumns}
              data={groupedBookings as any}
              height="max-h-none"
              seeMoreData={seeMoreActions}
              onRowClick={(row) =>
                router.push(`/dashboard/booking/${row.bookingId}`)
              }
              itemLabel="booking"
              isFiltered={!!(filters.searchTerm || filters.bookingStatus)}
              hideMobileActions
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              renderMobileCard={(row: any) => {
                const s = customerBookingStatus(row.bookingStatus);
                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {row.vehicleName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.classes}`}
                          >
                            {s.label}
                          </span>
                          {row.paymentMethod === "CORPORATE_WALLET" && (
                            <span className="inline-flex rounded-full bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#0673FF]">
                              Company
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {row.segmentCount > 1
                              ? `${formatDate(row.firstStart)} - ${formatDate(row.lastStart)}`
                              : formatDate(row.firstStart || row.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {row.bookingType}
                          {row.segmentCount > 1 ? ` × ${row.segmentCount}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Booked {formatDate(row.createdAt)}
                        </p>
                        {row.declineReason && (
                          <p className="mt-1 text-xs text-gray-500">
                            Reason: {row.declineReason}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-base font-bold text-gray-900">
                        {formatCurrency(row.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookingClick(row);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0673ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareBooking(row);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0673ff] hover:underline"
                      >
                        <FiShare2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {calendarLoading && !calendarLoaded ? (
              <DashboardLoader />
            ) : (
              <CalendarView
                bookings={calendarFiltered}
                onDateClick={handleDateClick}
              />
            )}
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
