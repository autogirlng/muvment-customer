"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMapPin,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { naira } from "@/utils/corporateAllowance";
import { customerBookingStatus } from "@/utils/bookingStatus";

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
  value ? (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  ) : null;

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const corp = useCorporateMembership();
  const bookingId = String(params?.bookingId || "");
  const orgId = corp.org?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    if (!orgId || !bookingId) return;
    setLoading(true);
    const data = await OrganizationService.getOrgBookingDetails(orgId, bookingId);
    setBooking(data);
    setLoading(false);

    // Full vehicle (photos + specs) and the wallet balance give the admin the context
    // to decide. Both are best-effort: the page still works if either is unavailable.
    const vehId = data?.vehicle?.id;
    if (vehId) {
      try {
        let v: any = await VehicleSearchService.getVehicleById(vehId);
        if (Array.isArray(v)) v = v[0];
        if (v && v.data && v.data.id) v = v.data;
        if (v && v.id) setVehicle(v);
      } catch {
        /* leave vehicle null */
      }
    }
    try {
      const info = await OrganizationService.getWalletInfo(orgId);
      if (info) setWalletBalance(Number(info.balance ?? 0));
    } catch {
      /* leave balance null */
    }
  }, [orgId, bookingId]);

  useEffect(() => {
    if (corp.loading) return;
    if (!corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    if (orgId) load();
  }, [corp.loading, corp.isOwnerLike, orgId, load, router]);

  const approve = async () => {
    if (!orgId || busy) return;
    setBusy(true);
    const res = await OrganizationService.approveBooking(orgId, bookingId);
    setBusy(false);
    if (res.error) {
      toast.error(res.message || "Could not approve this booking.");
      return;
    }
    toast.success("Booking approved and charged.");
    router.push("/dashboard/business/approvals");
  };

  const decline = async () => {
    if (!orgId || busy) return;
    setBusy(true);
    const res = await OrganizationService.declineBooking(
      orgId,
      bookingId,
      reason.trim() || undefined,
    );
    setBusy(false);
    if (res.error) {
      toast.error(res.message || "Could not decline this booking.");
      return;
    }
    toast.success("Booking declined.");
    router.push("/dashboard/business/approvals");
  };

  if (corp.loading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0673ff]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-sm font-medium text-gray-900">
          We couldn&apos;t load this booking
        </p>
        <p className="mt-1 text-sm text-gray-500">
          It may have already been handled, or it isn&apos;t part of your
          organization.
        </p>
        <button
          onClick={() => router.push("/dashboard/business/approvals")}
          className="mt-5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to approvals
        </button>
      </div>
    );
  }

  const status = customerBookingStatus(booking.bookingStatus);
  const isPending = booking.bookingStatus === "PENDING_APPROVAL";
  const forOthers = booking.bookingForOthers || booking.isBookingForOthers;
  const segments: any[] = Array.isArray(booking.segments) ? booking.segments : [];

  const vPhoto =
    vehicle?.photos?.[0]?.cloudinaryUrl || vehicle?.photos?.[0]?.url || null;
  const vTitle =
    ([vehicle?.year, vehicle?.vehicleMakeName, vehicle?.vehicleModelName]
      .filter(Boolean)
      .join(" ") ||
      booking.vehicle?.vehicleName) ??
    "Vehicle";
  const total = Number(booking.totalPrice || 0);
  const overBalance = walletBalance != null && total > walletBalance;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        onClick={() => router.push("/dashboard/business/approvals")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to approvals
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {booking.invoiceNumber || "Booking"}
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${status.classes}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {naira(booking.totalPrice)}
          </p>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="space-y-1">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <FiUser className="h-3.5 w-3.5" /> Booked by
          </p>
          <Row label="Name" value={booking.booker?.fullName} />
          <Row label="Email" value={booking.booker?.email} />
          <Row
            label="Phone"
            value={booking.booker?.phoneNumber || booking.primaryPhoneNumber}
          />
        </div>

        {forOthers && booking.recipient && (
          <>
            <hr className="my-4 border-gray-100" />
            <div className="space-y-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Passenger (guest)
              </p>
              <Row label="Name" value={booking.recipient?.fullName} />
              <Row label="Email" value={booking.recipient?.email} />
              <Row label="Phone" value={booking.recipient?.phoneNumber} />
            </div>
          </>
        )}

        <hr className="my-4 border-gray-100" />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Vehicle
          </p>
          <div className="flex gap-3">
            {vPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vPhoto}
                alt={vTitle}
                className="h-20 w-28 shrink-0 rounded-xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-400">
                No image
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {vTitle}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {[
                  booking.vehicle?.licensePlate,
                  vehicle?.vehicleColorName,
                  vehicle?.numberOfSeats
                    ? `${vehicle.numberOfSeats} seats`
                    : null,
                  vehicle?.transmissionType,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Vehicle details unavailable"}
              </p>
              {booking.servicePricingName && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {booking.servicePricingName}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />
        <div className="space-y-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Payment
          </p>
          <Row label="Method" value={booking.paymentMethod} />
          <Row label="Amount" value={naira(booking.totalPrice)} />
          <Row label="Booked on" value={fmtDate(booking.bookedAt)} />
          <Row
            label="Wallet balance"
            value={walletBalance != null ? naira(walletBalance) : undefined}
          />
          {overBalance && (
            <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This booking is more than the current wallet balance. Approving it
              will fail until the wallet is topped up.
            </p>
          )}
        </div>

        {segments.length > 0 && (
          <>
            <hr className="my-4 border-gray-100" />
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <FiCalendar className="h-3.5 w-3.5" /> Trips ({segments.length})
            </p>
            <div className="space-y-3">
              {segments.map((s, i) => (
                <div
                  key={s.segmentId || i}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-3.5"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {s.bookingTypeName || "Trip"}
                    {s.duration ? ` · ${s.duration}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {fmtDate(s.startDateTime)}
                    {s.endDateTime ? ` → ${fmtDate(s.endDateTime)}` : ""}
                  </p>
                  {s.pickupLocation && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-600">
                      <FiMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {s.pickupLocation}
                      {s.dropoffLocation ? ` → ${s.dropoffLocation}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {(booking.purposeOfRide || booking.extraDetails) && (
          <>
            <hr className="my-4 border-gray-100" />
            <div className="space-y-1">
              <Row
                label="Purpose"
                value={
                  booking.purposeOfRide && booking.purposeOfRide !== "N/A"
                    ? booking.purposeOfRide
                    : undefined
                }
              />
              <Row
                label="Notes"
                value={
                  booking.extraDetails && booking.extraDetails !== "N/A"
                    ? booking.extraDetails
                    : undefined
                }
              />
            </div>
          </>
        )}
      </div>

      {isPending ? (
        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={() => setDeclineOpen(true)}
            disabled={busy}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Decline
          </button>
          <button
            onClick={approve}
            disabled={busy}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#0673ff" }}
          >
            {busy ? "Working..." : "Approve & charge"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          This booking has already been {status.label.toLowerCase()}.
          {booking.declineReason ? (
            <p className="mt-1">
              <span className="text-gray-500">Reason: </span>
              {booking.declineReason}
            </p>
          ) : null}
        </div>
      )}

      {declineOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !busy && setDeclineOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <p className="text-base font-bold text-gray-900">Decline booking</p>
            <p className="mt-1 text-sm text-gray-500">
              Add a reason so {booking.booker?.fullName || "the member"} knows why.
              This is shared with them.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Outside policy for this trip type"
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0673ff] focus:outline-none focus:ring-1 focus:ring-[#0673ff]"
            />
            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={() => setDeclineOpen(false)}
                disabled={busy}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={decline}
                disabled={busy}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Declining..." : "Decline booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
