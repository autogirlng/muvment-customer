import React from "react";
import { FilterConfig, FilterState } from "@/types/filters";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ButtonFilter from "./ButtonFilter";
import ButtonGridFilter from "./ButtonGridFilter";
import CheckboxFilter from "./CheckBoxFilter";
import PriceRangeFilter from "./PriceRangeFilter";

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

      default:
        return null;
    }
  };

  if (showAccordion) {
    return (
      <div className="border rounded-lg">
        <button
          onClick={onToggle}
          className="w-full flex justify-between items-center p-3 font-semibold text-gray-900"
        >
          {config.title}
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isOpen && <div className="px-4 pb-4">{renderContent()}</div>}
      </div>
    );
  }

  return (
    <div className="pb-6 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">{config.title}</h3>
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
  };

  const key = mapping[filterId];
  return key ? (filterState[key] as string[]) : [];
};
