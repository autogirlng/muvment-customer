// store/bookingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookingSegment {
  bookingTypeId: string;
  bookingTypeName?: string;
  startDate: string;
  startTime: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  pickupLocationString: string;
  dropoffLocationString: string;
}

interface CalculatedPrice {
  calculationId?: string;
  basePrice?: number;
  platformFeeAmount?: number;
  discountAmount?: number;
  finalPrice?: number;
  extraHoursCharge?: number;
  outskirtPrice?: number;
  extremeAreaPrice?: number;
  totalDurationMinutes?: number;
  calculatedAt?: string;
  vehicle?: {
    vehicleId: string;
    vehicleIdentifier: string;
    name: string;
  };
  booker?: {
    userId: string;
    fullName: string;
  };
  requestedSegments?: any[];
}

interface Vehicle {
  id: string;
  name: string;
  photos: Array<{ cloudinaryUrl: string; isPrimary: boolean }>;
  city: string;
  vehicleTypeName: string;
  numberOfSeats: number;
  year?: string;
  description?: string;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  extraHourlyRate?: number;
}

interface BookingState {
  vehicleId: string | null;
  vehicle: Vehicle | null;
  segments: BookingSegment[];
  calculatedPrice: CalculatedPrice | null;
  calculationRequest: any | null;

  // Actions
  setVehicle: (vehicle: Vehicle) => void;
  setSegments: (segments: BookingSegment[]) => void;
  setCalculatedPrice: (price: CalculatedPrice) => void;
  setCalculationRequest: (request: any) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      vehicleId: null,
      vehicle: null,
      segments: [],
      calculatedPrice: null,
      calculationRequest: null,

      setVehicle: (vehicle) => set({ vehicle, vehicleId: vehicle.id }),

      setSegments: (segments) => set({ segments }),

      setCalculatedPrice: (calculatedPrice) => set({ calculatedPrice }),

      setCalculationRequest: (calculationRequest) =>
        set({ calculationRequest }),

      clearBooking: () =>
        set({
          vehicleId: null,
          vehicle: null,
          segments: [],
          calculatedPrice: null,
          calculationRequest: null,
        }),
    }),
    {
      name: "muvment-booking-storage",
    }
  )
);
