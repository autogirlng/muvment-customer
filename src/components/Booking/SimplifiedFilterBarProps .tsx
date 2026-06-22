import { formatVehicleTypeName } from "@/utils/vehicleType";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { FilterState } from "@/types/filters";
import PriceRangeFilter from "../NewFilterComponent/PriceRangeFilter";
import PriceSortFilter from "../NewFilterComponent/PriceSortFilter";
import {
  DEFAULT_VEHICLE_ORDER_BY,
  VEHICLE_ORDER_BY_LABELS,
} from "@/constants/vehicleSearchOrder";
import VehicleTypeFilter from "../NewFilterComponent/VehicleTypeFilter";
import YearsFilter from "../NewFilterComponent/YearsFilter";
import SeatsFilter from "../NewFilterComponent/SeatFilter";
import FeaturesFilter from "../NewFilterComponent/FeaturesFilter";
import MakeModelFilter from "./MakeModelFilter";

import {
  getSelectedFeatureName,
  getSelectedMakeName,
  getSelectedSeatName,
  getSelectedVehicleTypeName,
  getSelectedYearName,
} from "@/helpers/explorPageHelpers";
import { CiSettings } from "react-icons/ci";
import { BiChevronDown } from "react-icons/bi";
import {
  getSelectedModelName,
  PriceRangeformatPrice,
} from "@/services/vechilePriceUtiles";


interface SimplifiedFilterBarProps {
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  vehicleTypes: any[];
  makes: any[];
  models: any[];
  features: any[];
  totalCount: number;
  maxPrice?: number;
  minPrice?: number;
  bookingTypeOptions?: { value: string; label: string }[];
  bookingTypeValue?: string;
  onBookingTypeChange?: (value: string) => void;
}

