import React from "react";
import { FilterConfig, FilterState } from "@/types/filters";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ButtonFilter from "./ButtonFilter";
import ButtonGridFilter from "./ButtonGridFilter";
import CheckboxFilter from "./CheckBoxFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import NewFilterSearch from "./SelectFilter";

interface FilterSectionProps {
  config: FilterConfig;
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  showAccordion?: boolean;
  maxPrice?: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  config,
  filterState,
  onFilterChange,
  isOpen = true,
  onToggle,
  showAccordion = false,
}) => {
  const renderContent = () => {
    switch (config.type) {
      case "range":
        return (
          <PriceRangeFilter
            range={filterState.priceRange}
            onChange={(range) => onFilterChange("priceRange", range)}
            maxPrice={100000}
          />
        );

      case "button":
        return (
          <ButtonFilter
            options={config.options || []}
            selected={getSelectedValues(config.id, filterState)}
            onChange={(values) => onFilterChange(config.id, values)}
          />
        );

      case "button-grid":
        return (
          <ButtonGridFilter
            options={config.options || []}
            selected={getSelectedValues(config.id, filterState)}
            onChange={(values) => onFilterChange(config.id, values)}
            gridCols={config.gridCols || 5}
          />
        );

      case "checkbox":
        return (
          <CheckboxFilter
            options={config.options || []}
            selected={getSelectedValues(config.id, filterState)}
            onChange={(values) => onFilterChange(config.id, values)}
          />
        );

      case "select":
        return (
          <NewFilterSearch
            options={config.options || []}
            selected={getSelectedValues(config.id, filterState)}
            onChange={(values) => onFilterChange(config.id, values)}
            type={config.title}
          />
        );

      default:
        return null;
    }
  };

  if (showAccordion) {
    return (
      <div className="">
        <button
          onClick={onToggle}
          className="w-full flex justify-between items-center p-4 font-semibold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <span className="text-base">{config.title}</span>
          {isOpen ? (
            <FiChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 pb- border-t border-gray-200 pt-4">
            {renderContent()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-4 ">
      <h3 className="font-semibold text-gray-900 mb-4 text-base">
        {config.title}
      </h3>
      {renderContent()}
    </div>
  );
};
const getSelectedValues = (
  filterId: string,
  filterState: FilterState
): string[] => {
  const mapping: Record<string, keyof FilterState> = {
    vehicleType: "selectedVehicleTypes",
    make: "selectedMakes",
    years: "selectedYears",
    seats: "selectedSeats",
    features: "selectedFeatures",
    priceRange: "priceRange",
  };

  const key = mapping[filterId];
  if (!key) return [];

  const value = filterState[key];

  // Handle price range separately since it's a tuple
  if (key === "priceRange") {
    return value as string[];
  }

  // For array-based filters
  return Array.isArray(value) ? (value as any) : [];
};
