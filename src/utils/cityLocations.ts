export const cityKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bcity\b/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Normalise a city value that may arrive in any shape (lowercase, hyphenated
// slug, or with a trailing ", Nigeria") into a clean, title-cased display name.
// "port-harcourt" -> "Port Harcourt", "lagos" -> "Lagos", "Lagos, Nigeria" ->
// "Lagos". Used for both the page title and the canonical, so every variant of a
// city resolves to one consistent form.
export const formatCity = (raw: string) =>
  (raw || "")
    .split(",")[0]
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

// Build a city browse link for the search page. We filter by the city field,
// which is set reliably for every market, and intentionally do not send
// latitude and longitude here. Vehicle coordinates outside Lagos are not
// consistently populated, so a proximity search around a city centroid would
// wrongly exclude real vehicles. Sending only the city routes the backend to
// its city browse, which returns all approved vehicles in that market.
export const buildCitySearchHref = (name: string, bookingTypeId?: string) => {
  const params = new URLSearchParams();
  params.set("city", name.trim());

  if (bookingTypeId && bookingTypeId !== "undefined") {
    params.set("bookingType", bookingTypeId);
  }

  return `/booking/search?${params.toString()}`;
};
