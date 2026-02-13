// Updated interface to match the new payload structure

export interface PriceDetail {
  bookingTypeId: string;
  bookingTypeName: string;
  price: number;
}

export interface ServicePricingShowcase {
  yearRangeId: string;
  name: string;
  minYear: number;
  maxYear: number;
  servicePricingId: string;
  servicePricingName: string;
  rideType: string;
  imageUrl: string;
  prices: PriceDetail[];
}

// If you need the response type from the API
export interface ServicePricingResponse {
  data: ServicePricingShowcase[];
  success: boolean;
  message?: string;
}
