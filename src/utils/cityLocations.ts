export interface CityLocation {
  lat: number;
  lng: number;
  label: string;
}

const RADIUS_KM = 100;

const CITY_LOCATIONS: Record<string, CityLocation> = {
  lagos: { lat: 6.5244, lng: 3.3792, label: "lagos" },
  abuja: { lat: 9.0579, lng: 7.4951, label: "abuja" },
  "port-harcourt": { lat: 4.8156, lng: 7.0498, label: "port-harcourt" },
  benin: { lat: 6.335, lng: 5.6037, label: "benin" },
  enugu: { lat: 6.4584, lng: 7.5464, label: "enugu" },
  accra: { lat: 5.6037, lng: -0.187, label: "accra" },
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
