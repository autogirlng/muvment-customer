import cn from "classnames";
import TimePicker from "./TimePicker";

const TimeInput = ({
    onChange,
    value,
    error,
    name,
    label,
    timeType = "all",
    disabled = false, // Add disabled prop
    ...rest
}: {
    onChange: (value: Date) => void;
    value: Date | null;
    error?: string;
    label?: string;
    name: string;
    timeType?: "start" | "end" | "all";
    disabled?: boolean; // Add to interface
    [key: string]: any;
}) => {
    // Convert value to proper Date object if it exists
    const getDateValue = (val: Date | null): Date | null => {
        if (!val) return null;

        // If it's already a Date object, return it
        if (val instanceof Date && !isNaN(val.getTime())) {
            return val;
        }

        // If it's a string or other format, try to convert it
        try {
            const converted = new Date(val);
            if (!isNaN(converted.getTime())) {
                return converted;
            }
        } catch (error) {
            console.warn("Invalid date value in TimeInput:", val);
        }

        return null;
    };

    // Handle time change from TimePicker
    const handleTimeChange = (selectedDate: Date) => {
        if (disabled) return; // Prevent changes if disabled

        // Ensure we're getting a valid Date object
        if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
            // Create a new Date object to avoid mutation issues
            const newDate = new Date(selectedDate);

            // Call the parent's onChange with the proper Date object
            onChange(newDate);
        } else {
            console.warn("Invalid date received from TimePicker:", selectedDate);
        }
    };

    const normalizedValue = getDateValue(value);

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className={cn(
                        "label text-left text-sm block font-medium text-nowrap",
                        disabled && "text-grey-400" // Style disabled label
                    )}
                >
                    <span> {label}</span>
                </label>
            )}
            <div
                className={cn(
                    "w-full rounded-[15px] p-2 text-left text-sm h-[32px] gap-[5px] outline-none data-[placeholder]:text-grey-400 flex items-center border",
                    disabled
                        ? "bg-grey-100 text-grey-400 border-grey-300 cursor-not-allowed"
                        : error
                            ? "border-error-500 focus:border-error-500 bg-white text-grey-900"
                            : "bg-white text-grey-900 border-[#e4e7ec] focus:shadow-[0_0_0_4px_#1E93FF1A]"
                )}
            >
                <TimePicker
                    name={name}
                    value={normalizedValue}
                    onChange={handleTimeChange}
                    className="w-full"
                    width="w-full"
                    showArrow={true}
                    timeType={timeType}
                    disabled={disabled} // Pass disabled to TimePicker
                    {...rest}
                />
            </div>
            {error && (
                <p className="text-error-500 text-sm mt-2 text-left">{error}</p>
            )}
        </div>
    );
};

export default TimeInput;
