import { Fragment, ReactNode } from "react";
import Icons from "@/components/general/forms/icons";
import cn from "classnames";
import { Spinner } from "@/components/general/spinner";

const CheckIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
        <path
            d="M5 10.5L8.5 14L15 6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const Stepper = ({
    steps,
    children,
    currentStep,
}: {
    steps: string[];
    children: ReactNode;
    currentStep: number;
}) => {
    const total = steps.length;
    return (
        <>
            {/* Mobile progress */}
            <div className="lg:hidden space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-grey-900">
                        Step {currentStep + 1} of {total}
                    </span>
                    <span className="text-sm text-grey-500">{steps[currentStep]}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-grey-200 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[#0673ff] transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Desktop progress */}
            <div className="hidden lg:flex items-center w-full">
                {steps.map((step, index) => {
                    const completed = currentStep > index;
                    const active = currentStep === index;
                    return (
                        <Fragment key={index}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-9 h-9 3xl:w-10 3xl:h-10 rounded-full border-[1.5px] text-sm font-semibold transition-colors",
                                        completed
                                            ? "bg-[#0673ff] border-[#0673ff] text-white"
                                            : active
                                                ? "border-[#0673ff] text-[#0673ff] bg-[#EAF2FF]"
                                                : "border-grey-300 text-grey-400 bg-white"
                                    )}
                                >
                                    {completed ? <CheckIcon /> : index + 1}
                                </div>
                                <p
                                    className={cn(
                                        "text-base 3xl:text-xl font-medium whitespace-nowrap transition-colors",
                                        active
                                            ? "text-grey-900"
                                            : completed
                                                ? "text-[#0673ff]"
                                                : "text-grey-400"
                                    )}
                                >
                                    {step}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-[2px] mx-4 rounded bg-grey-200 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full bg-[#0673ff] transition-all duration-500",
                                            completed ? "w-full" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>

            {/* ========== content here ========== */}
            {children}
            {/* ========== content here ========== */}
        </>
    );
};

export const StepperNavigation = ({
    steps,
    currentStep,
    setCurrentStep,
    submitText,
    nextText = "Next",
    handleSubmit,
    handleSaveDraft,
    disableSubmitButton,
    disableSaveDraftButton = false,
    disableNextButton,
    isSubmitloading,
    isSaveDraftloading,
    isNextLoading,
    showSaveDraftButton,
    priceText,
}: {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    submitText?: string;
    nextText?: string;

    disableSubmitButton?: boolean;
    disableSaveDraftButton?: boolean;
    disableNextButton?: boolean;

    handleSubmit?: () => void;
    handleSaveDraft?: () => void;

    isSubmitloading?: boolean;
    isSaveDraftloading?: boolean;
    isNextLoading?: boolean;

    showSaveDraftButton?: boolean;
    priceText?: string;
}) => {
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-grey-200 py-3 sm:py-4 3xl:py-6 px-4 sm:px-8 lg:px-[52px] z-40">
            <div className="max-w-[1200px] 3xl:max-w-[1320px] mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {!(currentStep === 0) && currentStep >= 0 && (
                        <StepperButton
                            onClick={handleBack}
                            className="border-2 border-grey-300 text-grey-700 hover:bg-grey-50 cursor-pointer"
                            type="button"
                        >
                            {Icons.ic_chevron_left} <span>Previous</span>
                        </StepperButton>
                    )}
                    {priceText && (
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs text-grey-500">Total</span>
                            <span className="text-base sm:text-lg font-bold text-grey-900">
                                {priceText}
                            </span>
                        </div>
                    )}
                </div>

                <div className={cn("flex items-center gap-3 justify-end", priceText ? "flex-shrink-0" : "w-full")}>
                    {showSaveDraftButton && (
                        <StepperButton
                            onClick={handleSaveDraft}
                            disabled={isSaveDraftloading || disableSaveDraftButton}
                            className="border-2 border-grey-600 text-grey-600 disabled:text-grey-300 disabled:border-grey-300"
                            type="button"
                        >
                            <span>Save Draft</span> {isSaveDraftloading && <Spinner />}
                        </StepperButton>
                    )}
                    {submitText ? (
                        <StepperButton
                            onClick={handleSubmit}
                            disabled={disableSubmitButton || isSubmitloading}
                            className={cn(
                                "justify-center cursor-pointer bg-[#0673ff] text-white hover:opacity-90 disabled:bg-[#80b9ff]",
                                priceText ? "w-auto" : "w-full sm:w-auto",
                            )}
                            type="button"
                        >
                            <span>{submitText}</span>
                            {isSubmitloading && <Spinner />}
                        </StepperButton>
                    ) : currentStep === 0 ? (
                        <StepperButton
                            disabled={disableNextButton || isNextLoading}
                            className="w-full sm:w-auto justify-center cursor-pointer bg-[#0673ff] text-white disabled:bg-grey-300"
                            type="submit"
                        >
                            <span>{nextText}</span>{" "}
                            {isNextLoading ? <Spinner /> : Icons.ic_chevron_right}
                        </StepperButton>
                    ) : (
                        !(currentStep === steps.length || disableNextButton || isNextLoading) && (
                            <StepperButton className="w-full sm:w-auto justify-center cursor-pointer disabled:bg-[#80b9ff] bg-[#0673ff] text-white">
                                <span>{nextText}</span>{" "}
                                {isNextLoading ? <Spinner /> : Icons.ic_chevron_right}
                            </StepperButton>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const StepperButton = ({
    children,
    onClick,
    className,
    ...rest
}: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    [key: string]: any;
}) => (
    <button
        {...rest}
        className={cn(
            "py-3 3xl:py-4 px-5 sm:px-6 3xl:px-8 rounded-full flex items-center gap-1 3xl:gap-2 text-sm 3xl:text-base font-semibold transition-colors",
            className
        )}
        onClick={onClick}
    >
        {children}
    </button>
);
