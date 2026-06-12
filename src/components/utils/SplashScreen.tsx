"use client";

import { useEffect, useState } from "react";
import ScreenLoader from "@/components/utils/ScreenLoader";

// Shown from the very first paint (so it never lands on top of already-visible
// content) and faded out shortly after the app hydrates. Initial load only.
export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fade"), 600);
    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const doneTimer = setTimeout(() => setPhase("done"), 500);
    return () => clearTimeout(doneTimer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`transition-opacity duration-500 ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <ScreenLoader />
    </div>
  );
}
