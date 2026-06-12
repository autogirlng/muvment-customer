import axios from "axios";
export default class NetworkService {
  static checkConnection() {
    if (typeof window !== "undefined" && !navigator.onLine) {
      window.location.href = "/Network-checker"; // Redirect without using router
      return false;
    }
    return true;
  }

  static handleApiResponse(response: any): {
    data: any | null;
    message: string;
    error: boolean;
  } {
    if (response.err) {
      return {
        data: null,
        message: response.err || "No response received from server.",
        error: true,
      };
    }

    return {
      data: response,
      message: "Success",
      error: false,
    };
  }

  static handleApiError(error: any): {
    data: null | { status: number };
    message: string;
    error: boolean;
  } {
    // console.log("API Error:", error);

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;

      if (status === 403) {
        return {
          data: null,
          message: "You don't have permission to access this resource.",
          error: true,
        };
      }

      if (status >= 500) {
        return {
          data: null,
          message: "Server error. Please try again later.",
          error: true,
        };
      }

      return {
        data: null,
        message: `Request failed with status ${status}`,
        error: true,
      };
    }

    return {
      data: null,
      message: "Unexpected error occurred.",
      error: true,
    };
  }
}
