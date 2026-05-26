"use client";

import { useEffect, useState, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { AuthProvider } from "@/context/AuthContext";
import RouteTracker from "../general/RouteTracker";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleReady = () => setIsAppReady(true);
    if (document.readyState === "complete") {
      handleReady();
    } else {
      window.addEventListener("load", handleReady);
    }
    return () => window.removeEventListener("load", handleReady);
  }, []);

  // Only show the spinner after client-side mount so SSR HTML never contains
  // the loader or visibility:hidden — keeps the real page content crawlable.
  const showSpinner = isMounted && !isAppReady;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {showSpinner && <ScreenLoader />}
      <div style={showSpinner ? { visibility: "hidden" } : undefined}>
        <AuthProvider>
          <Suspense fallback={null}>
            <RouteTracker />
          </Suspense>
          {children}
        </AuthProvider>
      </div>
    </>
  );
}
