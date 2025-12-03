import cn from "classnames";

import SelectInput from "./select";
import Icons from "./icons";

type SelectCountryProps = {
  name: string;
  id: string;
  label?: string;
  placeholder: string;
  variant?: "outlined" | "filled";
  value?: string | any;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  [key: string]: any;
};

const allowedCountries = [
  { flag: Icons.ic_country_nigeria, option: "+234", value: "NG" },
  // { flag: Icons.ic_country_ghana, option: "+233", value: "GH" },
];

const SelectCountry = ({
  label,
  id,
  variant,
  value,
  onChange,
  labels,
  error,
  className,
  ...rest
}: SelectCountryProps) => {
  return (
    <div className={cn("w-full space-y-1", className, error && "-mb-[28px]")}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm block font-medium",
            variant === "filled" ? "text-white" : "text-grey-900"
          )}
        >
          {label}
        </label>
      )}
      <SelectInput
        defaultValue="NG"
        variant="outlined"
        id="bank"
        options={allowedCountries}
        value={value}
        onChange={(value) => onChange(value)}
        error={error}
        profile
        {...rest}
      />
    </div>
  );
};

export default SelectCountry;
