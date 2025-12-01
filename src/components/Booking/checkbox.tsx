import { ReactNode, useState } from "react";
import Icons from "../general/forms/icons";


import * as Checkbox from "@radix-ui/react-checkbox";
import cn from "classnames";

type GroupCheckBoxProps = {
    feature: string;
    onChange: (feature: string, checked: boolean) => void;
    checkedValues: string[];
};

export const GroupCheckBox = ({
    feature,
    onChange,
    checkedValues,
}: GroupCheckBoxProps) => {
    return (
        <div className="flex items-center space-x-3">
            <Checkbox.Root
                className={cn(
                    "w-6 h-6 rounded",
                    checkedValues.includes(feature.replace(/\s+/g, ""))
                        ? "bg-primary-400"
                        : "bg-white border-[1.5px] border-grey-300"
                )}
                checked={checkedValues.includes(feature.replace(/\s+/g, ""))}
                onCheckedChange={(checked) =>
                    onChange(feature.replace(/\s+/g, ""), checked as boolean)
                }
                id={feature}
            >
                <Checkbox.Indicator className="flex items-center justify-center text-white">
                    {Icons.ic_check}
                </Checkbox.Indicator>
            </Checkbox.Root>
            <label htmlFor={feature} className="text-sm capitalize">
                {feature}
            </label>
        </div>
    );
};

type SingleCheckBoxProps = {
    id: string;
    onChange: (checked: boolean) => void;
    checked: boolean;
    children?: ReactNode;
};

export const SingleCheckBox = ({
    id,
    onChange,
    checked,
    children,
}: SingleCheckBoxProps) => {
    return (
        <div className="flex items-center space-x-3">
            <Checkbox.Root
                className={cn(
                    "w-6 h-6 rounded",
                    checked ? "bg-primary-400" : "bg-white border-[1.5px] border-grey-300"
                )}
                checked={checked}
                onCheckedChange={onChange}
                id={id}
            >
                <Checkbox.Indicator className="flex items-center justify-center text-white">
                    {Icons.ic_check}
                </Checkbox.Indicator>
            </Checkbox.Root>
            {children}
        </div>
    );
};
