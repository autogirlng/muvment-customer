import React, { useState } from "react";
import { FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FilterConfig, FilterState } from "@/types/filters";
import { FilterSection } from "./FilterSection";

interface GenericFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfigs: FilterConfig[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  onApply: () => void;
  mode: "desktop" | "mobile";
}

export const GenericFilterSidebar: React.FC<GenericFilterSidebarProps> = ({
  isOpen,
  onClose,
  filterConfigs,
  filterState,
  onFilterChange,
  onClearAll,
  onApply,
  mode,
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);

  if (mode === "desktop") {
    return (
      <div className="bg-white border-r border-gray-200 p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 border border-gray-300 px-3 py-1 rounded-lg"
          >
            <FiX className="w-4 h-4" />
            Clear all
          </button>
        </div>

        <div className="space-y-6">
          {filterConfigs.map((config) => (
            <FilterSection
              key={config.id}
              config={config}
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-in-out overflow-y-auto w-80 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
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
                className="text-gray-600 hover:text-gray-900"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Show only first filter by default */}
            {filterConfigs.length > 0 && (
              <FilterSection
                key={filterConfigs[0].id}
                config={filterConfigs[0]}
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            )}

            {/* Show remaining filters when expanded */}
            {showAllFilters &&
              filterConfigs
                .slice(1)
                .map((config) => (
                  <FilterSection
                    key={config.id}
                    config={config}
                    filterState={filterState}
                    onFilterChange={onFilterChange}
                  />
                ))}

            {/* View All / View Less Button */}
            {filterConfigs.length > 1 && (
              <button
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {showAllFilters ? (
                  <>
                    <span>View Less</span>
                    <FiChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>
                      View All Filters ({filterConfigs.length - 1} more)
                    </span>
                    <FiChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-6">
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
