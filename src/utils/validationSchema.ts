import { array, object, ref, string } from "yup";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";

export const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePhoneNumber = (
  phoneNumber: string,
  country: CountryCode,
) => {
  // let isPhoneNumberValid = false;
  // if (country === "NG") {
  //   isPhoneNumberValid = phoneNumber.length === 11 || phoneNumber.length === 10;
  // } else {
  //   isPhoneNumberValid = phoneNumber.length === 10 || phoneNumber.length === 11;
  // }

  return isValidPhoneNumber(phoneNumber, country);
};

export const itineraryInformationSchema = object().shape({
  extraDetails: string().optional(),
  purposeOfRide: string().optional(),
});

export const personalInformationMyselfSchema = object().shape({
  guestFullName: string().required("Please enter your full name"),
  guestEmail: string()
    .email("Please enter a valid email address")
    .required("Please enter your email")
    .matches(emailRegEx, "Please enter a valid email address"),
  primaryPhoneNumber: string()
    .required("Please enter your phone number")
    .test("phoneNumber", "Invalid phone number", function (val) {
      const { country } = this.parent;
      return validatePhoneNumber(val, country);
    }),
});

export const personalInformationOthersSchema = object().shape({
  recipientFullName: string().required("Please enter your full name"),
  recipientEmail: string()
    .email("Please enter a valid email address")
    .required("Please enter your email")
    .matches(emailRegEx, "Please enter a valid email address"),
  recipientPhoneNumber: string()
    .required("Please enter your phone number")
    .test("phoneNumber", "Invalid phone number", function (val) {
      const { country } = this.parent;
      return validatePhoneNumber(val, country);
    }),
  //  recipientSecondaryPhoneNumber: string()
  //     .notRequired()
  //     .test("phoneNumber", "Invalid phone number", function (val) {
  //       const { country } = this.parent;
  //       return validatePhoneNumber(val || "", country);
  //     }),
});
