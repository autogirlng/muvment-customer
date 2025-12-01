import React, { useState } from "react";
import { PiX } from "react-icons/pi";

interface MobileFilterDrawerProps {
  filterState: {
    priceRange?: [number, number];
    selectedVehicleTypes?: string[];
    selectedMakes?: string[];
    selectedYears?: string[];
    selectedSeats?: string[];
    selectedFeatures?: string[];
  };
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  onClose: () => void;
  vehicleTypes: any[];
  makes: any[];
  features: any[];
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  filterState,
  onFilterChange,
  onClearAll,
  onClose,
  vehicleTypes,
  makes,
  features,
}) => {
  const isPriceActive = filterState.priceRange !== undefined;
  const isTypeActive = filterState.selectedVehicleTypes !== undefined;
  const isMakeActive = filterState.selectedMakes !== undefined;
  const isYearsActive = filterState.selectedYears !== undefined;
  const isSeatsActive = filterState.selectedSeats !== undefined;
  const isFeaturesActive = filterState.selectedFeatures !== undefined;

  const hasActiveFilters =
    isPriceActive ||
    isTypeActive ||
    isMakeActive ||
    isYearsActive ||
    isSeatsActive ||
    isFeaturesActive;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 left-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PiX className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="divide-y divide-gray-200 px-4 pb-4">
          {/* Price Range */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Range
            </h3>
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterState.priceRange?.[0] || ""}
                  onChange={(e) =>
                    onFilterChange("priceRange", [
                      Number(e.target.value),
                      filterState.priceRange?.[1] || 50000,
                    ])
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filterState.priceRange?.[1] || ""}
                  onChange={(e) =>
                    onFilterChange("priceRange", [
                      filterState.priceRange?.[0] || 0,
                      Number(e.target.value),
                    ])
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-500 rounded mt-2"></div>
          </div>

          {/* Vehicle Type */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Vehicle Type
            </h3>
            <div className="space-y-2">
              {vehicleTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="vehicle-type"
                    checked={
                      filterState.selectedVehicleTypes?.includes(type.id) ||
                      false
                    }
                    onChange={() =>
                      onFilterChange(
                        "selectedVehicleTypes",
                        filterState.selectedVehicleTypes?.includes(type.id)
                          ? undefined
                          : [type.id]
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Make */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Vehicle Make
            </h3>
            <select
              value={filterState.selectedMakes?.[0] || ""}
              onChange={(e) =>
                onFilterChange(
                  "selectedMakes",
                  e.target.value ? [e.target.value] : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select vehicle make</option>
              {makes.map((make) => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Year */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Vehicle Year
            </h3>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="2010"
                max="2025"
                value={filterState.selectedYears?.[0] || 2010}
                onChange={(e) =>
                  onFilterChange("selectedYears", [e.target.value])
                }
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-900 min-w-10">
                {filterState.selectedYears?.[0] || 2010}
              </span>
            </div>
          </div>

          {/* Booking Type */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Booking Type
            </h3>
            <div className="space-y-2">
              {[
                { id: "1hour", label: "1 Hour" },
                { id: "3hours", label: "3 Hours" },
                { id: "6hours", label: "6 Hours" },
                { id: "12hours", label: "12 Hours" },
                { id: "airport", label: "Airport Transfers" },
              ].map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input type="radio" name="booking-type" className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Number Of Seats */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Number Of Seats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {filterState.selectedSeats?.map((seat) => (
                <label
                  key={seat}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="seats"
                    checked={filterState.selectedSeats?.includes(seat) || false}
                    onChange={() =>
                      onFilterChange(
                        "selectedSeats",
                        filterState.selectedSeats?.includes(seat)
                          ? undefined
                          : [seat]
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{seat}</span>
                </label>
              )) ||
                ["2+", "3+", "4+", "5+", "6+", "7+"].map((seat) => (
                  <label
                    key={seat}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input type="radio" name="seats" className="w-4 h-4" />
                    <span className="text-sm text-gray-700">{seat}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Vehicle Features */}
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Vehicle Features
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => (
                <label
                  key={feature.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      filterState.selectedFeatures?.includes(feature.id) ||
                      false
                    }
                    onChange={() => {
                      const newFeatures = filterState.selectedFeatures || [];
                      if (newFeatures.includes(feature.id)) {
                        onFilterChange(
                          "selectedFeatures",
                          newFeatures.filter((f) => f !== feature.id)
                        );
                      } else {
                        onFilterChange("selectedFeatures", [
                          ...newFeatures,
                          feature.id,
                        ]);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-700">{feature.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-10">
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll();
              }}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors text-sm ${
              !hasActiveFilters ? "col-span-2" : ""
            }`}
          >
            Show results
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
