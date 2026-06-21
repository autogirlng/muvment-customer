export const cityKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bcity\b/g, "")
    .trim()
    .replace(/\s+/g, "-");

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
