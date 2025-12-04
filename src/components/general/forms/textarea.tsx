import { ReactNode } from "react";
import cn from "classnames";
import Tooltip from "./tooltip";

type TextAreaProps = {
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

const TextArea = ({
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
    onChange,
    toggleShowPassword,
    ...rest
}: TextAreaProps) => (
    <div className={cn("w-full space-y-1", className)}>
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
        <div className="relative">
            <textarea
                id={id}
                placeholder={placeholder}
                onChange={onChange}
                onBlur={rest.onBlur}
                value={rest.value}
                className={cn(
                    "w-full rounded-[18px] resize-none p-4 text-sm h-[56px] gap-[5px] outline-none data-[placeholder]:text-grey-400 min-h-[130px] disabled:bg-grey-100 disabled:text-grey-400 disabled:border-grey-300",
                    icon ? "pr-8" : "",
                    inputClass,
                    error
                        ? "border border-error-500 focus:border-error-500"
                        : variant === "filled"
                            ? "bg-grey-800 text-grey-400 border-none"
                            : "bg-white text-grey-900 border border-[#E4E7EC] hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_#1E93FF1A]"
                )}
                {...rest}
            />
        </div>
        {error && error.includes("minimum") ? (
            <p className="text-grey-500 text-sm mt-2">
                <span className="bg-error-75 w-[100px] h-2 rounded-3xl inline-block mr-3" />
                {error}
            </p>
        ) : (
            error && <p className="text-error-500 text-sm mt-2">{error}</p>
        )}
    </div>
);

export default TextArea;
