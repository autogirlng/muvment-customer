import {
  createData,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";

export interface Payment {
  id: string;
  bookingId: string;
  paymentStatus: string;
  paymentProvider: string;
  transactionReference: string;
  totalPayable: number;
  amountPaid: number;
  createdAt: string;
  paidAt: string;
  vehicleName: string;
  vehicleIdentifier: string;
  vehicleId: string;
  userId: string;
}

export interface PaymentResponse {
  status: string;
  message: string;
  errorCode: string;
  data: {
    content: Payment[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface PaymentFilters {
  page?: number;
  size?: number;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export class PaymentService {
  private static readonly BASE_URL = "/api/v1/payments";

  static async getMyPayments(
    filters: PaymentFilters = {}
  ): Promise<PaymentResponse> {
    try {
      const response = await getTableData(this.BASE_URL, filters);
      return response?.data as PaymentResponse;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  }

  static async downloadReceipt(paymentId: string): Promise<void> {
    try {
      // Implementation for downloading receipt
      const apiResponse = await getSingleData(
        `${this.BASE_URL}/${paymentId}/receipt`
      );
      // Use response.data if available otherwise use the response itself
      const payload = apiResponse?.data ?? apiResponse;
      if (!payload) {
        throw new Error("No receipt data received from server");
      }

      // Handle payload which may be a base64 string or binary-compatible BlobPart
      let blob: Blob;
      if (typeof payload === "string") {
        // Assume base64-encoded PDF string and decode it
        const base64 = payload.replace(/^data:application\/pdf;base64,/, "");
        const byteString =
          typeof atob === "function"
            ? atob(base64)
            : Buffer.from(base64, "base64").toString("binary");
        const ab = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          ab[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ab], { type: "application/pdf" });
      } else {
        // payload is binary / BlobPart compatible
        blob = new Blob([payload as BlobPart], { type: "application/pdf" });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${paymentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      throw error;
    }
  }
}
