"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, isValid } from "date-fns";
import {
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiHash,
  FiDownload,
  FiArrowLeft,
  FiShield,
  FiCalendar,
  FiBox,
  FiInfo,
  FiLoader,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getSingleData } from "@/controllers/connnector/app.callers";

interface BookingSegment {
  segmentId: string;
  startDateTime: string;
  endDateTime: string;
  duration: string;
  pickupLocation: string;
  dropoffLocation: string;
  bookingTypeName: string;
}

interface BookingDetails {
  bookingId: string;
  invoiceNumber: string;
  bookingStatus: string;
  paymentMethod: string;
  channel: string;
  bookedAt: string;
  totalPrice: number;
  vehicle?: {
    id: string;
    vehicleName: string;
    licensePlate: string;
  };
  booker?: {
    fullName: string;
    email: string;
    customerPhone: string;
  };
  recipient?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  primaryPhoneNumber?: string;
  segments?: BookingSegment[];
}

interface VehiclePhoto {
  cloudinaryUrl: string;
  isPrimary: boolean;
}

interface VehicleDetails {
  id: string;
  name: string;
  photos: VehiclePhoto[];
  vehicleMakeName: string;
  vehicleModelName: string;
  vehicleColorName: string;
  year: number;
  vehicleFeatures: string[];
  numberOfSeats: number;
  description: string;
}

const BRAND = "#0673ff";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const safeFormat = (dateString: string | undefined | null, fmt: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, fmt) : "Invalid Date";
};

const isConfirmedStatus = (s?: string) =>
  s === "CONFIRMED" || s === "SUCCESSFUL" || s === "PAID";

