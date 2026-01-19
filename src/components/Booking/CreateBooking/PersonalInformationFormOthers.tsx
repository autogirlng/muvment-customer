import { useEffect, useState, useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import InputField from "@/components/general/forms/inputField";
import { StepperNavigation } from "./stepper";
import { personalInformationOthersSchema } from "@/utils/validationSchema";
import { PersonalInformationOthersValues } from "@/types/booking";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
import { getCountryCallingCode } from "react-phone-number-input";

type Props = {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicleId: string;
    isOthers: boolean;
};





export const replaceCharactersWithString = (str: string): string => {
    return str.replace(/\D/g, "");
};

const PersonalInformationFormOthers = ({
    steps,
    currentStep,
    setCurrentStep,
    isOthers
}: Props) => {

    const [bookingInformationValues, setBookingInformationValues] = useState<PersonalInformationOthersValues | null>(null)

    const initialValues: PersonalInformationOthersValues = useMemo(() => ({
        recipientFullName: bookingInformationValues?.recipientFullName || "",
        recipientEmail: bookingInformationValues?.recipientEmail || "",
        recipientPhoneNumber: bookingInformationValues?.recipientPhoneNumber || "",
        recipientSecondaryPhoneNumber: bookingInformationValues?.recipientSecondaryPhoneNumber || "",
        country: "NG",
        countryCode: "+234",
        userCountry: "NG",
        userCountryCode: "+234",
        isBookingForOthers: true,
    }), [bookingInformationValues]);



    useEffect(() => {
        const stored = sessionStorage.getItem("userBookingInformation");
        if (stored) {
            try {
                const userBookingValues = JSON.parse(stored) as PersonalInformationOthersValues;
                if (userBookingValues?.isBookingForOthers) {
                    setBookingInformationValues(userBookingValues);
                }
            } catch (error) {
                console.error("Failed to parse booking information for others:", error);
            }
        }
    }, []);

    return (
        <Formik
            initialValues={
                initialValues
            }
            validationSchema={personalInformationOthersSchema}
            onSubmit={(values, { setSubmitting }) => {

                const stored = sessionStorage.getItem("userBookingInformation");

                let bookingInfomation = null;

                if (stored) {
                    try {
                        bookingInfomation = JSON.parse(stored);
                    } catch (err) {
                        console.error("Invalid sessionStorage JSON:", err);
                    }
                }

                let bookingData = values;

                if (bookingInfomation && typeof bookingInfomation === "object") {
                    bookingData = { ...bookingInfomation, ...values };
                }

                sessionStorage.setItem("userBookingInformation", JSON.stringify(bookingData));

                setCurrentStep(currentStep + 1);
                setSubmitting(false);
            }}
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
        >
            <PersonalInformationFormInner
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                isOthers={isOthers}
            />
        </Formik>
    );
};

interface PersonalInformationFormInnerProps {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isOthers: boolean;
}

const PersonalInformationFormInner = ({
    steps,
    currentStep,
    setCurrentStep,
    isOthers,
}: PersonalInformationFormInnerProps) => {
    const {
        values,
        touched,
        errors,
        isValid,
        handleBlur,
        handleChange,
        setFieldTouched,
        setFieldValue,
        isSubmitting,
    } = useFormikContext<PersonalInformationOthersValues>(); // Ensure correct type is passed


    return (
        <Form className="max-w-[800px] w-full space-y-8">
            {isOthers && (
                <>

                    <InputField
                        name="recipientFullName"
                        id="recipientFullName"
                        type="text"
                        label="Passenger’s full name"
                        placeholder="Enter passenger’s full name"
                        value={values.recipientFullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                            errors.recipientFullName && touched.recipientFullName
                                ? String(errors.recipientFullName)
                                : ""
                        }
                    />
                    <PhoneNumberAndCountryField
                        inputName="recipientPhoneNumber"
                        selectName="country"
                        inputId="recipientPhoneNumber"
                        selectId="country"
                        label="Passenger’s phone number"
                        inputPlaceholder="Enter passenger’s phone number"
                        selectPlaceholder="+234"
                        inputValue={values.recipientPhoneNumber}
                        selectValue={values.country}
                        inputOnChange={(event) => {
                            const number = replaceCharactersWithString(event.target.value);
                            setFieldTouched("recipientPhoneNumber", true);
                            setFieldValue("recipientPhoneNumber", number);
                        }}
                        selectOnChange={(value: string) => {
                            const countryCode = `+${getCountryCallingCode(value as any)}`;
                            setFieldValue("country", value);
                            setFieldValue("countryCode", countryCode);
                            setFieldValue("userCountry", value);
                            setFieldValue("userCountryCode", countryCode);
                        }}
                        inputOnBlur={handleBlur}
                        selectOnBlur={handleBlur}
                        selectClassname="!w-[130px]"
                        inputError={
                            errors.recipientPhoneNumber && touched.recipientPhoneNumber
                                ? String(errors.recipientPhoneNumber)
                                : ""
                        }
                        selectError={
                            errors.country && touched.country ? String(errors.country) : ""
                        }
                    />
                    <InputField
                        name="recipientEmail"
                        id="recipientEmail"
                        type="text"
                        label="Passenger’s email"
                        placeholder="Enter passenger’s email"
                        value={values.recipientEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                            errors.recipientEmail && touched.recipientEmail
                                ? String(errors.recipientEmail)
                                : ""
                        }
                    />
                </>
            )}


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
    );
};

export default PersonalInformationFormOthers;
