// services/profile.service.ts
import {
  getSingleData,
  patchData,
  createData,
  patchWithoutParams,
} from "../connnector/app.callers";

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl?: string;
  profilePicture?: string;
  verified: boolean;
  referralCode: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export class ProfileService {
  private static readonly PROFILE_BASE_URL = "/api/v1/users/me";

  static async getMyProfile(): Promise<{ data: UserProfile }> {
    const response = await getSingleData(this.PROFILE_BASE_URL);
    if (!response) {
      throw new Error("Failed to fetch profile");
    }
    return response;
  }

  static async updateProfile(
    formData: ProfileFormData
  ): Promise<{ data: UserProfile }> {
    const response = await patchWithoutParams(this.PROFILE_BASE_URL, formData);
    if (!response) {
      throw new Error("Failed to update profile");
    }
    return response as { data: UserProfile };
  }

  static async updateProfilePicture(
    formData: FormData
  ): Promise<{ data: UserProfile }> {
    const response = await patchWithoutParams(
      `${this.PROFILE_BASE_URL}/profile-picture`,
      formData
    );
    if (!response) {
      throw new Error("Failed to update profile picture");
    }
    return response as { data: UserProfile };
  }

  static async switchToHost(): Promise<any> {
    return await createData(`${this.PROFILE_BASE_URL}/switch-to-host`, {});
  }

  // POST /api/v1/users/change-password  body: { oldPassword, newPassword }
  static async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<any> {
    const response = await createData(
      "/api/v1/users/change-password",
      data,
      { silent: true },
    );
    if (!response) {
      throw new Error("Failed to change password");
    }
    if (response.error) {
      throw new Error(response.message || "Failed to change password");
    }
    const payload = response.data ?? response;
    if (payload?.status === "FAILED" || payload?.errorCode) {
      throw new Error(
        payload.message || "The old password you entered is incorrect.",
      );
    }
    return response;
  }
}
