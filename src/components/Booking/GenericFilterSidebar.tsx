import React, { useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
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

interface GenericFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  onApply: () => void;
  mode: "desktop" | "mobile";
  isLoading?: boolean;
  vehicleTypes?: any[];
  makes?: any[];
  features?: any[];
}

export const GenericFilterSidebar: React.FC<GenericFilterSidebarProps> = ({
  isOpen,
  onClose,
  filterState,
  onFilterChange,
  onClearAll,
  onApply,
  mode,
  isLoading = false,
  vehicleTypes = [],
  makes = [],
  features = [],
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["price", "type", "make", "years", "seats", "features"])
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleApply = () => {
    onApply();
    if (mode === "mobile") {
      onClose();
    }
  };

  // Check active filters
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

  // Get selected names
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

  const FilterSection = ({
    id,
    title,
    isActive,
    activeCount,
    children,
  }: {
    id: string;
    title: string;
    isActive: boolean;
    activeCount: number;
    children: React.ReactNode;
  }) => (
    <div>
      <button
        onClick={() => toggleSection(id)}
        className={`w-full flex justify-between items-center p-4 font-semibold rounded-xl transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-900 hover:bg-blue-100"
            : "text-gray-900 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{title}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {expandedSections.has(id) ? (
          <FiChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections.has(id) && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          {children}
        </div>
      )}
    </div>
  );

  const getVehicleTypeName = (id: string) => {
    return vehicleTypes?.find((v: any) => v.id === id)?.name || id;
  };

  const getMakeName = (id: string) => {
    return makes?.find((m: any) => m.id === id)?.name || id;
  };

  const getFeatureName = (id: string) => {
    return features?.find((f: any) => f.id === id)?.name || id;
  };

  const renderActiveFilters = () => (
    <>
      {isPriceActive && filterState.priceRange && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          <span>
            ₦{filterState.priceRange[0].toLocaleString()} - ₦
            {filterState.priceRange[1].toLocaleString()}
          </span>
          <button
            onClick={() => onFilterChange("priceRange", undefined)}
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      {filterState.selectedVehicleTypes?.map((typeId) => (
        <div
          key={typeId}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
        >
          <span>{getVehicleTypeName(typeId)}</span>
          <button
            onClick={() =>
              onFilterChange(
                "selectedVehicleTypes",
                filterState.selectedVehicleTypes?.filter((v) => v !== typeId)
              )
            }
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ))}

      {filterState.selectedMakes?.map((makeId) => (
        <div
          key={makeId}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
        >
          <span>{getMakeName(makeId)}</span>
          <button
            onClick={() =>
              onFilterChange(
                "selectedMakes",
                filterState.selectedMakes?.filter((v) => v !== makeId)
              )
            }
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ))}

      {filterState.selectedYears?.map((year) => (
        <div
          key={year}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
        >
          <span>{year}</span>
          <button
            onClick={() =>
              onFilterChange(
                "selectedYears",
                filterState.selectedYears?.filter((v) => v !== year)
              )
            }
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ))}

      {filterState.selectedSeats?.map((seat) => (
        <div
          key={seat}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
        >
          <span>{seat} seats</span>
          <button
            onClick={() =>
              onFilterChange(
                "selectedSeats",
                filterState.selectedSeats?.filter((v) => v !== seat)
              )
            }
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ))}

      {filterState.selectedFeatures?.map((featureId) => (
        <div
          key={featureId}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
        >
          <span>{getFeatureName(featureId)}</span>
          <button
            onClick={() =>
              onFilterChange(
                "selectedFeatures",
                filterState.selectedFeatures?.filter((v) => v !== featureId)
              )
            }
            className="hover:bg-blue-200 rounded p-0.5"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ))}
    </>
  );

  if (mode === "desktop") {
    return (
      <div className="w-76 bg-gray-50 p-4 h-fit sticky top-24">
        {/* Header */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            Hide
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-2">{renderActiveFilters()}</div>
          </div>
        )}

        {/* Filter Sections */}
        <div className="space-y-6">
          <FilterSection
            id="price"
            title="Price"
            isActive={isPriceActive}
            activeCount={isPriceActive ? 1 : 0}
          >
            <PriceRangeFilter
              range={filterState.priceRange || [0, 100000]}
              onChange={(range) => onFilterChange("priceRange", range)}
              onClear={() => onFilterChange("priceRange", undefined)}
            />
          </FilterSection>

          <FilterSection
            id="type"
            title="Vehicle Type"
            isActive={isTypeActive}
            activeCount={filterState.selectedVehicleTypes?.length as number}
          >
            <VehicleTypeFilter
              value={filterState.selectedVehicleTypes}
              onChange={(value) =>
                onFilterChange("selectedVehicleTypes", value)
              }
              vehicleTypes={vehicleTypes}
              onClose={closeAllDropdowns}
            />
          </FilterSection>

          <FilterSection
            id="make"
            title="Make"
            isActive={isMakeActive}
            activeCount={filterState.selectedMakes?.length as number}
          >
            <MakeFilter
              value={filterState.selectedMakes}
              onChange={(value) => onFilterChange("selectedMakes", value)}
              makes={makes}
              onClose={closeAllDropdowns}
            />
          </FilterSection>

          <FilterSection
            id="years"
            title="Years"
            isActive={isYearsActive}
            activeCount={filterState.selectedYears?.length as number}
          >
            <YearsFilter
              value={filterState.selectedYears}
              onChange={(value) => onFilterChange("selectedYears", value)}
              onClose={closeAllDropdowns}
            />
          </FilterSection>

          <FilterSection
            id="seats"
            title="Seats"
            isActive={isSeatsActive}
            activeCount={filterState.selectedSeats?.length as number}
          >
            <SeatsFilter
              value={filterState.selectedSeats}
              onChange={(value) => onFilterChange("selectedSeats", value)}
              onClose={closeAllDropdowns}
            />
          </FilterSection>

          <FilterSection
            id="features"
            title="Features"
            isActive={isFeaturesActive}
            activeCount={filterState.selectedFeatures?.length as number}
          >
            <FeaturesFilter
              value={filterState.selectedFeatures}
              onChange={(value) => onFilterChange("selectedFeatures", value)}
              features={features}
              onClose={closeAllDropdowns}
            />
          </FilterSection>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            "Apply Filters"
          )}
        </button>
      </div>
    );
  }

  // Mobile mode
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClearAll}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
          >
            Clear all
          </button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-2">{renderActiveFilters()}</div>
          </div>
        )}

        {/* Filter Content */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto px-4 py-2">
          <div className="space-y-4 pb-4">
            <FilterSection
              id="price"
              title="Price"
              isActive={isPriceActive}
              activeCount={isPriceActive ? 1 : 0}
            >
              <PriceRangeFilter
                range={filterState.priceRange || [0, 100000]}
                onChange={(range) => onFilterChange("priceRange", range)}
                onClear={() => onFilterChange("priceRange", undefined)}
              />
            </FilterSection>

            <FilterSection
              id="type"
              title="Vehicle Type"
              isActive={isTypeActive}
              activeCount={filterState.selectedVehicleTypes?.length as number}
            >
              <VehicleTypeFilter
                value={filterState.selectedVehicleTypes}
                onChange={(value) =>
                  onFilterChange("selectedVehicleTypes", value)
                }
                vehicleTypes={vehicleTypes}
                onClose={closeAllDropdowns}
              />
            </FilterSection>

            <FilterSection
              id="make"
              title="Make"
              isActive={isMakeActive}
              activeCount={filterState.selectedMakes?.length as number}
            >
              <MakeFilter
                value={filterState.selectedMakes}
                onChange={(value) => onFilterChange("selectedMakes", value)}
                makes={makes}
                onClose={closeAllDropdowns}
              />
            </FilterSection>

            <FilterSection
              id="years"
              title="Years"
              isActive={isYearsActive}
              activeCount={filterState.selectedYears?.length as number}
            >
              <YearsFilter
                value={filterState.selectedYears}
                onChange={(value) => onFilterChange("selectedYears", value)}
                onClose={closeAllDropdowns}
              />
            </FilterSection>

            <FilterSection
              id="seats"
              title="Seats"
              isActive={isSeatsActive}
              activeCount={filterState.selectedSeats?.length as number}
            >
              <SeatsFilter
                value={filterState.selectedSeats}
                onChange={(value) => onFilterChange("selectedSeats", value)}
                onClose={closeAllDropdowns}
              />
            </FilterSection>

            <FilterSection
              id="features"
              title="Features"
              isActive={isFeaturesActive}
              activeCount={filterState.selectedFeatures?.length as number}
            >
              <FeaturesFilter
                value={filterState.selectedFeatures}
                onChange={(value) => onFilterChange("selectedFeatures", value)}
                features={features}
                onClose={closeAllDropdowns}
              />
            </FilterSection>
          </div>
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Filters"
            )}
          </button>
        </div>
      </div>
    </>
  );
};
