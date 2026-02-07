import { BaseResponse } from "./base";

export interface VehicleOwner {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface VehicleMake {
  id: string;
  name: string;
  code: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  code: string;
}

export interface VehicleColor {
  id: string;
  name: string;
  hexCode: string;
}

export interface VehiclePhoto {
  id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
}

export interface VehicleDocument {
  id: string;
  documentType: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
}

export interface VehicleFeature {
  id: string;
  name: string;
}

export interface BookingType {
  id: string;
  name: string;
  durationInMinutes: number;
  description: string;
  defaultActive: boolean;
}

export interface VehiclePricing {
  id: string;
  bookingTypeId: string;
  price: number;
  platformFeeType: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  referredById: string;
  active: boolean;
  departmentName?: string;
}

export interface Vehicle {
  id: string;
  vehicleIdentifier: string;
  ownerId: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  vehicleTypeId: string;
  vehicleMakeId: string;
  vehicleModelId: string;
  yearOfRelease: number;
  hasInsurance: boolean;
  hasTracker: boolean;
  status: string;
  licensePlateNumber: string;
  stateOfRegistration: string;
  vehicleColorId: string;
  numberOfSeats: number;
  description: string;
  maxTripDurationUnit: string;
  maxTripDurationValue: number;
  advanceNoticeUnit: string;
  advanceNoticeValue: number;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  extraHourlyRate: number;
  outskirtFee: number;
  extremeFee: number;
  isVehicleUpgraded: boolean;
  upgradedYear: number;
  owner: VehicleOwner;
  vehicleMake: VehicleMake;
  vehicleModel: VehicleModel;
  vehicleColor: VehicleColor;
  photos: VehiclePhoto[];
  documents: VehicleDocument[];
  features: VehicleFeature[];
  supportedBookingTypes: BookingType[];
  pricing: VehiclePricing[];
  discounts: unknown[];
  outOfBoundsAreaIds: string[];
}

// export interface FavouriteResponseVehicle {
//   id: string;
//   hasInsurance: boolean;
//   hasTracker: boolean;
//   willProvideDriver: boolean;
//   willProvideFuel: boolean;
// }

// export interface FavouriteResponse extends BaseResponse {
//   data: {
//     customer: Customer;
//     vehicles: FavouriteResponseVehicle[];
//   };
// }

export interface FavouritesVehiclePayload {
  customer: Customer;
  vehicles: Vehicle[];
}

export interface FavouritesVehicleData extends BaseResponse {
  data: FavouritesVehiclePayload;
}

export interface FavouriteStatus extends BaseResponse {
  data: boolean;
}
