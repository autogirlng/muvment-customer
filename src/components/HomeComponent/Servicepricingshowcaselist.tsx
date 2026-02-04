"use client";

import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { ServicePricingShowcase } from "@/types/Servicepricing";
import React, { useState, useEffect, useRef } from "react";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ServicePricingCard } from "../Booking/Servicepricingcard";

export const ServicePricingShowcaseList: React.FC = () => {
  const [pricingData, setPricingData] = useState<ServicePricingShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const MAX_DOTS = 5;

  // Update cards on resize
  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 768) setVisibleCards(2);
      else if (window.innerWidth < 1024) setVisibleCards(3);
      else setVisibleCards(4);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  useEffect(() => {
    fetchServicePricing();
  }, []);

  const fetchServicePricing = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await ServicePricingService.getServicePricingShowcase();
      setPricingData(data[0].data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pricing data",
      );
    } finally {
      setLoading(false);
    }
  };

  // Move next (1 card at a time for smooth peek effect)
  const handleNext = () => {
    const maxIndex = Math.max(pricingData.length - visibleCards, 0);
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(newIndex);
  };

  // Move previous (1 card at a time)
  const handlePrev = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  // Check if arrows should be disabled
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= pricingData.length - visibleCards;

  // Handle dots
  const handleDotClick = (dotIndex: number) => {
    const totalCards = pricingData.length;
    const targetIndex = Math.min(
      dotIndex * visibleCards,
      totalCards - visibleCards,
    );
    setCurrentIndex(targetIndex);
  };

  // Active dot logic
  const getActiveDot = () => {
    const totalCards = pricingData.length;
    const slidesCount = Math.ceil(totalCards / visibleCards);
    const active = Math.floor(currentIndex / visibleCards);
    return Math.min(active, slidesCount - 1, MAX_DOTS - 1);
  };

  // Smooth scroll logic
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (!firstChild) return;

      const cardWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap || "24", 10);
      const scrollPosition = currentIndex * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchStartX.current - touchEndX.current;
      const threshold = 50;
      if (delta > threshold) handleNext();
      else if (delta < -threshold) handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading service pricing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchServicePricing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (pricingData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 text-lg">
            No service pricing available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 my-[50px]">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-[95%] ml-auto px-6">
          <div className="text-center md:text-start">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Service Pricing Showcase
            </h2>
            <p className="text-gray-600">
              Explore our range of service packages with flexible pricing
              options
            </p>
          </div>
        </div>

        {/* Carousel with Navigation Arrows */}
        <div className="relative">
          {/* Left Arrow - Desktop */}
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${
              isPrevDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Carousel Container */}
          <div
            className="relative px-4 md:px-16"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-hidden scroll-smooth select-none w-full"
              style={{
                maxWidth: "100%",
              }}
            >
              {pricingData.map((item) => (
                <div
                  key={`${item.yearRangeId}-${item.servicePricingId}`}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                >
                  <ServicePricingCard data={item} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow - Desktop */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${
              isNextDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            <FaChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Dots */}
        {pricingData.length > visibleCards && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({
              length: Math.min(
                Math.ceil(pricingData.length / visibleCards),
                MAX_DOTS,
              ),
            }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === getActiveDot()
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
