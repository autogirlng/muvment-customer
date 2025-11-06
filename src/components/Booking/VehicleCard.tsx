"use client";
import {
  formatCurrency,
  getDisplayLabel,
  getDisplayPrice,
} from "@/app/services/vechilePriceUtiles";
import { VehicleCardProps } from "@/types/vehicle";
import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, use } from "react";
import { FiMapPin, FiUser, FiDroplet, FiHeart } from "react-icons/fi";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  name,
  city,
  vehicleTypeName,
  allPricingOptions,
  extraHourlyRate,
  willProvideDriver,
  willProvideFuel,
  numberOfSeats,
  photos,
  bookingType,
}) => {
  const images = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    return photos
      .map((p) => p?.cloudinaryUrl)
      .filter(
        (url) =>
          url && (url.startsWith("http://") || url.startsWith("https://"))
      );
  }, [photos]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const route = useRouter();
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCardClick = () => {
    route.push(
      `/Booking/details/${id}?vehicleType=${encodeURIComponent(
        vehicleTypeName
      )}&bookingType=${bookingType}`
    );
  };

  const currentImage = images[currentImageIndex];

  return (
    <div
      onClick={handleCardClick}
      className="w-full border border-gray-200 rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:h-[220px] lg:h-[260px] xl:h-[300px]"
    >
      {/* Image Section */}
      <div className="relative w-full h-[200px] sm:h-[240px] md:w-[240px] md:h-auto lg:w-[280px] xl:w-[340px] md:flex-shrink-0 bg-gray-100">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name || "Vehicle"}
            className="w-full h-full object-cover rounded-t-[28px] sm:rounded-t-[36px] lg:rounded-t-[42px] md:rounded-t-none md:rounded-l-[28px] lg:md:rounded-l-[36px] xl:md:rounded-l-[42px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-t-[28px] sm:rounded-t-[36px] lg:rounded-t-[42px] md:rounded-t-none md:rounded-l-[28px] lg:md:rounded-l-[36px] xl:md:rounded-l-[42px]">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* City Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <FiMapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="uppercase tracking-wider">{city || "N/A"}</span>
        </div>

        {/* Image Counter */}
        {images.length > 0 && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1 sm:p-1.5 rounded-full shadow-md transition-all"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1 sm:p-1.5 rounded-full shadow-md transition-all"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 sm:px-5 sm:py-5 md:py-0 gap-3 sm:gap-4">
        {/* Left Content: Title, Type, and Pricing */}
        <div className="md:px-2 lg:px-4 xl:px-5 md:min-w-[160px] lg:min-w-[200px] xl:min-w-[240px] space-y-1.5 sm:space-y-2 lg:space-y-3">
          {/* Title */}
          <h3 className="text-lg sm:text-xl md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 leading-tight line-clamp-1">
            {name}
          </h3>

          {/* Pricing Section */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mb-0.5">
                {getDisplayLabel(bookingType)}
              </p>
              <p className="text-base sm:text-lg md:text-base lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 whitespace-nowrap">
                {formatCurrency(
                  getDisplayPrice(bookingType, allPricingOptions)
                )}
              </p>
            </div>
            {extraHourlyRate > 0 && (
              <div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mb-0.5">
                  Extra Hours
                </p>
                <p className="text-base sm:text-lg md:text-base lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 whitespace-nowrap">
                  {formatCurrency(extraHourlyRate)}
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Type */}
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {vehicleTypeName.replaceAll("_", " ")}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-16 lg:h-24 xl:h-32 bg-gray-200 flex-shrink-0"></div>

        {/* Right Content: Features */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5 sm:gap-2 md:px-2 lg:px-3 xl:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-[11px] lg:text-sm xl:text-xs 2xl:text-sm bg-gray-100 w-fit px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 rounded-md text-gray-700">
            <FiUser className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Driver Available:{" "}
              <strong>{willProvideDriver ? "Yes" : "No"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-[11px] lg:text-sm xl:text-xs 2xl:text-sm bg-gray-100 w-fit px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 rounded-md text-gray-700">
            <FiDroplet className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Fuel Available: <strong>{willProvideFuel ? "Yes" : "No"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-[11px] lg:text-sm xl:text-xs 2xl:text-sm bg-gray-100 w-fit px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 rounded-md text-gray-700">
            <MdAirlineSeatReclineNormal className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Seats: <strong>{numberOfSeats || 0}</strong>
            </span>
          </div>
        </div>

        <div className="hidden md:block w-px h-14 lg:h-20 xl:h-24 bg-gray-200 flex-shrink-0"></div>

        {/* Heart Button */}
        <div className="hidden md:flex items-center justify-center md:pr-2 lg:pr-4 xl:pr-6">
          <button
            onClick={handleLike}
            className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add to favorites"
          >
            <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Heart Button */}
        <div className="md:hidden flex justify-end -mt-2">
          <button
            onClick={handleLike}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add to favorites"
          >
            <FiHeart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
