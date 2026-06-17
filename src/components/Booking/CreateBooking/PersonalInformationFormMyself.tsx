import { Formik, Form } from "formik";
import { StepperNavigation } from "./stepper";
import InputField from "@/components/general/forms/inputField";
import { personalInformationMyselfSchema } from "@/utils/validationSchema";
import { PersonalInformationMyselfValues } from "@/types/booking";
import PhoneNumberAndCountryField from "@/components/general/forms/phoneNumberAndCountryField";
import { getCountryCallingCode } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProfileService } from "@/controllers/user/profile.service";
import { replaceCharactersWithString } from "./PersonalInformationFormOthers";
import PersistBookingDraft from "./PersistBookingDraft";

const splitPhone = (raw?: string) => {
  if (!raw) return { country: "NG", countryCode: "+234", local: "" };
  const e164 = raw.startsWith("+") ? raw : "+" + raw.replace(/^0+/, "");
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed && parsed.country) {
    return {
      country: parsed.country as string,
      countryCode: "+" + parsed.countryCallingCode,
      local: parsed.nationalNumber as string,
    };
  }
  let local = raw.replace(/[^\d]/g, "");
  if (local.startsWith("234")) local = local.slice(3);
  local = local.replace(/^0+/, "");
  return { country: "NG", countryCode: "+234", local };
};

type Props = {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  vehicleId: string;
  type: "user" | "guest";
  hideNavigation?: boolean;
};

const PersonalInformationFormMyself = ({
  steps,
  currentStep,
  setCurrentStep,
  vehicleId,
  type,
  hideNavigation,
}: Props) => {
  const [showSecondaryPhoneNumber, setShowSecondaryPhoneNumber] =
    useState<boolean>(false);
  const [bookingInformationValues, setBookingInformationValues] =
    useState<PersonalInformationMyselfValues | null>(null);

  const { user } = useAuth();

  const [profilePhone, setProfilePhone] = useState<string>("");

  // The login response doesn't include the phone number, so when the signed-in
  // user has none on the auth object, pull it from their profile to prefill.
  useEffect(() => {
    if (!user || user.phoneNumber) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await ProfileService.getMyProfile();
        const respData: any = response?.data;
        const first = Array.isArray(respData) ? respData[0] : respData;
        const profileData: any = first && (first.data ?? first);
        const phone = profileData?.phoneNumber || "";
        if (!cancelled && phone) setProfilePhone(phone);
      } catch {
        // best effort; leave the field empty if the profile can't be loaded
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const userPhone = useMemo(
    () => splitPhone(user?.phoneNumber || profilePhone),
    [user, profilePhone],
  );

  const initialValues = useMemo(
    () => ({
      guestFullName:
        bookingInformationValues?.guestFullName ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : ""),
      guestEmail: bookingInformationValues?.guestEmail || user?.email || "",
      primaryPhoneNumber:
        bookingInformationValues?.primaryPhoneNumber || userPhone.local || "",
      country: bookingInformationValues?.country || userPhone.country || "NG",
      countryCode:
        bookingInformationValues?.countryCode || userPhone.countryCode || "+234",
      secondaryPhoneNumber:
        bookingInformationValues?.secondaryPhoneNumber || "",
      secondaryCountry: bookingInformationValues?.secondaryCountry || "NG",
      secondaryCountryCode:
        bookingInformationValues?.secondaryCountryCode || "+234",
      isBookingForOthers: false,
    }),
    [bookingInformationValues, user, userPhone],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("userBookingInformation");
    if (stored) {
      try {
        const userBookingValues = JSON.parse(
          stored,
        ) as PersonalInformationMyselfValues;
        if (!userBookingValues?.isBookingForOthers) {
          setBookingInformationValues(userBookingValues);
        }
        if (userBookingValues?.secondaryPhoneNumber) {
          setShowSecondaryPhoneNumber(true);
        }
      } catch (error) {
        console.error(
          "Failed to parse booking information from sessionStorage:",
          error,
        );
      }
    }
  }, []);
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={personalInformationMyselfSchema}
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

        // Store the national number only. The country code is applied once
        // downstream when the booking is created.
        const formattedValues = {
          ...values,
          primaryPhoneNumber: values.primaryPhoneNumber.replace(/^0+/, ""),
          ...(values.secondaryPhoneNumber && {
            secondaryPhoneNumber: values.secondaryPhoneNumber.replace(/^0+/, ""),
          }),
        };

        const bookingData =
          bookingInfomation && typeof bookingInfomation === "object"
            ? { ...bookingInfomation, ...formattedValues }
            : formattedValues;

        sessionStorage.setItem(
          "userBookingInformation",
          JSON.stringify(bookingData),
        );
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
      }) => {
        return (
          <Form className="max-w-[700px] w-full space-y-5">
            <PersistBookingDraft />
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
                const number = replaceCharactersWithString(
                  event.target.value,
                ).replace(/^0+/, "");
                setFieldTouched("primaryPhoneNumber", true);
                setFieldValue("primaryPhoneNumber", number);
              }}
              selectOnChange={(value: string) => {
                const countryCode = `+${getCountryCallingCode(value as any)}`;
                setFieldValue("country", value);
                setFieldValue("countryCode", countryCode);
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
                inputValue={values.secondaryPhoneNumber}
                selectValue={values.secondaryCountry}
                inputOnChange={(event) => {
                  const number = replaceCharactersWithString(
                    event.target.value,
                  ).replace(/^0+/, "");
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
                selectClassname="!w-[130px]"
                // ✅ Error will now show under input if phone is invalid
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
                tooltipDescription="Add an extra phone number we can reach you on if your primary line isn't available."
              />
            )}
            <button
              type="button"
              className="text-sm md:text-base 3xl:text-xl text-[#0673ff] cursor-pointer"
              onClick={() => {
                if (showSecondaryPhoneNumber) {
                  setFieldValue("secondaryPhoneNumber", "");
                  setFieldTouched("secondaryPhoneNumber", false);
                }
                setShowSecondaryPhoneNumber(!showSecondaryPhoneNumber);
              }}
            >
              {showSecondaryPhoneNumber
                ? "Remove secondary phone number"
                : "Add secondary phone number"}
            </button>

            {!hideNavigation && (
              <StepperNavigation
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                handleSaveDraft={() => {}}
                isSaveDraftloading={false}
                isNextLoading={isSubmitting}
                disableNextButton={isSubmitting}
              />
            )}
          </Form>
        );
      }}
    </Formik>
  );
};
export default PersonalInformationFormMyself;
