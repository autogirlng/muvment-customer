
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
  guestName: string;
  guestEmail: string;
  guestPhoneNumber: string;
  country: string;
  countryCode: string;
  secondaryPhoneNumber: string;
  secondaryCountry: string;
  secondaryCountryCode: string;
  isForSelf: boolean;
}