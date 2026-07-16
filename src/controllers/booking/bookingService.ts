import {
  BookingCalculationRequest,
  BookingCalculationResponse,
  CreateBookingResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
} from "@/types/vehicle";
import {
  createData,
  updateData,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";
import { PaymentService } from "./paymentService";
import { clarityEvent } from "@/services/clarity";

// Cache the full booking-types list so concurrent callers (navbar bar, filter
// bar) share one request instead of each hitting the endpoint.
let allBookingTypesCache: any[] | null = null;
let allBookingTypesPromise: Promise<any[]> | null = null;

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
  private static readonly TRIPS_URL = "/api/v1/trips";
  private static readonly BOOKING_TYPE =
    "/api/v1/booking-types?isDefaultActive=true";
  private static readonly BOOKING_TYPE_ALL = "/api/v1/booking-types";
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

  static async getBookingByInvoice(invoiceNumber: string): Promise<any> {
    try {
      const response = await getSingleData(
        `${this.BOOKINGS_URL}/invoice/${encodeURIComponent(invoiceNumber)}`,
      );
      return response?.data || null;
    } catch (error) {
      console.error("Error fetching booking by invoice:", error);
      throw error;
    }
  }

  static async getTripBySegment(segmentId: string): Promise<any | null> {
    try {
      const response = await getSingleData(
        `${this.TRIPS_URL}/by-segment/${segmentId}`,
        undefined,
        { silent: true },
      );
      return response?.data?.[0]?.data || null;
    } catch (error) {
      // No trip exists for this segment yet, which is expected for segments that
      // have not been turned into a trip. Handled by the callers, nothing to log.
      return null;
    }
  }

  static async getDashboardMetrics(): Promise<{
    bookings: number;
    trips: number;
    paymentsTotal: number;
  }> {
    let bookings = 0;
    let trips = 0;
    let paymentsTotal = 0;

    try {
      const segBody = await this.getMyBookings({ page: 0, size: 1000 } as any);
      const content: any[] = segBody?.data?.content ?? [];
      trips = segBody?.data?.totalElements ?? content.length;
      const ids = new Set(
        content.map((s) => s?.booking?.bookingId).filter(Boolean),
      );
      bookings = ids.size;
    } catch (error) {
      console.error("Error loading booking metrics:", error);
    }

    try {
      const payBody: any = await PaymentService.getMyPayments({
        page: 0,
        size: 1000,
      } as any);
      const payContent: any[] = payBody?.data?.content ?? [];
      paymentsTotal = payContent
        .filter((p) => String(p?.paymentStatus).toUpperCase() === "SUCCESSFUL")
        .reduce((sum, p) => sum + (Number(p?.amountPaid) || 0), 0);
    } catch (error) {
      console.error("Error loading payment metrics:", error);
    }

    return { bookings, trips, paymentsTotal };
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

  static async getAllBookingTypes(): Promise<any[]> {
    if (allBookingTypesCache) return allBookingTypesCache;
    if (allBookingTypesPromise) return allBookingTypesPromise;
    const url = this.BOOKING_TYPE_ALL;
    allBookingTypesPromise = (async () => {
      try {
        const response = await getTableData(`${url}`);
        const data = response?.data?.data || [];
        allBookingTypesCache = data;
        return data;
      } catch (error) {
        allBookingTypesPromise = null;
        console.error("Error fetching all booking types:", error);
        return [];
      }
    })();
    return allBookingTypesPromise;
  }

  static async calculateBooking(request: BookingCalculationRequest) {
    const response = await createData(
      this.BOOKINGS_URL + "/calculate",
      request,
      { silent: true, requireAuth: true, skipLoader: true },
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
  }

  // Updates an existing price calculation (PUT) instead of creating a new one.
  // The booking calculation endpoint persists a record on every POST, so reusing
  // the same record for recalculations avoids leaving unused estimates behind.
  static async updateCalculation(
    id: string,
    request: BookingCalculationRequest,
  ) {
    const response = await updateData(
      this.BOOKINGS_URL + "/calculate",
      id,
      request,
      { silent: true, requireAuth: true, skipLoader: true },
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
  }

  static async createBooking(bookingData: any) {
    // console.log("Creating booking with data:", bookingData);
    try {
      const response = await createData(this.BASE_URL, bookingData);
      if (!response || !response.data)
        throw new Error("Failed to create booking");

      clarityEvent("booking_created", {
        booking_id:
          (response as any)?.data?.bookingId ?? (response as any)?.data?.id,
        invoice_number: (response as any)?.data?.invoiceNumber,
      });
      return response;
    } catch (error) {
      console.error("Booking creation error:", error);
      throw error;
    }
  }

  static async createSpecialBooking(bookingData: any) {
    try {
      const response: any = await createData(
        this.BASE_URL_SPECIAL_BOOKING,
        bookingData,
      );
      // createData does not throw on a handled error; it returns { error, message }.
      // Surface that message (e.g. insufficient corporate balance or spending limit)
      // instead of a generic failure.
      if (response?.error) {
        throw new Error(response.message || "Failed to create booking");
      }
      if (!response || !response.data)
        throw new Error("Failed to create booking");

      clarityEvent("booking_created", { type: "service_pricing" });
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
      clarityEvent("payment_initiated", {
        payment_provider: paymentData.paymentProvider,
        booking_id: paymentData.bookingId,
      });
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
      anonymousEmail?: string;
      anonymousFullName?: string;
    },
    isAnonymous: boolean,
  ): Promise<any> {
    const AUTH_ENDPOINT = "/api/v1/rating-review";
    const PUBLIC_ENDPOINT = "/api/v1/rating-review/anonymouse-user";

    const post = async (
      endpoint: string,
      requireAuth: boolean,
      payload: Record<string, unknown>,
    ) => {
      const response = await createData(endpoint, payload, {
        requireAuth,
        silent: true,
      });
      if (!response || !response.data) {
        throw new Error(response?.message || "Failed to create review");
      }
      return response.data;
    };

    const submit = async (payload: Record<string, unknown>) => {
      if (isAnonymous) {
        return post(PUBLIC_ENDPOINT, false, payload);
      }
      try {
        return await post(AUTH_ENDPOINT, true, payload);
      } catch (error) {
        // Review links are opened from email, often in a browser or in-app webview that
        // carries no session, while a stale profile still looks signed in. The signed-in
        // endpoint rejects those, so fall back to the public one rather than lose the
        // review.
        console.error("Signed-in review failed, retrying as a guest:", error);
        return post(PUBLIC_ENDPOINT, false, payload);
      }
    };

    try {
      return await submit(reviewData);
    } catch (error) {
      // Review emails sent before the link was corrected label the id as a trip when it
      // is really a booking, so the server cannot find the entity. Those emails are
      // already in people's inboxes, so retry against the booking instead of losing the
      // review.
      if (reviewData.entityType !== "Booking") {
        return submit({ ...reviewData, entityType: "Booking" });
      }
      throw error;
    }
  }

  static async checkIfUserHasReviewed(bookingId: string): Promise<boolean> {
    try {
      const response = await getSingleData(
        `/api/v1/rating-review/entity/${bookingId}`,
      );

      // handleApiResponse returns { data, error }. On an error response (for
      // example a 401 when a guest opens the link with no session) data is null
      // and error is true, so treat that as "not reviewed" and show the form.
      if (!response || response.error || !response.data) {
        return false;
      }

      const payload = Array.isArray(response.data)
        ? response.data[0]?.data
        : response.data;
      const content = payload?.content;
      return Array.isArray(content) && content.length > 0;
    } catch {
      // The check is a convenience. If it cannot run, still show the form: the server
      // rejects a duplicate on submit, and that is handled there.
      return false;
    }
  }
}
