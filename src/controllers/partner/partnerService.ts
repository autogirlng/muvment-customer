import ApiClient from "../connnector/appClient";
import {
  Partner,
  PaginatedVehicleResponse,
} from "@/components/pagesComponent/partner-ship/types/partner";

export class PartnerService {
  private static readonly PARTNERS_BASE_URL = "/api/v1/public/partners";

  static async getPartnerBySlug(slug: string): Promise<Partner | null> {
    try {
      const [response] = await ApiClient.request(
        `${this.PARTNERS_BASE_URL}/${slug}`,
        {
          method: "GET",
          requireAuth: false,
        },
      );

      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching partner ${slug}:`, error);
      return null;
    }
  }

  static async getPriorityVehicles(
    slug: string,
    page: number = 0,
    size: number = 6,
  ): Promise<PaginatedVehicleResponse | null> {
    try {
      const [response] = await ApiClient.request(
        `${this.PARTNERS_BASE_URL}/${slug}/vehicles/priority`,
        {
          method: "GET",
          params: { page, size },
          requireAuth: false,
        },
      );
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching priority vehicles for ${slug}:`, error);
      return null;
    }
  }

  static async getOtherVehicles(
    slug: string,
    page: number = 0,
    size: number = 6,
  ): Promise<PaginatedVehicleResponse | null> {
    try {
      const [response] = await ApiClient.request(
        `${this.PARTNERS_BASE_URL}/${slug}/vehicles/other`,
        {
          method: "GET",
          params: { page, size },
          requireAuth: false,
        },
      );

      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching other vehicles for ${slug}:`, error);
      return null;
    }
  }
}
