import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import React from "react";

type Props = { backLink: string; className?: string; label?: string };

export default function BackLink({
    backLink,
    className,
    label = "Cancel",
}: Props) {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <button
            type="button"
            onClick={handleGoBack}
            className={`inline-flex items-center gap-2 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-50 hover:border-grey-400 cursor-pointer ${className || ""}`}
            aria-label={label}
        >
            <FiArrowLeft className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );
}