const FilterDropdownButton: React.FC<{
  id?: string;
  label: string;
  selectedLabel?: string;
  count: number;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  panelWidth?: number;
  align?: "left" | "right";
  children: React.ReactNode;
}> = ({
  label,
  selectedLabel,
  count,
  isActive,
  isOpen,
  onToggle,
  panelWidth = 320,
  align = "left",
  children,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }
    const compute = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(panelWidth, window.innerWidth - 16);
      const desired = align === "right" ? r.right - width : r.left;
      const left = Math.max(8, Math.min(desired, window.innerWidth - width - 8));
      setPos({ top: r.bottom + 8, left, width });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        data-filter-trigger
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
          isActive
            ? "bg-[#0673FF] text-white border-[#0673FF]"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
        }`}
      >
        <span>{selectedLabel || label}</span>
        {count > 0 && (
          <span
            className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
              isActive ? "bg-white text-[#0673FF]" : "bg-[#0673FF] text-white"
            }`}
          >
            {count}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      {isOpen &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-filter-panel
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 60,
            }}
            className="max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export const SimplifiedFilterBar: React.FC<SimplifiedFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearAll,
  vehicleTypes,
  makes,
  models,
  features,
  totalCount,
  maxPrice,
  minPrice,
  bookingTypeOptions,
  bookingTypeValue,
  onBookingTypeChange,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("[data-filter-panel]") &&
        !target.closest("[data-filter-trigger]")
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

  const currentOrderBy = filterState.orderBy ?? DEFAULT_VEHICLE_ORDER_BY;
  const isSortActive = currentOrderBy === "HIGH_LOW";
  const isPriceActive = filterState.priceRange !== undefined;
  const isTypeActive = filterState.selectedVehicleTypes !== undefined;
  const isMakeActive = filterState.selectedMakes !== undefined;
  const isModelActive = filterState.selectedModels !== undefined;
  const isYearsActive = filterState.selectedYears !== undefined;
  const isSeatsActive = filterState.selectedSeats !== undefined;
  const isFeaturesActive = filterState.selectedFeatures !== undefined;

  const bookingTypeOpts = bookingTypeOptions ?? [];
  const isBookingTypeActive = !!bookingTypeValue;
  const selectedBookingTypeLabel = bookingTypeOpts.find(
    (o) => o.value === bookingTypeValue,
  )?.label;

  const hasActiveFilters =
    isSortActive ||
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
    vehicleTypes,
  );
  const selectedMake = getSelectedMakeName(filterState.selectedMakes, makes);
  const selectedModel = getSelectedModelName(
    filterState.selectedModels,
    models,
  );
  const selectedYear = getSelectedYearName(filterState.selectedYears);
  const selectedSeat = getSelectedSeatName(filterState.selectedSeats);
  const selectedFeature =
    filterState.selectedFeatures && filterState.selectedFeatures.length > 0
      ? features.find(
          (f: any) => f.id === filterState.selectedFeatures![0],
        )?.name
      : undefined;

  return (
    <>
      {/* Desktop & Tablet View */}
      <div className="hidden lg:block space-y-4" ref={dropdownRef}>
        <div className="relative flex items-center bg-white">
          <div
            className={`flex w-full items-center gap-3 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              hasActiveFilters ? "pr-28" : ""
            }`}
          >
          {bookingTypeOpts.length > 0 && onBookingTypeChange && (
            <FilterDropdownButton
              id="booking-type"
              isOpen={openDropdown === "booking-type"}
              onToggle={() => toggleDropdown("booking-type")}
              label="Booking type"
              selectedLabel={selectedBookingTypeLabel}
              count={isBookingTypeActive ? 1 : 0}
              isActive={isBookingTypeActive}
            >
              {openDropdown === "booking-type" && (
                <div className="flex flex-col">
                  {[{ value: "", label: "All booking types" }, ...bookingTypeOpts].map(
                    (opt) => {
                      const active = (bookingTypeValue || "") === opt.value;
                      return (
                        <button
                          key={opt.value || "all"}
                          type="button"
                          onClick={() => {
                            onBookingTypeChange(opt.value);
                            closeAllDropdowns();
                          }}
                          className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            active
                              ? "bg-[#0673FF] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </FilterDropdownButton>
          )}

          <FilterDropdownButton
            id="price"
            isOpen={openDropdown === "price"}
            onToggle={() => toggleDropdown("price")}
            label="Price range"
            selectedLabel={
              isPriceActive
                ? `₦${PriceRangeformatPrice(filterState.priceRange?.[0] || 0)}-${PriceRangeformatPrice(filterState.priceRange?.[1] || 0)}`
                : undefined
            }
            count={isPriceActive ? 1 : 0}
            isActive={isPriceActive}
          >
            {openDropdown === "price" && (
              <PriceRangeFilter
                range={
                  filterState.priceRange || [
                    minPrice || 25000,
                    maxPrice || 500000,
                  ]
                }
                onChange={(range) => onFilterChange("priceRange", range)}
                maxPrice={maxPrice || 500000}
                minPrice={minPrice || 25000}
                onClear={() => {
                  onFilterChange("priceRange", undefined);
                  closeAllDropdowns();
                }}
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="sort"
            isOpen={openDropdown === "sort"}
            onToggle={() => toggleDropdown("sort")}
            label="Order by price"
            selectedLabel={
              isSortActive
                ? VEHICLE_ORDER_BY_LABELS[currentOrderBy]
                : undefined
            }
            count={isSortActive ? 1 : 0}
            isActive={isSortActive}
          >
            {openDropdown === "sort" && (
              <PriceSortFilter
                value={currentOrderBy}
                onChange={(value) => onFilterChange("orderBy", value)}
                onClose={closeAllDropdowns}
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="type"
            panelWidth={460}
            isOpen={openDropdown === "type"}
            onToggle={() => toggleDropdown("type")}
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
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="make-model"
            panelWidth={460}
            isOpen={openDropdown === "make-model"}
            onToggle={() => toggleDropdown("make-model")}
            label="Make & Model"
            selectedLabel={
              selectedMake && selectedModel
                ? `${selectedMake} - ${selectedModel}`
                : selectedMake
                  ? selectedMake
                  : undefined
            }
            count={(isMakeActive ? 1 : 0) + (isModelActive ? 1 : 0)}
            isActive={isMakeActive || isModelActive}
          >
            {openDropdown === "make-model" && (
              <MakeModelFilter
                makeValue={filterState.selectedMakes}
                modelValue={filterState.selectedModels}
                onMakeChange={(value) => onFilterChange("selectedMakes", value)}
                onModelChange={(value) =>
                  onFilterChange("selectedModels", value)
                }
                makes={makes}
                models={models}
                onClose={closeAllDropdowns}
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="years"
            panelWidth={460}
            isOpen={openDropdown === "years"}
            onToggle={() => toggleDropdown("years")}
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
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="seats"
            isOpen={openDropdown === "seats"}
            onToggle={() => toggleDropdown("seats")}
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
                compact
              />
            )}
          </FilterDropdownButton>

          <FilterDropdownButton
            id="features"
            align="right"
            panelWidth={460}
            isOpen={openDropdown === "features"}
            onToggle={() => toggleDropdown("features")}
            label="Features"
            selectedLabel={selectedFeature}
            count={filterState.selectedFeatures?.length || 0}
            isActive={isFeaturesActive}
          >
            {openDropdown === "features" && (
              <FeaturesFilter
                value={filterState.selectedFeatures}
                onChange={(value) => onFilterChange("selectedFeatures", value)}
                features={features}
                onClose={closeAllDropdowns}
                compact
              />
            )}
          </FilterDropdownButton>
          </div>

          {hasActiveFilters && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-white via-white to-transparent pl-12">
              <button
                onClick={handleClearAll}
                className="pointer-events-auto flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                <span>✕</span>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium"
        >
          <div className="flex items-center gap-2">
            <CiSettings className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-[#0673FF] text-white text-xs font-bold px-2 py-1 rounded-full">
                {
                  [
                    isPriceActive,
                    isSortActive,
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
          maxPrice={maxPrice}
          minPrice={minPrice}
          bookingTypeOptions={bookingTypeOptions}
          bookingTypeValue={bookingTypeValue}
          onBookingTypeChange={onBookingTypeChange}
        />
      )}
    </>
  );
};

// A single selectable tile used throughout the mobile filter sheet
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
      active
        ? "border-[#0673FF] bg-[#0673FF]/10 text-[#0673FF]"
        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);

const AccordionSection: React.FC<{
  title: string;
  summary?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, summary, isOpen, onToggle, children }) => (
  <section className="border-b border-gray-100">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
    >
      <span className="text-base font-semibold text-gray-900">{title}</span>
      <span className="flex min-w-0 items-center gap-2">
        {summary && (
          <span className="max-w-[150px] truncate text-sm font-medium text-[#0673FF]">
            {summary}
          </span>
        )}
        <svg
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
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
      </span>
    </button>
    {isOpen && <div className="px-4 pb-6">{children}</div>}
  </section>
);

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
  maxPrice,
  minPrice,
  bookingTypeOptions,
  bookingTypeValue,
  onBookingTypeChange,
}) => {
  const [tempFilterState, setTempFilterState] =
    useState<FilterState>(filterState);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const tempOrderBy = tempFilterState.orderBy ?? DEFAULT_VEHICLE_ORDER_BY;
  const isSortActive = tempOrderBy === "HIGH_LOW";
  const isPriceActive = tempFilterState.priceRange !== undefined;
  const isTypeActive = tempFilterState.selectedVehicleTypes !== undefined;
  const isMakeActive = tempFilterState.selectedMakes !== undefined;
  const isModelActive = tempFilterState.selectedModels !== undefined;
  const isYearsActive = tempFilterState.selectedYears !== undefined;
  const isSeatsActive = tempFilterState.selectedSeats !== undefined;
  const isFeaturesActive = tempFilterState.selectedFeatures !== undefined;

  const hasActiveFilters =
    isSortActive ||
    isPriceActive ||
    isTypeActive ||
    isMakeActive ||
    isModelActive ||
    isYearsActive ||
    isSeatsActive ||
    isFeaturesActive;

  const handleTempFilterChange = (filterId: string, value: any) => {
    setTempFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleApplyFilters = () => {
    Object.keys(tempFilterState).forEach((key) => {
      onFilterChange(key, tempFilterState[key as keyof FilterState]);
    });
    onClose();
  };

  const handleClearFilter = (filterId: string) => {
    handleTempFilterChange(filterId, undefined);
  };

  const handleClearAll = () => {
    const emptyState: FilterState = {
      orderBy: DEFAULT_VEHICLE_ORDER_BY,
      priceRange: [minPrice || 25000, maxPrice || 500000],
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

  const SORT_OPTIONS = ["LOW_HIGH", "HIGH_LOW"] as const;
  const SEAT_OPTIONS = ["2", "3", "4", "5", "6", "7"];
  const YEAR_OPTIONS = [
    "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017",
    "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025",
  ];
  const toggleSingle = (
    key: keyof FilterState,
    current: string[] | undefined,
    val: string,
  ) => {
    handleTempFilterChange(key, current?.includes(val) ? undefined : [val]);
    setOpenSection(null);
  };
  const toggleMulti = (
    key: keyof FilterState,
    current: string[] | undefined,
    val: string,
  ) => {
    const arr = current || [];
    const next = arr.includes(val)
      ? arr.filter((x) => x !== val)
      : [...arr, val];
    handleTempFilterChange(key, next.length ? next : undefined);
  };

  const priceSummary =
    isPriceActive && tempFilterState.priceRange
      ? `₦${PriceRangeformatPrice(
          tempFilterState.priceRange[0],
        )} - ₦${PriceRangeformatPrice(tempFilterState.priceRange[1])}`
      : undefined;
  const makeName = getSelectedMakeName(tempFilterState.selectedMakes, makes);
  const modelName = getSelectedModelName(tempFilterState.selectedModels, models);
  const makeModelSummary =
    makeName && modelName
      ? `${makeName} - ${modelName}`
      : makeName || undefined;

  const drawer = (
    <div className="fixed inset-0 z-[200] lg:hidden flex flex-col bg-white">
      {/* Header: X (left) / Filter (center) / Clear (right) */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-2 py-3">
        <button
          onClick={onClose}
          aria-label="Close filters"
          className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <FiX className="h-6 w-6" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Filter</h2>
        <button
          onClick={handleClearAll}
          disabled={!hasActiveFilters}
          className="px-3 text-sm font-medium text-[#0673FF] disabled:text-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Collapsible sections */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {(bookingTypeOptions?.length ?? 0) > 0 && onBookingTypeChange && (
          <AccordionSection
            title="Booking type"
            summary={
              bookingTypeOptions?.find((o) => o.value === bookingTypeValue)
                ?.label
            }
            isOpen={openSection === "booking-type"}
            onToggle={() => toggleSection("booking-type")}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "", label: "All booking types" },
                ...(bookingTypeOptions ?? []),
              ].map((opt) => (
                <FilterChip
                  key={opt.value || "all"}
                  active={(bookingTypeValue || "") === opt.value}
                  onClick={() => {
                    onBookingTypeChange(opt.value);
                    setOpenSection(null);
                  }}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </div>
          </AccordionSection>
        )}

        <AccordionSection
          title="Sort by"
          summary={isSortActive ? VEHICLE_ORDER_BY_LABELS[tempOrderBy] : undefined}
          isOpen={openSection === "sort"}
          onToggle={() => toggleSection("sort")}
        >
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map((opt) => (
              <FilterChip
                key={opt}
                active={tempOrderBy === opt}
                onClick={() => {
                  handleTempFilterChange("orderBy", opt);
                  setOpenSection(null);
                }}
              >
                {VEHICLE_ORDER_BY_LABELS[opt]}
              </FilterChip>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Price range"
          summary={priceSummary}
          isOpen={openSection === "price"}
          onToggle={() => toggleSection("price")}
        >
          <p className="mb-3 text-xs text-gray-400">Total price before tax</p>
          <PriceRangeFilter
            range={
              tempFilterState.priceRange || [
                minPrice || 25000,
                maxPrice || 500000,
              ]
            }
            onChange={(range) => handleTempFilterChange("priceRange", range)}
            maxPrice={maxPrice || 500000}
            minPrice={minPrice || 25000}
            onClear={() => handleClearFilter("priceRange")}
            compact={true}
          />
          {isPriceActive && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleClearFilter("priceRange")}
                className="text-xs font-medium text-[#0673FF]"
              >
                Clear
              </button>
            </div>
          )}
        </AccordionSection>

        {vehicleTypes.length > 0 && (
          <AccordionSection
            title="Vehicle type"
            summary={getSelectedVehicleTypeName(
              tempFilterState.selectedVehicleTypes,
              vehicleTypes,
            )}
            isOpen={openSection === "type"}
            onToggle={() => toggleSection("type")}
          >
            <div className="grid grid-cols-2 gap-2">
              {vehicleTypes.map((t: any) => (
                <FilterChip
                  key={t.id}
                  active={Boolean(
                    tempFilterState.selectedVehicleTypes?.includes(t.id),
                  )}
                  onClick={() =>
                    toggleSingle(
                      "selectedVehicleTypes",
                      tempFilterState.selectedVehicleTypes,
                      t.id,
                    )
                  }
                >
                  {formatVehicleTypeName(t.name)}
                </FilterChip>
              ))}
            </div>
          </AccordionSection>
        )}

        <AccordionSection
          title="Make & Model"
          summary={makeModelSummary}
          isOpen={openSection === "makemodel"}
          onToggle={() => toggleSection("makemodel")}
        >
          <MakeModelFilter
            makeValue={tempFilterState.selectedMakes}
            modelValue={tempFilterState.selectedModels}
            onMakeChange={(value) => handleTempFilterChange("selectedMakes", value)}
            onModelChange={(value) =>
              handleTempFilterChange("selectedModels", value)
            }
            makes={makes}
            models={models}
            onClose={onClose}
            compact={true}
          />
        </AccordionSection>

        <AccordionSection
          title="Year"
          summary={getSelectedYearName(tempFilterState.selectedYears)}
          isOpen={openSection === "year"}
          onToggle={() => toggleSection("year")}
        >
          <div className="grid grid-cols-4 gap-2">
            {YEAR_OPTIONS.map((y) => (
              <FilterChip
                key={y}
                active={Boolean(tempFilterState.selectedYears?.includes(y))}
                onClick={() =>
                  toggleSingle("selectedYears", tempFilterState.selectedYears, y)
                }
              >
                {y}
              </FilterChip>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Seats"
          summary={getSelectedSeatName(tempFilterState.selectedSeats)}
          isOpen={openSection === "seats"}
          onToggle={() => toggleSection("seats")}
        >
          <div className="grid grid-cols-4 gap-2">
            {SEAT_OPTIONS.map((sVal) => (
              <FilterChip
                key={sVal}
                active={Boolean(tempFilterState.selectedSeats?.includes(sVal))}
                onClick={() =>
                  toggleSingle("selectedSeats", tempFilterState.selectedSeats, sVal)
                }
              >
                {sVal === "7" ? "7+" : sVal}
              </FilterChip>
            ))}
          </div>
        </AccordionSection>

        {features.length > 0 && (
          <AccordionSection
            title="Features"
            summary={
              (tempFilterState.selectedFeatures?.length || 0) > 1
                ? `${tempFilterState.selectedFeatures!.length} selected`
                : getSelectedFeatureName(
                    tempFilterState.selectedFeatures,
                    features,
                  )
            }
            isOpen={openSection === "features"}
            onToggle={() => toggleSection("features")}
          >
            <div className="grid grid-cols-2 gap-2">
              {features.map((f: any) => (
                <FilterChip
                  key={f.id}
                  active={Boolean(
                    tempFilterState.selectedFeatures?.includes(f.id),
                  )}
                  onClick={() =>
                    toggleMulti(
                      "selectedFeatures",
                      tempFilterState.selectedFeatures,
                      f.id,
                    )
                  }
                >
                  {f.name}
                </FilterChip>
              ))}
            </div>
          </AccordionSection>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={handleApplyFilters}
          className="w-full rounded-lg bg-[#0673FF] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6]"
        >
          Show results
        </button>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(drawer, document.body)
    : null;
};
