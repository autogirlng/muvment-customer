export interface OperatingState {
  id: string;
  name: string;
}

export interface Partner {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  contactPersonName: string;
  website: string;
  partnerType: string;
  latitude: number;
  longitude: number;
  operatingStates: OperatingState[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface PaginatedVehicleResponse {
  content: any[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface PaginatedPartnerResponse {
  content: Partner[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
