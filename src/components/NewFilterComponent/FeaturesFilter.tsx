import React, { useState } from "react";

interface FeaturesFilterProps {
  value?: string[];
  onChange: (value: string[]) => void;
  features: any[];
  onClose: () => void;
  compact?: boolean;
}

const FeaturesFilter: React.FC<FeaturesFilterProps> = ({
  value = [],
  onChange,
  features,
  onClose,
  compact = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeatures = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (featureId: string) => {
    const newValue = value?.includes(featureId) ? [] : [featureId];
    onChange(newValue);
  };

  const handleClear = () => {
    onChange([]);
  };

  // Compact mode for mobile
  if (compact) {
    return (
      <div className="w-full space-y-4">
        {/* Header */}

        <p className="text-xs text-gray-500 -mt-2">Select one</p>

        {/* Features grid */}
        <div className="max-h-60 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {filteredFeatures.map((feature) => (
              <label
                key={feature.id}
                className={`flex items-center cursor-pointer p-3 rounded-lg border transition-all ${
                  value?.includes(feature.id)
                    ? "bg-blue-50 border-blue-500"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="relative flex items-center w-full">
                  <input
                    type="radio"
                    name="features"
                    checked={value?.includes(feature.id)}
                    onChange={() => handleSelect(feature.id)}
                    className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-full cursor-pointer checked:border-blue-500 checked:bg-blue-500 checked:shadow-[inset_0_0_0_2px_white] focus:outline-none transition-all"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                    {feature.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No features found
          </div>
        )}
      </div>
    );
  }

  // Original dropdown mode for desktop
  return (
    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 p-6 max-h-96 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Features</h3>
          <button
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Clear filter
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">Select one</p>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search features"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredFeatures.map((feature) => (
            <label
              key={feature.id}
              className={`flex items-center cursor-pointer px-4 py-2.5 rounded-full border transition-all ${
                value?.includes(feature.id)
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="features"
                  checked={value?.includes(feature.id)}
                  onChange={() => handleSelect(feature.id)}
                  className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full cursor-pointer checked:border-blue-500 checked:bg-blue-500 checked:shadow-[inset_0_0_0_3px_white] focus:outline-none transition-all"
                />
              </div>
              <span className="ml-2.5 text-sm font-medium text-gray-900">
                {feature.name}
              </span>
            </label>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No features found matching your search
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesFilter;
