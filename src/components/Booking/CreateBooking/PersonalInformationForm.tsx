import { useState, useEffect } from "react"; // Import useEffect
import PersonalInformationFormMyself from "./PersonalInformationFormMyself";
// import PersonalInformationFormOthers from "./PersonalInformationFormOthers";

type Props = {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicleId: string;
    type: "user" | "guest";
};

const PersonalInformationForm = ({
    steps,
    currentStep,
    setCurrentStep,
    vehicleId,
    type,
}: Props) => {
    const [whoBookedRide, setWhoBookedRide] = useState<"myself" | "others">(
        "myself"
    );

    // isOthers state should be derived from whoBookedRide
    const [isOthers, setIsOthers] = useState<boolean>(whoBookedRide === "others"); // Initialize based on whoBookedRide

    // Use useEffect to update isOthers whenever whoBookedRide changes
    useEffect(() => {
        setIsOthers(whoBookedRide === "others");
    }, [whoBookedRide]); // Dependency array: run this effect when whoBookedRide changes

    return (
        <div className="max-w-[730px] w-full space-y-9">
            {/* <h6 className="!font-bold text-base md:text-xl 3xl:text-h6">
                Who is this ride for?
            </h6>
            <div className="flex items-center gap-9">
                <RadioInputContainer
                    name="whoBookedRide"
                    value="myself"
                    title="Myself"
                    onChange={(value) => setWhoBookedRide(value as "myself" | "others")}
                    checked={whoBookedRide === "myself"}
                />
                <RadioInputContainer
                    name="whoBookedRide"
                    value="others"
                    title="Others"
                    onChange={(value) => setWhoBookedRide(value as "myself" | "others")}
                    checked={whoBookedRide === "others"}
                />
            </div> */}
            {/* {whoBookedRide === "myself" ? (
                <PersonalInformationFormMyself
                    steps={steps}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    vehicleId={vehicleId}
                    type={type}
                />
            ) : (
                // <PersonalInformationFormOthers
                //   steps={steps}
                //   currentStep={currentStep}
                //   setCurrentStep={setCurrentStep}
                //   vehicleId={vehicleId}
                //   type={type}
                //   isOthers={isOthers} // Pass the updated isOthers state
                // />
                <></>
            )} */}
            <PersonalInformationFormMyself
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                vehicleId={vehicleId}
                type={type}
            />
        </div>
    );
};

export default PersonalInformationForm;

const RadioInputContainer = ({
    value,
    name,
    title,
    onChange,
    checked = false,
}: {
    value: string;
    name: string;
    title: string;
    onChange: (value: string) => void;
    checked?: boolean;
}) => {
    return (
        <div className="flex items-center gap-3">
            <input
                checked={checked}
                type="radio"
                id={value}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 appearance-none border-[1.5px] border-grey-300 rounded-full before:content-[''] before:block before:w-3 before:h-3 before:rounded-full before:bg-[#1e93ff] before:scale-0 before:transition before:duration-300 before:translate-y-[4.5px] before:translate-x-[4.5px] checked:before:scale-100 checked:border-[#1e93ff]"
            />
            <label
                htmlFor={value}
                className="text-sm md:text-base 3xl:text-xl !font-medium"
            >
                {title}
            </label>
        </div>
    );
};
