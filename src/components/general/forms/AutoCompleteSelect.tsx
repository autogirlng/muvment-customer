import React, { useState, useRef, useEffect } from "react";
import cn from "classnames";
import Tooltip from "./tooltip";

type OptionProps = {
  value: string;
  option: string;
  flag?: string | React.ReactNode;
};

type AutocompleteSelectProps = {
  className?: string;
  defaultValue?: string;
  id: string;
  label?: string;
  placeholder?: string;
  variant?: "outlined" | "filled";
  options: OptionProps[];
  onChange?: (value: string) => void;
  value?: string;
  error?: string;
  info?: boolean;
  tooltipTitle?: string;
  tooltipDescription?: string;
  disabled?: boolean;
  width?: string;
  profile?: boolean;
};

// Common ride purposes array
export const RIDE_PURPOSES = [
  "Airport Transfer",
  "Business Meeting",
  "Wedding",
  "Corporate Event",
  "City Tour",
  "Shopping",
  "Medical Appointment",
  "School Run",
  "Party/Night Out",
  "Hotel Transfer",
  "Conference",
  "Funeral",
  "Date Night",
  "Concert/Event",
  "Family Outing",
  "Religious Service",
  "Sports Event",
  "Restaurant Visit",
  "Sightseeing",
  "Other",
];

const AutocompleteSelect = ({
  className,
  defaultValue,
  id,
  label,
  placeholder,
  variant = "outlined",
  options,
  value,
  onChange,
  error,
  info,
  tooltipTitle,
  tooltipDescription,
  disabled = false,
  width,
  profile,
}: AutocompleteSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(
    value || defaultValue || "",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get display text for selected value
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption?.option || "";

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    onChange?.(optionValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div
      className={cn("w-full flex flex-col gap-1.5 relative", width)}
      ref={dropdownRef}
    >
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-nowrap flex items-center gap-2",
            variant === "filled" ? "text-white" : "text-grey-900",
          )}
        >
          <span>{label}</span>
          {info && (
            <Tooltip
              title={tooltipTitle || ""}
              description={tooltipDescription || ""}
            />
          )}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={isOpen ? searchTerm : displayText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder || "Select an option..."}
          disabled={disabled}
          className={cn(
            `w-full cursor-pointer rounded-[12px] px-4 text-sm ${
              profile ? "h-[56px]" : "h-[45px]"
            } outline-none transition-all duration-200 ease-in-out`,
            "disabled:bg-[#e4e7ec] disabled:text-grey-400 disabled:cursor-not-allowed disabled:border-grey-300",
            error
              ? "border border-error-500 focus:ring-2 focus:ring-error-500/20"
              : variant === "filled"
                ? "bg-gray-800 text-gray-400 border-none hover:bg-gray-700"
                : "bg-white text-gray-900 border border-[#e4e7ec] hover:border-primary-500 focus:border-primary-500",
            className,
          )}
        />

        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
          style={{
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : ""}`,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill={variant === "filled" ? "#FFFFFF" : "#667085"}
            viewBox="0 0 256 256"
          >
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
          </svg>
        </div>

        {isOpen && (
          <div
            className={cn(
              "absolute z-[999] w-full mt-1 overflow-hidden rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 max-h-[240px] overflow-y-auto",
              variant === "filled"
                ? "bg-grey-800 text-white"
                : "bg-white border border-[#e4e7ec]",
            )}
          >
            <div className="p-1.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center w-full cursor-pointer select-none rounded-lg py-2.5 px-3 text-sm outline-none transition-colors",
                      variant === "filled" ? "text-grey-300" : "text-grey-700",
                      "hover:bg-primary-50 hover:text-primary-600",
                      variant === "filled" &&
                        "hover:bg-grey-700 hover:text-white",
                      selectedValue === option.value &&
                        "bg-primary-50 text-primary-600 font-medium",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option?.flag && (
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          {option.flag}
                        </span>
                      )}
                      <span className="truncate">{option.option}</span>
                    </span>
                    {selectedValue === option.value && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 ml-auto"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-2.5 px-3 text-sm text-grey-500 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-error-500 text-sm">{error}</p>}
    </div>
  );
};

export default AutocompleteSelect;
