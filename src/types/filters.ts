export interface FilterOption {
  id: string;
  name: string;
  label?: string;
}

export interface FilterConfig {
  id: string;
  title: string;
  type: "checkbox" | "button" | "range" | "button-grid" | "select";
  options?: FilterOption[];
  gridCols?: number;
}

import type { VehicleSearchOrderBy } from "@/constants/vehicleSearchOrder";

export interface FilterState {
  orderBy?: VehicleSearchOrderBy;
  priceRange?: [number, number];
  selectedVehicleTypes?: string[];
  selectedModels?: string[];
  selectedMakes?: string[];
  selectedYears?: string[];
  selectedSeats?: string[];
  selectedFeatures?: string[];
}
