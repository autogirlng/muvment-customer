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
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
  };
  timestamp: string;
}

export interface BookingFilters {
  page?: number;
  size?: number;
  bookingStatus?: string;
  bookingTypeId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export class BookingService {
  private static readonly BASE_URL = "/api/v1/bookings";
  private static readonly MY_SEGMENTS_URL = "/api/v1/bookings/my-segments";
  private static readonly BASE_URL_SPECIAL_BOOKING =
    "/api/v1/bookings/service-pricing";
  private static readonly BOOKINGS_URL = "/api/v1/public/bookings";
  private static readonly PAYMENT_URL = "/api/v1/payments";
  private static readonly BOOKING_TYPE =
    "/api/v1/booking-types?isDefaultActive=true";
  private static readonly INITIATE_PAYMENT = "/api/v1/payments/initiate";
  private static readonly INITIATE_PAYMENT_PAYSTACK =
    "/api/v1/payments/initialize";

  static async getMyBookings(
    filters: BookingFilters = {},
  ): Promise<BookingResponse> {
    try {
      const response = await getTableData(
        `${this.MY_SEGMENTS_URL}`,
        filters,
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
      const response = await getSingleData(`${this.BOOKINGS_URL}/${bookingId}`);
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }

  static async getDashboardCounts(): Promise<{ payments: number }> {
    try {
      const paymentRes = await getSingleData(`${this.PAYMENT_URL}`);
      const paymentResData = paymentRes?.data[0].data;
      const payments = paymentResData?.totalElements ?? 0;
      return { payments };
    } catch (error) {
      console.error("Error fetching payment count:", error);
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
        request,
        { silent: true },
      );
      if (!response || response.error || !response.data) {
        const apiMessage =
          response &&
          typeof response.message === "string" &&
          response.message !== "Success"
            ? response.message
            : "";
        throw new Error(
          apiMessage || "We couldn't calculate the price for this trip.",
        );
      }
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

  static async createSpecialBooking(bookingData: any) {
    // console.log("Creating booking with data:", bookingData);
    try {
      const response = await createData(
        this.BASE_URL_SPECIAL_BOOKING,
        bookingData,
      );
      if (!response || !response.data)
        throw new Error("Failed to create booking");

      return response;
    } catch (error) {
      console.error("Booking creation error:", error);
      throw error;
    }
  }
  static async initiatePayment(
    paymentData: PaymentInitiationRequest,
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

  static async createReview(
    reviewData: {
      rating: number;
      review: string;
      recommend: string;
      entityId: string;
      entityType: string;
      source: string;
      // isAnonymous: boolean,
    },
    isAnonymous: boolean,
  ): Promise<any> {
    let END_POINT;
    if (!isAnonymous) {
      END_POINT = "/api/v1/rating-review";
    } else {
      END_POINT = "/api/v1/rating-review/anonymouse-user";
    }

    try {
      const response = await createData(END_POINT, reviewData);
      if (!response || !response.data)
        throw new Error("Failed to create review");
      return response.data;
    } catch (error) {
      console.error("Review creation error:", error);
      throw error;
    }
  }

  static async checkIfUserHasReviewed(bookingId: string): Promise<boolean> {
    try {
      const response = await getSingleData(
        `/api/v1/rating-review/entity/${bookingId}`,
      );

      if (!response || !response.data) {
        return false; // No review exists
      }

      const data = response.data[0].data.content;
      return data.length > 0;
    } catch (error) {
      return false;
    }
  }
}
