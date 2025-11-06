export interface VehicleSearchParams {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
  bookingTypeId?: string;
  vehicleTypeId?: string;
  vehicleMakeId?: string;
  vehicleModelId?: string;
  vehicleColorId?: string;
  featureIds?: string[];
  minSeats?: number;
  minYear?: number;
  willProvideDriver?: boolean;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  untilDate?: string;
}

export interface Vehicle {
  id: string;
  listingName: string;
  make: string;
  model: string;
  yearOfRelease: string;
  numberOfSeats: number;
  vehicleType: string;
  location: string;
  pricing: {
    dailyRate: {
      value: number;
      currency: string | null;
    };
    extraHoursFee: number;
    airportPickupFee: number;
  };
  tripSettings: {
    provideDriver: boolean;
    fuelProvided: boolean;
  };
  VehicleImage: {
    frontView: string;
    backView: string;
    sideView1: string;
    sideView2: string;
    interior: string;
    other: string;
  };
  features: string[];
  isActive: boolean;
  distance?: number;
}

export interface VehicleSearchResponse {
  data: Vehicle[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface VehicleType {
  id: string;
  name: string;
  code: string;
}

export interface VehicleMake {
  id: string;
  name: string;
  code: string;
}

export interface VehicleFeature {
  id: string;
  name: string;
  description: string;
}

export interface VehicleColor {
  id: string;
  name: string;
  hexCode: string;
}

export interface BookingCalculationRequest {
  vehicleId: string;
  segments: {
    bookingTypeId: string;
    startDate: string;
    startTime: string;
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
    pickupLocationString: string;
    dropoffLocationString: string;
  }[];
}

export interface BookingCalculationResponse {
  status: string;
  message: string;
  errorCode?: string;
  data: {
    calculationId: string;
    calculatedAt: string;
    totalDurationMinutes: number;
    basePrice: number;
    discountAmount: number;
    geofenceSurcharge: number;
    platformFeeAmount: number;
    finalPrice: number;
    vehicle: {
      vehicleId: string;
      vehicleIdentifier: string;
      name: string;
    };
    booker: {
      userId: string;
      fullName: string;
    };
    requestedSegments: any[];
  };
  timestamp: string;
}

export interface CreateBookingRequest {
  calculationId: string;
  primaryContactFullName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  secondaryContactPhoneNumber?: string;
  recipientFullName: string;
  recipientEmail: string;
  recipientPhoneNumber: string;
  specialInstructions?: string;
  channel: string;
  paymentMethod: string;
}

export interface CreateBookingResponse {
  status: string;
  message: string;
  errorCode?: string;
  data: {
    bookingId: string;
    bookingReference: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    vehicle: {
      vehicleId: string;
      name: string;
      vehicleIdentifier: string;
    };
    segments: Array<{
      segmentId: string;
      startDate: string;
      startTime: string;
      pickupLocation: string;
      dropoffLocation: string;
      bookingType: string;
    }>;
  };
  timestamp: string;
}

export interface PaymentInitiationRequest {
  bookingId: string;
}

export interface PaymentInitiationResponse {
  status: string;
  message: string;
  errorCode?: string;
  data: {
    paymentId: string;
    paymentUrl: string;
    paymentStatus: string;
    amount: number;
    currency: string;
    expiresAt: string;
    authorizationUrl?: string;
  };
  timestamp: string;
}
export interface VehicleCardProps {
  id: string;
  name: string;
  city: string;
  vehicleTypeName: string;
  allPricingOptions: {
    bookingTypeId: string;
    bookingTypeName: string;
    price: number;
    platformFeeType: string;
  }[];
  extraHourlyRate: number;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  numberOfSeats: number;
  photos: { cloudinaryUrl: string; isPrimary: boolean }[];
  bookingType?: string;
  rating?: number;
}

interface Photo {
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
}

interface PricingOption {
  bookingTypeId: string;
  bookingTypeName: string;
  price: number;
  platformFeeType: string;
}

export interface TopVehicle {
  id: string;
  vehicleIdentifier: string;
  name: string;
  photos: Photo[];
  city: string;
  allPricingOptions: PricingOption[];
  extraHourlyRate: number;
  vehicleTypeId: string;
  vehicleTypeName: string;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  numberOfSeats: number;
  rating?: number;
}
