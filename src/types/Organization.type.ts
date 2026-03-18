import { BaseResponse } from "./base";

export enum OrganizationKYCStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Organization {
  id: string;
  name: string;
  rcNumber: string;
  industry: string;
  createdAt?: string;
}

export interface CreateOrganizationBody {
  name: string;
  rcNumber: string;
  industry: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  environment: "TEST" | "LIVE";
  createdAt: string;
  rawApiKey?: string;
  active: boolean;
}

export interface CreateApiKeyBody {
  name: string;
  environment: "TEST" | "LIVE";
}

export interface OrganizationKYC extends BaseResponse {
  data: {
    status: OrganizationKYCStatus;
    cacNumber?: "string";
    officeAddress?: "string";
    additionalAddress?: "string";
    organizationSize?: "string";
    servicesRendered?: "string";
  };
}
