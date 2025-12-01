import { DatePicker } from "./calendar"
import cn from "classnames";
import { format } from "date-fns";
import { useState } from "react";

// Define the Value type to match the DatePicker component
type ValuePiece = Date | null;
type Value = Date | null | [ValuePiece, ValuePiece];
type CalendarValuePiece = Date | null;

export type CalendarValue =
    | CalendarValuePiece
    | [CalendarValuePiece, CalendarValuePiece];

const DateInput = ({
    onChange,
    value,
    error,
    label,
    name,
    minDate,
    maxDate,
    blockPastDates = false,
    disabled = false, // Add disabled prop
}: {
    name: string;
    onChange: (value: CalendarValue) => void;
    value: Date | null;
    error?: string;
    label?: string;
    minDate?: Date | null;
    maxDate?: Date | null;
    blockPastDates?: boolean;
    disabled?: boolean; // Add to interface
}) => {
    const [pickupDateIsOpen, setPickupDateIsOpen] = useState<boolean>(false);

    // If blockPastDates is true, use the later of today or minDate
    const today = new Date();
    const effectiveMinDate = blockPastDates
        ? minDate && minDate > today
            ? minDate
            : today
        : minDate;

    // Handle the date change from DatePicker and convert it to the expected type
    const handleDateChange = (selectedValue: Value) => {
        // Don't allow changes if disabled
        if (disabled) return;

        // Since selectRange is false in DatePicker, selectedValue should be Date | null
        // But we need to handle the case where it might be an array (just in case)
        let dateToReturn: Date | null = null;

        if (selectedValue === null) {
            dateToReturn = null;
        } else if (Array.isArray(selectedValue)) {
            // If it's an array, take the first date (shouldn't happen with selectRange=false)
            dateToReturn = selectedValue[0];
        } else {
            // It's a single Date
            dateToReturn = selectedValue;
        }

        // Call the parent's onChange with the proper date
        onChange(dateToReturn as CalendarValue);
    };

    // Don't open picker if disabled
    const handleIsOpen = (open: boolean) => {
        if (!disabled) {
            setPickupDateIsOpen(open);
        }
    };

    return (
        <DatePicker
            value={value}
            onChange={handleDateChange}
            isOpen={pickupDateIsOpen}
            handleIsOpen={handleIsOpen}
            buttonClass="w-full"
            showMinDate={!!effectiveMinDate}
            minDate={effectiveMinDate}
            maxDate={maxDate}
            disabled={disabled}
        >
            {label && (
                <label
                    htmlFor={name}
                    className={cn(
                        "label text-left text-sm block font-medium text-nowrap",
                        disabled && "text-grey-400"
                    )}
                >
                    <span> {label}</span>
                </label>
            )}
            <div
                className={cn(
                    "w-full rounded-[12px] px-2 py-1  cursor-pointer text-left text-sm h-[32px] gap-[5px] outline-none data-[placeholder]:text-grey-400",
                    disabled
                        ? "bg-grey-100 text-grey-400 border-grey-300 cursor-not-allowed"// Disabled styles
                        : error
                            ? "border border-error-500 focus:border-error-500"
                            : "bg-white text-grey-900 border border-[#e4e7ec] hover:border-primary-500 focus:shadow-[0_0_0_4px_#1E93FF1A]",
                    "border"
                )}
                style={disabled ? { pointerEvents: "none" } : {}} // Prevent clicks when disabled
            >
                {value ? (
                    <span className={cn("text-grey-800", disabled && "text-grey-400")}>
                        {format(new Date(value), "dd/MM/yyyy")}
                    </span>
                ) : (
                    <span className="text-grey-400">Select a date</span>
                )}
            </div>
            {error && (
                <p className="text-error-500 text-sm mt-2 text-left">{error}</p>
            )}
        </DatePicker>
    );
};

export default DateInput;
