"use client";

import { useRef, useEffect, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
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
  menuAlign?: "left" | "right";
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
  menuAlign = "left",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(240);

  // Open upward when there isn't room below, and cap height to fit the viewport
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const desired = 240;
    const buffer = 16;
    if (spaceBelow < desired + buffer && spaceAbove > spaceBelow) {
      setDropUp(true);
      setMenuMaxHeight(Math.max(140, Math.min(desired, spaceAbove - buffer)));
    } else {
      setDropUp(false);
      setMenuMaxHeight(Math.max(140, Math.min(desired, spaceBelow - buffer)));
    }
  }, [isOpen]);

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
        className={`flex items-center gap-2 text-sm ${selectedValue ? "font-medium text-gray-800" : "text-gray-800"
          }`}
      >
        {selectedOption?.icon && (
          <span className="shrink-0 text-base">{selectedOption.icon}</span>
        )}
        <span className="truncate">{selectedOption?.label || placeholder}</span>
      </span>
      <FiChevronDown
        className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
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
          className={`absolute ${menuAlign === "right" ? "right-0" : "left-0"} w-full min-w-[12rem] bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn overflow-y-auto ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ maxHeight: menuMaxHeight }}
        >
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${option.value === selectedValue
                    ? "bg-[#0673FF]/10 text-[#0673FF] font-medium"
                    : "hover:bg-gray-50 text-gray-800"
                    } ${option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {option.icon && (
                        <span className="shrink-0 text-base">{option.icon}</span>
                      )}
                      {option.label}
                    </span>
                    {option.value === selectedValue && (
                      <FiCheck className="h-4 w-4 shrink-0 text-[#0673FF]" />
                    )}
                  </span>
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
