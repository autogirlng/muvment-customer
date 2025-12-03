"use client";
import { useState, useEffect } from "react";

interface SlidingBannerProps {
  message: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
}

export default function SlidingBanner({
  message,
  backgroundColor = "bg-[#1da1f2]",
  textColor = "text-white",
  duration = 180,
}: SlidingBannerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`${backgroundColor} ${textColor} py-2 overflow-hidden relative z-50 select-none`}
    >
      <div
        className="inline-block whitespace-nowrap"
        style={{
          animation: `train ${duration}s linear infinite`,
        }}
      >
        <span className="inline-flex items-center gap-6 px-20">
          <span className="text-sm md:text-md lg:text-md font-semibold tracking-wider">
            {message}
          </span>
          <span className="px-2 py-0.5 text-[0.5rem] font-semibold bg-gradient-to-r from-blue-800 to-blue-700 rounded-full">
            5% OFF
          </span>
        </span>
      </div>

      <style jsx>{`
        @keyframes train {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        /* Pause on hover */
        div:hover > div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
