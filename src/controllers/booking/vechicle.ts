import {
  createData,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";

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

export class VehicleSearchService {
  private static readonly SEARCH_BASE_URL = "/api/v1/public/vehicles/search";
  private static readonly VEHICLES_TYPE = "/api/v1/public/vehicle-types";
  private static readonly VEHICLES_MAKE = "/api/v1/public/vehicle-makes";
  private static readonly VEHICLES_FEATURES = "/api/v1/public/vehicle-features";
  private static readonly VEHICLES_COLORS = "/api/v1/public/vehicle-colors";

  static async searchVehicles(params?: VehicleSearchParams): Promise<any> {
    try {
      // Remove empty params before sending
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(
          ([_, v]) => v !== null && v !== undefined && v !== ""
        )
      );

      const response = await getTableData(this.SEARCH_BASE_URL, filteredParams);

      if (!response || !response.data || response.data.length === 0) {
        return { data: [], totalCount: 0, totalPages: 1 };
      }

      return response;
    } catch (error) {
      console.error("Vehicle search error:", error);
      throw error;
    }
  }

  static async buildSearchUrl(
    location: { name: string; lat: number; lng: number },
    bookingType: string,
    category: string,
    fromDate: Date,
    untilDate: Date
  ) {
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      location: location.name,
      bookingType,
      category,
      fromDate: fromDate.toISOString(),
      untilDate: untilDate.toISOString(),
    });

    return `/Booking/search?${params.toString()}`;
  }

  static async getVehicleTypes(): Promise<any> {
    try {
      const response = await getSingleData(this.VEHICLES_TYPE);
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      return [];
    }
  }

  static async getVehicleMakes(): Promise<any> {
    try {
      const response = await getSingleData(this.VEHICLES_MAKE);
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      return [];
    }
  }

  static async getVehicleFeatures(): Promise<any> {
    try {
      const response = await getSingleData(this.VEHICLES_FEATURES);
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching vehicle features:", error);
      return [];
    }
  }

  static async getVehicleColors(): Promise<[]> {
    try {
      const response = await getSingleData(this.VEHICLES_COLORS);
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching vehicle colors:", error);
      return [];
    }
  }

  // Legacy method for backward compatibility
  static async getVechielType() {
    return this.getVehicleTypes();
  }
}
