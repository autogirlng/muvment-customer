"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface BackgroundCarouselProps {
  images: string[];
  alts?: string[];
  interval?: number;
  overlay?: string;
}

export default function BackgroundCarousel({
  images,
  alts = [],
  interval = 3000,
  overlay = "bg-gradient-to-r from-gray-900/70 via-gray-800/50 to-gray-900/30",
}: BackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={alts[index] ?? ""}
            fill
            className="object-cover w-full h-full"
            priority={index === 0}
            quality={75}
            sizes="100vw"
          />
        </div>
      ))}

      <div className={`absolute inset-0 ${overlay}`}></div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className="p-2 -m-2 flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white w-8 h-2"
                    : "bg-white/50 hover:bg-white/75 w-2 h-2"
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}