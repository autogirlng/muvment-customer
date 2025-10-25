import { AuthController } from "../connnector/app.callers";
import Cookies from "js-cookie";

// Request interfaces
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: "CUSTOMER" | "HOST" | "DRIVER" | "ADMIN";
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyAccountRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Response interfaces
export interface AuthResponse {
  data?: any;
  error?: boolean;
  message?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

// Error class for better error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// Constants for storage keys to avoid typos
const STORAGE_KEYS = {
  ACCESS_TOKEN: "muvment_access_token",
  REFRESH_TOKEN: "muvment_refresh_token",
  USER: "muvment_user",
} as const;

const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export class AuthService {
  private static readonly BASE_URL = "/api/v1/auth";

  /**
   * Safe cookie setter with error handling
   */
  private static setCookie(key: string, value: string): void {
    try {
      Cookies.set(key, value, COOKIE_OPTIONS);
    } catch (error) {
      console.error(`Failed to set ${key} in cookies:`, error);
      throw new AuthError("Cookie operation failed");
    }
  }

  /**
   * Safe cookie getter with error handling
   */
  private static getCookie(key: string): string | null {
    try {
      return Cookies.get(key) || null;
    } catch (error) {
      console.error(`Failed to get ${key} from cookies:`, error);
      return null;
    }
  }

  /**
   * Safe cookie remover with error handling
   */
  private static removeCookie(key: string): void {
    try {
      Cookies.remove(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from cookies:`, error);
    }
  }

  /**
   * Store authentication data in cookies
   */
  private static storeAuthData(
    accessToken?: string,
    refreshToken?: string,
    user?: User
  ): void {
    if (accessToken) {
      this.setCookie(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      this.setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (user) {
      this.setCookie(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  private static handleResponse(response: any): AuthResponse {
    if (!response) {
      return {
        error: true,
        message: "No response from server",
      };
    }

    return response;
  }

  private static handleError(error: any, defaultMessage: string): AuthResponse {
    console.error("Auth service error:", error);

    if (error instanceof AuthError) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      error: true,
      message: defaultMessage,
    };
  }

  static async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/signup`,
        data,
        false
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(
        error,
        "Failed to create account. Please try again."
      );
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/login`,
        data,
        false
      );

      const handledResponse = this.handleResponse(response);
      if (handledResponse && !handledResponse.error && handledResponse.data) {
        this.storeAuthData(
          handledResponse.data.accessToken,
          handledResponse.data.refreshToken,
          handledResponse.data.user
        );
      }
      console.log(handledResponse);
      return handledResponse;
    } catch (error) {
      return this.handleError(
        error,
        "Failed to login. Please check your credentials."
      );
    }
  }

  /**
   * Verify account after signup
   * POST /v1/auth/verify-account
   */
  static async verifyAccount(
    data: VerifyAccountRequest
  ): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/verify-account`,
        data,
        false
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(
        error,
        "Failed to verify account. Please try again."
      );
    }
  }

  /**
   * Forgot password - sends reset email
   * POST /v1/auth/forgot-password
   */
  static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/forgot-password`,
        data,
        false
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(
        error,
        "Failed to send password reset email. Please try again."
      );
    }
  }

  /**
   * Reset password with OTP
   * POST /v1/auth/reset-password
   */
  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/reset-password`,
        data,
        false
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(
        error,
        "Failed to reset password. Please try again."
      );
    }
  }

  /**
   * Resend verification OTP
   * POST /v1/auth/resend-verification-otp
   */
  static async resendVerificationOTP(
    data: ResendVerificationRequest
  ): Promise<AuthResponse> {
    try {
      const response = await AuthController(
        `${this.BASE_URL}/resend-verification-otp`,
        data,
        false
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(
        error,
        "Failed to resend verification code. Please try again."
      );
    }
  }

  /**
   * Refresh access token
   * POST /v1/auth/refresh-token
   */
  static async refreshToken(data?: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      // Use provided refresh token or get from cookies
      const refreshToken = data?.refreshToken || this.getRefreshToken();

      if (!refreshToken) {
        return {
          error: true,
          message: "No refresh token available",
        };
      }

      const response = await AuthController(
        `${this.BASE_URL}/refresh-token`,
        { refreshToken },
        false
      );

      const handledResponse = this.handleResponse(response);

      // Update access token in cookies if refresh successful
      if (
        handledResponse &&
        !handledResponse.error &&
        handledResponse.data?.accessToken
      ) {
        this.setCookie(
          STORAGE_KEYS.ACCESS_TOKEN,
          handledResponse.data.accessToken
        );
      }

      return handledResponse;
    } catch (error) {
      return this.handleError(
        error,
        "Failed to refresh token. Please login again."
      );
    }
  }

  /**
   * Logout user - clears cookies
   */
  static logout(): void {
    this.removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
    this.removeCookie(STORAGE_KEYS.REFRESH_TOKEN);
    this.removeCookie(STORAGE_KEYS.USER);
  }

  /**
   * Get current user from cookies
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = this.getCookie(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get access token from cookies
   */
  static getAccessToken(): string | null {
    return this.getCookie(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from cookies
   */
  static getRefreshToken(): string | null {
    return this.getCookie(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all auth data
   */
  static clearAuthData(): void {
    this.logout();
  }
}
