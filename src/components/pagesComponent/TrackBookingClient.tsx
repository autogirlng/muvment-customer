"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiSearch,
  FiAlertCircle,
  FiNavigation,
  FiArrowRight,
  FiCreditCard,
  FiUser,
  FiTruck,
  FiEye,
  FiX,
  FiCopy,
  FiCheck,
  FiChevronRight,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import { useAuth } from "@/context/AuthContext";
import { BookingService } from "@/controllers/booking/bookingService";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { customerBookingStatus } from "@/utils/bookingStatus";
import { SUPPORT_CONTACT } from "@/constants/support";
import {
  BRAND,
  ngn,
  fmt,
  prettyStatus,
  statusClasses,
  Card,
  Row,
} from "@/components/Dashboard/detailUI";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unwrap = (data: any) => {
  const raw = Array.isArray(data)
    ? data[0]?.data ?? data[0]
    : data?.data ?? data;
  return raw || null;
};

const segId = (s: any) => s?.segmentId || s?.id || "";

const TrackBookingClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const urlRef =
    searchParams.get("invoice") || searchParams.get("bookingId") || "";

  const [trackId, setTrackId] = useState(urlRef);
  const [input, setInput] = useState(urlRef);
  const [booking, setBooking] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const load = useCallback(async (ref: string) => {
    if (!ref) return;
    setLoading(true);
    setError(false);
    setBooking(null);
    setVehicle(null);
    const isUuid = UUID_RE.test(ref);
    const tryById = async () => {
      try {
        return await BookingService.getBookingById(ref);
      } catch {
        return null;
      }
    };
    const tryByInvoice = async () => {
      try {
        return await BookingService.getBookingByInvoice(ref);
      } catch {
        return null;
      }
    };
    try {
      // Customers usually have the invoice number from their receipt; a UUID
      // only arrives via an internal share link. Try the likely path first,
      // then fall back to the other so both forms resolve.
      let data = isUuid ? await tryById() : await tryByInvoice();
      if (!data) data = isUuid ? await tryByInvoice() : await tryById();
      const raw = unwrap(data);
      const isRealBooking =
        raw &&
        typeof raw === "object" &&
        !raw.err &&
        raw.status !== "FAILED" &&
        Boolean(
          raw.bookingId ||
            raw.invoiceNumber ||
            raw.bookingStatus ||
            Array.isArray(raw.segments),
        );
      if (!isRealBooking) {
        setError(true);
        return;
      }
      setBooking(raw);

      const vehicleId = raw.vehicle?.id || raw.segments?.[0]?.vehicle?.id;
      if (vehicleId) {
        try {
          const vRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {},
          );
          setVehicle(vRes?.data?.[0]?.data || null);
        } catch {
          setVehicle(null);
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackId) load(trackId);
  }, [trackId, load]);

  useEffect(() => {
    document.body.style.overflow = vehicleModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [vehicleModalOpen]);

  const submitManual = () => {
    const id = input.trim();
    if (!id) return;
    setTrackId(id);
    const param = UUID_RE.test(id) ? "bookingId" : "invoice";
    router.replace(`/track-booking?${param}=${encodeURIComponent(id)}`);
  };

  const reset = () => {
    setTrackId("");
    setBooking(null);
    setVehicle(null);
    setError(false);
    setInput("");
    router.replace("/track-booking");
  };

  const copyId = async () => {
    if (!booking?.bookingId) return;
    try {
      await navigator.clipboard.writeText(booking.bookingId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1500);
    } catch {
      // clipboard unavailable; no action needed
    }
  };

  const segments = (booking?.segments || []) as any[];
  const photo =
    vehicle?.photos?.find((p: any) => p.isPrimary)?.cloudinaryUrl ||
    vehicle?.photos?.[0]?.cloudinaryUrl ||
    "";
  const vehicleName =
    vehicle?.name || booking?.vehicle?.name || booking?.vehicle?.vehicleName;
  const bookThisVehicle = () => {
    const vid = vehicle?.slug || vehicle?.id || booking?.vehicle?.id;
    if (vid) router.push(`/booking/details/${vid}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        {/* Header + search */}
        {!booking && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0673FF] to-[#0a328f] px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
          <h1 className="text-2xl font-bold sm:text-3xl">Track your booking</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
            Enter your invoice number to see its status and trip details. No
            account needed.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:max-w-xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitManual()}
                placeholder="Invoice number"
                className="w-full rounded-full border border-transparent bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </div>
            <button
              onClick={submitManual}
              className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0673ff] transition hover:bg-white/90"
            >
              Track
            </button>
          </div>
          {trackId && error && !loading && (
            <div className="mt-4 flex max-w-xl items-start gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                We couldn&apos;t find a booking for &quot;{trackId}&quot;. Please
                check the invoice number and enter a valid one.
              </span>
            </div>
          )}
        </div>
        )}

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div
                className="mx-auto h-10 w-10 animate-spin rounded-full border-t-2 border-b-2"
                style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
              />
              <p className="mt-4 text-sm text-gray-500">
                Loading booking status...
              </p>
            </div>
          ) : booking ? (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Tracking reference:{" "}
                  <span className="font-mono" style={{ color: BRAND }}>
                    {booking?.invoiceNumber || trackId}
                  </span>
                </p>
                <button
                  onClick={reset}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-blue-50"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  <FiSearch className="h-4 w-4" />
                  Track another
                </button>
              </div>

              {/* Header card */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {photo ? (
                  <div className="relative h-44 w-full bg-gray-100 sm:h-56">
                    <img
                      src={photo}
                      alt={vehicleName || "Vehicle"}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusClasses(
                        booking.bookingStatus,
                      )}`}
                    >
                      {prettyStatus(booking.bookingStatus)}
                    </span>
                  </div>
                ) : null}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-gray-900">
                        {vehicleName || "Vehicle"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {segments[0]?.bookingTypeName ||
                          booking.servicePricingName ||
                          "Booking"}
                        {booking.invoiceNumber
                          ? ` · Invoice ${booking.invoiceNumber}`
                          : ""}
                      </p>
                      {booking.bookingId && (
                        <button
                          onClick={copyId}
                          title="Copy booking ID"
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                        >
                          <span className="font-mono">
                            ID: {String(booking.bookingId).slice(0, 8)}…
                            {String(booking.bookingId).slice(-4)}
                          </span>
                          {idCopied ? (
                            <FiCheck className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <FiCopy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    {!photo && (
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          booking.bookingStatus,
                        )}`}
                      >
                        {prettyStatus(booking.bookingStatus)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
                <div className="space-y-6 lg:col-span-2 lg:sticky lg:top-24">
                  {/* Trips */}
                  <Card
                    title={segments.length > 1 ? `Trips (${segments.length})` : "Trip"}
                  >
                    <div className="space-y-3">
                      {segments.map((seg: any, i: number) => {
                        const sid = segId(seg);
                        const st = customerBookingStatus(
                          seg.bookingStatus || booking.bookingStatus,
                        );
                        return (
                          <button
                            key={sid || i}
                            type="button"
                            onClick={() =>
                              router.push(
                                `/track-booking/${booking.bookingId}/trip/${sid}`,
                              )
                            }
                            className="block w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:bg-gray-100"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Trip {i + 1}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${st.classes}`}
                                  >
                                    {st.label}
                                  </span>
                                </div>
                                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                  <FiCalendar className="h-4 w-4 shrink-0 text-gray-400" />
                                  {fmt(seg.startDateTime, true)}
                                </p>
                                {(seg.pickupLocation || seg.dropoffLocation) && (
                                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                    <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">
                                      {seg.pickupLocation || "Pickup"}
                                    </span>
                                    <FiArrowRight className="h-3 w-3 shrink-0" />
                                    <span className="truncate">
                                      {seg.dropoffLocation || "Drop-off"}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0673ff]">
                                Details
                                <FiChevronRight className="h-4 w-4" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Vehicle */}
                  <Card
                    title="Vehicle"
                    action={
                      vehicle ? (
                        <button
                          onClick={() => setVehicleModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673ff] hover:underline"
                        >
                          <FiEye className="h-4 w-4" /> View vehicle
                        </button>
                      ) : undefined
                    }
                  >
                    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                      <Row
                        icon={<FiTruck className="h-4 w-4" />}
                        label="Name"
                        value={vehicleName}
                      />
                      {vehicle && (
                        <>
                          <Row
                            icon={<FiTruck className="h-4 w-4" />}
                            label="Make & model"
                            value={[
                              vehicle.vehicleMakeName,
                              vehicle.vehicleModelName,
                            ]
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
                        </>
                      )}
                      {(booking.vehicle?.licensePlateNumber ||
                        booking.vehicle?.vehicleIdentifier) && (
                        <Row
                          icon={<FiTruck className="h-4 w-4" />}
                          label="Identifier"
                          value={
                            booking.vehicle?.licensePlateNumber ||
                            booking.vehicle?.vehicleIdentifier
                          }
                        />
                      )}
                    </div>
                    {vehicle &&
                      Array.isArray(vehicle.vehicleFeatures) &&
                      vehicle.vehicleFeatures.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
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
                  </Card>

                  {/* Payment */}
                  <Card title="Payment">
                    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                      <Row
                        icon={<FiCreditCard className="h-4 w-4" />}
                        label="Total"
                        value={
                          <span className="text-base font-bold text-gray-900">
                            {ngn(booking.totalPrice)}
                          </span>
                        }
                      />
                      {booking.discounted && (
                        <>
                          <Row
                            icon={<FiCreditCard className="h-4 w-4" />}
                            label="Original price"
                            value={ngn(booking.originalPrice)}
                          />
                          <Row
                            icon={<FiCreditCard className="h-4 w-4" />}
                            label="Discount"
                            value={ngn(booking.discountAmount)}
                          />
                          {booking.couponCode && (
                            <Row
                              icon={<FiCreditCard className="h-4 w-4" />}
                              label="Coupon"
                              value={booking.couponCode}
                            />
                          )}
                        </>
                      )}
                      <Row
                        icon={<FiCreditCard className="h-4 w-4" />}
                        label="Method"
                        value={booking.paymentMethod}
                      />
                      <Row
                        icon={<FiCalendar className="h-4 w-4" />}
                        label="Booked on"
                        value={fmt(booking.bookedAt)}
                      />
                      {booking.paidAt && (
                        <Row
                          icon={<FiCalendar className="h-4 w-4" />}
                          label="Paid on"
                          value={fmt(booking.paidAt)}
                        />
                      )}
                      {booking.rideType && (
                        <Row
                          icon={<FiTruck className="h-4 w-4" />}
                          label="Ride type"
                          value={prettyStatus(booking.rideType)}
                        />
                      )}
                    </div>
                  </Card>

                  {/* Extra details */}
                  {(booking.purposeOfRide || booking.extraDetails) && (
                    <Card title="Trip notes">
                      <div className="grid grid-cols-1 gap-x-6">
                        {booking.purposeOfRide && (
                          <Row
                            icon={<FiNavigation className="h-4 w-4" />}
                            label="Purpose of ride"
                            value={booking.purposeOfRide}
                          />
                        )}
                        {booking.extraDetails && (
                          <Row
                            icon={<FiNavigation className="h-4 w-4" />}
                            label="Extra details"
                            value={booking.extraDetails}
                          />
                        )}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:col-span-1 lg:sticky lg:top-24">
                  <Card title="Actions">
                    <div className="space-y-2.5">
                      {user ? (
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/booking/${booking.bookingId || trackId}`,
                            )
                          }
                          className="w-full rounded-full px-4 py-2.5 font-semibold text-white transition hover:opacity-90"
                          style={{ backgroundColor: BRAND }}
                        >
                          Open in my bookings
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push("/auth/register")}
                            className="w-full rounded-full px-4 py-2.5 font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: BRAND }}
                          >
                            Create an account
                          </button>
                          <button
                            onClick={() => router.push("/auth/login")}
                            className="block w-full rounded-full border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Log in
                          </button>
                        </>
                      )}
                    </div>
                  </Card>

                  <Card title="Need help">
                    <p className="text-sm text-gray-600">
                      Our support team can help with anything about this booking.
                    </p>
                    <div className="mt-3 space-y-2.5">
                      <a
                        href={SUPPORT_CONTACT.phoneHref}
                        className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: BRAND }}
                      >
                        <FiPhone className="h-4 w-4" /> Call support
                      </a>
                      <a
                        href={SUPPORT_CONTACT.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        <FaWhatsapp className="h-4 w-4 text-[#25D366]" /> WhatsApp
                      </a>
                      <a
                        href={SUPPORT_CONTACT.emailHref}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        <FiMail className="h-4 w-4" /> Email
                      </a>
                    </div>
                  </Card>

                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
                    <div
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#E7F1FF" }}
                    >
                      <FiNavigation className="h-6 w-6" style={{ color: BRAND }} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Live location coming soon
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Once your trip starts, the driver&apos;s live location and
                      status will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : trackId && error ? null : (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Book a vehicle */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#E7F1FF", color: BRAND }}
                >
                  <FiTruck className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Need a ride?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Browse verified cars across Nigeria and Ghana and book in
                  minutes, with flexible pricing for any kind of trip.
                </p>
                <button
                  onClick={() => router.push("/booking/search")}
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  Book a vehicle <FiArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Account / manage bookings */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#E7F1FF", color: BRAND }}
                >
                  <FiUser className="h-6 w-6" />
                </span>
                {user ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">
                      Your bookings, all in one place
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      Head to your dashboard to see every trip, track its status,
                      and rebook in a tap.
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/my-booking")}
                      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: BRAND }}
                    >
                      Go to my bookings <FiArrowRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">
                      Manage your bookings
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      Create a free account to keep every trip in one place,
                      track status, rebook faster, and find your receipts
                      anytime.
                    </p>
                    <button
                      onClick={() => router.push("/auth/register")}
                      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: BRAND }}
                    >
                      Create an account <FiArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push("/auth/login")}
                      className="mt-3 w-fit text-sm font-medium hover:underline"
                      style={{ color: BRAND }}
                    >
                      Already have an account? Log in
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
                  alt={vehicleName || "Vehicle"}
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

      <Footer />
    </div>
  );
};

export default TrackBookingClient;
