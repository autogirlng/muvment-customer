// Lagos-only rule for special (hourly package) booking. The check is coordinate
// based so it works from any entry point, whether a location is typed with a
// resolved state or carried in as coordinates only. The box covers Lagos State
// with a small margin and clearly excludes the other operating cities (Abuja,
// Port Harcourt, Benin, Enugu, Accra), so a coordinate outside it is not Lagos.
export const LAGOS_BOUNDS = {
  minLat: 6.3,
  maxLat: 6.8,
  minLng: 2.65,
  maxLng: 4.4,
};

export const isLagosCoordinate = (
  c?: { lat: number | null; lng: number | null } | null,
) =>
  !!c &&
  typeof c.lat === "number" &&
  typeof c.lng === "number" &&
  c.lat >= LAGOS_BOUNDS.minLat &&
  c.lat <= LAGOS_BOUNDS.maxLat &&
  c.lng >= LAGOS_BOUNDS.minLng &&
  c.lng <= LAGOS_BOUNDS.maxLng;
