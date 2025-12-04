"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface SlidingBannerProps {
  messages: string[];
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  showLogo?: boolean;
  logoUrl?: string;
}

export default function SlidingBanner({
  messages,
  backgroundColor = "bg-[#1B1B1B]",
  textColor = "text-white",
  duration = 5000,
  showLogo = true,
  logoUrl = "/images/image.png",
}: SlidingBannerProps) {
  const [key, setKey] = useState(0);
  const [forceAnimate, setForceAnimate] = useState(false);

  // Detect mobile or tablet ( <1024px )
  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth < 1024) {
        setForceAnimate(true);
      } else {
        setForceAnimate(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Re-render when messages change
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [messages]);

  if (!messages || messages.length === 0) return null;

  const hasSingleMessage = messages.length === 1;

  // Apply animation even for single message on mobile/tablet
  const enableAnimation = !hasSingleMessage || forceAnimate;

  const displayMessages = enableAnimation
    ? [...messages, ...messages]
    : messages;

  return (
    <div
      className={`${backgroundColor} ${textColor} py-2 overflow-hidden relative z-50`}
    >
      <div className="max-w-8xl mx-auto overflow-hidden">
        <div className="relative h-auto">
          {!enableAnimation ? (
            // Single message (desktop) - No animation
            <div className="flex justify-center items-center">
              <div className="inline-flex items-center justify-center mx-12 flex-shrink-0 gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <p className="text-[1.3rem] font-medium tracking-normal">
                    {messages[0]}
                  </p>
                  <span className="px-3 py-1 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 rounded-full">
                    5% OFF
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Animation enabled (mobile/tablet OR multiple messages)
            <div
              key={key}
              className="flex animate-infinite-scroll whitespace-nowrap items-center"
              style={{ animationDuration: `${duration * messages.length}ms` }}
            >
              {displayMessages.map((message, index) => (
                <div
                  key={`${message}-${index}`}
                  className="inline-flex items-center justify-center mx-12 flex-shrink-0 gap-3 md:gap-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <p className="text-[1.3rem] font-light tracking-normal">
                      {message}
                    </p>
                    {index % 2 === 0 && (
                      <span className="px-2 py-0.5 text-[0.5rem] font-semibold bg-gradient-to-r from-blue-800 to-blue-700 rounded-full">
                        5% OFF
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(-10%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
