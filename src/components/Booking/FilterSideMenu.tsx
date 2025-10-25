import { seatOptions, years } from "@/types/BookingSearch";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

interface FilterOption {
  id: string;
  name: string;
  label?: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;

  // Price Range
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice?: number;

  // Vehicle Type
  vehicleTypes: FilterOption[];
  selectedVehicleTypes: string[];
  onVehicleTypeChange: (types: string[]) => void;

  // Make
  makes: FilterOption[];
  selectedMakes: string[];
  onMakeChange: (makes: string[]) => void;

  // Years
  selectedYears: string[];
  onYearChange: (years: string[]) => void;

  // Seats
  selectedSeats: string[];
  onSeatChange: (seats: string[]) => void;

  // Features
  features: FilterOption[];
  selectedFeatures: string[];
  onFeatureChange: (features: string[]) => void;

  // Actions
  onClearAll: () => void;
  onApply: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  priceRange,
  onPriceChange,
  maxPrice = 100000,
  vehicleTypes,
  selectedVehicleTypes,
  onVehicleTypeChange,
  makes,
  selectedMakes,
  onMakeChange,
  selectedYears,
  onYearChange,
  selectedSeats,
  onSeatChange,
  features,
  selectedFeatures,
  onFeatureChange,
  onClearAll,
  onApply,
}) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  // Update live visuals while dragging
  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...localPriceRange] as [number, number];
    newRange[index] = value;

    if (index === 0 && value > newRange[1]) newRange[1] = value;
    if (index === 1 && value < newRange[0]) newRange[0] = value;

    setLocalPriceRange(newRange);
  };

  // Fire search/filter only when drag ends
  const handlePriceCommit = () => {
    onPriceChange(localPriceRange);
  };

  const toggleSelection = (
    value: string,
    selectedValues: string[],
    onChange: (values: string[]) => void
  ) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-80 lg:w-full border-r border-gray-200`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearAll}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 border border-gray-300 px-3 py-1 rounded-lg"
              >
                <FiX className="w-4 h-4" />
                Clear all
              </button>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(localPriceRange[0])}/day
                  </span>
                  <span className="text-gray-600">
                    {formatCurrency(localPriceRange[1])}/day
                  </span>
                </div>

                {/* Range Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="1000"
                    value={localPriceRange[0]}
                    onChange={(e) =>
                      handlePriceChange(0, Number(e.target.value))
                    }
                    onMouseUp={handlePriceCommit}
                    onTouchEnd={handlePriceCommit}
                    className="absolute w-full h-2 bg-transparent appearance-none z-20"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="1000"
                    value={localPriceRange[1]}
                    onChange={(e) =>
                      handlePriceChange(1, Number(e.target.value))
                    }
                    onMouseUp={handlePriceCommit}
                    onTouchEnd={handlePriceCommit}
                    className="absolute w-full h-2 bg-transparent appearance-none z-20"
                  />
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-2 bg-blue-600 rounded-full"
                      style={{
                        left: `${(localPriceRange[0] / maxPrice) * 100}%`,
                        right: `${
                          100 - (localPriceRange[1] / maxPrice) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Vehicle type</h3>
              <div className="flex flex-wrap gap-2">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      toggleSelection(
                        type.id,
                        selectedVehicleTypes,
                        onVehicleTypeChange
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedVehicleTypes.includes(type.id)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {(type?.name || "").replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Make */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Make</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {makes?.map((make) => (
                  <label
                    key={make.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMakes.includes(make.id)}
                      onChange={() =>
                        toggleSelection(make.id, selectedMakes, onMakeChange)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{make.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Years */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Years</h3>
              <div className="grid grid-cols-5 gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() =>
                      toggleSelection(year, selectedYears, onYearChange)
                    }
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedYears.includes(year)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Seats */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Seats</h3>
              <div className="flex flex-wrap gap-2">
                {seatOptions.map((seat) => (
                  <button
                    key={seat}
                    onClick={() =>
                      toggleSelection(seat, selectedSeats, onSeatChange)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSeats.includes(seat)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="pb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {features.map((feature) => (
                  <label
                    key={feature.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() =>
                        toggleSelection(
                          feature.id,
                          selectedFeatures,
                          onFeatureChange
                        )
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {feature.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Button (Mobile) */}
          <div className="lg:hidden mt-6">
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
