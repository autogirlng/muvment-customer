import { Formik, Form } from "formik";
import { StepperNavigation } from "./stepper";
import InputField from "@/components/general/forms/inputField";
import { personalInformationMyselfSchema } from "@/utils/validationSchema";
import { PersonalInformationMyselfValues } from "@/types/booking";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
import { getCountryCallingCode } from "react-phone-number-input";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";



export const replaceCharactersWithString = (str: string): string => {
    return str.replace(/\D/g, "");
};



type Props = {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicleId: string;
    type: "user" | "guest";
};




const PersonalInformationFormMyself = ({
    steps,
    currentStep,
    setCurrentStep,
    vehicleId,
    type,
}: Props) => {
    const [showSecondaryPhoneNumber, setShowSecondaryPhoneNumber] = useState<boolean>(false);
    const { user } = useAuth();


    const initialValues: PersonalInformationMyselfValues = {
        guestFullName: user?.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "",
        guestEmail: user?.email || "",
        primaryPhoneNumber: user?.phoneNumber || '',
        country: "NG",
        countryCode: "+234",
        secondaryPhoneNumber: "",
        secondaryCountry: "NG",
        secondaryCountryCode: "+234",
        isBookingForOthers: false,
    };



    useEffect(() => {
        sessionStorage.removeItem("userBookingInformation")
    }, [])
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={personalInformationMyselfSchema}
            onSubmit={(values, { setSubmitting }) => {
                sessionStorage.setItem("userBookingInformation", JSON.stringify(values))
                setCurrentStep(currentStep + 1);
                setSubmitting(false);

            }}
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
        >
            {({
                values,
                touched,
                errors,
                isValid,
                dirty,
                handleBlur,
                handleChange,
                setFieldTouched,
                setFieldValue,
                isSubmitting,
            }) => (
                <Form className="max-w-[700px] w-full space-y-5">
                    <InputField
                        name="guestFullName"
                        id="guestFullName"
                        type="text"
                        label="Full name"
                        placeholder="Enter your full name"
                        value={values.guestFullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                            errors.guestFullName && touched.guestFullName
                                ? String(errors.guestFullName)
                                : ""
                        }
                    />

                    <InputField
                        name="guestEmail"
                        id="guestEmail"
                        type="text"
                        label="Email Address"
                        placeholder="Enter your email address"
                        value={values.guestEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                            errors.guestEmail && touched.guestEmail
                                ? String(errors.guestEmail)
                                : ""
                        }
                    />

                    <PhoneNumberAndCountryField
                        inputName="guestPhoneNumber"
                        selectName="country"
                        inputId="guestPhoneNumber"
                        selectId="country"
                        label="Phone number - Primary"
                        inputPlaceholder="Enter phone number"
                        selectPlaceholder="+234"
                        inputValue={values.primaryPhoneNumber}
                        selectValue={values.country}
                        inputOnChange={(event) => {
                            const number = replaceCharactersWithString(event.target.value);
                            setFieldTouched("primaryPhoneNumber", true);
                            setFieldValue("primaryPhoneNumber", number);
                        }}
                        selectOnChange={(value: string) => {
                            const countryCode = `+${getCountryCallingCode(value as any)}`;
                            setFieldValue("country", value);
                            setFieldValue("countryCode", countryCode);
                            setFieldValue("secondaryCountry", value);
                            setFieldValue("secondaryCountryCode", countryCode);
                        }}
                        inputOnBlur={handleBlur}
                        selectOnBlur={handleBlur}
                        // inputClassname
                        selectClassname="!w-[130px]"
                        inputError={
                            errors.primaryPhoneNumber && touched.primaryPhoneNumber
                                ? String(errors.primaryPhoneNumber)
                                : ""
                        }
                        selectError={
                            errors.country && touched.country ? String(errors.country) : ""
                        }
                    />


                    {showSecondaryPhoneNumber && (
                        <PhoneNumberAndCountryField
                            inputName="secondaryPhoneNumber"
                            selectName="secondaryCountry"
                            inputId="secondaryPhoneNumber"
                            selectId="secondaryCountry"
                            label="Phone number - Secondary (optional)"
                            inputPlaceholder="Enter phone number"
                            selectPlaceholder="+234"
                            selectDisabled
                            inputValue={values.secondaryPhoneNumber}
                            selectValue={values.secondaryCountry}
                            inputOnChange={(event) => {
                                const number = replaceCharactersWithString(event.target.value);

                                setFieldTouched("secondaryPhoneNumber", true);
                                setFieldValue("secondaryPhoneNumber", number);
                            }}
                            selectOnChange={(value: string) => {
                                const countryCode = `+${getCountryCallingCode(value as any)}`;
                                setFieldValue("secondaryCountry", value);
                                setFieldValue("secondaryCountryCode", countryCode);
                            }}
                            inputOnBlur={handleBlur}
                            selectOnBlur={handleBlur}
                            // inputClassname
                            selectClassname="!w-[130px]"
                            inputError={
                                errors.secondaryPhoneNumber && touched.secondaryPhoneNumber
                                    ? String(errors.secondaryPhoneNumber)
                                    : ""
                            }
                            selectError={
                                errors.secondaryCountry && touched.secondaryCountry
                                    ? String(errors.secondaryCountry)
                                    : ""
                            }
                            info
                            tooltipTitle=""
                            tooltipDescription="Add an extra phone number we can reach you on if your primary line isn’t available. This helps us contact you faster in case of urgent updates or booking issues"
                        />
                    )}
                    <button
                        type="button"
                        className="text-sm md:text-base 3xl:text-xl text-[#0673ff] cursor-pointer"
                        onClick={() => setShowSecondaryPhoneNumber(!showSecondaryPhoneNumber)}>
                        {showSecondaryPhoneNumber
                            ? "Hide secondary phone number"
                            : "Add secondary phone number"}
                    </button>

                    <StepperNavigation
                        steps={steps}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        handleSaveDraft={() => { }}
                        isSaveDraftloading={false}
                        isNextLoading={isSubmitting}
                        disableNextButton={!isValid || isSubmitting}
                    />
                </Form>
            )}
        </Formik>
    );
};
export default PersonalInformationFormMyself;
