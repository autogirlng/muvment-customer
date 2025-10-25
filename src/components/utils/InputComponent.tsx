// components/ui/Input.tsx
import React from "react";

interface InputProps {
  label?: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  fluid?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = "",
  fluid = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={`${fluid ? "w-full" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-[18px] border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${fluid ? "w-full" : ""}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
