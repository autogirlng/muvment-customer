export interface ItineraryInformationValues {
  pickupLocation: string;
  startDate: Date | null;
  startTime: Date | null;
  dropoffLocation: string;
  endDate: Date | null;
  endTime: Date | null;
  areaOfUse: string;
  outskirtsLocation: string[];
  extraDetails: string;
  purposeOfRide: string;
}

export interface PersonalInformationMyselfValues {
  guestFullName: string;
  guestEmail: string;
  primaryPhoneNumber: string;
  country: string;
  countryCode: string;
  secondaryPhoneNumber: string;
  secondaryCountry: string;
  secondaryCountryCode: string;
  isBookingForOthers: boolean;
}

export interface PersonalInformationOthersValues {
  recipientFullName: string;
  recipientEmail: string;
  recipientPhoneNumber: string;
  recipientSecondaryPhoneNumber: string;
  country: string;
  countryCode: string;
  userCountry: string;
  userCountryCode: string;
  isBookingForOthers: boolean;
}
