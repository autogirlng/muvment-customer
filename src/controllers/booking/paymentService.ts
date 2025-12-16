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
  userName?: string;
  userPhone?: string;
  userEmail?: string;
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

      const payload = apiResponse?.data ?? apiResponse;

      if (!payload) {
        throw new Error("No receipt data received from server");
      }

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

// Add this to your PaymentService or create a new ReceiptService

export class ReceiptGenerator {
  static generateReceiptHTML(payment: Payment): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const isPaid = payment.paymentStatus === "SUCCESSFUL";
    const statusColor = isPaid ? "#10b981" : "#f59e0b";
    const statusText = isPaid ? "PAID" : "PENDING";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f4f6;
      padding: 40px 20px;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .status-badge {
      display: inline-block;
      background: ${statusColor};
      color: white;
      padding: 8px 24px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 16px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .info-item {
      padding: 12px 0;
    }
    .info-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .info-value {
      font-size: 15px;
      color: #111827;
      font-weight: 500;
    }
    .payment-summary {
      background: #f9fafb;
      border-radius: 8px;
      padding: 24px;
      margin-top: 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-top: 16px;
      margin-top: 8px;
      border-top: 2px solid #d1d5db;
    }
    .summary-label {
      font-size: 15px;
      color: #4b5563;
    }
    .summary-value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    .summary-row:last-child .summary-label,
    .summary-row:last-child .summary-value {
      font-size: 18px;
      font-weight: 700;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
    }
    .transaction-ref {
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .receipt-container {
        box-shadow: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>Payment Receipt</h1>
      <p>Vehicle Booking Service</p>
      <div class="status-badge">${statusText}</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${payment.userName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${payment.userEmail}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${payment.userPhone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Customer ID</div>
            <div class="info-value">${payment.userId.substring(0, 8)}...</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Vehicle Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Vehicle Name</div>
            <div class="info-value">${payment.vehicleName}</div>
          </div>
        
        </div>
      </div>

      <div class="section">
        <div class="section-title">Transaction Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Receipt Number</div>
            <div class="info-value">${payment.id
              .substring(0, 13)
              .toUpperCase()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Transaction Reference</div>
            <div class="info-value transaction-ref">${
              payment.transactionReference
            }</div>
          </div>
          <div class="info-item">
            <div class="info-label">Booking ID</div>
            <div class="info-value">${payment.bookingId
              .substring(0, 13)
              .toUpperCase()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Payment Provider</div>
            <div class="info-value">${payment.paymentProvider}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Created Date</div>
            <div class="info-value">${formatDate(payment.createdAt)}</div>
          </div>
          ${
            isPaid
              ? `
          <div class="info-item">
            <div class="info-label">Payment Date</div>
            <div class="info-value">${formatDate(payment.paidAt!)}</div>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="payment-summary">
          <div class="summary-row">
            <span class="summary-label">Total Amount</span>
            <span class="summary-value">${formatCurrency(
              payment.totalPayable
            )}</span>
          </div>
          ${
            payment.amountPaid
              ? `
          <div class="summary-row">
            <span class="summary-label">Amount Paid</span>
            <span class="summary-value">${formatCurrency(
              payment.amountPaid
            )}</span>
          </div>
          `
              : ""
          }
          <div class="summary-row">
            <span class="summary-label">Total ${isPaid ? "Paid" : "Due"}</span>
            <span class="summary-value">${formatCurrency(
              payment.amountPaid || payment.totalPayable
            )}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p>This is an electronically generated receipt.</p>
      <p>For any queries, please contact support with your receipt number.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static async downloadReceipt(payment: Payment): Promise<void> {
    try {
      const html = this.generateReceiptHTML(payment);

      // Create a blob from the HTML
      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      // Open in new window for printing
      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          // Wait for content to load then trigger print
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }

      // Also create a downloadable HTML file
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${payment.id.substring(0, 8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error generating receipt:", error);
      throw error;
    }
  }
}
