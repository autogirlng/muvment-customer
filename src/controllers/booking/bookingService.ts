import { EstimatedBookingPrice } from "@/types/vehicleDetails";
import {
  createData,
  getSingleData,
  getTableData,
  updateData,
} from "../connnector/app.callers";
import {
  CreateBookingResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
} from "@/types/vehicle";

export interface Booking {
  id?: string;
  segmentId: string;
  bookingId: string;
  vehicleUuid: string;
  vehicleId: string;
  vehicleName: string;
  createdAt: string;
  customerName: string;
  bookingType: string;
  city: string;
  duration: string;
  bookingStatus: string;
  price: number;
}

export interface BookingResponse {
  status: string;
  message: string;
  errorCode: string;
  data: {
    content: Booking[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface BookingFilters {
  page?: number;
  size?: number;
  bookingStatus?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export class BookingService {
  private static readonly BASE_URL = "/api/v1/bookings";
  private static readonly PAYMENT_URL = "/api/v1/payments";
  private static readonly INITIATE_PAYMENT = "/api/v1/payments/initiate";

  static async getMyBookings(
    filters: BookingFilters = {}
  ): Promise<BookingResponse> {
    try {
      const response = await getTableData(
        `${this.BASE_URL}/my-segments`,
        filters
      );
      if (response) {
        return response.data as BookingResponse;
      }
      // If the caller returned no response, throw to ensure this function never returns undefined
      throw new Error("No response received from bookings endpoint");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }

  static async createBooking(bookingData: any): Promise<CreateBookingResponse> {
    try {
      const response = await createData(this.BASE_URL, bookingData);
      if (!response || !response.data)
        throw new Error("Failed to create booking");
      return response.data;
    } catch (error) {
      console.error("Booking creation error:", error);
      throw error;
    }
  }

  static async initiatePaymentPaystack(
    paymentData: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    try {
      const response = await createData(
        this.INITIATE_PAYMENT + `/${paymentData.bookingId}`,
        {}
      );
      if (!response || !response.data)
        throw new Error("Failed to initiate payment");
      return response.data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  }

  static async initiatePaymentMonify(
    paymentData: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    try {
      const response = await createData(this.INITIATE_PAYMENT, paymentData);
      if (!response || !response.data)
        throw new Error("Failed to initiate payment");
      return response.data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  }

  static async getBookingById(bookingId: string): Promise<any> {
    try {
      const response = await getSingleData(`${this.BASE_URL}/${bookingId}`);
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }

  static async updateBookingEstimation(
    bookingId: string,
    data: any
  ): Promise<any> {
    try {
      const response = await updateData(`${this.BASE_URL}`, bookingId, data);
      return (response as EstimatedBookingPrice) || null;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }

  static async getDashboardCounts(): Promise<{
    bookings: number;
    payments: number;
  }> {
    try {
      const [bookingRes, paymentRes] = await Promise.all([
        getSingleData(`${this.BASE_URL}/my-segments`),
        getSingleData(`${this.PAYMENT_URL}`),
      ]);

      const bookingResData = bookingRes?.data[0].data;
      const paymentResData = paymentRes?.data[0].data;
      const bookings = bookingResData.totalItems ?? 0;
      const payments = paymentResData.totalItems ?? 0;

      return { bookings, payments };
    } catch (error) {
      console.error("Error fetching counts:", error);
      throw error;
    }
  }
}
