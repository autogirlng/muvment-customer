import { FilterConfig } from "@/types/filters";
import { seatOptions, years } from "@/types/BookingSearch";

export const createFilterConfig = (
  vehicleTypes: any[],
  makes: any[],
  features: any[]
): FilterConfig[] => [
  {
    id: "price",
    title: "Price Range",
    type: "range",
  },
  {
    id: "vehicleType",
    title: "Vehicle Type",
    type: "button",
    options: vehicleTypes,
  },
  {
    id: "make",
    title: " Vehicle Make",
    type: "select",
    options: makes,
  },
  {
    id: "years",
    title: "Years",
    type: "select",
    options: years.map((year) => ({ id: year, name: year })),
  },
  {
    id: "seats",
    title: "Seats",
    type: "button",
    options: seatOptions.map((seat) => ({ id: seat, name: seat })),
  },
  {
    id: "features",
    title: "Vehicle Features",
    type: "button",
    options: features,
  },
];
