"use client";

import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { ServicePricingShowcase } from "@/types/Servicepricing";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ServicePricingCard } from "../general/Servicepricingcard";

const HEADING = "Hourly car rentals";
const SUBHEAD = "By the hour, from 3 hours up. Driver and fuel included.";

const cardWidth =
  "w-[66%] flex-shrink-0 snap-start md:w-[calc(40%-12px)] lg:w-[calc(25%-18px)]";

const trackClasses =
  "flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const ServicePricingShowcaseList: React.FC = () => {
  const [pricingData, setPricingData] = useState<ServicePricingShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServicePricing();
  }, []);

  const fetchServicePricing = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ServicePricingService.getServicePricingShowcase();
      setPricingData(data?.[0]?.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pricing data",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const id = setTimeout(updateArrows, 100);
    return () => clearTimeout(id);
  }, [pricingData, updateArrows]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left:
        direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const showArrows = canScrollLeft || canScrollRight;

  const arrowClasses = (disabled: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
      disabled
        ? "cursor-not-allowed border-gray-200 text-gray-300"
        : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
    }`;

  const Header = ({ withArrows = false }: { withArrows?: boolean }) => (
    <div className="mb-8 flex items-end justify-between gap-4 px-4 lg:px-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {HEADING}
        </h2>
        <p className="mt-1 max-w-2xl text-gray-600">{SUBHEAD}</p>
      </div>
      {withArrows && showArrows && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous pricing"
            className={arrowClasses(!canScrollLeft)}
          >
            <FaChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next pricing"
            className={arrowClasses(!canScrollRight)}
          >
            <FaChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div
        id="hourly-rentals"
        className="w-full bg-white py-16 lg:py-20 scroll-mt-24"
      >
        <Header />
        <div className="px-4 lg:px-8">
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`${cardWidth} overflow-hidden rounded-xl border border-gray-200 bg-white`}
              >
                <div className="h-40 w-full animate-pulse bg-gray-100 sm:h-44" />
                <div className="p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-4 h-3 w-1/4 animate-pulse rounded bg-gray-100" />
                  <div className="mt-1 h-6 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchServicePricing}
            className="bg-[#0673FF] hover:bg-[#0560d6] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (pricingData.length === 0) {
    return null;
  }

  return (
    <div
      id="hourly-rentals"
      className="w-full bg-white py-16 lg:py-20 scroll-mt-24"
    >
      <Header withArrows />
      <div className="px-4 lg:px-8">
        <div ref={scrollRef} onScroll={updateArrows} className={trackClasses}>
          {pricingData.map((item) => (
            <div
              key={`${item.yearRangeId}-${item.servicePricingId}`}
              className={cardWidth}
            >
              <ServicePricingCard data={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
