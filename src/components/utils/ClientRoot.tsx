"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ScreenLoader from "@/components/utils/ScreenLoader";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const handleReady = () => setIsAppReady(true);
    if (document.readyState === "complete") {
      handleReady();
    } else {
      window.addEventListener("load", handleReady);
    }
    return () => window.removeEventListener("load", handleReady);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!isAppReady ? (
        <ScreenLoader />
      ) : (
        <>
          <AuthProvider>{children}</AuthProvider>
        </>
      )}
    </>
  );
}
