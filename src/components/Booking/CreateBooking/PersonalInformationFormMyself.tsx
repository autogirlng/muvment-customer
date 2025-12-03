import { Formik, Form } from "formik";
import { StepperNavigation } from "./stepper";
import InputField from "@/components/general/forms/inputField";
import { personalInformationMyselfSchema } from "@/utils/validationSchema";
import { PersonalInformationMyselfValues } from "@/types/booking";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
// import {
//   saveAndUpdateBookingInformation,
// } from "@/utils/functions";
import { getCountryCallingCode } from "react-phone-number-input";
import { useEffect, useState } from "react";
// import { useAppSelector } from "@/lib/hooks";




export const replaceCharactersWithString = (str: string): string => {
    return str.replace(/\D/g, "");
};

const getPrefillUserValuesForBooking = (values: any, user?: any) => {
    if (user?.firstName && user?.lastName && user?.email) {
        return {
            ...values,
            guestName: `${user.firstName} ${user.lastName}`,
            guestEmail: user.email,
            guestPhoneNumber: user.phoneNumber,
            country: user.country,
            countryCode: user.countryCode,
        };
    }
    return values;
};

export const getExistingBookingInformation = (
    values: any,
    vehicleId: string,
    formType: string,
    user?: any | null
) => {
    const bookingInformation = localStorage.getItem("bookingInformation");

    if (bookingInformation) {
        const bookingInformationObject = JSON.parse(bookingInformation);
        return bookingInformationObject[vehicleId]?.[formType] || values;
    }

    return getPrefillUserValuesForBooking(values, user);
};


type Props = {
    steps: string[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
    vehicleId: string;
    type: "user" | "guest";
};

const initialValues: PersonalInformationMyselfValues = {
    guestName: "",
    guestEmail: "",
    guestPhoneNumber: "",
    country: "NG",
    countryCode: "+234",
    secondaryPhoneNumber: "",
    secondaryCountry: "NG",
    secondaryCountryCode: "+234",
    isForSelf: true,
};



const PersonalInformationFormMyself = ({
    steps,
    currentStep,
    setCurrentStep,
    vehicleId,
    type,
}: Props) => {
    const [showSecondaryPhoneNumber, setShowSecondaryPhoneNumber] =
        useState<boolean>(false);
    // const { user } = useAppSelector((state) => state.user);

    useEffect(() => {
        sessionStorage.removeItem("userBookingInformation")
    }, [])
    return (
        <Formik
            initialValues={getExistingBookingInformation(
                initialValues,
                vehicleId,
                "personalInformation",
                // type === "user" && user ? user : undefined
            )}
            validationSchema={personalInformationMyselfSchema}
            onSubmit={(values, { setSubmitting }) => {
                // saveAndUpdateBookingInformation(
                //     values,
                //     vehicleId,
                //     "personalInformation"
                // );
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
                        name="guestName"
                        id="guestName"
                        type="text"
                        label="Full name"
                        placeholder="Enter your full name"
                        value={values.guestName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                            errors.guestName && touched.guestName
                                ? String(errors.guestName)
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
                        label="Phone number- primary"
                        inputPlaceholder="Enter phone number"
                        selectPlaceholder="+234"
                        inputValue={values.guestPhoneNumber}
                        selectValue={values.country}
                        inputOnChange={(event) => {
                            const number = replaceCharactersWithString(event.target.value);
                            setFieldTouched("guestPhoneNumber", true);
                            setFieldValue("guestPhoneNumber", number);
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
                            errors.guestPhoneNumber && touched.guestPhoneNumber
                                ? String(errors.guestPhoneNumber)
                                : ""
                        }
                        selectError={
                            errors.country && touched.country ? String(errors.country) : ""
                        }
                    />


                    {/* {showSecondaryPhoneNumber && (
                        <PhoneNumberAndCountryField
                            inputName="secondaryPhoneNumber"
                            selectName="secondaryCountry"
                            inputId="secondaryPhoneNumber"
                            selectId="secondaryCountry"
                            label="Phone number- Secondary (optional)"
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
                        className="text-sm md:text-base 3xl:text-xl text-primary-500"
                        onClick={() =>
                            setShowSecondaryPhoneNumber(!showSecondaryPhoneNumber)
                        }
                    >
                        {showSecondaryPhoneNumber
                            ? "Hide secondary phone number"
                            : "Add secondary phone number"}
                    </button> */}

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
