"use client";

import { getLocationIcon } from "@/context/locationUtils";
import { PlacePrediction } from "@/types/BookingSearch";
import React from "react";

interface LocationDropdownProps {
  isOpen: boolean;
  suggestions: PlacePrediction[];
  isLoading: boolean;
  error: string;
  onLocationSelect: (location: PlacePrediction) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  isOpen,
  suggestions,
  isLoading,
  error,
  onLocationSelect,
  dropdownRef,
}) => {
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className=" top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <div className="h-full overflow-y-auto py-1">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm">Searching locations...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-sm">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Location Results */}
        {!isLoading && suggestions.length > 0
          ? suggestions.map((location) => (
            <LocationItem
              key={location.id}
              location={location}
              onSelect={onLocationSelect}
            />
          ))
          : !isLoading && (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-gray-500">No locations found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

interface LocationItemProps {
  location: PlacePrediction;
  onSelect: (location: PlacePrediction) => void;
}

const LocationItem: React.FC<LocationItemProps> = ({ location, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(location)}
      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-800">
        {getLocationIcon(location.icon, location.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {location.name}
        </p>
        {location.description !== location.name && (
          <p className="text-xs text-gray-500 truncate">
            {location.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationDropdown;
