// import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React from "react";
type Props = { backLink: string; className?: string };
export default function BackLink({ backLink, className }: Props) {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <span
            className="flex items-center gap-0.5 text-primary-500 fill-primary-500 cursor-pointer w-[80px]"
            onClick={handleGoBack}
            // Add keyboard accessibility
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleGoBack();
                }
            }}
        >
            {/* <CaretLeft size={18} fill="inherit" /> */}
            <span className="text-sm 2xl:text-base font-medium">Cancel</span>
        </span>
    );
}
