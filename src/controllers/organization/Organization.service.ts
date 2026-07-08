import {
  ApiKey,
  CreateApiKeyBody,
  CreateOrganizationBody,
  Organization,
  OrganizationKYC,
  OrganizationMember,
  OrganizationInvite,
  OrganizationWalletInfo,
  WalletTransaction,
  OrganizationBooking,
  Paginated,
} from "@/types/Organization.type";
import {
  createData,
  deleteData,
  getSingleData,
  patchDataNoBody,
  patchWithoutParams,
} from "../connnector/app.callers";

export class OrganizationService {
  private static readonly ORGANIZATIONS = "/api/v1/organizations";
  private static readonly API_KEYS = "api-keys";

  static async createOrganization(
    body: CreateOrganizationBody,
  ): Promise<Organization | null> {
    try {
      const response = await createData(this.ORGANIZATIONS, body);
      return response?.data ?? null;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create organization";
      console.error("Error creating organization:", serverMessage);
      throw new Error(serverMessage);
    }
  }

  static async getMyOrganizations(): Promise<Organization[]> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/my-organizations`,
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        const list = data.data[0]?.data;
        if (!Array.isArray(list)) return [];
        // The endpoint returns MyOrganizationDto (organizationId /
        // organizationName), so normalize to the id/name every caller expects.
        return list.map((o: any) => ({
          id: o?.organizationId ?? o?.id ?? "",
          name: o?.organizationName ?? o?.name ?? "",
          rcNumber: o?.rcNumber ?? "",
          industry: o?.industry ?? "",
          registrationType: o?.registrationType ?? "",
          businessEmail: o?.businessEmail ?? "",
          businessPhone: o?.businessPhone ?? "",
          companySize: o?.companySize ?? "",
          website: o?.website ?? "",
          address: o?.address ?? "",
          // The caller's own membership on this organization.
          myRole: o?.myRole ?? null,
          mySpendingLimit:
            o?.mySpendingLimit == null ? null : Number(o.mySpendingLimit),
          myAmountSpent:
            o?.myAmountSpent == null ? 0 : Number(o.myAmountSpent),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  }

  static async getMembers(
    orgId: string,
    page = 0,
    size = 50,
  ): Promise<OrganizationMember[]> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${orgId}/members`,
        { page, size },
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        const body = data.data[0]?.data;
        const content = body?.content;
        if (!Array.isArray(content)) return [];
        // The API serializes the boolean as "active" (Jackson strips the "is"),
        // so read that and fall back to isActive.
        return content.map((m: any) => ({
          ...m,
          isActive: (m?.isActive ?? m?.active) ?? false,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching members:", error);
      return [];
    }
  }

  static async getPendingInvites(
    orgId: string,
  ): Promise<OrganizationInvite[]> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${orgId}/invites`,
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        const list = data.data[0]?.data;
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching invites:", error);
      return [];
    }
  }

  static async inviteStaff(
    orgId: string,
    email: string,
    spendingLimit?: number,
  ): Promise<{ error: boolean; message?: string }> {
    try {
      const res: any = await createData(
        `${this.ORGANIZATIONS}/${orgId}/staff`,
        { email, spendingLimit },
        { silent: true },
      );
      if (res?.error) {
        return { error: true, message: res?.message };
      }
      return { error: false };
    } catch (err: any) {
      return { error: true, message: err?.message || "Failed to invite" };
    }
  }

  static async toggleStaffSuspension(
    orgId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      await patchDataNoBody(
        `${this.ORGANIZATIONS}/${orgId}/staff/${userId}/suspend`,
      );
      return true;
    } catch (error) {
      console.error("Error toggling suspension:", error);
      return false;
    }
  }

  static async removeStaff(orgId: string, userId: string): Promise<boolean> {
    try {
      await deleteData(`${this.ORGANIZATIONS}/${orgId}/staff/${userId}`);
      return true;
    } catch (error) {
      console.error("Error removing staff:", error);
      return false;
    }
  }

  static async updateStaffLimit(
    orgId: string,
    userId: string,
    spendingLimit: number | null,
  ): Promise<boolean> {
    try {
      await patchWithoutParams(
        `${this.ORGANIZATIONS}/${orgId}/staff/${userId}/limit`,
        { spendingLimit },
      );
      return true;
    } catch (error) {
      console.error("Error updating limit:", error);
      return false;
    }
  }

  static async cancelInvite(orgId: string, inviteId: string): Promise<boolean> {
    try {
      await deleteData(`${this.ORGANIZATIONS}/${orgId}/invites/${inviteId}`);
      return true;
    } catch (error) {
      console.error("Error cancelling invite:", error);
      return false;
    }
  }

  static async resendInvite(orgId: string, inviteId: string): Promise<boolean> {
    try {
      const res: any = await createData(
        `${this.ORGANIZATIONS}/${orgId}/invites/${inviteId}/resend`,
        {},
        { silent: true },
      );
      return !res?.error;
    } catch (error) {
      console.error("Error resending invite:", error);
      return false;
    }
  }

  static async getWalletInfo(
    organizationId: string,
  ): Promise<OrganizationWalletInfo | null> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${organizationId}/wallet`,
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        return (data.data[0]?.data as OrganizationWalletInfo) ?? null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      return null;
    }
  }

  static async getWalletTransactions(
    organizationId: string,
    page = 0,
    size = 20,
  ): Promise<Paginated<WalletTransaction>> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${organizationId}/transactions`,
        { page, size },
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        const body = data.data[0]?.data;
        return {
          content: Array.isArray(body?.content) ? body.content : [],
          currentPage: Number(body?.currentPage ?? page),
          totalPages: Number(body?.totalPages ?? 0),
          totalItems: Number(body?.totalItems ?? 0),
        };
      }
      return { content: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      return { content: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
  }

  /**
   * Admins get every booking made on the organization; staff get only their own.
   * The backend decides, based on the caller's membership role.
   */
  static async getOrganizationBookings(
    organizationId: string,
    page = 0,
    size = 10,
  ): Promise<Paginated<OrganizationBooking>> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${organizationId}/bookings`,
        { page, size },
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) {
        const body = data.data[0]?.data;
        return {
          content: Array.isArray(body?.content) ? body.content : [],
          currentPage: Number(body?.currentPage ?? page),
          totalPages: Number(body?.totalPages ?? 0),
          totalItems: Number(body?.totalItems ?? 0),
        };
      }
      return { content: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    } catch (error) {
      console.error("Error fetching organization bookings:", error);
      return { content: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
  }

  static async changeMemberRole(
    orgId: string,
    userId: string,
    newRole: "ORG_ADMIN" | "ORG_STAFF",
  ): Promise<{ error: boolean; message?: string }> {
    try {
      const res: any = await patchWithoutParams(
        `${this.ORGANIZATIONS}/${orgId}/members/${userId}/role`,
        { newRole },
      );
      if (res?.error) return { error: true, message: res?.message };
      return { error: false };
    } catch (err: any) {
      return { error: true, message: err?.message || "Failed to change role" };
    }
  }

  static async getMyOrganizationsKYC(
    organizationId: string,
  ): Promise<OrganizationKYC[]> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${organizationId}/kyc`,
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (error) {
      console.error("Error fetching organizations kyc:", error);
      return [];
    }
  }

  static async getApiKeys(orgId: string): Promise<ApiKey[]> {
    try {
      const rawData = await getSingleData(
        `${this.ORGANIZATIONS}/${orgId}/${this.API_KEYS}`,
      );
      const data = { ...rawData };
      if (data?.data && Array.isArray(data.data)) return data.data[0].data;
      return [];
    } catch (error) {
      console.error("Error fetching API keys:", error);
      return [];
    }
  }

  static async generateApiKey(
    orgId: string,
    body: CreateApiKeyBody,
  ): Promise<ApiKey | null> {
    try {
      const response = await createData(
        `${this.ORGANIZATIONS}/${orgId}/api-keys`,
        body,
      );

      return response?.data.data ?? null;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate API key";
      console.error("Error generating API key:", serverMessage);
      throw new Error(serverMessage);
    }
  }

  static async revokeApiKey(orgId: string, keyId: string): Promise<void> {
    try {
      await deleteData(
        `${this.ORGANIZATIONS}/${orgId}/${this.API_KEYS}/${keyId}`,
      );
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to revoke API key";
      console.error("Error revoking API key:", serverMessage);
      throw new Error(serverMessage);
    }
  }

  static async regenerateApiKey(
    orgId: string,
    existingKeyId: string,
    environment: "TEST" | "LIVE",
  ): Promise<ApiKey | null> {
    await this.revokeApiKey(orgId, existingKeyId);
    return this.generateApiKey(orgId, {
      name: `${environment} Key`,
      environment,
    });
  }
}
