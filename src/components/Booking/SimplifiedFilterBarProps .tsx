import React, { useState } from "react";
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
import { BiChevronDown, BiLeftArrow } from "react-icons/bi";
import { BsChevronDown, BsX } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";

interface SimplifiedFilterBarProps {
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  vehicleTypes: any[];
  makes: any[];
  features: any[];
  totalCount: number;
}

export const SimplifiedFilterBar: React.FC<SimplifiedFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearAll,
  vehicleTypes,
  makes,
  features,
  totalCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

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

  const handleClearAll = () => {
    closeAllDropdowns();
    onClearAll();
  };

  const selectedVehicleType = getSelectedVehicleTypeName(
    filterState.selectedVehicleTypes,
    vehicleTypes
  );
  const selectedMake = getSelectedMakeName(filterState.selectedMakes, makes);
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-600 text-white relative"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
        }`}
      >
        <span>{selectedLabel || label}</span>
        {count > 0 && (
          <span
            className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
              isActive ? "bg-white text-gray-600" : "bg-gray-600 text-white"
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
      {/* <div className="px-4 font-bold text-gray-700  text-[1.7rem] ">
        {totalCount}+ vehicles available
      </div> */}
      <div className="hidden md:block space-y-4">
        <div className="flex flex-wrap gap-3 items-center bg-white ">
          <FilterButton
            id="price"
            label="Daily price"
            selectedLabel={
              isPriceActive
                ? `₹${filterState.priceRange?.[0]}-${filterState.priceRange?.[1]}`
                : undefined
            }
            count={isPriceActive ? 1 : 0}
            isActive={isPriceActive}
          >
            {openDropdown === "price" && (
              <PriceRangeFilter
                range={filterState.priceRange || [0, 100000]}
                onChange={(range) => onFilterChange("priceRange", range)}
                onClear={() => onFilterChange("priceRange", undefined)}
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
          features={features}
          totalCount={totalCount}
        />
      )}
    </>
  );
};

// Mobile Filter Drawer Component - UPDATED DESIGN
const MobileFilterDrawer: React.FC<
  SimplifiedFilterBarProps & { onClose: () => void }
> = ({
  filterState,
  onFilterChange,
  onClearAll,
  onClose,
  vehicleTypes,
  makes,
  features,
  totalCount,
}) => {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

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
      <div className="absolute inset-0 " onClick={onClose} />
      <div className="absolute top-0 right-0 left-0 bg-white rounded-t-2xl max-h-[100vh] overflow-y-auto animate-in slide-in-from-bottom">
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

        {/* Filter Content - ALL FILTERS VISIBLE AT ONCE */}
        <div className="p-4 space-y-6 max-h-[100vh] overflow-y-auto">
          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
            <PriceRangeFilter
              range={filterState.priceRange || [0, 100000]}
              onChange={(range) => onFilterChange("priceRange", range)}
              onClear={() => onFilterChange("priceRange", undefined)}
              compact={true}
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Vehicle Type
            </h3>
            <VehicleTypeFilter
              value={filterState.selectedVehicleTypes}
              onChange={(value) =>
                onFilterChange("selectedVehicleTypes", value)
              }
              vehicleTypes={vehicleTypes}
              onClose={onClose}
              compact={true}
            />
          </div>

          {/* Make */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Make</h3>
            <MakeFilter
              value={filterState.selectedMakes}
              onChange={(value) => onFilterChange("selectedMakes", value)}
              makes={makes}
              onClose={onClose}
              compact={true}
            />
          </div>

          {/* Years */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Years</h3>
            <YearsFilter
              value={filterState.selectedYears}
              onChange={(value) => onFilterChange("selectedYears", value)}
              onClose={onClose}
              compact={true}
            />
          </div>

          {/* Seats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Seats</h3>
            <SeatsFilter
              value={filterState.selectedSeats}
              onChange={(value) => onFilterChange("selectedSeats", value)}
              onClose={onClose}
              compact={true}
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Features</h3>
            <FeaturesFilter
              value={filterState.selectedFeatures}
              onChange={(value) => onFilterChange("selectedFeatures", value)}
              features={features}
              onClose={onClose}
              compact={true}
            />
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};
