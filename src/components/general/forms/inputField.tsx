import { ReactNode } from "react";
import cn from "classnames";
import Tooltip from "./tooltip";

type InputFieldProps = {
    name: string;
    id: string;
    type?: string;
    label?: string;
    placeholder: string;
    variant?: "outlined" | "filled";
    icon?: ReactNode;
    value?: string | any;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    info?: boolean;
    tooltipTitle?: string;
    tooltipDescription?: string;
    inputClass?: string;
    className?: string;

    toggleShowPassword?: () => void;
    [key: string]: any;
};

const InputField = ({
    id,
    label,
    placeholder,
    variant,
    type,
    icon,
    error,
    info,
    tooltipTitle,
    tooltipDescription,
    inputClass,
    className,
    toggleShowPassword,
    ...rest
}: InputFieldProps) => (
    <div className={cn("w-full space-y-1", className)}>
        {label && (
            <label
                htmlFor={id}
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
        )}
        <div className="relative">
            <input
                type={type || "text"}
                id={id}
                placeholder={placeholder}
                className={cn(
                    "w-full rounded-[18px] p-4 text-sm h-[56px] gap-[5px] outline-none data-[placeholder]:text-grey-400 disabled:bg-grey-100 disabled:text-grey-400 disabled:border-grey-300",
                    icon ? "pr-8" : "",
                    inputClass,
                    error
                        ? "border border-[#e7000b] focus:border-[#e7000b]"
                        : variant === "filled"
                            ? "bg-grey-800 text-grey-400 border-none"
                            : "bg-white text-grey-900 border border-[#d0d5dd] hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_#1E93FF1A]"
                )}
                autoCorrect="off"
                spellCheck="false"
                autoComplete={`new-${type || "text"}`}
                {...rest}
            />
            {(id === "password" ||
                id === "confirmPassword" ||
                id === "currentPassword") && (
                    <div
                        className="absolute right-3 bottom-[19px] fill-grey-500 cursor-pointer"
                        onClick={toggleShowPassword}
                    >
                        {icon}
                    </div>
                )}
        </div>
        {error && <p className="text-[#e7000b] text-sm mt-2">{error}</p>}
    </div>
);

export default InputField;
