export interface CityArea {
  name: string;
  lat: number;
  lng: number;
  isOutskirts: boolean;
}

const lagos: CityArea[] = [
  { name: "Lekki", lat: 6.4330474, lng: 3.4821942, isOutskirts: false },
  {
    name: "Lekki Phase 1",
    lat: 6.447809299999999,
    lng: 3.4723495,
    isOutskirts: false,
  },
  {
    name: "Victoria Island",
    lat: 6.429098199999999,
    lng: 3.4238032,
    isOutskirts: false,
  },
  { name: "Ikoyi", lat: 6.449999999999999, lng: 3.433333, isOutskirts: false },
  { name: "Ikeja", lat: 6.601838, lng: 3.3514863, isOutskirts: false },
  {
    name: "Ikeja GRA",
    lat: 6.578996999999999,
    lng: 3.3494666,
    isOutskirts: false,
  },
  {
    name: "Surulere",
    lat: 6.498292999999999,
    lng: 3.348572,
    isOutskirts: false,
  },
  { name: "Yaba", lat: 6.5095442, lng: 3.3710936, isOutskirts: false },
  {
    name: "Gbagada",
    lat: 6.558351699999999,
    lng: 3.3914817,
    isOutskirts: false,
  },
  { name: "Maryland", lat: 6.5707, lng: 3.3686, isOutskirts: false },
  { name: "Magodo", lat: 6.6184, lng: 3.376, isOutskirts: false },
  { name: "Ojota", lat: 6.58, lng: 3.384, isOutskirts: false },
  { name: "Oshodi", lat: 6.5546, lng: 3.347, isOutskirts: false },
  { name: "Ilupeju", lat: 6.553, lng: 3.362, isOutskirts: false },
  { name: "Isolo", lat: 6.536, lng: 3.321, isOutskirts: false },
  { name: "Apapa", lat: 6.449, lng: 3.359, isOutskirts: false },
  { name: "Sangotedo", lat: 6.471, lng: 3.636, isOutskirts: true },
  { name: "Ajah", lat: 6.4683134, lng: 3.5655375, isOutskirts: true },
  { name: "Ibeju Lekki", lat: 6.428, lng: 3.85, isOutskirts: true },
  { name: "Free Trade Zone", lat: 6.399, lng: 3.725, isOutskirts: true },
  { name: "Epe", lat: 6.584, lng: 3.983, isOutskirts: true },
  { name: "Ikorodu Town", lat: 6.6194, lng: 3.5105, isOutskirts: true },
  { name: "Ibese", lat: 6.63, lng: 3.5, isOutskirts: true },
  { name: "Ojodu Berger", lat: 6.632, lng: 3.376, isOutskirts: true },
  { name: "Agbado", lat: 6.684, lng: 3.268, isOutskirts: true },
  { name: "Iyana Ipaja", lat: 6.613, lng: 3.292, isOutskirts: true },
  { name: "Alimosho", lat: 6.594, lng: 3.286, isOutskirts: true },
  { name: "Akowonjo", lat: 6.605, lng: 3.3, isOutskirts: true },
  { name: "Dopemu", lat: 6.616, lng: 3.307, isOutskirts: true },
  { name: "Agege", lat: 6.615, lng: 3.321, isOutskirts: true },
  { name: "Igando", lat: 6.551, lng: 3.27, isOutskirts: true },
  { name: "Amuwo Odofin", lat: 6.463, lng: 3.278, isOutskirts: true },
  { name: "Festac Town", lat: 6.4655, lng: 3.286, isOutskirts: true },
  { name: "Ajegunle", lat: 6.457, lng: 3.332, isOutskirts: true },
  { name: "Alaba", lat: 6.453, lng: 3.188, isOutskirts: true },
  { name: "Agbara", lat: 6.499, lng: 3.11, isOutskirts: true },
  { name: "Badagry", lat: 6.431, lng: 2.8876, isOutskirts: true },
];

export const cityAreas: Record<string, CityArea[]> = {
  lagos,
};

export function getAreasForCity(city?: string | null): CityArea[] {
  if (!city) return [];
  return cityAreas[city.trim().toLowerCase()] || [];
}
