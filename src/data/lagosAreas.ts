export interface CityArea {
  name: string;
  lat: number;
  lng: number;
  isOutskirts: boolean;
}

const lagos: CityArea[] = [
  { name: "Lekki", lat: 6.4641, lng: 3.5615, isOutskirts: false },
  { name: "Lekki Phase 1", lat: 6.445, lng: 3.476, isOutskirts: false },
  { name: "Victoria Island", lat: 6.4281, lng: 3.4219, isOutskirts: false },
  { name: "Ikoyi", lat: 6.4541, lng: 3.4346, isOutskirts: false },
  { name: "Ikeja", lat: 6.6018, lng: 3.3515, isOutskirts: false },
  { name: "Ikeja GRA", lat: 6.579, lng: 3.359, isOutskirts: false },
  { name: "Surulere", lat: 6.4889, lng: 3.3548, isOutskirts: false },
  { name: "Yaba", lat: 6.5095, lng: 3.3711, isOutskirts: false },
  { name: "Gbagada", lat: 6.5483, lng: 3.3897, isOutskirts: false },
  { name: "Maryland", lat: 6.5707, lng: 3.3686, isOutskirts: false },
  { name: "Magodo", lat: 6.6184, lng: 3.376, isOutskirts: false },
  { name: "Ojota", lat: 6.58, lng: 3.384, isOutskirts: false },
  { name: "Oshodi", lat: 6.5546, lng: 3.347, isOutskirts: false },
  { name: "Ilupeju", lat: 6.553, lng: 3.362, isOutskirts: false },
  { name: "Isolo", lat: 6.536, lng: 3.321, isOutskirts: false },
  { name: "Apapa", lat: 6.449, lng: 3.359, isOutskirts: false },
  { name: "Sangotedo", lat: 6.471, lng: 3.636, isOutskirts: true },
  { name: "Ajah", lat: 6.4674, lng: 3.6018, isOutskirts: true },
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
