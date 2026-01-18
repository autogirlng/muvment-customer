import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { FilterState } from "@/types/filters";
import PriceRangeFilter from "../NewFilterComponent/PriceRangeFilter";
import VehicleTypeFilter from "../NewFilterComponent/VehicleTypeFilter";
import MakeFilter from "../NewFilterComponent/MakeFilter";
import YearsFilter from "../NewFilterComponent/YearsFilter";
import SeatsFilter from "../NewFilterComponent/SeatFilter";
import FeaturesFilter from "../NewFilterComponent/FeaturesFilter";

import {
  getSelectedFeatureName,
  getSelectedMakeName,
  getSelectedSeatName,
  getSelectedVehicleTypeName,
  getSelectedYearName,
} from "@/helpers/explorPageHelpers";
import { CiSettings } from "react-icons/ci";
import { BiChevronDown } from "react-icons/bi";
import { MdChevronLeft } from "react-icons/md";
import { getSelectedModelName } from "@/services/vechilePriceUtiles";
import ModelFilter from "./ModelFilter";

interface SimplifiedFilterBarProps {
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  vehicleTypes: any[];
  makes: any[];
  models: any[];
  features: any[];
  totalCount: number;
}

export const SimplifiedFilterBar: React.FC<SimplifiedFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearAll,
  vehicleTypes,
  makes,
  models,
  features,
  totalCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeAllDropdowns();
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const isPriceActive = filterState.priceRange !== undefined;
  const isTypeActive = filterState.selectedVehicleTypes !== undefined;
  const isMakeActive = filterState.selectedMakes !== undefined;
  const isModelActive = filterState.selectedModels !== undefined;
  const isYearsActive = filterState.selectedYears !== undefined;
  const isSeatsActive = filterState.selectedSeats !== undefined;
  const isFeaturesActive = filterState.selectedFeatures !== undefined;

  const hasActiveFilters =
    isPriceActive ||
    isTypeActive ||
    isMakeActive ||
    isModelActive ||
    isYearsActive ||
    isSeatsActive ||
    isFeaturesActive;

  const handleClearAll = () => {
    closeAllDropdowns();
    onClearAll();
  };

  const selectedVehicleType = getSelectedVehicleTypeName(
    filterState.selectedVehicleTypes,
    vehicleTypes
  );
  const selectedMake = getSelectedMakeName(filterState.selectedMakes, makes);
  const selectedModel = getSelectedModelName(
    filterState.selectedModels,
    models
  );
  const selectedYear = getSelectedYearName(filterState.selectedYears);
  const selectedSeat = getSelectedSeatName(filterState.selectedSeats);
  const selectedFeature = getSelectedFeatureName(
    filterState.selectedFeatures,
    features
  );

  const FilterButton = ({
    id,
    label,
    selectedLabel,
    count,
    isActive,
    children,
  }: {
    id: string;
    label: string;
    selectedLabel?: string;
    count: number;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isActive
          ? "bg-gray-600 text-white relative"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
          }`}
      >
        <span>{selectedLabel || label}</span>
        {count > 0 && (
          <span
            className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${isActive ? "bg-white text-gray-600" : "bg-gray-600 text-white"
              }`}
          >
            {count}
          </span>
        )}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {children}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet View */}
      <div className="hidden md:block space-y-4" ref={dropdownRef}>
        <div className="flex flex-wrap gap-3 items-center bg-white ">
          <FilterButton
            id="price"
            label="Daily price"
            selectedLabel={
              isPriceActive
                ? `₦${filterState.priceRange?.[0]}-${filterState.priceRange?.[1]}`
                : undefined
            }
            count={isPriceActive ? 1 : 0}
            isActive={isPriceActive}
          >
            {openDropdown === "price" && (
              <PriceRangeFilter
                range={filterState.priceRange || [0, 100000]}
                onChange={(range) => onFilterChange("priceRange", range)}
                onClear={() => {
                  onFilterChange("priceRange", undefined);
                  closeAllDropdowns();
                }}
              />
            )}
          </FilterButton>

          <FilterButton
            id="type"
            label="Vehicle type"
            selectedLabel={selectedVehicleType}
            count={isTypeActive ? 1 : 0}
            isActive={isTypeActive}
          >
            {openDropdown === "type" && (
              <VehicleTypeFilter
                value={filterState.selectedVehicleTypes}
                onChange={(value) =>
                  onFilterChange("selectedVehicleTypes", value)
                }
                vehicleTypes={vehicleTypes}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          <FilterButton
            id="make"
            label="Make"
            selectedLabel={selectedMake}
            count={isMakeActive ? 1 : 0}
            isActive={isMakeActive}
          >
            {openDropdown === "make" && (
              <MakeFilter
                value={filterState.selectedMakes}
                onChange={(value) => onFilterChange("selectedMakes", value)}
                makes={makes}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          <FilterButton
            id="model"
            label="Model"
            selectedLabel={selectedModel}
            count={isModelActive ? 1 : 0}
            isActive={isModelActive}
          >
            {openDropdown === "model" && (
              <ModelFilter
                value={filterState.selectedModels}
                onChange={(value: any) =>
                  onFilterChange("selectedModels", value)
                }
                models={models}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          <FilterButton
            id="years"
            label="Years"
            selectedLabel={selectedYear}
            count={isYearsActive ? 1 : 0}
            isActive={isYearsActive}
          >
            {openDropdown === "years" && (
              <YearsFilter
                value={filterState.selectedYears}
                onChange={(value) => onFilterChange("selectedYears", value)}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          <FilterButton
            id="seats"
            label="Seats"
            selectedLabel={selectedSeat}
            count={isSeatsActive ? 1 : 0}
            isActive={isSeatsActive}
          >
            {openDropdown === "seats" && (
              <SeatsFilter
                value={filterState.selectedSeats}
                onChange={(value) => onFilterChange("selectedSeats", value)}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          <FilterButton
            id="features"
            label="Features"
            selectedLabel={selectedFeature}
            count={isFeaturesActive ? 1 : 0}
            isActive={isFeaturesActive}
          >
            {openDropdown === "features" && (
              <FeaturesFilter
                value={filterState.selectedFeatures}
                onChange={(value) => onFilterChange("selectedFeatures", value)}
                features={features}
                onClose={closeAllDropdowns}
              />
            )}
          </FilterButton>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ml-auto"
            >
              <span>✕</span>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden ">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium"
        >
          <div className="flex items-center gap-2">
            <CiSettings className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {
                  [
                    isPriceActive,
                    isTypeActive,
                    isMakeActive,
                    isModelActive,
                    isYearsActive,
                    isSeatsActive,
                    isFeaturesActive,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </div>
          <BiChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <MobileFilterDrawer
          filterState={filterState}
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
          onClose={() => setIsMobileFilterOpen(false)}
          vehicleTypes={vehicleTypes}
          makes={makes}
          models={models}
          features={features}
          totalCount={totalCount}
        />
      )}
    </>
  );
};

// Mobile Filter Drawer Component
const MobileFilterDrawer: React.FC<
  SimplifiedFilterBarProps & { onClose: () => void }
> = ({
  filterState,
  onFilterChange,
  onClearAll,
  onClose,
  vehicleTypes,
  makes,
  models,
  features,
  totalCount,
}) => {
    // Local state to track temporary filter changes before applying
    const [tempFilterState, setTempFilterState] =
      useState<FilterState>(filterState);

    const isPriceActive = tempFilterState.priceRange !== undefined;
    const isTypeActive = tempFilterState.selectedVehicleTypes !== undefined;
    const isMakeActive = tempFilterState.selectedMakes !== undefined;
    const isModelActive = tempFilterState.selectedModels !== undefined;
    const isYearsActive = tempFilterState.selectedYears !== undefined;
    const isSeatsActive = tempFilterState.selectedSeats !== undefined;
    const isFeaturesActive = tempFilterState.selectedFeatures !== undefined;

    const hasActiveFilters =
      isPriceActive ||
      isTypeActive ||
      isMakeActive ||
      isModelActive ||
      isYearsActive ||
      isSeatsActive ||
      isFeaturesActive;

    // Handle temporary filter changes
    const handleTempFilterChange = (filterId: string, value: any) => {
      setTempFilterState((prev) => ({
        ...prev,
        [filterId]: value,
      }));
    };

    // Apply filters and close drawer
    const handleApplyFilters = () => {
      // Apply all temp filters to actual filter state
      Object.keys(tempFilterState).forEach((key) => {
        onFilterChange(key, tempFilterState[key as keyof FilterState]);
      });
      onClose();
    };

    // Clear individual filter
    const handleClearFilter = (filterId: string) => {
      handleTempFilterChange(filterId, undefined);
    };

    // Clear all and reset
    const handleClearAll = () => {
      const emptyState: FilterState = {
        priceRange: undefined,
        selectedVehicleTypes: undefined,
        selectedMakes: undefined,
        selectedModels: undefined,
        selectedYears: undefined,
        selectedSeats: undefined,
        selectedFeatures: undefined,
      };
      setTempFilterState(emptyState);
      onClearAll();
    };

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="absolute top-0 right-0 left-0 bg-white rounded-t-2xl max-h-[100vh] flex flex-col animate-in slide-in-from-bottom">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <MdChevronLeft className="w-6 h-6" /> hide filters
            </button>
          </div>

          {/* Filter Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Price Range
                </h3>
                {isPriceActive && (
                  <button
                    onClick={() => handleClearFilter("priceRange")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <PriceRangeFilter
                range={tempFilterState.priceRange || [0, 100000]}
                onChange={(range) => handleTempFilterChange("priceRange", range)}
                onClear={() => handleClearFilter("priceRange")}
                compact={true}
              />
            </div>

            {/* Vehicle Type */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Vehicle Type
                </h3>
                {isTypeActive && (
                  <button
                    onClick={() => handleClearFilter("selectedVehicleTypes")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <VehicleTypeFilter
                value={tempFilterState.selectedVehicleTypes}
                onChange={(value) =>
                  handleTempFilterChange("selectedVehicleTypes", value)
                }
                vehicleTypes={vehicleTypes}
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Make */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Make</h3>
                {isMakeActive && (
                  <button
                    onClick={() => handleClearFilter("selectedMakes")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <MakeFilter
                value={tempFilterState.selectedMakes}
                onChange={(value) =>
                  handleTempFilterChange("selectedMakes", value)
                }
                makes={makes}
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Model */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Model</h3>
                {isModelActive && (
                  <button
                    onClick={() => handleClearFilter("selectedModels")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ModelFilter
                value={tempFilterState.selectedModels}
                onChange={(value) =>
                  handleTempFilterChange("selectedModels", value)
                }
                models={models}
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Years */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Years</h3>
                {isYearsActive && (
                  <button
                    onClick={() => handleClearFilter("selectedYears")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <YearsFilter
                value={tempFilterState.selectedYears}
                onChange={(value) =>
                  handleTempFilterChange("selectedYears", value)
                }
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Seats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Seats</h3>
                {isSeatsActive && (
                  <button
                    onClick={() => handleClearFilter("selectedSeats")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <SeatsFilter
                value={tempFilterState.selectedSeats}
                onChange={(value) =>
                  handleTempFilterChange("selectedSeats", value)
                }
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Features</h3>
                {isFeaturesActive && (
                  <button
                    onClick={() => handleClearFilter("selectedFeatures")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <FeaturesFilter
                value={tempFilterState.selectedFeatures}
                onChange={(value) =>
                  handleTempFilterChange("selectedFeatures", value)
                }
                features={features}
                onClose={onClose}
                compact={true}
              />
            </div>

            {/* Add spacing for footer */}
            <div className="h-24" />
          </div>

          {/* Footer - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="w-full py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={handleApplyFilters}
              className="w-full py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    );
  };
