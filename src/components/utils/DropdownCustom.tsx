"use client";

import { useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { DropdownOption } from "@/types/HeroSectionTypes";

interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  className = "",
  isOpen = false,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (onToggle && isOpen) onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <span
          className={
            selectedValue ? "text-gray-900 font-medium" : "text-gray-500"
          }
        >
          {selectedOption?.label || placeholder}
        </span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl
            z-[9999] animate-fadeIn
            overflow-hidden
            
            sm:w-[280px]
            md:w-[100%]
          "
          style={{
            maxHeight: "30vh",
            bottom:
              window.innerHeight -
                dropdownRef.current?.getBoundingClientRect().bottom! <
              250
                ? "100%"
                : "auto",
          }}
        >
          <ul className="divide-y divide-gray-100 h-full overflow-y-auto scrollbar-hide">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${
                    option.value === selectedValue
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "hover:bg-gray-50 text-gray-800"
                  } ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
