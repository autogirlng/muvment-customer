"use client";
import { useState } from "react";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import Dropdown from "./DropdownCustom";
import { DropdownOption } from "@/types/HeroSectionTypes";

export default function StatusFilter({
  options,
  value,
  onChange,
  placeholder = "Filter by status",
}: {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const isFiltering = Boolean(value);

  return (
    <Dropdown
      options={options}
      selectedValue={value}
      onSelect={onChange}
      isOpen={open}
      onToggle={() => setOpen(!open)}
      menuAlign="right"
      className="shrink-0 w-auto sm:w-64"
      customTrigger={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Filter by status"
          className="flex items-center"
        >
          <span
            className={`flex h-[42px] w-[42px] items-center justify-center rounded-lg border bg-white sm:hidden ${
              isFiltering
                ? "border-[#0673ff] text-[#0673ff]"
                : "border-gray-300 text-gray-600"
            }`}
          >
            <FiFilter className="h-5 w-5" />
          </span>
          <span className="hidden w-64 items-center justify-between rounded-lg border border-gray-300 bg-white p-3 sm:flex">
            <span className="truncate text-sm text-gray-800">
              {selected?.label || placeholder}
            </span>
            <FiChevronDown
              className={`h-4 w-4 shrink-0 text-gray-800 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      }
    />
  );
}
