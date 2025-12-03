import cn from "classnames";
import "react-phone-number-input/style.css";
import en from "react-phone-number-input/locale/en";
import InputField from "./inputField";
import Tooltip from "./tooltip";
import SelectCountry from "./selectCountry";

type PhoneNumberAndCountryFieldProps = {
    inputName: string;
    selectName: string;

    inputId: string;
    selectId: string;

    label?: string;

    inputPlaceholder: string;
    selectPlaceholder: string;

    inputValue: string | any;
    selectValue: string | any;

    inputOnChange: (value: any) => void;
    selectOnChange: (value: any) => void;

    inputOnBlur: (value: any) => void;
    selectOnBlur: (value: any) => void;

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
};

const PhoneNumberAndCountryField = ({
    inputName,
    selectName,
    inputId,
    selectId,
    label,
    inputPlaceholder,
    selectPlaceholder,
    inputValue,
    selectValue,
    inputOnChange,
    selectOnChange,
    inputOnBlur,
    selectOnBlur,
    inputClassname,
    selectClassname,
    inputError,
    selectError,
    inputDisabled = false,
    selectDisabled = false,
    info,
    tooltipTitle,
    tooltipDescription,
    variant,
}: PhoneNumberAndCountryFieldProps) => (
    <div className="w-full space-y-1">
        <label
            className={cn(
                "label text-sm block font-medium text-nowrap",
                variant === "filled" ? "text-white" : "text-grey-900",
                info && "flex items-center gap-3"
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
        <div
            className={cn(
                "flex gap-1 items-end",
                selectError || (inputError && "pb-5")
            )}
        >
            <SelectCountry
                labels={en}
                name={selectName}
                id={selectId}
                type="text"
                // label={label}
                placeholder={selectPlaceholder}
                value={selectValue}
                onChange={selectOnChange}
                error={selectError}
                className={selectClassname}
                onBlur={selectOnBlur}
                disabled={selectDisabled}
                width="!max-h-[116px] !min-w-[116px]"
            />
            <div className={cn("w-full space-y-1", inputError && "-mb-[25px]")}>
                <InputField
                    name={inputName}
                    id={inputId}
                    type="text"
                    placeholder={inputPlaceholder}
                    onChange={inputOnChange}
                    value={inputValue}
                    onBlur={inputOnBlur}
                    disabled={inputDisabled}
                />
                {inputError && (
                    <p className="text-[#e7000b] text-sm mt-2">{inputError}</p>
                )}
            </div>
        </div>
    </div>
);

export default PhoneNumberAndCountryField;
