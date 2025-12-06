import { BookingService } from "@/controllers/booking/bookingService";
import { PlacePrediction } from "@/types/BookingSearch";
import { DropdownOption } from "@/types/HeroSectionTypes";

// export const bookingOptionsData: DropdownOption[] = [
//   { value: "AN_HOUR", label: "1 Hour" },
//   { value: "THREE_HOURS", label: "3 Hours" },
//   { value: "SIX_HOURS", label: "6 Hours" },
//   { value: "TWELVE_HOURS", label: "12 Hours" },
//   { value: "TWENTY_FOUR_HOURS", label: "24 Hours" },
//   { value: "AIRPORT_PICKUP", label: "Airport Transfers" },
// ];

export const getBookingOption = async (): Promise<{
  rawBookingOptions: any[];
  dropdownOptions: DropdownOption[];
}> => {
  const response = await BookingService.getBookingType();
  const rawBookingOptions = response?.data || [];

  const dropdownOptions: DropdownOption[] = rawBookingOptions.map(
    (item: { id: string; name: string }) => ({
      value: item.id,
      label: item.name,
    })
  );

  return {
    rawBookingOptions,
    dropdownOptions,
  };
};
export const DEFAULT_LOCATION_SUGGESTIONS: PlacePrediction[] = [
  {
    id: "anywhere",
    place_id: "anywhere",
    name: "Anywhere",
    description: "Search everywhere",
    type: "popular",
    icon: "location",
  },
  {
    id: "recent-1",
    place_id: "recent-1",
    name: "Yaba, Mainland, Lagos",
    description: "Recent search",
    type: "recent",
    icon: "clock",
  },
  {
    id: "recent-2",
    place_id: "recent-2",
    name: "Victoria Island, Island, Lagos",
    description: "Recent search",
    type: "recent",
    icon: "clock",
  },
  {
    id: "popular-1",
    place_id: "popular-1",
    name: "Ugbowo, Benin City, Edo State",
    description: "Popular location",
    type: "popular",
    icon: "home",
  },
];

export const GOOGLE_MAPS_DEBOUNCE_DELAY = 300;
export const MAX_GOOGLE_PLACES_RESULTS = 5;
export const GOOGLE_PLACES_COUNTRY_RESTRICTION = "ng";