const prettyStatus = (s?: string) => {
  if (!s) return "Pending";
  const t = s.replace(/_/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const StatusBadge = ({ status }: { status: string }) => {
  const confirmed = isConfirmedStatus(status);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
        confirmed
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {confirmed ? <FiCheckCircle /> : <FiClock />}
      {prettyStatus(status)}
    </span>
  );
};

const MAX_POLLS = 5;

const BookingDetailsClient = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const bookingId = (params.id as string) || "";

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [paymentRef, setPaymentRef] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setPaymentRef(p.get("reference") || p.get("trxref") || "");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      sessionStorage.removeItem("servicePricingBookingId");
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const bookingRes = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`,
        );
        const bookingData = bookingRes?.data?.[0]?.data;

        if (!bookingData) {
          throw new Error("We couldn't find this booking.");
        }

        setBooking(bookingData);

        const vehicleId = bookingData.vehicle?.id;
        if (vehicleId) {
          const vehicleRes = await getSingleData(
            `/api/v1/public/vehicles/${vehicleId}`,
            {},
          );
          setVehicle(vehicleRes?.data?.[0]?.data || null);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // The payment callback can land here a moment before the booking is marked
  // confirmed. Re-check a few times so a freshly paid booking stops reading as
  // pending without the user having to refresh.
  useEffect(() => {
    if (!booking || !bookingId) return;
    if (isConfirmedStatus(booking.bookingStatus)) return;
    if (pollCount >= MAX_POLLS) return;

    const t = setTimeout(async () => {
      try {
        const res = await getSingleData(
          `/api/v1/public/bookings/${bookingId}`,
        );
        const data = res?.data?.[0]?.data;
        if (data) setBooking(data);
      } catch (e) {
        console.error("Re-check failed", e);
      }
      setPollCount((c) => c + 1);
    }, 4000);

    return () => clearTimeout(t);
  }, [booking, pollCount, bookingId]);

  const buildReceiptHtml = () => {
    if (!booking) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const vehicleTitle = vehicle
      ? `${vehicle.year} ${vehicle.vehicleMakeName} ${vehicle.vehicleModelName}`
      : booking.vehicle?.vehicleName || "Vehicle";
    const plate = booking.vehicle?.licensePlate || "";
    const vehicleId = booking.vehicle?.id || vehicle?.id || "";
    const vehicleLink = vehicleId
      ? `${origin}/booking/details/${vehicleId}`
      : "";
    const recipient = booking.recipient;
    const forOthers = !!(
      recipient?.fullName &&
      recipient.fullName !== booking.booker?.fullName
    );
    const features = (vehicle?.vehicleFeatures || [])
      .map((f) => escapeHtml(f))
      .join(" &middot; ");
    const rows = (booking.segments || [])
      .map(
        (s, i) => `
        <tr>
          <td class="num">${i + 1}</td>
          <td>${escapeHtml(safeFormat(s.startDateTime, "EEE, MMM do yyyy"))}<div class="muted">${escapeHtml(s.bookingTypeName || "")}${s.duration ? " &middot; " + escapeHtml(s.duration) : ""}</div></td>
          <td>${escapeHtml(s.pickupLocation || "N/A")}<div class="muted">${escapeHtml(safeFormat(s.startDateTime, "h:mm a"))}</div></td>
          <td>${escapeHtml(s.dropoffLocation || "N/A")}<div class="muted">${escapeHtml(safeFormat(s.endDateTime, "h:mm a"))}</div></td>
        </tr>`,
      )
      .join("");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Muvment Booking ${escapeHtml(booking.invoiceNumber || booking.bookingId)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; font-size: 12px; line-height: 1.5; }
  a { color: #0673ff; text-decoration: none; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0673ff; padding-bottom: 14px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand img { height: 32px; width: auto; }
  .brand .name { font-size: 16px; font-weight: 700; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 18px; margin: 0; }
  .pill { display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: #ecfdf3; color: #15803d; border: 1px solid #bbf7d0; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin: 22px 0 8px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f1f4; padding: 5px 0; }
  .row .k { color: #6b7280; }
  .row .v { font-weight: 600; text-align: right; }
  .total { margin-top: 16px; background: #eff6ff; border: 1px solid #cfe2ff; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
  .total .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #1e40af; }
  .total .amt { font-size: 20px; font-weight: 800; color: #0673ff; }
  .veh .vt { font-size: 15px; font-weight: 700; }
  .veh .meta { color: #6b7280; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 6px 8px; }
  td { padding: 8px; border-bottom: 1px solid #f1f1f4; vertical-align: top; }
  td.num { color: #9ca3af; width: 22px; }
  .muted { color: #6b7280; font-size: 11px; margin-top: 2px; }
  .help { margin-top: 22px; background: #f9fafb; border: 1px solid #eceef2; border-radius: 10px; padding: 14px 16px; }
  .help h2 { margin-top: 0; }
  .help .line { margin: 3px 0; }
  .fine { margin-top: 16px; color: #9ca3af; font-size: 10px; text-align: center; }
</style>
</head>
<body>
  <div class="head">
    <div class="brand">
      <img src="${origin}/images/image.png" alt="Muvment" />
      <span class="name">Muvment</span>
    </div>
    <div class="doc-title">
      <h1>Booking confirmation</h1>
      <div class="pill">${escapeHtml(prettyStatus(booking.bookingStatus))}</div>
    </div>
  </div>

  <div class="two">
    <div>
      <h2>Booking</h2>
      <div class="row"><span class="k">Invoice</span><span class="v">${escapeHtml(booking.invoiceNumber || "N/A")}</span></div>
      <div class="row"><span class="k">Booked on</span><span class="v">${escapeHtml(safeFormat(booking.bookedAt, "dd MMM yyyy"))}</span></div>
    </div>
    <div>
      <h2>Payment</h2>
      <div class="row"><span class="k">Method</span><span class="v">${escapeHtml((booking.paymentMethod || "Online").toString().toLowerCase().replace("_", " "))}</span></div>
      <div class="row"><span class="k">Status</span><span class="v">${escapeHtml(prettyStatus(booking.bookingStatus))}</span></div>
      <div class="row"><span class="k">Channel</span><span class="v">${escapeHtml((booking.channel || "Website").toString().toLowerCase())}</span></div>
    </div>
  </div>

  <div class="total">
    <span class="lbl">Total amount paid</span>
    <span class="amt">${escapeHtml(formatCurrency(booking.totalPrice))}</span>
  </div>

  <h2>Vehicle</h2>
  <div class="veh">
    <div class="vt">${escapeHtml(vehicleTitle)}</div>
    <div class="meta">${plate ? "Plate " + escapeHtml(plate) : ""}${vehicle?.vehicleColorName ? (plate ? " &middot; " : "") + escapeHtml(vehicle.vehicleColorName) : ""}</div>
    ${features ? `<div class="meta">${features}</div>` : ""}
    ${vehicleLink ? `<div class="meta"><a href="${vehicleLink}">View this vehicle on muvment</a></div>` : ""}
  </div>

  <h2>Trip itinerary</h2>
  <table>
    <thead><tr><th>#</th><th>Date</th><th>Pick-up</th><th>Drop-off</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">No itinerary details.</td></tr>`}</tbody>
  </table>

  <h2>${forOthers ? "Booked by" : "Customer"}</h2>
  <div class="row"><span class="k">Name</span><span class="v">${escapeHtml(booking.booker?.fullName || "Guest user")}</span></div>
  <div class="row"><span class="k">Email</span><span class="v">${escapeHtml(booking.booker?.email || "N/A")}</span></div>
  <div class="row"><span class="k">Phone</span><span class="v">${escapeHtml(booking.booker?.customerPhone || booking.primaryPhoneNumber || "N/A")}</span></div>
  ${
    forOthers
      ? `
  <h2>Customer</h2>
  <div class="row"><span class="k">Name</span><span class="v">${escapeHtml(recipient?.fullName || "N/A")}</span></div>
  <div class="row"><span class="k">Email</span><span class="v">${escapeHtml(recipient?.email || "N/A")}</span></div>
  <div class="row"><span class="k">Phone</span><span class="v">${escapeHtml(recipient?.phoneNumber || "N/A")}</span></div>`
      : ""
  }

  <div class="help">
    <h2>Need help with this booking?</h2>
    <div class="line">Autogirl Limited (AG Muvment)</div>
    <div class="line">Email: <a href="mailto:info@muvment.ng">info@muvment.ng</a></div>
    <div class="line">Call or SMS: <a href="tel:+2348167474165">+234 816 747 4165</a></div>
    <div class="line">Web: <a href="https://muvment.ng">muvment.ng</a></div>
    <div class="line">Terms you agreed to: <a href="${origin}/policy/terms-conditions">${origin}/policy/terms-conditions</a></div>
  </div>

  <div class="fine">
    Confirmation of your booking and payment with Muvment by Autogirl. Generated ${escapeHtml(safeFormat(new Date().toISOString(), "dd MMM yyyy, h:mm a"))}.
  </div>

  <script>window.onload = function(){ setTimeout(function(){ window.focus(); window.print(); }, 200); };</script>
