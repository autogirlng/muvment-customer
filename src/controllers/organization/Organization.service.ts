import {
  ApiKey,
  CreateApiKeyBody,
  CreateOrganizationBody,
  Organization,
  OrganizationKYC,
} from "@/types/Organization.type";
import {
  createData,
  deleteData,
  getSingleData,
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
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
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
