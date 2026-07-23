// The airports Muvment serves. A fixed list rather than a Google lookup, so a
// selection can never be an airport we do not cover. Shared by the search form
// and the booking details page so both offer exactly the same set.
export type SupportedAirport = {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  keywords: string;
};

export const SUPPORTED_AIRPORTS: SupportedAirport[] = [
  // Lagos: one international terminal and two domestic terminals (GAT and MMA2)
  { code: "LOS-INT", name: "Lagos International (MMIA, Murtala Muhammed)", city: "Lagos", lat: 6.5774, lng: 3.3212, keywords: "los mmia mma1 mm1 murtala muhammed ikeja terminal 1 terminal 2 international" },
  { code: "LOS-MMA2", name: "Lagos Domestic (MMA2)", city: "Lagos", lat: 6.5839, lng: 3.3214, keywords: "los mma2 mm2 bi-courtney murtala muhammed ikeja domestic local terminal 2 ibom dana valuejet air peace" },
  { code: "LOS-GAT", name: "Lagos Domestic (GAT)", city: "Lagos", lat: 6.5836, lng: 3.3210, keywords: "los gat general aviation terminal murtala muhammed ikeja domestic local air peace arik" },
  // Abuja: separate international and domestic terminals
  { code: "ABV-INT", name: "Abuja International (Nnamdi Azikiwe)", city: "Abuja", lat: 9.0067, lng: 7.2631, keywords: "abv nnamdi azikiwe naia international" },
  { code: "ABV-DOM", name: "Abuja Domestic (Nnamdi Azikiwe)", city: "Abuja", lat: 9.0067, lng: 7.2631, keywords: "abv nnamdi azikiwe naia domestic local" },
  // Port Harcourt (Omagwa): international and domestic
  { code: "PHC-INT", name: "Port Harcourt International (Omagwa)", city: "Port Harcourt", lat: 5.0153, lng: 6.9500, keywords: "phc phia omagwa rivers international" },
  { code: "PHC-DOM", name: "Port Harcourt Domestic (Omagwa)", city: "Port Harcourt", lat: 5.0153, lng: 6.9500, keywords: "phc phia omagwa rivers domestic local" },
  // Enugu (Akanu Ibiam): international and domestic
  { code: "ENU-INT", name: "Enugu International (Akanu Ibiam)", city: "Enugu", lat: 6.4739, lng: 7.5611, keywords: "enu akanu ibiam emene international" },
  { code: "ENU-DOM", name: "Enugu Domestic (Akanu Ibiam)", city: "Enugu", lat: 6.4739, lng: 7.5611, keywords: "enu akanu ibiam emene domestic local" },
  // Benin City: single airport, mostly domestic
  { code: "BNI", name: "Benin Airport", city: "Benin City", lat: 6.3169, lng: 5.5995, keywords: "bni benin city ogba domestic local" },
  // Accra (Kotoka): Terminal 3 international, Terminal 2 domestic
  { code: "ACC-T3", name: "Accra International (Kotoka, Terminal 3)", city: "Accra", lat: 5.6061, lng: -0.1682, keywords: "acc kotoka kia ghana terminal 3 t3 international" },
  { code: "ACC-T2", name: "Accra Domestic (Kotoka, Terminal 2)", city: "Accra", lat: 5.6061, lng: -0.1682, keywords: "acc kotoka kia ghana terminal 2 t2 domestic local" },
];
