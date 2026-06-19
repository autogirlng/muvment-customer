export interface CityLocation {
  lat: number;
  lng: number;
  label: string;
}

const RADIUS_KM = 100;

const CITY_LOCATIONS: Record<string, CityLocation> = {
  lagos: { lat: 6.5244, lng: 3.3792, label: "lagos" },
  abuja: { lat: 9.0579, lng: 7.4951, label: "abuja" },
  abia: { lat: 5.5249, lng: 7.4943, label: "abia" },
  delta: { lat: 6.198, lng: 6.734, label: "delta" },
  imo: { lat: 5.4836, lng: 7.0333, label: "imo" },
  oyo: { lat: 7.3775, lng: 3.947, label: "oyo" },
  rivers: { lat: 4.8156, lng: 7.0498, label: "rivers" },
};

export const cityKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bcity\b/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const buildCitySearchHref = (name: string, bookingTypeId?: string) => {
  const key = cityKey(name);
  const loc = CITY_LOCATIONS[key];
  const params = new URLSearchParams();

  if (loc) {
    params.set("lat", loc.lat.toString());
    params.set("lng", loc.lng.toString());
    params.set("location", loc.label);
    params.set("radiusInKm", RADIUS_KM.toString());
  } else {
    params.set("city", key);
  }

  if (bookingTypeId && bookingTypeId !== "undefined") {
    params.set("bookingType", bookingTypeId);
  }

  return `/booking/search?${params.toString()}`;
};
