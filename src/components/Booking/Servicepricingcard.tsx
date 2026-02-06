"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { ServicePricingShowcase } from "@/types/Servicepricing";

import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { ServicePricingStorage } from "@/utils/Servicepricingstorage";

interface ServicePricingCardProps {
  data: ServicePricingShowcase;
}

export const ServicePricingCard: React.FC<ServicePricingCardProps> = ({
  data,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === 0 ? data.sampleImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === data.sampleImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleCardClick = () => {
    ServicePricingStorage.saveToStorage(data);

    const url = ServicePricingService.buildDetailsUrl(
      data.yearRangeId,
      data.servicePricingId,
    );
    router.push(url);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentImageIndex(index);
  };

  const prices = Array.isArray(data.prices) ? data.prices : [];

  const lowestPrice =
    prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : 0;
  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <div className="relative h-full w-full">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={data?.sampleImages[currentImageIndex]}
            alt={`${data.name} - Image ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
        </div>

        {data?.sampleImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <FiChevronRight className="w-5 h-5 text-gray-800" />
            </button>

            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {currentImageIndex + 1} / {data.sampleImages.length}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {data.sampleImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(index, e)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "bg-white w-6"
                      : "bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
          {data.rideType}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {data.servicePricingName}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <FiCalendar className="w-4 h-4" />
          <span>
            {data.minYear} - {data.maxYear}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{data.name}</p>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <p className="text-2xl font-bold text-blue-600">
                NGN {lowestPrice.toLocaleString()}
              </p>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200">
              View Details
            </button>
          </div>

          {data.prices.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              +{data.prices.length - 1} more pricing option
              {data.prices.length > 2 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
