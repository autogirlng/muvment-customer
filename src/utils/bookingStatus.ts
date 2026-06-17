// Maps the application's internal booking states to the smaller set a customer
// should see. Every cancellation variant (and a failed availability) reads as a
// single "Cancelled".
type StatusStyle = { label: string; classes: string };

const MAP: Record<string, StatusStyle> = {
  PENDING_PAYMENT: { label: "Pending payment", classes: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmed", classes: "bg-green-100 text-green-800" },
  IN_PROGRESS: { label: "Ongoing", classes: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", classes: "bg-indigo-100 text-indigo-800" },
  CANCELLED_BY_USER: { label: "Cancelled", classes: "bg-rose-100 text-rose-700" },
  CANCELLED_BY_HOST: { label: "Cancelled", classes: "bg-rose-100 text-rose-700" },
  CANCELLED_BY_ADMIN: { label: "Cancelled", classes: "bg-rose-100 text-rose-700" },
  FAILED_AVAILABILITY: { label: "Cancelled", classes: "bg-rose-100 text-rose-700" },
  NO_SHOW: { label: "No show", classes: "bg-orange-100 text-orange-800" },
};

export const customerBookingStatus = (status?: string): StatusStyle => {
  if (status && MAP[status]) return MAP[status];
  const label = (status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
  return { label: label || "Unknown", classes: "bg-gray-100 text-gray-700" };
};

const TRIP_MAP: Record<string, StatusStyle> = {
  UPCOMING: { label: "Upcoming", classes: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In progress", classes: "bg-green-100 text-green-800" },
  COMING_TO_AN_END: {
    label: "Ending soon",
    classes: "bg-amber-100 text-amber-800",
  },
  COMPLETED: { label: "Completed", classes: "bg-indigo-100 text-indigo-800" },
  DELAYED: { label: "Delayed", classes: "bg-orange-100 text-orange-800" },
  EXTENDED: { label: "Extended", classes: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelled", classes: "bg-rose-100 text-rose-700" },
};

export const customerTripStatus = (status?: string): StatusStyle => {
  if (status && TRIP_MAP[status]) return TRIP_MAP[status];
  const label = (status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
  return { label: label || "Unknown", classes: "bg-gray-100 text-gray-700" };
};

// Options shown in the customer status filter. Each maps to a single backend
// value. Cancelled uses the user cancellation; see note in the page about the
// backend supporting a grouped cancelled filter.
export const CUSTOMER_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All status" },
  { value: "PENDING_PAYMENT", label: "Pending payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED_BY_USER", label: "Cancelled" },
  { value: "NO_SHOW", label: "No show" },
];
