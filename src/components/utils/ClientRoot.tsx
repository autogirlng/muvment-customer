"use client";

import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import RouteTracker from "../general/RouteTracker";
import TopProgressBar from "@/components/utils/TopProgressBar";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <AuthProvider>
        <Suspense fallback={null}>
          <RouteTracker />
        </Suspense>
        {children}
      </AuthProvider>
    </>
  );
}
