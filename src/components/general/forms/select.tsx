import React, { LegacyRef, ReactNode } from "react";

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
}: SelectInputProps) => {
    return (
        <div className="w-full space-y-2 custom-radix-select">
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        "label text-sm block font-medium text-nowrap",
                        variant === "filled" ? "text-white" : "text-grey-900",
                        info ? "flex items-center gap-3" : ""
                    )}
                >
                    <span> {label}</span>
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
            >
                <Select.Trigger
                    className={cn(
                        "flex items-center justify-between w-full cursor-pointer rounded-[12px] p-4 text-sm h-[32px] gap-[5px] outline-none data-[placeholder]:text-[#4A5565] disabled:bg-[#e4e7ec] disabled:text-grey-400 disabled:border-grey-300",
                        error
                            ? "border border-error-500 focus:border-error-500"
                            : variant === "filled"
                                ? "bg-grey-800 text-grey-400 border-none"
                                : "bg-white text-grey-900 border border-[#e4e7ec]",
                        className
                    )}
                    aria-label={id}
                    disabled={disabled}
                >
                    <Select.Value placeholder={placeholder || ""} />
                    {!disabled && (
                        <Select.Icon>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill={variant === "filled" ? "#FFFFFF" : "#000000"}
                                viewBox="0 0 256 256"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                            </svg>
                        </Select.Icon>
                    )}
                </Select.Trigger>
                <Select.Content
                    position="popper"
                    sideOffset={5}
                    className={cn(
                        "!overflow-auto rounded-2xl cursor-pointer z-[999] max-h-[250px] min-w-[240px]",
                        width,
                        variant === "filled"
                            ? "text-[#4A5565] border-none"
                            : "bg-white border border-[#e4e7ec] "
                    )}
                >
                    <Select.Viewport className="px-4 py-[3px]">
                        <Select.Group className="space-y-3">
                            {options.map((option: OptionProps, index) => (
                                <SelectItem
                                    key={index}
                                    value={option.value}
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex items-center gap-0.5">
                                        {option?.flag && (
                                            <span className="w-6 h-6">{option?.flag}</span>
                                        )}
                                        <span> {option.option}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </Select.Group>
                    </Select.Viewport>
                </Select.Content>
            </Select.Root>
            {error && (
                <p className="text-error-500 text-sm mt-2 text-nowrap">{error}</p>
            )}
        </div>
    );
};

type SelectItemProps = {
    className?: string;
    children: ReactNode;
    value: string;
};

const SelectItem = ({ children, className, ...props }: SelectItemProps) => {
    return (
        <Select.Item
            className={cn(
                "text-xs 3xl:text-sm flex items-center py-4 h-4 relative select-none data-[disabled]:text-grey-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:text-primary-500",
                className
            )}
            {...props}
        >
            <Select.ItemText>{children}</Select.ItemText>
        </Select.Item>
    );
};
export default SelectInput;
