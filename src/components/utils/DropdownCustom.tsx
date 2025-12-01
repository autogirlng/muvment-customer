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
  customTrigger?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  className = "",
  isOpen = false,
  onToggle,
  customTrigger,
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
    if (onToggle) onToggle();
  };

  // Default trigger for the dropdown
  const defaultTrigger = (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center focus:outline-none group"
    >
      <span
        className={`text-sm ${
          selectedValue ? "font-medium text-gray-400" : "text-gray-400"
        }`}
      >
        {selectedOption?.label || placeholder}
      </span>
      <FiChevronDown
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        } group-hover:text-gray-600`}
      />
    </button>
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Trigger */}
      {customTrigger || defaultTrigger}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
          absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
          z-50 animate-fadeIn overflow-hidden
          max-h-60 overflow-y-auto
        "
        >
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
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
