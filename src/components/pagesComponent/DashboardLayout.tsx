"use client";

import React, { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ScreenLoader from "@/components/utils/ScreenLoader";

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (isLoading) return;

    if (!isAuthenticated || !accessToken) {
      logout();
      router.replace("/auth/login");
      return;
    }
    if (
      user?.isBanned ||
      user?.status === "banned" ||
      user?.isActive === false
    ) {
      logout();
      router.replace("/access-denied");
      return;
    }
  }, [isAuthenticated, isLoading, accessToken, user, router, logout]);

  if (isLoading) {
    return (
      <div className="">
        <ScreenLoader />
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Dashboard header or sidebar */}
      <header className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>

      {/* Main dashboard content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayoutClient;
