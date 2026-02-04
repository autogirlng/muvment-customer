import {
  ServicePricingResponse,
  ServicePricingShowcase,
} from "@/types/Servicepricing";
import { createData, getSingleData } from "../connnector/app.callers";

export class ServicePricingService {
  private static readonly SERVICE_PRICING_SHOWCASE =
    "/api/v1/public/service-pricing-showcase";

  static async getServicePricingShowcase(): Promise<any[]> {
    try {
      const rawData = await getSingleData(this.SERVICE_PRICING_SHOWCASE);

      const data = {
        ...rawData,
      };

      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching service pricing showcase:", error);
      throw new Error("Failed to load service pricing data");
    }
  }

  static async getServicePricingById(
    servicePricingId: string,
  ): Promise<ServicePricingShowcase | null> {
    try {
      const allPricing = await this.getServicePricingShowcase();
      const found = allPricing[0].data.find(
        (item: any) => item.servicePricingId === servicePricingId,
      );

      return found || null;
    } catch (error) {
      console.error("Error fetching service pricing by ID:", error);
      throw new Error("Failed to load service pricing details");
    }
  }

  static buildDetailsUrl(
    yearRangeId: string,
    servicePricingId: string,
  ): string {
    return `/booking/${servicePricingId}/special-pricing`;
  }
  static async calulateSpecialBooking(requestBody: any) {
    try {
      const response = await createData(
        "/api/v1/public/bookings/service-pricing/quote",
        requestBody,
      );
      return response.data;
    } catch (error: any) {
      return error.messag;
    }
  }
}
