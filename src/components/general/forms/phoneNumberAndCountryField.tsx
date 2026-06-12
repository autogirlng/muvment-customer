"use client";

import cn from "classnames";
import CountryCodeSelect from "./countryCodeSelect";
import Tooltip from "./tooltip";

type PhoneNumberAndCountryFieldProps = {
  inputName: string;
  selectName?: string;
  inputId?: string;
  selectId?: string;
  label?: string;
  inputPlaceholder?: string;
  selectPlaceholder?: string;
  inputValue: string | any;
  selectValue: string | any;
  inputOnChange: (value: any) => void;
  selectOnChange: (value: any) => void;
  inputOnBlur?: (value: any) => void;
  selectOnBlur?: (value: any) => void;
  inputClassname?: string;
  selectClassname?: string;
  inputError?: string;
  selectError?: string;
  inputDisabled?: boolean;
  selectDisabled?: boolean;
  variant?: "outlined" | "filled";
  info?: boolean;
  tooltipTitle?: string;
  tooltipDescription?: string;
  [key: string]: any;
};

const PhoneNumberAndCountryField = ({
  inputName,
  inputId,
  label,
  inputPlaceholder,
  inputValue,
  selectValue,
  inputOnChange,
  selectOnChange,
  inputOnBlur,
  inputClassname,
  inputError,
  inputDisabled = false,
  selectDisabled = false,
  info,
  tooltipTitle,
  tooltipDescription,
  variant,
}: PhoneNumberAndCountryFieldProps) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={inputId || inputName}
        className={cn(
          "text-sm block font-medium mb-2",
          variant === "filled" ? "text-white" : "text-gray-900",
          info && "flex items-center gap-3",
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

    <div className="flex items-stretch gap-2">
      <div className="shrink-0 w-[140px]">
        <CountryCodeSelect
          value={selectValue}
          onChange={selectOnChange}
          disabled={selectDisabled}
        />
      </div>

      <input
        id={inputId || inputName}
        name={inputName}
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        disabled={inputDisabled}
        value={inputValue}
        onChange={inputOnChange}
        onBlur={inputOnBlur}
        placeholder={inputPlaceholder || "Enter phone number"}
        className={cn(
          "flex-1 min-w-0 h-[56px] px-4 rounded-[12px] border bg-white text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF] disabled:opacity-60",
          inputError ? "border-red-500" : "border-gray-300",
          inputClassname,
        )}
      />
    </div>

    {inputError && <p className="mt-1 text-sm text-red-500">{inputError}</p>}
  </div>
);

export default PhoneNumberAndCountryField;
