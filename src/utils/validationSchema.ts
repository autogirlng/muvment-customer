import { array, object, ref, string } from "yup";


export const validatePhoneNumber = (phoneNumber: string, country: string) => {
  let isPhoneNumberValid = false;
  if (country === "NG") {
    isPhoneNumberValid = phoneNumber.length === 11;
  } else {
    isPhoneNumberValid = phoneNumber.length === 10;
  }

  return isPhoneNumberValid;
};

export const itineraryInformationSchema = object().shape({
  pickupLocation: string().required("Please enter the pickup location"),
  startDate: string().required("Please select the start date"),
  startTime: string().required("Please select the start time"),
  dropoffLocation: string().required("Please enter the dropoff location"),
  endDate: string().required("Please select the end date"),
  endTime: string().required("Please select the end time"),
  areaOfUse: string().required("Please enter the area of use"),
});

export const personalInformationMyselfSchema = object().shape({
  guestName: string().required("Please enter your full name"),
  guestEmail: string()
    .email("Please enter a valid email address")
    .required("Please enter your email"),
    // .matches(emailRegEx, "Please enter a valid email address"),
  guestPhoneNumber: string()
    .required("Please enter your phone number")
    .test("phoneNumber", "Invalid phone number", function (val) {
      const { country } = this.parent;
      return validatePhoneNumber(val, country);
    }),
});