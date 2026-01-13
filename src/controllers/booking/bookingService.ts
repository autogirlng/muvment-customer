import {
  BookingCalculationRequest,
  BookingCalculationResponse,
  CreateBookingResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
} from "@/types/vehicle";
import {
  createData,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";

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
  private static readonly BOOKINGS_URL = "/api/v1/public/bookings";
  private static readonly PAYMENT_URL = "/api/v1/payments";
  private static readonly BOOKING_TYPE =
    "/api/v1/booking-types?isDefaultActive=true";
  private static readonly INITIATE_PAYMENT = "/api/v1/payments/initiate";
  private static readonly INITIATE_PAYMENT_PAYSTACK =
    "/api/v1/payments/initialize";

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

  static async getBookingById(bookingId: string): Promise<any> {
    try {
      const response = await getSingleData(`${this.BASE_URL}/${bookingId}`);
      return response?.data || null;
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

  static async getBookingType(): Promise<any> {
    try {
      const response = await getTableData(`${this.BOOKING_TYPE}`);
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching booking type:", error);
      throw error;
    }
  }

  static async calculateBooking(request: BookingCalculationRequest) {
    try {
      const response = await createData(
        this.BOOKINGS_URL + "/calculate",
        request
      );
      if (!response || !response.data)
        throw new Error("Failed to calculate booking price");
      return response;
    } catch (error) {
      console.error("Booking calculation error:", error);
      throw error;
    }
  }

  static async createBooking(bookingData: any) {
    // console.log("Creating booking with data:", bookingData);
    try {
      const response = await createData(this.BASE_URL, bookingData);
      if (!response || !response.data)
        throw new Error("Failed to create booking");

      return response;
    } catch (error) {
      console.error("Booking creation error:", error);
      throw error;
    }
  }

  static async initiatePayment(
    paymentData: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    try {
      let paymentURL;
      if (paymentData.paymentProvider === "PAYSTACK") {
        paymentURL = `${this.INITIATE_PAYMENT_PAYSTACK}/${paymentData.bookingId}`;
      } else {
        paymentURL = this.INITIATE_PAYMENT;
      }
      const response = await createData(paymentURL, paymentData);
      if (!response || !response.data)
        throw new Error("Failed to initiate payment");
      return response.data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  }

  static async createAnonymousReview(reviewData: {
    rating: number;
    review: string;
    recommend: string;
    entityId: string;
    entityType: string;
    source: string;
    anonymouseEmail: string;
    anonymouseFullName: string;
    anonymousePhoneNumber: string;
  }): Promise<any> {
    try {
      const response = await createData(
        "/api/v1/rating-review/anonymouse-user",
        reviewData
      );
      console.log(response);
      if (!response || !response.data)
        throw new Error("Failed to create review");
      return response.data;
    } catch (error) {
      console.error("Review creation error:", error);
      throw error;
    }
  }
}
