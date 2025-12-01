import { useState, useRef, useEffect } from "react";
import { FilterOption } from "@/types/filters";
import { BiChevronDown, BiSearch } from "react-icons/bi";

interface CheckboxFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  type: string;
}

const NewFilterSearch: React.FC<CheckboxFilterProps> = ({
  options,
  selected,
  onChange,
  type,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => selected.includes(opt.id));

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 bg-white border-2 border-blue-400 rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors"
        >
          <span className="text-gray-600">
            {selectedOption ? selectedOption.name : `Select ${type}`}
          </span>
          <BiChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <BiSearch
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${type}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="tel"
                      checked={selected.includes(option.id)}
                      onChange={() => toggleSelection(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.name}</span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No item found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewFilterSearch;
