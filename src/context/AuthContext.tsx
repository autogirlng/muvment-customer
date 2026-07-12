"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { clarityIdentify } from "@/services/clarity";
import { setGAUser } from "@/services/analytics";
import Cookies from "js-cookie";
import { AuthService } from "@/controllers/auth/auth";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: string;
  isVerified?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    userData: User,
    tokens: { accessToken: string; refreshToken: string },
    rememberMe?: boolean
  ) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// The login response calls it userId, /users/me calls it id. Normalize once so every
// consumer can rely on user.id.
const normalizeUser = (raw: any) => {
  if (!raw) return raw;
  const id = raw.id ?? raw.userId ?? null;
  return id && !raw.id ? { ...raw, id } : raw;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from cookies on mount
  useEffect(() => {
    loadUserFromCookies();
  }, []);

  const loadUserFromCookies = async () => {
    try {
      const accessTokenCookie = Cookies.get("muvment_access_token");
      const refreshTokenCookie = Cookies.get("muvment_refresh_token");

      // No token means no session; let the app treat this as logged out.
      if (!accessTokenCookie) {
        return;
      }
      setAccessToken(accessTokenCookie);
      setRefreshToken(refreshTokenCookie || null);

      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("muvment_user")
          : null;
      const userRaw = stored || Cookies.get("muvment_user") || null;

      let userData = normalizeUser(userRaw ? JSON.parse(userRaw) : null);

      // Token is valid but the stored user is missing (e.g. an old oversized
      // cookie was dropped): rebuild the session from the API instead of logging
      // the person out.
      if (!userData) {
        userData = normalizeUser(await AuthService.getUserInformation());
        if (userData && typeof window !== "undefined") {
          localStorage.setItem("muvment_user", JSON.stringify(userData));
        }
      }

      if (userData) {
        setUser(userData);
        clarityIdentify(
          userData.id,
          `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() ||
            userData.email,
        );
        setGAUser(userData.id);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    userData: User,
    tokens: { accessToken: string; refreshToken: string },
    rememberMe: boolean = true
  ) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);

    // Remembered sessions persist for the refresh-token lifetime (7 days);
    // otherwise tokens are session cookies that clear when the browser closes.
    const base = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
    const opts = rememberMe ? { ...base, expires: 7 } : base;

    Cookies.set("muvment_remember", rememberMe ? "1" : "0", opts);
    Cookies.set("muvment_access_token", tokens.accessToken, opts);
    Cookies.set("muvment_refresh_token", tokens.refreshToken, opts);

    const normalized = normalizeUser(userData);
    setUser(normalized);
    clarityIdentify(
      normalized.id,
      `${normalized.firstName ?? ""} ${normalized.lastName ?? ""}`.trim() ||
        normalized.email,
    );
    setGAUser(normalized.id);

    // A new sign-in must not inherit the previous user's or a guest's booking
    // details. Clear the saved booking personal info so the form prefills from
    // this account instead of the prior session.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userBookingInformation");
    }

    // Store the user in localStorage, not a cookie. The login response carries
    // both JWTs and the organizations list, which pushes a cookie past the 4KB
    // limit and gets it silently dropped (logging the user out on reload).
    // localStorage has no such limit. Tokens stay in their own cookies for the
    // API client.
    const storedUser = { ...normalized } as Record<string, unknown>;
    delete storedUser.accessToken;
    delete storedUser.refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("muvment_user", JSON.stringify(storedUser));
    }
    Cookies.remove("muvment_user");
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear cookies
    Cookies.remove("muvment_user");
    Cookies.remove("muvment_access_token");
    Cookies.remove("muvment_refresh_token");
    Cookies.remove("muvment_remember");
    if (typeof window !== "undefined") {
      localStorage.removeItem("muvment_user");
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Don't leave this account's booking details behind for the next guest or
    // account that signs in on this browser.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userBookingInformation");
    }

    // Redirect to login
    window.location.href = "/auth/login";
  };

  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    const base = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
    const remembered = Cookies.get("muvment_remember") !== "0";
    const opts = remembered ? { ...base, expires: 7 } : base;

    Cookies.set("muvment_access_token", newAccessToken, opts);
    Cookies.set("muvment_refresh_token", newRefreshToken, opts);

    if (remembered) {
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,

    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
