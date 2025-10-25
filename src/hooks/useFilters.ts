import { useState, useCallback } from "react";
import { FilterState } from "@/types/filters";

export const useFilters = (initialState: FilterState) => {
  const [filterState, setFilterState] = useState<FilterState>(initialState);

  const updateFilter = useCallback((filterId: string, value: any) => {
    setFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setFilterState({
      priceRange: [0, 100000],
      selectedVehicleTypes: [],
      selectedMakes: [],
      selectedYears: [],
      selectedSeats: [],
      selectedFeatures: [],
    });
  }, []);

  const toggleSelection = useCallback((filterId: string, value: string) => {
    setFilterState((prev) => {
      const currentValues = prev[filterId as keyof FilterState] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterId]: newValues,
      };
    });
  }, []);

  return {
    filterState,
    updateFilter,
    clearAll,
    toggleSelection,
  };
};
