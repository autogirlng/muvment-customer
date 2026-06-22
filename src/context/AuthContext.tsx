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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from cookies on mount
  useEffect(() => {
    loadUserFromCookies();
  }, []);

  const loadUserFromCookies = () => {
    try {
      const userCookie = Cookies.get("muvment_user");
      const accessTokenCookie = Cookies.get("muvment_access_token");
      const refreshTokenCookie = Cookies.get("muvment_refresh_token");

      if (userCookie && accessTokenCookie) {
        const userData = JSON.parse(userCookie);
        setUser(userData);
        clarityIdentify(
          userData.id,
          `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() ||
            userData.email,
        );
        setGAUser(userData.id);
        setAccessToken(accessTokenCookie);
        setRefreshToken(refreshTokenCookie || null);
      }
    } catch (error) {
      console.error("Error loading user from cookies:", error);
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

    setUser(userData);
    clarityIdentify(
      userData.id,
      `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() ||
        userData.email,
    );
    setGAUser(userData.id);

    // A new sign-in must not inherit the previous user's or a guest's booking
    // details. Clear the saved booking personal info so the form prefills from
    // this account instead of the prior session.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userBookingInformation");
    }

    Cookies.set("muvment_user", JSON.stringify(userData), opts);
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
