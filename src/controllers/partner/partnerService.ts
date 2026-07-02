import ApiClient from "../connnector/appClient";
import {
  Partner,
  PaginatedVehicleResponse,
  PaginatedPartnerResponse,
} from "@/components/pagesComponent/partner-ship/types/partner";

export class PartnerService {
  private static readonly PARTNERS_BASE_URL = "/api/v1/public/partners";

  static async getCityVehicles(
    city: string,
    page: number = 0,
    size: number = 6,
  ): Promise<PaginatedVehicleResponse | null> {
    try {
      const [response] = await ApiClient.request(
        "/api/v1/public/vehicles/search",
        {
          method: "GET",
          params: { city, page, size },
          requireAuth: false,
        },
      );
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching city vehicles for ${city}:`, error);
      return null;
    }
  }

  static async getAllActivePartners(
    search: string = "",
    page: number = 0,
    size: number = 20,
  ): Promise<PaginatedPartnerResponse | null> {
    try {
      const params: Record<string, unknown> = { page, size };
      if (search) params.search = search;
      const [response] = await ApiClient.request(this.PARTNERS_BASE_URL, {
        method: "GET",
        params,
        requireAuth: false,
      });
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching partners:", error);
      return null;
    }
  }

  static async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const [response] = await ApiClient.request(
      `${this.PARTNERS_BASE_URL}/${slug}`,
      {
        method: "GET",
        requireAuth: false,
      },
    );

    if (response?.data) return response.data;
    if (response?.status === 404) return null;
    throw new Error(response?.err || `Failed to load partner ${slug}`);
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
