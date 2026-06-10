"use client";

import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import RouteTracker from "../general/RouteTracker";
import SplashScreen from "@/components/utils/SplashScreen";
import TopProgressBar from "@/components/utils/TopProgressBar";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SplashScreen />
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthProvider>
        <Suspense fallback={null}>
          <RouteTracker />
        </Suspense>
        {children}
      </AuthProvider>
    </>
  );
}
