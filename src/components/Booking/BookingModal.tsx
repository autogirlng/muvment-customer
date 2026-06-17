"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiShare2,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiChevronRight,
} from "react-icons/fi";
import { customerBookingStatus } from "@/utils/bookingStatus";

interface BookingModalProps {
  bookings: any[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (booking: any) => void;
}

const ngn = (amount?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);

const dayLabel = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

const timeLabel = (d?: string) =>
  d
    ? new Date(d).toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export const BookingModal: React.FC<BookingModalProps> = ({
  bookings,
  isOpen,
  onClose,
  onShare,
}) => {
  const router = useRouter();

  if (!isOpen || !bookings || bookings.length === 0) return null;

  const openTrip = (b: any) => {
    const segId = b.segmentId || b.id;
    if (b.bookingId && segId) {
      router.push(`/dashboard/booking/${b.bookingId}/trip/${segId}`);
    }
  };

  const headerDate = dayLabel(bookings[0]?.startDateTime || bookings[0]?.createdAt);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Trips on {headerDate}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {bookings.length} trip{bookings.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="space-y-3">
            {bookings.map((b, index) => {
              const s = customerBookingStatus(b.bookingStatus);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => openTrip(b)}
                  className="block w-full rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {b.vehicleName || "Vehicle"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.classes}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {b.bookingType}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-700">
                        <FiCalendar className="h-4 w-4 shrink-0 text-gray-400" />
                        {timeLabel(b.startDateTime) || "Time pending"}
                      </p>
                      {(b.pickupLocationString || b.dropoffLocationString) && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {b.pickupLocationString || "Pickup"}
                          </span>
                          <FiArrowRight className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {b.dropoffLocationString || "Drop-off"}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {ngn(b.price)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#0673ff]">
                        View trip <FiChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(b);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#0673ff]"
                    >
                      <FiShare2 className="h-3.5 w-3.5" /> Share
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
