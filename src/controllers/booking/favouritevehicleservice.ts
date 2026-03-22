import {
  createData,
  getSingleData,
  deleteData,
  updateData,
  updateDataFormWithNoID,
  deleteItem,
} from "../connnector/app.callers";

export interface FavouriteVehicleItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface FavouriteVehicleResponse {
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  createdById: string;
  updatedById: string;
  deletedById: string;
  restoredById: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    departmentName: string;
    referredById: string;
    active: boolean;
  };
  vehicles: FavouriteVehicleItem[];
}

export interface FavouriteVehiclePayload {
  vehicles: { id: string }[];
}

export class FavouriteVehicleService {
  private static readonly BASE_URL = "/api/v1/favourite-vehicle";
  static async getFavourites(): Promise<FavouriteVehicleResponse | null> {
    try {
      const response = await getSingleData(this.BASE_URL);
      return response?.data?.[0]?.data ?? null;
    } catch (error) {
      console.error("Error fetching favourite vehicles:", error);
      throw error;
    }
  }

  static async addFavourites(
    vehicleIds: string[],
  ): Promise<FavouriteVehicleResponse> {
    try {
      const payload: FavouriteVehiclePayload = {
        vehicles: vehicleIds.map((id) => ({ id })),
      };
      const response = await createData(this.BASE_URL, payload);
      if (!response || !response.data)
        throw new Error("Failed to add favourite vehicle");
      return response.data;
    } catch (error) {
      console.error("Error adding favourite vehicles:", error);
      throw error;
    }
  }

  //   static async updateFavourites(
  //     vehicleIds: string,
  //   ): Promise<FavouriteVehicleResponse> {
  //     try {

  //       const response = await updateData(this.BASE_URL, );
  //       if (!response || !response.data)
  //         throw new Error("Failed to update favourite vehicles");
  //       return response.data;
  //     } catch (error) {
  //       console.error("Error updating favourite vehicles:", error);
  //       throw error;
  //     }
  //   }

  static async removeFavourites(vehicleIds: string): Promise<void> {
    try {
      await deleteItem(this.BASE_URL, {
        vehicles: [
          {
            id: vehicleIds,
          },
        ],
      });
    } catch (error) {
      console.error("Error deleting favourite vehicles:", error);
      throw error;
    }
  }

  static async checkIsFavourite(vehicleId: string): Promise<boolean> {
    try {
      const response = await getSingleData(
        `${this.BASE_URL}/check/${vehicleId}`,
      );
      const v = response?.data[0].data;
      return v;
    } catch {
      return false;
    }
  }
  static async toggleFavourite(
    vehicleId: string,
    currentFavouriteIds: string[],
  ): Promise<{ isFavourited: boolean; updatedFavouriteIds: string[] }> {
    const isCurrentlyFavourited = currentFavouriteIds.includes(vehicleId);
    if (isCurrentlyFavourited) {
      await FavouriteVehicleService.removeFavourites(vehicleId);
      return { isFavourited: false, updatedFavouriteIds: [] };
    } else {
      await FavouriteVehicleService.addFavourites([vehicleId]);
      const updatedList = [...currentFavouriteIds, vehicleId];
      return { isFavourited: true, updatedFavouriteIds: updatedList };
    }
  }
}
