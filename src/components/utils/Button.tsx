import React, { forwardRef, ButtonHTMLAttributes } from "react";
function cn(...inputs: any[]): string {
  const res: string[] = [];
  const handle = (v: any) => {
    if (!v && v !== 0) return;
    const t = typeof v;
    if (t === "string" || t === "number") {
      res.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(handle);
    } else if (t === "object") {
      for (const k in v) {
        if (Object.prototype.hasOwnProperty.call(v, k) && v[k]) {
          res.push(k);
        }
      }
    }
  };
  inputs.forEach(handle);
  return res.join(" ");
}
// Color variants
type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "ghost";

// Size variants
type ButtonSize = "small" | "medium" | "large";

// Button variants
type ButtonVariant = "filled" | "outline" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color = "primary",
      size = "medium",
      variant = "filled",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Handle Enter key press
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" && !isDisabled && onClick) {
        onClick(event as any);
      }
      onKeyDown?.(event);
    };

    // Base classes
    const baseClasses = cn(
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      {
        "w-full": fullWidth,
        "cursor-not-allowed": isDisabled,
      }
    );

    // Size classes
    const sizeClasses = cn({
      "px-3 py-2 text-sm": size === "small",
      "px-4 py-2.5 text-base": size === "medium",
      "px-6 py-3 text-lg": size === "large",
    });

    // Color and variant classes
    const colorClasses = cn({
      // Filled variants
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800":
        variant === "filled" && color === "primary",
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800":
        variant === "filled" && color === "secondary",
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800":
        variant === "filled" && color === "success",
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 active:bg-yellow-700":
        variant === "filled" && color === "warning",
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800":
        variant === "filled" && color === "error",

      // Outline variants
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 active:bg-blue-700":
        variant === "outline" && color === "primary",
      "border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500 active:bg-gray-700":
        variant === "outline" && color === "secondary",
      "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500 active:bg-green-700":
        variant === "outline" && color === "success",
      "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white focus:ring-yellow-500 active:bg-yellow-600":
        variant === "outline" && color === "warning",
      "border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500 active:bg-red-700":
        variant === "outline" && color === "error",

      // Text variants
      "text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100":
        variant === "text" && color === "primary",
      "text-gray-600 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100":
        variant === "text" && color === "secondary",
      "text-green-600 hover:bg-green-50 focus:ring-green-500 active:bg-green-100":
        variant === "text" && color === "success",
      "text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500 active:bg-yellow-100":
        variant === "text" && color === "warning",
      "text-red-600 hover:bg-red-50 focus:ring-red-500 active:bg-red-100":
        variant === "text" && color === "error",

      // Ghost variant
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200":
        color === "ghost",
    });

    // Loading spinner component
    const LoadingSpinner = () => (
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
    );

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(baseClasses, sizeClasses, colorClasses, className)}
        {...props}
      >
        {/* Left Icon or Loading Spinner */}
        <span
          className={cn("flex items-center", {
            "opacity-0": loading,
          })}
        >
          {leftIcon && (
            <span
              className={cn({
                "mr-2": size === "small",
                "mr-3": size === "medium",
                "mr-4": size === "large",
              })}
            >
              {leftIcon}
            </span>
          )}
        </span>

        {/* Loading Spinner */}
        {loading && (
          <span
            className={cn("absolute", {
              "mr-2": size === "small",
              "mr-3": size === "medium",
              "mr-4": size === "large",
            })}
          >
            <LoadingSpinner />
          </span>
        )}

        {/* Button Text */}
        <span
          className={cn("transition-opacity duration-200", {
            "opacity-0": loading,
            "opacity-100": !loading,
          })}
        >
          {children}
        </span>

        {/* Right Icon */}
        {rightIcon && !loading && (
          <span
            className={cn({
              "ml-2": size === "small",
              "ml-3": size === "medium",
              "ml-4": size === "large",
            })}
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
