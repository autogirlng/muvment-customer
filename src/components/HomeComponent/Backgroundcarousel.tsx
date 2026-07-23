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
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            quality={70}
            sizes="100vw"
          />
        </div>
      ))}

      <div className={`absolute inset-0 ${overlay}`}></div>
    </div>
  );
}