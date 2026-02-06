export interface ServicePrice {
  bookingTypeId: string;
  bookingTypeName: string;
  price: number;
  id?: string;
}

export interface ServicePricingShowcase {
  yearRangeId: string;
  name: string;
  minYear: number;
  maxYear: number;
  servicePricingId: string;
  servicePricingName: string;
  rideType: string;
  id?: string;
  sampleImages: string[];
  prices: ServicePrice[];
}

export interface ServicePricingResponse {
  status: string;
  message: string;
  errorCode: string;
  data: ServicePricingShowcase[];
  timestamp: string;
}

export interface ServicePricingDetailsProps {
  yearRangeId: string;
  servicePricingId: string;
}
