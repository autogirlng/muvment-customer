import React, { useState, useEffect } from "react";

interface MakeModelFilterProps {
  makeValue?: string[];
  modelValue?: string[];
  onMakeChange: (value: string[]) => void;
  onModelChange: (value?: string[] | undefined) => void;
  makes: any[];
  models: any[];
  onClose: () => void;
  compact?: boolean;
}

const MakeModelFilter: React.FC<MakeModelFilterProps> = ({
  makeValue = [],
  modelValue,
  onMakeChange,
  onModelChange,
  makes,
  models,
  onClose,
  compact = false,
}) => {
  const [makeSearchTerm, setMakeSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState<string | undefined>(
    makeValue?.[0],
  );

  useEffect(() => {
    setSelectedMake(makeValue?.[0]);
  }, [makeValue]);

  const filteredMakes = makes.filter((make) =>
    make.name.toLowerCase().includes(makeSearchTerm.toLowerCase()),
  );

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name
      .toLowerCase()
      .includes(modelSearchTerm.toLowerCase());
    const matchesMake = selectedMake ? model.makeId === selectedMake : false;
    return matchesSearch && matchesMake;
  });

  const handleMakeSelect = (makeId: string) => {
    const newValue = makeValue?.includes(makeId) ? [] : [makeId];
    setSelectedMake(newValue[0]);
    onMakeChange(newValue);
    // Clear model when make changes
    onModelChange(undefined);
  };

  const handleModelSelect = (modelId: string) => {
    const newValue: string[] | undefined =
      modelValue && modelValue.includes(modelId) ? undefined : [modelId];
    onModelChange(newValue);
  };

  const handleClearAll = () => {
    setSelectedMake(undefined);
    onMakeChange([]);
    onModelChange(undefined);
    setMakeSearchTerm("");
    setModelSearchTerm("");
  };

  const selectedMakeName = makes.find((m) => m.id === selectedMake)?.name;

  // Compact mode for mobile
  if (compact) {
    return (
      <div className="w-full space-y-6">
        {/* Make Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              1. Select Make
            </h4>
            {selectedMake && (
              <button
                onClick={handleClearAll}
                className="text-xs text-[#0673FF] hover:text-[#0560d6] font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search make..."
              value={makeSearchTerm}
              onChange={(e) => setMakeSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0673FF] text-sm"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filteredMakes.map((make) => (
                <label
                  key={make.id}
                  className={`flex items-center cursor-pointer p-3 rounded-lg border transition-all ${
                    makeValue?.includes(make.id)
                      ? "bg-[#0673FF]/10 border-[#0673FF]"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="make"
                    checked={makeValue?.includes(make.id)}
                    onChange={() => handleMakeSelect(make.id)}
                    className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-full cursor-pointer checked:border-[#0673FF] checked:bg-[#0673FF] checked:shadow-[inset_0_0_0_2px_white] focus:outline-none transition-all"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {make.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {filteredMakes.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No makes found
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Model Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              2. Select Model {selectedMakeName && `(${selectedMakeName})`}
            </h4>
          </div>

          {!selectedMake ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#0673FF]/10">
                <svg
                  className="h-5 w-5 text-[#0673FF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Choose a make first
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Pick a make above and its models will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search model..."
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0673FF] text-sm"
                />
              </div>

              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredModels.map((model) => (
                    <label
                      key={model.id}
                      className={`flex items-center cursor-pointer p-3 rounded-lg border transition-all ${
                        modelValue && modelValue.includes(model.id)
                          ? "bg-[#0673FF]/10 border-[#0673FF]"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        checked={Boolean(
                          modelValue && modelValue.includes(model.id),
                        )}
                        onChange={() => handleModelSelect(model.id)}
                        className="appearance-none w-4 h-4 border-2 border-gray-400 rounded-full cursor-pointer checked:border-[#0673FF] checked:bg-[#0673FF] checked:shadow-[inset_0_0_0_2px_white] focus:outline-none transition-all"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                        {model.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {filteredModels.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No models found for {selectedMakeName}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop dropdown mode
  return (
    <div className="absolute top-full left-0 mt-2 w-[500px] bg-white rounded-lg shadow-xl z-50 p-6 max-h-[600px] overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Make & Model</h3>
          {(selectedMake || modelValue) && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Make Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Step 1: Select Make
          </h4>

          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicle make..."
              value={makeSearchTerm}
              onChange={(e) => setMakeSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0673FF] focus:border-[#0673FF] text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {filteredMakes.map((make) => (
              <label
                key={make.id}
                className={`flex items-center cursor-pointer px-4 py-2.5 rounded-full border transition-all ${
                  makeValue?.includes(make.id)
                    ? "bg-[#0673FF]/10 border-[#0673FF]"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="make"
                  checked={makeValue?.includes(make.id)}
                  onChange={() => handleMakeSelect(make.id)}
                  className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full cursor-pointer checked:border-[#0673FF] checked:bg-[#0673FF] checked:shadow-[inset_0_0_0_3px_white] focus:outline-none transition-all"
                />
                <span className="ml-2.5 text-sm font-medium text-gray-900">
                  {make.name}
                </span>
              </label>
            ))}
          </div>

          {filteredMakes.length === 0 && (
            <div className="text-center py-3 text-gray-500 text-sm">
              No makes found
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Model Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Step 2: Select Model{" "}
            {selectedMakeName && (
              <span className="text-[#0673FF]">({selectedMakeName})</span>
            )}
          </h4>

          {!selectedMake ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#0673FF]/10">
                <svg
                  className="h-5 w-5 text-[#0673FF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Choose a make first
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Pick a make above and its models will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0673FF] focus:border-[#0673FF] text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {filteredModels.map((model) => (
                  <label
                    key={model.id}
                    className={`flex items-center cursor-pointer px-4 py-2.5 rounded-full border transition-all ${
                      modelValue && modelValue.includes(model.id)
                        ? "bg-[#0673FF]/10 border-[#0673FF]"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      checked={Boolean(
                        modelValue && modelValue.includes(model.id),
                      )}
                      onChange={() => handleModelSelect(model.id)}
                      className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full cursor-pointer checked:border-[#0673FF] checked:bg-[#0673FF] checked:shadow-[inset_0_0_0_3px_white] focus:outline-none transition-all"
                    />
                    <span className="ml-2.5 text-sm font-medium text-gray-900">
                      {model.name}
                    </span>
                  </label>
                ))}
              </div>

              {filteredModels.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm">
                  No models found for {selectedMakeName}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeModelFilter;
