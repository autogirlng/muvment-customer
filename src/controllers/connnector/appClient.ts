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
        let message =
          error.response?.data.data ||
          error.response?.data?.error ||
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
}

export default ApiClient;
