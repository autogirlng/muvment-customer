import {
  createData,
  createDataWithParams,
  deleteData,
  deleteItem,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";
import { FavouriteStatus } from "@/types/favourites";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ApiClient from "../connnector/appClient";
import NetworkService from "@/components/Network/NetworkService";

export class FavouriteService {
  private static readonly URL = "/api/v1/favourite-vehicle";
  private static readonly VehicleFavouritedStatus = `${this.URL}/check`;

  static async getVehicleFavouriteStatus(vehicleId: string): Promise<boolean> {
    try {
      const { data } = await getSingleData(
        `${this.VehicleFavouritedStatus}/${vehicleId}`,
      );
      const { data: favouriteStatus } = data[0] as FavouriteStatus;
      return favouriteStatus || false;
    } catch (error) {
      console.error("Error fetching vehicle favourited status:", error);
      return false;
    }
  }

  static async deleteVehicleFromFavourite(vehicleId: string): Promise<any> {
    if (!NetworkService.checkConnection()) {
      toast.error("No network");
      return;
    }
    const body = {
      vehicles: [
        {
          id: vehicleId,
        },
      ],
    };
    try {
      const isFormData = body instanceof FormData;

      const [data] = await ApiClient.request(this.URL, {
        method: "DELETE",
        body,
        headers: isFormData
          ? {}
          : { "Content-Type": "application/json;charset=UTF-8" },
        requireAuth: true,
      });

      if (data.err) {
        toast.error(data.err);
      }

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  }

  static async makeVehicleFavourite(vehicleId: string) {
    if (!NetworkService.checkConnection()) {
      toast.error("No network");
      return;
    }
    const body = {
      vehicles: [
        {
          id: vehicleId,
        },
      ],
    };
    try {
      const isFormData = body instanceof FormData;

      const [data] = await ApiClient.request(this.URL, {
        method: "POST",
        body,
        headers: isFormData
          ? {}
          : { "Content-Type": "application/json;charset=UTF-8" },
        requireAuth: true,
      });

      if (data.err) {
        toast.error(data.err);
      }

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  }
}
