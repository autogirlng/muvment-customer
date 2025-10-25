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
      className="absolute top-full left-0 mt-5 w-full min-w-[280px] md:min-w-[320px] bg-white border border-grey-200 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] z-50 overflow-hidden"
      style={{ maxHeight: "30vh" }}
    >
      <div className="h-full overflow-y-auto py-2 scrollbar-hide">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-grey-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-grey-300 border-t-primary-500"></div>
              <span className="text-sm">Searching locations...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="px-4 py-3 border-b border-grey-100">
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
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-grey-500">No locations found</p>
                <p className="text-xs text-grey-400 mt-1">
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
      className="flex items-center gap-3 px-4 py-3 hover:bg-grey-50 cursor-pointer transition-colors duration-150 ease-in-out"
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-grey-500">
        {getLocationIcon(location.icon, location.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-grey-900 truncate">
          {location.name}
        </p>
        {location.description !== location.name && (
          <p className="text-xs text-grey-500 truncate">
            {location.description}
          </p>
        )}
      </div>
      {location.type === "google" && (
        <div className="text-xs text-grey-400 bg-grey-100 px-2 py-1 rounded">
          Maps
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
