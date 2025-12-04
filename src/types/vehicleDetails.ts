export interface VehicleDetailsPageProps {
  params: {
    id: string;
  };
}

export interface VehicleBookingOptions {
  bookingTypeId: string;
  bookingTypeName: string;
  platformFeeType: string;
  price: number;
}

export interface VehicleInformation {
  availabilityAndPricing: any;
  id?: string;
  listingName: string;
  location?: string;
  address?: string;
  vehicleType: string;
  make: string;
  model: string;
  yearOfRelease: string;
  hasTracker: boolean;
  hasInsurance: boolean;
  licensePlateNumber: string;
  stateOfRegistration: string;
  vehicleDescription: string;
  features: string[];
  vehicleColor: string;
  numberOfSeats: number;
  //   VehicleImage: VehiclePhotos;
  //   tripSettings: TripSettings;
  pricing: {
    //   dailyRate: Rate;
    extraHoursFee: number;
    // hourlyRate: Rate;
    airportPickupFee: number;
    //   discounts: Discount[];
    bookingTypePrices: { type: NewBookingType; price: number }[];
  };
  outskirtsLocation?: string[];
  outskirtsPrice?: number;
  //   status: ListingStatus;
  //   vehicleStatus: VehicleStatus;
  userId: string;
  //   user: User;
  createdAt: string;
  updatedAt: string;
  vehicleCurrency: string;
  statistics: {
    bookingsCompleted: number;
    canceledBookings: number;
    hostStats: {
      averageRating: number;
      topRatedVehicle: number;
      totalCompletedRides: number;
      totalEarnings: number;
      totalOnboardedVehicles: number;
      walletBalance: number;
    };
    numberOfCustomers: number;
    totalRevenue: number;
  };
  extremeAreaPrice?: number;
  extremeAreasLocation?: string[];
}

export interface Trips {
  id: string;
  tripDetails?: TripDetails;
}

export enum NewBookingType {
  AN_HOUR = "AN_HOUR",
  THREE_HOURS = "THREE_HOURS",
  SIX_HOURS = "SIX_HOURS",
  TWELVE_HOURS = "TWELVE_HOURS",
  TWENTY_FOUR_HOURS = "TWENTY_FOUR_HOURS",
  AIRPORT_PICKUP = "AIRPORT_PICKUP",
}

export interface TripDetails {
  id?: string;
  bookingType?: NewBookingType;
  tripStartDate?: string;
  tripStartTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  areaOfUse?: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
  areaOfUseCoordinates?: { lat: number; lng: number };
}

type CalendarValuePiece = Date | null;

export type CalendarValue =
  | CalendarValuePiece
  | [CalendarValuePiece, CalendarValuePiece];

export interface ITripPerDaySelect {
  initialValues?: TripDetails;
  day: string;
  deleteMethod?: (idToDelete: string) => void;
  id: string;
  onChangeTrip: (id: string, details: TripDetails) => void;
  vehicle?: VehicleInformation | null;
  disabled: boolean;
  page?: string;
  isCollapsed?: boolean;
  toggleOpen: () => void;
  bookingOptions: { option: string; value: string }[];
}

export interface EstimatedBookingPrice {
  data: {
    status: string;
    message: string;
    data: {
      calculationId: string;
      basePrice: number;
      geofenceSurcharge: number;
      appliedGeofenceNames: string[];
      platformFeeAmount: number;
      discountAmount: number;
      couponDiscountAmount: number;
      appliedCouponCode?: string;
      finalPrice: number;
    };
    timestamp: string;
  };
  message: string;
  error: boolean;
}

export interface VehicleDetailsPublic {
  id: string;
  name: string;
  photos: {
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    isPrimary: boolean;
    id: string;
  }[];
  city: string;
  allPricingOptions: {
    bookingTypeId: string;
    bookingTypeName: string;
    price: number;
    platformFeeType: string;
    id: string;
  };
  extraHourlyRate: number;
  vehicleTypeName: string;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  numberOfSeats: number;
  advanceNotice: string;
  vehicleMakeName: string;
  vehicleModelName: string;
  vehicleColorName: string;
  year: number;
  description: string;
  vehicleFeatures: string[];
  maxTripDuration: string;
  discounts: {
    durationName: string;
    percentage: number;
  };
}
