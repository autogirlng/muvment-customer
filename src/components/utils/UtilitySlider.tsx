"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface SlideItem {
  image: string;
  title: string;
  text: string;
}

interface SliderProps {
  slides: SlideItem[];
  automatic?: boolean;
  seconds?: number;
  visibleCount?: number; // how many cards visible at once, default 4
}

export default function Slider({
  slides,
  automatic = false,
  seconds = 3,
  visibleCount = 4,
}: SliderProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = slides.length;
  const maxIndex = total - visibleCount; // furthest position we can slide to

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(index, maxIndex)));
    },
    [maxIndex]
  );

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play
  useEffect(() => {
    if (!automatic) return;
    timerRef.current = setTimeout(next, seconds * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [automatic, seconds, current, next]);

  const cardWidthPercent = 100 / visibleCount;
  const translatePercent = current * cardWidthPercent;

  return (
    <div className="relative w-full">
      {/* Overflow clip */}
      <div className="overflow-hidden">
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(-${translatePercent}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-2"
              style={{ width: `${cardWidthPercent}%` }}
            >
              <SlideCard slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="
          absolute -left-4 top-1/2 -translate-y-1/2 z-10
          w-9 h-9 rounded-full bg-white shadow-md border border-gray-200
          flex items-center justify-center
          text-gray-700 hover:bg-gray-100 active:scale-95
          transition-all duration-200
        "
      >
        <ChevronLeft />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="
          absolute -right-4 top-1/2 -translate-y-1/2 z-10
          w-9 h-9 rounded-full bg-white shadow-md border border-gray-200
          flex items-center justify-center
          text-gray-700 hover:bg-gray-100 active:scale-95
          transition-all duration-200
        "
      >
        <ChevronRight />
      </button>

      {/* Dot indicators — one dot per possible stop position */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to position ${i + 1}`}
            className={`
              rounded-full transition-all duration-300
              ${
                i === current
                  ? "w-6 h-2.5 bg-blue-500"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }
            `}
          />
        ))}
      </div>

      {/* Progress bar for auto-slide */}
      {automatic && (
        <ProgressBar key={`${current}-${seconds}`} durationSeconds={seconds} />
      )}
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function SlideCard({ slide }: { slide: SlideItem }) {
  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[3/4] group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={slide.title}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h3 className="text-white font-semibold text-base md:text-lg tracking-tight">
          {slide.title}
        </h3>
        <p className="text-white/75 text-xs md:text-sm mt-1 leading-snug">
          {slide.text}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ durationSeconds }: { durationSeconds: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-full">
      <div
        className="h-full bg-blue-500 rounded-full"
        style={{ animation: `slider-progress ${durationSeconds}s linear forwards` }}
      />
      <style>{`
        @keyframes slider-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}