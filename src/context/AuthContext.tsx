"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

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
    tokens: { accessToken: string; refreshToken: string }
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
        setAccessToken(accessTokenCookie);
        setRefreshToken(refreshTokenCookie || null);
      }
    } catch (error) {
      console.error("Error loading user from cookies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (
    userData: User,
    tokens: { accessToken: string; refreshToken: string }
  ) => {
    // Set state
    const getUser = setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);

    // Store in cookies (expires in 7 days)
    Cookies.set("muvment_user", JSON.stringify(userData), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    Cookies.set("muvment_access_token", tokens.accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    Cookies.set("muvment_refresh_token", tokens.refreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
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

    // Redirect to login
    window.location.href = "/auth/login";
  };

  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    Cookies.set("muvment_access_token", newAccessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    Cookies.set("muvment_refresh_token", newRefreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
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
