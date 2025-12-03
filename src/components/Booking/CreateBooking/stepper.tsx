import { Fragment, ReactNode } from "react";
import Icons from "@/components/general/forms/icons";
import cn from "classnames";
import { Spinner } from "@/components/general/spinner";

export const Stepper = ({
    steps,
    children,
    currentStep,
}: {
    steps: string[];
    children: ReactNode;
    currentStep: number;
}) => {
    return (
        <>
            <div className="flex justify-between items-center gap-2">
                {steps.map((step, index) => (
                    <Fragment key={index}>
                        <div className="flex items-center justify-between gap-6">
                            <div
                                className={`flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full border-grey-500 border-[1.5px] text-xs ${currentStep > index
                                    ? "bg-[#0673ff] border-[#0673ff] text-white"
                                    : currentStep === index
                                        ? "bg-[#667185] text-white"
                                        : "text-grey-500"
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <p className="font-medium text-base 3xl:text-xl text-grey-500 hidden md:block">
                                {step}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="text-black">{Icons.ic_chevron_right}</div>
                        )}
                    </Fragment>
                ))}
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
    handleSubmit,
    handleSaveDraft,
    disableSubmitButton,
    disableSaveDraftButton = false,
    disableNextButton,
    isSubmitloading,
    isSaveDraftloading,
    isNextLoading,
    showSaveDraftButton,
}: {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    submitText?: string;

    disableSubmitButton?: boolean;
    disableSaveDraftButton?: boolean;
    disableNextButton?: boolean;

    handleSubmit?: () => void;
    handleSaveDraft?: () => void;

    isSubmitloading?: boolean;
    isSaveDraftloading?: boolean;
    isNextLoading?: boolean;

    showSaveDraftButton?: boolean;
}) => {
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }

    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    return (
        <div className="fixed bottom-0 left-0 w-full py-4 3xl:py-6 px-4 sm:px-8 lg:px-[52px]">

            <div className="flex justify-between">
                {currentStep >= 0 && (
                    <StepperButton
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="sm:border-2 sm:border-grey-600"
                        type="button"
                    >
                        {Icons.ic_chevron_left} <span>Previous</span>
                    </StepperButton>
                )}

                <div className="flex items-center gap-3 justify-end w-full">

                    {showSaveDraftButton && (
                        <StepperButton
                            onClick={handleSaveDraft}
                            disabled={isSaveDraftloading || disableSaveDraftButton}
                            className="sm:border-2 sm:border-grey-600 text-grey-600 disabled:text-grey-300 disabled:sm:border-grey-300"
                            type="button"
                        >
                            <span>Save Draft</span> {isSaveDraftloading && <Spinner />}
                        </StepperButton>
                    )}
                    {
                        submitText ? (
                            <StepperButton
                                onClick={handleSubmit}
                                disabled={disableSubmitButton || isSubmitloading}
                                className="px-6 3xl:!px-8 bg-transparent sm:bg-primary-500 text-primary-500 sm:text-white disabled:sm:bg-grey-300"
                                type="button"
                            >
                                <span>{submitText}</span>{" "}
                            // {isSubmitloading ? <Spinner /> : Icons.ic_chevron_right}
                            </StepperButton>
                        ) : currentStep === 0 ?

                            <StepperButton
                                // Button to be clicked if formik is not handling the next step
                                // onClick={handleNext}
                                disabled={
                                    currentStep === steps.length ||
                                    disableNextButton ||
                                    isNextLoading
                                }
                                className="px-6 3xl:!px-8 bg-transparent cursor-pointer sm:bg-[#0673ff] text-primary-500 sm:text-white disabled:sm:bg-grey-300"
                                type="submit"
                            >
                                <span>Next</span>{" "}
                                {isNextLoading ? <Spinner /> : Icons.ic_chevron_right}
                            </StepperButton> : (
                                // Button clicked if formik is handling next step
                                <StepperButton
                                    onClick={handleNext}
                                    disabled={
                                        currentStep === steps.length ||
                                        disableNextButton ||
                                        isNextLoading
                                    }
                                    className="px-6 3xl:!px-8 cursor-pointer  bg-[#0673ff] text-white"
                                // type="submit"
                                >
                                    <span>Next</span>{" "}
                                    {isNextLoading ? <Spinner /> : Icons.ic_chevron_right}
                                </StepperButton>
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
            "py-2 sm:py-3 3xl:py-4 px-2 sm:px-4 3xl:px-6 rounded-[43px] flex items-center gap-1 3xl:gap-2 text-xs 3xl:text-base font-semibold",
            className
        )}
        onClick={onClick}
    >
        {children}
    </button>
);
