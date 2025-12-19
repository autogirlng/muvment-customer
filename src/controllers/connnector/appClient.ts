import axios from "axios";
import Cookies from "js-cookie";
//  do not write any code here
class ApiClient {
  private static BaseURL = process.env.NEXT_PUBLIC_API_URL;

  static async request(
    url: string,
    {
      method = "GET",
      body,
      headers = {},
      requireAuth = true,
      params = {},
    }: {
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      body?: Record<string, unknown> | null;
      headers?: Record<string, string>;
      requireAuth?: boolean;
      params?: Record<string, unknown>;
    }
  ): Promise<[any, string]> {
    if (!this.BaseURL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }

    let token: string | undefined;
    if (typeof window !== "undefined") {
      token = Cookies.get("muvment_access_token");
    }

    const requestHeaders: Record<string, string> = {
      //"Content-Type": "application/json; charset=UTF-8",
      ...headers,
    };

    if (requireAuth && token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios({
        url: `${this.BaseURL}${url}`,
        method,
        data: body || {},
        headers: requestHeaders,
        params,
      });
      return [response.data as any, "Request successful"];
    } catch (error: unknown) {
      console.error("API request error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          return [409, "A conflict occured"];
        }
        let message =
          error.response?.data.data ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Network error or request failed";

        if (error.response?.status === 401) {
          message = message
            ? message
            : "Unauthorized: Token expired or invalid";
        }

        return [{ err: message }, message];
      }
      return [null, "An unknown error occurred"];
    }
  }

  static baseUrl() {
    return this.BaseURL;
  }

  // Add this method to your ApiClient class
  static async downloadFile(
    url: string,
    defaultFilename: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    if (!this.BaseURL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }

    let token: string | undefined;
    if (typeof window !== "undefined") {
      token = Cookies.get("muvment_access_token");
    }

    const requestHeaders: Record<string, string> = {};
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios({
        url: `${this.BaseURL}${url}`,
        method: "GET",
        headers: requestHeaders,
        params,
        responseType: "blob", // Important: tell axios to expect binary data
      });

      const blob = response.data;

      // Try to get filename from Content-Disposition header
      let filename = defaultFilename;
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Create download link
      const url_obj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url_obj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url_obj);
    } catch (error: unknown) {
      console.error("Download error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to download file";
        throw new Error(message);
      }
      throw new Error("An unknown error occurred");
    }
  }
}

export default ApiClient;
