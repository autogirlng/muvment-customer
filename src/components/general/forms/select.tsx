import React, { ReactNode } from "react";
import * as Select from "@radix-ui/react-select";
import cn from "classnames";
import Tooltip from "./tooltip";

type OptionProps = {
  value: string;
  option: string;
  flag?: string | ReactNode;
};

type SelectInputProps = {
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

const SelectInput = ({
  className,
  defaultValue,
  id,
  label,
  placeholder,
  variant,
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
}: SelectInputProps) => {
  return (
    <div className={cn("w-full flex flex-col gap-1.5", width)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-nowrap flex items-center gap-2",
            variant === "filled" ? "text-white" : "text-grey-900"
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

      <Select.Root
        defaultValue={defaultValue}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <Select.Trigger
          className={cn(
            `group flex items-center justify-between w-full cursor-pointer rounded-[12px] px-4 text-sm ${
              profile ? "h-[56px]" : "h-[45px]"
            } gap-2 outline-none transition-all duration-200 ease-in-out`,
            "disabled:bg-[#e4e7ec] disabled:text-grey-400 disabled:cursor-not-allowed disabled:border-grey-300",
            error
              ? "border border-error-500 focus:ring-2 focus:ring-error-500/20"
              : variant === "filled"
              ? "bg-gray-800 text-gray-400 border-none hover:bg-gray-700"
              : "bg-white text-gray-900 border border-[#e4e7ec] hover:border-primary-500",
            className
          )}
          aria-label={id}
        >
          <span className="truncate">
            <Select.Value
              placeholder={
                <span className="text-[#4A5565]">{placeholder || ""}</span>
              }
            />
          </span>
          <Select.Icon className="transition-transform duration-200 group-data-[state=open]:rotate-180">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill={variant === "filled" ? "#FFFFFF" : "#667085"}
              viewBox="0 0 256 256"
            >
              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
            </svg>
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={5}
            className={cn(
              "z-[999] overflow-hidden rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100",
              // Mobile/Responsive fix: Ensure dropdown matches trigger width
              "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]",
              variant === "filled"
                ? "bg-grey-800 text-white"
                : "bg-white border border-[#e4e7ec]"
            )}
          >
            <Select.Viewport className="p-1.5">
              <Select.Group>
                {options.map((option, index) => (
                  <SelectItem
                    key={index}
                    value={option.value}
                    variant={variant}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option?.flag && (
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          {option.flag}
                        </span>
                      )}
                      <span className="truncate">{option.option}</span>
                    </span>
                  </SelectItem>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error && <p className="text-error-500 text-sm">{error}</p>}
    </div>
  );
};

type SelectItemProps = {
  className?: string;
  children: ReactNode;
  value: string;
  variant?: "outlined" | "filled";
};

const SelectItem = ({
  children,
  className,
  variant,
  ...props
}: SelectItemProps) => {
  return (
    <Select.Item
      className={cn(
        "relative flex items-center w-full cursor-pointer select-none rounded-lg py-2.5 px-3 text-sm outline-none transition-colors",
        // Default state
        variant === "filled" ? "text-grey-300" : "text-grey-700",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Highlighted/Hover state
        variant === "filled"
          ? "data-[highlighted]:bg-grey-700 data-[highlighted]:text-white"
          : "data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-600",
        className
      )}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>

      {/* Optional: Add a checkmark if needed */}
      <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </Select.ItemIndicator>
    </Select.Item>
  );
};

export default SelectInput;
