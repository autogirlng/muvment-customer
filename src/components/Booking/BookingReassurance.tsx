import { FiLock, FiCheckCircle } from "react-icons/fi";

// Fuel and a chauffeur are bundled into our standard bookings. Monthly rentals
// settle fuel separately, and interstate trips depend on the route, so we do not
// make the blanket promise for those. Boat trips are excluded too.
export const bookingIncludesFuelAndDriver = (name?: string): boolean => {
  const n = String(name || "").toLowerCase();
  if (!n) return false;
  if (n.includes("month")) return false;
  if (n.includes("interstate")) return false;
  if (n.includes("boat")) return false;
  return true;
};

export default function BookingReassurance({
  bookingTypeNames,
}: {
  bookingTypeNames: (string | undefined)[];
}) {
  const names = bookingTypeNames.filter(Boolean) as string[];
  const showFuelDriver =
    names.length > 0 && names.every((n) => bookingIncludesFuelAndDriver(n));

  return (
    <div className="space-y-2.5">
      {showFuelDriver && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#cfe0fb] bg-[#EAF2FF] px-4 py-3">
          <FiCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0673ff]" />
          <p className="text-sm text-grey-800">
            This booking includes fuel and a professional driver.
          </p>
        </div>
      )}
      <div className="flex items-start gap-2.5 rounded-2xl border border-grey-100 bg-white px-4 py-3">
        <FiLock className="mt-0.5 h-4 w-4 flex-shrink-0 text-grey-400" />
        <p className="text-sm text-grey-600">
          Pay with card or transfer. Once your payment goes through, your booking
          is confirmed and your service is guaranteed.
        </p>
      </div>
    </div>
  );
}
