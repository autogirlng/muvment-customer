"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMail,
  FiEye,
  FiX,
  FiExternalLink,
  FiTruck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { BookingService } from "@/controllers/booking/bookingService";
import {
  customerTripStatus,
  customerBookingStatus,
} from "@/utils/bookingStatus";
import { SUPPORT_CONTACT } from "@/constants/support";
import { BRAND, ngn, fmt, Card, Row } from "@/components/Dashboard/detailUI";

export type TripLinks = {
  rootLabel: string;
  rootHref: string;
  bookingHref: (bookingId: string) => string;
  tripHref: (bookingId: string, segmentId: string) => string;
};

const segId = (s: any) => s?.segmentId || s?.id || "";

export default function TripDetailContent({
  bookingId,
  segmentId,
  links,
}: {
  bookingId: string;
  segmentId: string;
  links: TripLinks;
}): React.ReactElement {
  const router = useRouter();

  const [booking, setBooking] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!bookingId || !segmentId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getSingleData(`/api/v1/public/bookings/${bookingId}`);
        const data = res?.data?.[0]?.data;
        if (!data) throw new Error("We couldn't find this booking.");
        setBooking(data);

        const segs = (data.segments || []) as any[];
        const seg = segs.find((s) => segId(s) === segmentId);
        const vehicleId = seg?.vehicle?.id || data.vehicle?.id;
        if (vehicleId) {
          const vRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {},
          );
          setVehicle(vRes?.data?.[0]?.data || null);
        }
      } catch (e: any) {
        console.error("Error loading trip:", e);
        setError(e?.message || "Failed to load this trip.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, segmentId]);

  useEffect(() => {
    if (!segmentId) return;
    let cancelled = false;
    (async () => {
      const t = await BookingService.getTripBySegment(segmentId);
      if (!cancelled) setTrip(t);
    })();
    return () => {
      cancelled = true;
    };
  }, [segmentId]);

  useEffect(() => {
    document.body.style.overflow = vehicleModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [vehicleModalOpen]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center p-12">
        <div
          className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2"
          style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
        />
      </div>
    );
  }

  const segments = (booking?.segments || []) as any[];
  const index = segments.findIndex((s) => segId(s) === segmentId);
  const segment = index >= 0 ? segments[index] : undefined;

  if (error || !booking || !segment) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <button
          onClick={() => router.push(links.bookingHref(bookingId))}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>
        <Card>
          <p className="font-semibold text-gray-900">
            {error || "Trip not found"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This trip may have been removed, or the link is no longer valid.
          </p>
        </Card>
      </div>
    );
  }

  const prev = index > 0 ? segments[index - 1] : undefined;
  const next =
    index >= 0 && index < segments.length - 1 ? segments[index + 1] : undefined;

  const status = trip?.tripStatus
    ? customerTripStatus(trip.tripStatus)
    : customerBookingStatus(segment.bookingStatus || booking.bookingStatus);

  const photo =
    vehicle?.photos?.find((p: any) => p.isPrimary)?.cloudinaryUrl ||
    vehicle?.photos?.[0]?.cloudinaryUrl ||
    "";
  const vehicleName =
    vehicle?.name || segment?.vehicle?.vehicleName || "Vehicle";
  const tripType = segment?.bookingTypeName || booking.bookingType || "Trip";

  const goToTrip = (s: any) =>
    router.push(links.tripHref(bookingId, segId(s)));

  const bookThisVehicle = () => {
    const vid = vehicle?.slug || vehicle?.id || segment?.vehicle?.id;
    if (vid) router.push(`/booking/details/${vid}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
        <button
          onClick={() => router.push(links.rootHref)}
          className="hover:text-gray-900"
        >
          {links.rootLabel}
        </button>
        <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button
          onClick={() => router.push(links.bookingHref(bookingId))}
          className="hover:text-gray-900"
        >
          {booking.invoiceNumber ? `Invoice ${booking.invoiceNumber}` : "Booking"}
        </button>
        <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-medium text-gray-900">Trip {index + 1}</span>
      </div>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-44 w-full bg-gray-100 sm:h-56">
          {photo ? (
            <img
              src={photo}
              alt={vehicleName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${status.classes}`}
          >
            {status.label}
          </span>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Trip {index + 1} of {segments.length}
          </p>
          <h2 className="mt-0.5 truncate text-xl font-bold text-gray-900">
            {vehicleName}
          </h2>
          <p className="text-sm text-gray-500">{tripType}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <FiCalendar className="h-4 w-4 text-gray-400" />
            <span>{fmt(segment.startDateTime, true)}</span>
          </div>
        </div>
      </div>

      {/* Trip schedule */}
      <Card title="Trip schedule">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Row
            icon={<FiCalendar className="h-4 w-4" />}
            label="Starts"
            value={fmt(segment.startDateTime, true)}
          />
          <Row
            icon={<FiCalendar className="h-4 w-4" />}
            label="Ends"
            value={fmt(segment.endDateTime, true)}
          />
          <Row
            icon={<FiClock className="h-4 w-4" />}
            label="Duration"
            value={segment.duration}
          />
        </div>
      </Card>

      {/* Route */}
      <Card title="Route">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <Row
            icon={<FiMapPin className="h-4 w-4" />}
            label="Pickup"
            value={segment.pickupLocation}
          />
          <Row
            icon={<FiMapPin className="h-4 w-4" />}
            label="Drop-off"
            value={segment.dropoffLocation}
          />
          {Array.isArray(segment.areaOfUse) &&
            segment.areaOfUse.filter((a: any) => a?.areaOfUseName).length >
              0 && (
              <Row
                icon={<FiMapPin className="h-4 w-4" />}
                label="Area of use"
                value={segment.areaOfUse
                  .map((a: any) => a?.areaOfUseName)
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
        </div>
      </Card>

      {/* Driver (shown only when assigned data is available) */}
      {trip?.driverAssigned && (
        <Card title="Driver">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F1FF] text-[#0673ff]">
                <FiUser className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {trip.driverName || "Assigned"}
                </p>
                <p className="text-xs text-gray-500">Your assigned driver</p>
              </div>
            </div>
            {trip.driverPhoneNumber && (
              <a
                href={`tel:${trip.driverPhoneNumber}`}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <FiPhone className="h-4 w-4" /> Call
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Assigned car */}
      {vehicle && (
        <Card
          title="Assigned car"
          action={
            <button
              onClick={() => setVehicleModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673ff] hover:underline"
            >
              <FiEye className="h-4 w-4" /> View vehicle
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <Row
              icon={<FiTruck className="h-4 w-4" />}
              label="Make & model"
              value={[vehicle.vehicleMakeName, vehicle.vehicleModelName]
                .filter(Boolean)
                .join(" ")}
            />
            <Row
              icon={<FiTruck className="h-4 w-4" />}
              label="Colour"
              value={vehicle.vehicleColorName}
            />
            <Row
              icon={<FiTruck className="h-4 w-4" />}
              label="Year"
              value={vehicle.year}
            />
            <Row
              icon={<FiUser className="h-4 w-4" />}
              label="Seats"
              value={vehicle.numberOfSeats}
            />
            {(segment?.vehicle?.licensePlate || vehicle.licensePlate) && (
              <Row
                icon={<FiTruck className="h-4 w-4" />}
                label="Plate"
                value={segment?.vehicle?.licensePlate || vehicle.licensePlate}
              />
            )}
          </div>
        </Card>
      )}

      {/* Need help */}
      <Card title="Need help">
        <p className="text-sm text-gray-600">
          Our support team is here if anything about this trip needs attention.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={SUPPORT_CONTACT.phoneHref}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            <FiPhone className="h-4 w-4" /> Call support
          </a>
          <a
            href={SUPPORT_CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FaWhatsapp className="h-4 w-4 text-[#25D366]" /> WhatsApp
          </a>
          <a
            href={SUPPORT_CONTACT.emailHref}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FiMail className="h-4 w-4" /> Email
          </a>
        </div>
      </Card>

      {/* Booking summary */}
      <Card title="Booking">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {booking.invoiceNumber
                ? `Invoice ${booking.invoiceNumber}`
                : "This booking"}
              {segments.length > 1 ? ` · ${segments.length} trips` : ""}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
              <FiCreditCard className="h-4 w-4 text-gray-400" />
              {ngn(booking.totalPrice)}
            </p>
          </div>
          <button
            onClick={() => router.push(links.bookingHref(bookingId))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FiExternalLink className="h-4 w-4" /> View booking
          </button>
        </div>
      </Card>

      {/* Sibling trip navigation */}
      {segments.length > 1 && (
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <button
              onClick={() => goToTrip(prev)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FiChevronLeft className="h-4 w-4" /> Trip {index}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              onClick={() => goToTrip(next)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Trip {index + 2} <FiChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span />
          )}
        </div>
      )}

      {vehicleModalOpen && vehicle && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setVehicleModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto bg-white sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 w-full bg-gray-100">
              {photo ? (
                <img
                  src={photo}
                  alt={vehicleName}
                  className="h-full w-full object-cover sm:rounded-t-2xl"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {vehicleName}
                </h3>
                <p className="text-sm text-gray-500">
                  {[
                    vehicle.vehicleMakeName,
                    vehicle.vehicleModelName,
                    vehicle.vehicleColorName,
                    vehicle.year,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="font-medium text-gray-900">
                    {vehicle.numberOfSeats ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-medium text-gray-900">
                    {vehicle.year ?? "N/A"}
                  </p>
                </div>
              </div>

              {Array.isArray(vehicle.vehicleFeatures) &&
                vehicle.vehicleFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {vehicle.vehicleFeatures.map((f: string) => (
                      <span
                        key={f}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

              {vehicle.description && (
                <p className="text-sm leading-relaxed text-gray-600">
                  {vehicle.description}
                </p>
              )}

              <button
                onClick={bookThisVehicle}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <FiArrowRight className="h-4 w-4" /> Book this Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
