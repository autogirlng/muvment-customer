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
