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
  registrationType?: string;
  businessEmail?: string;
  businessPhone?: string;
  companySize?: string;
  website?: string;
  address?: string;
  createdAt?: string;
}

export interface OrganizationMember {
  memberId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: "ORG_ADMIN" | "ORG_STAFF";
  spendingLimit?: number | null;
  amountSpent?: number | null;
  isActive: boolean;
  joinedAt?: string;
}

export interface OrganizationInvite {
  inviteId: string;
  email: string;
  spendingLimit?: number | null;
  invitedAt?: string;
}

export interface CreateOrganizationBody {
  name: string;
  rcNumber: string;
  industry: string;
  registrationType?: string;
  businessEmail?: string;
  businessPhone?: string;
  companySize?: string;
  website?: string;
  address?: string;
}

export interface OrganizationWalletInfo {
  balance: number;
  virtualAccountNumber?: string;
  bankName?: string;
  accountName?: string;
}

export interface WalletTransaction {
  transactionId: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  transactionType: "CREDIT" | "DEBIT";
  reference?: string;
  description?: string;
  staffName?: string;
  createdAt: string;
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
