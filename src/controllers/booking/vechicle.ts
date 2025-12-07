import {
  BookingCalculationRequest,
  BookingCalculationResponse,
  CreateBookingResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  VehicleSearchParams,
} from "@/types/vehicle";
import {
  createData,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";

export class VehicleSearchService {
  private static readonly SEARCH_BASE_URL = "/api/v1/public/vehicles/search";
  private static readonly VEHICLES_TYPE = "/api/v1/public/vehicle-types";
  private static readonly VEHICLES_MAKE = "/api/v1/public/vehicle-makes";
  private static readonly VEHICLES_FEATURES = "/api/v1/public/vehicle-features";
  private static readonly VEHICLES_COLORS = "/api/v1/public/vehicle-colors";
  private static readonly BOOKING_CALCULATE =
    "/api/v1/public/bookings/calculate";
  private static readonly VEHICLE_DETAILS = "/api/v1/public/vehicles";

  static async searchVehicles(params?: VehicleSearchParams): Promise<any> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(
          ([_, v]) => v !== null && v !== undefined && v !== ""
        )
      );

      const apiPayload: any = {
        ...filteredParams,
        radiusInKm: 100,
      };

      if (apiPayload.lat !== undefined) {
        apiPayload.latitude = apiPayload.lat;
        delete apiPayload.lat;
      }

      if (apiPayload.lng !== undefined) {
        apiPayload.longitude = apiPayload.lng;
        delete apiPayload.lng;
      }

      const response = await getTableData(this.SEARCH_BASE_URL, apiPayload);

      if (!response || !response.data || response.data.length === 0) {
        return { data: [], totalCount: 0, totalPages: 1 };
      }

      return response;
    } catch (error) {
      console.error("Vehicle search error:", error);
      throw error;
    }
  }

  // ... (Keep the rest of your methods exactly as they are) ...

  static async getVehicleById(vehicleId: string): Promise<any> {
    try {
      const response = await getSingleData(
        `${this.VEHICLE_DETAILS}/${vehicleId}`
      );
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      throw error;
    }
  }

  // static async buildSearchUrl(
  //   location: { name: string; lat: number; lng: number },
  //   bookingType: string,
  //   category: string,
  //   fromDate: Date,
  //   untilDate: Date
  // ) {
  //   const params = new URLSearchParams({
  //     lat: location.lat.toString(),
  //     lng: location.lng.toString(),
  //     location: location.name,
  //     bookingType,
  //     category,
  //     fromDate: fromDate.toISOString(),
  //     untilDate: untilDate.toISOString(),
  //     radiusInKm: "100",
  //   });

  //   return `/Booking/search?${params.toString()}`;
  // }

  static async buildSearchUrl(
    location: { name: string; lat: number; lng: number },
    bookingType?: string,
    category?: string,
    fromDate?: Date,
    untilDate?: Date
  ) {
    const params = new URLSearchParams();

    // ✅ Always required
    params.append("lat", location.lat.toString());
    params.append("lng", location.lng.toString());
    params.append("location", location.name);
    params.append("radiusInKm", "100");

    // ✅ Optional params (ONLY added if they exist)
    if (bookingType) {
      params.append("bookingType", bookingType);
    }

    if (category) {
      params.append("vehicleTypeId", category);
    }

    if (fromDate) {
      params.append("fromDate", fromDate.toISOString());
    }

    if (untilDate) {
      params.append("untilDate", untilDate.toISOString());
    }

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

  static async getcalculatingBookingByid(id: string): Promise<any> {
    try {
      const response = await getSingleData(this.BOOKING_CALCULATE + `/${id}`);
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

  static async fetchFeaturedVehicles(page: number, size: number) {
    try {
      const response = await getSingleData(
        `/api/v1/public/featured-vehicles?page=${page}&size=${size}`
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching featured vehicles:", error);
      throw error;
    }
  }

  static async getVechielType() {
    return this.getVehicleTypes();
  }
}
