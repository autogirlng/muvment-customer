import React, { useState } from "react";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FilterConfig, FilterState } from "@/types/filters";

interface MobileFilterPillsProps {
  filterConfigs: FilterConfig[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onViewAll: () => void;
}

export const MobileFilterPills: React.FC<MobileFilterPillsProps> = ({
  filterConfigs,
  filterState,
  onFilterChange,
  onViewAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const quickFilters = ["vehicleType", "price", "features"];
  const displayConfigs = filterConfigs.filter((config) =>
    quickFilters.includes(config.id)
  );

  return (
    <div className="lg:hidden mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {displayConfigs.map((config) => (
          <button
            key={config.id}
            onClick={() =>
              setActiveFilter(activeFilter === config.id ? null : config.id)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeFilter === config.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {config.title}
          </button>
        ))}

        <button
          onClick={onViewAll}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100"
        >
          <FiFilter className="w-4 h-4" />
          View All
        </button>
      </div>

      {activeFilter && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-fadeIn">
          {/* Render active filter content */}
        </div>
      )}
    </div>
  );
};
