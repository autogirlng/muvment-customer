import React from "react";
import {
  DEFAULT_VEHICLE_ORDER_BY,
  VEHICLE_ORDER_BY_LABELS,
  VehicleSearchOrderBy,
} from "@/constants/vehicleSearchOrder";

interface PriceSortFilterProps {
  value?: VehicleSearchOrderBy;
  onChange: (value: VehicleSearchOrderBy) => void;
  onClose: () => void;
  compact?: boolean;
}

const SORT_OPTIONS: VehicleSearchOrderBy[] = ["LOW_HIGH", "HIGH_LOW"];

const PriceSortFilter: React.FC<PriceSortFilterProps> = ({
  value = DEFAULT_VEHICLE_ORDER_BY,
  onChange,
  onClose,
  compact = false,
}) => {
  const handleSelect = (orderBy: VehicleSearchOrderBy) => {
    onChange(orderBy);
    if (!compact) onClose();
  };

  const options = (
    <div className="flex flex-col gap-2">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleSelect(option)}
          className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            value === option
              ? "bg-blue-50 border-blue-500 text-gray-900"
              : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          {VEHICLE_ORDER_BY_LABELS[option]}
        </button>
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="w-full space-y-3">
        <p className="text-xs text-gray-500">Order by price</p>
        {options}
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order by price</h3>
      {options}
    </div>
  );
};

export default PriceSortFilter;
