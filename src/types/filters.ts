export interface FilterOption {
  id: string;
  name: string;
  label?: string;
}

export interface FilterConfig {
  id: string;
  title: string;
  type: "checkbox" | "button" | "range" | "button-grid";
  options?: FilterOption[];
  gridCols?: number;
}

export interface FilterState {
  priceRange: [number, number];
  selectedVehicleTypes: string[];
  selectedMakes: string[];
  selectedYears: string[];
  selectedSeats: string[];
  selectedFeatures: string[];
}
