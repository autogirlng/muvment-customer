// Area of use describes where the customer will be driven around during a
// booking, so it only applies to bookings that work that way: the within state
// hourly and daily hires. The rest are priced on a different basis and must not
// ask for it.
//
//   Airport pickup and drop off  a fixed route between an address and a terminal
//   Boat trip                    priced per destination
//   Interstate                   priced on the route between states
//   Monthly within state         priced for the month, not by area
//
// An unknown or not yet loaded booking type is treated as not needing it, so the
// field is never demanded before the type is known.
const EXEMPT_KEYWORDS = ["airport", "boat", "interstate", "month"];

export const requiresAreaOfUse = (bookingTypeName?: string | null) => {
  const name = String(bookingTypeName || "")
    .trim()
    .toLowerCase();
  if (!name) return false;
  return !EXEMPT_KEYWORDS.some((keyword) => name.includes(keyword));
};