</body>
</html>`;
  };

  const downloadReceipt = () => {
    if (typeof window === "undefined" || !booking) return;
    const existing = document.getElementById("mv-receipt-frame");
    if (existing) existing.remove();
    const iframe = document.createElement("iframe");
    iframe.id = "mv-receipt-frame";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(buildReceiptHtml());
    doc.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
            style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
          ></div>
          <p className="text-gray-500 animate-pulse">
            Retrieving booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FiInfo className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load booking
          </h3>
          <p className="text-red-500 mb-6 text-sm max-w-md">
            {error || "Booking not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 text-white rounded-full hover:opacity-90 transition font-medium"
            style={{ backgroundColor: BRAND }}
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const confirmed = isConfirmedStatus(booking.bookingStatus);
  const forOthers = !!(
    booking.recipient?.fullName &&
    booking.recipient.fullName !== booking.booker?.fullName
  );
  const vehiclePageId = booking.vehicle?.id || vehicle?.id || "";
  const vehicleName = vehicle
    ? `${vehicle.year} ${vehicle.vehicleMakeName} ${vehicle.vehicleModelName}`
    : booking?.vehicle?.vehicleName || "Vehicle";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 mt-16">
        {/* Success hero */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 mb-8 text-center">
          {confirmed ? (
            <div className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500">
              <FiCheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
            </div>
          ) : (
            <div
              className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full"
              style={{ backgroundColor: "#E7F1FF" }}
            >
              <FiLoader className="w-10 h-10 animate-spin" style={{ color: BRAND }} />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {confirmed ? "Payment successful" : "Payment received"}
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-3 max-w-xl mx-auto">
            {confirmed
              ? "Your booking is confirmed. A professional driver will be assigned to you shortly, and you'll be notified once everything is set."
              : "We're confirming your booking now. This usually takes a moment, no need to refresh."}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <StatusBadge status={booking.bookingStatus} />
            <span className="text-xs text-gray-500">
              Invoice number:{" "}
              <span className="font-mono" style={{ color: BRAND }}>
                {booking.invoiceNumber || "N/A"}
              </span>
            </span>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
            {isAuthenticated && (
              <button
                onClick={() => router.push("/dashboard/my-booking")}
                className="w-full sm:w-auto text-white font-semibold py-3 px-6 rounded-full hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                View my bookings
              </button>
            )}
            <button
              onClick={downloadReceipt}
              className="w-full sm:w-auto font-semibold py-3 px-6 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download receipt
            </button>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="bg-white rounded-2xl border border-[#cfe2ff] shadow-sm overflow-hidden mb-8 print:hidden">
            <div className="md:flex items-stretch">
              <div className="p-6 md:p-8 flex-1">
                <span
                  className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                  style={{ backgroundColor: "#E7F1FF", color: "#0b4ea2" }}
                >
                  Save time next time
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Create your free account to manage this booking
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mt-2 max-w-lg">
                  Track this trip, rebook in a tap, and keep your details and
                  saved trips in one place. Returning customers book their next
                  ride in about half the time.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push("/auth/register")}
                    className="text-white font-semibold py-3 px-6 rounded-full hover:opacity-90 transition"
                    style={{ backgroundColor: BRAND }}
                  >
                    Create account
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="font-semibold py-3 px-6 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Log in
                  </button>
                </div>
              </div>
              <div
                className="hidden md:flex items-center justify-center px-10"
                style={{ backgroundColor: "#E7F1FF" }}
              >
                <div className="text-center">
                  <div
                    className="text-4xl font-extrabold"
                    style={{ color: BRAND }}
                  >
                    50%
                  </div>
                  <div
                    className="text-xs font-medium mt-1"
                    style={{ color: "#0b4ea2" }}
                  >
                    faster checkout next time
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center text-gray-500 hover:text-[#0673ff] transition-colors"
          >
            <div className="p-2 bg-white rounded-full border border-gray-200 mr-2 group-hover:border-[#cfe2ff]">
              <FiArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: vehicle, itinerary, contact */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicle */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {vehicle && vehicle.photos && vehicle.photos.length > 0 ? (
                <div className="w-full relative group">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {vehicle.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="snap-center shrink-0 w-full sm:w-[85%] h-64 sm:h-80 relative first:pl-0 border-r border-white/20"
                      >
                        <img
                          src={photo.cloudinaryUrl}
                          alt={`${vehicle.vehicleMakeName || "Vehicle"} ${
                            vehicle.vehicleModelName || ""
                          }`.trim()}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {vehicle.photos.length} Photos
                  </div>
                </div>
              ) : (
                <div className="h-56 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <FiBox size={32} className="mb-2 opacity-50" />
                  <span>Image unavailable</span>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {vehiclePageId ? (
                        <a
                          href={`/booking/details/${vehiclePageId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#0673ff] transition-colors"
                        >
                          {vehicleName}
                        </a>
                      ) : (
                        vehicleName
                      )}
                    </h2>

                    <div className="flex items-center gap-3 mt-3">
                      {vehicle?.vehicleColorName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-gray-200"
                            style={{
                              backgroundColor:
                                vehicle.vehicleColorName.toLowerCase(),
                            }}
                          ></span>
                          {vehicle.vehicleColorName}
                        </span>
                      )}
                      {booking?.vehicle?.licensePlate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 font-mono">
                          {booking.vehicle.licensePlate}
                        </span>
                      )}
                    </div>
                  </div>

                  {vehicle && vehicle.vehicleFeatures && (
                    <div className="flex flex-wrap gap-2 md:justify-end md:max-w-[40%]">
                      {vehicle.vehicleFeatures
                        .slice(0, 4)
                        .map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-50 border border-gray-200 text-gray-600 text-[11px] px-2 py-1 rounded-md font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {vehicle?.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiInfo style={{ color: BRAND }} /> Vehicle description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <FiMapPin style={{ color: BRAND }} /> Trip itinerary
              </h3>

              <div className="space-y-10">
                {booking.segments && booking.segments.length > 0 ? (
                  booking.segments.map((segment) => (
                    <div
                      key={segment.segmentId}
                      className="relative pl-8 md:pl-10 border-l-2 last:border-0"
                      style={{ borderColor: "#cfe2ff" }}
                    >
                      <div
                        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10"
                        style={{ backgroundColor: BRAND }}
                      ></div>

                      <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-100 relative top-[-10px]">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b border-gray-200 pb-4">
                          <span
                            className="inline-flex items-center text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: BRAND }}
                          >
                            {segment.bookingTypeName}
                          </span>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {safeFormat(
                                segment.startDateTime,
                                "EEEE, MMMM do, yyyy",
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Duration: {segment.duration}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Pickup location
                            </label>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {segment.pickupLocation || "N/A"}
                            </p>
                            <div
                              className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded text-xs font-semibold"
                              style={{ color: "#0b4ea2", backgroundColor: "#E7F1FF" }}
                            >
                              <FiClock size={14} />
                              {safeFormat(segment.startDateTime, "h:mm a")}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold mb-1 block">
                              Drop-off location
                            </label>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {segment.dropoffLocation || "N/A"}
                            </p>
                            <div className="inline-flex items-center gap-1.5 mt-3 text-gray-600 bg-gray-200 px-2 py-1 rounded text-xs font-semibold">
                              <FiClock size={14} />
                              {safeFormat(segment.endDateTime, "h:mm a")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiMapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No specific itinerary details found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: summary, payment, contact */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Summary</h3>
                <StatusBadge status={booking.bookingStatus} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiHash size={16} /> Invoice #
                  </span>
                  <span className="font-mono font-medium text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
                    {booking.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiCalendar size={16} /> Booked on
                  </span>
                  <span className="font-medium text-gray-900 text-sm">
                    {safeFormat(booking.bookedAt, "dd/MM/yyyy")}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100">
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Total amount paid
                  </span>
                  <span
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: BRAND }}
                  >
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
              </div>

              <div
                className="mt-8 p-4 rounded-xl border"
                style={{ backgroundColor: "#E7F1FF", borderColor: "#cfe2ff" }}
              >
                <h4
                  className="font-bold text-sm mb-2 flex items-center gap-2"
                  style={{ color: "#0b4ea2" }}
                >
                  <FiCheckCircle /> {confirmed ? "Booking confirmed" : "Confirming booking"}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "#0b4ea2" }}>
                  Keep invoice <strong>{booking.invoiceNumber}</strong> handy for
                  any support enquiries.
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                <FiShield style={{ color: BRAND }} /> Payment
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Method</span>
                  <span className="font-medium text-gray-900 text-sm capitalize">
                    {(booking.paymentMethod || "Online")
                      .toLowerCase()
                      .replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Channel</span>
                  <span className="font-medium text-gray-900 text-sm capitalize">
                    {(booking.channel || "Website").toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {prettyStatus(booking.bookingStatus)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: BRAND }}
                  >
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
                {paymentRef && (
                  <div className="flex justify-between items-start gap-3 pt-2.5 border-t border-gray-50">
                    <span className="text-gray-500 text-sm shrink-0">
                      Reference
                    </span>
                    <span className="font-mono text-gray-700 text-xs text-right break-all">
                      {paymentRef}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                <FiUser style={{ color: BRAND }} /> Contact
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                    {forOthers ? "Booked by" : "Customer"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {booking.booker?.fullName || "Guest user"}
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {booking.booker?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.booker?.customerPhone ||
                      booking.primaryPhoneNumber ||
                      "N/A"}
                  </p>
                </div>
                {forOthers && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                      Customer
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.recipient?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 break-words">
                      {booking.recipient?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.recipient?.phoneNumber || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetailsClient;
