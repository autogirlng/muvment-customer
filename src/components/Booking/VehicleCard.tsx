"use client";
import React, { useState, useMemo } from "react";
import { FiMapPin, FiUser, FiDroplet, FiHeart } from "react-icons/fi";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

export interface VehicleCardProps {
  id: string;
  name: string;
  city: string;
  vehicleTypeName: string;
  allPricingOptions: {
    bookingTypeId: string;
    bookingTypeName: string;
    price: number;
    platformFeeType: string;
  }[];
  extraHourlyRate: number;
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  numberOfSeats: number;
  photos: { cloudinaryUrl: string; isPrimary: boolean }[];
}

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

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
    console.log(`Navigate to /vehicles/${id}`);
  };

  const currentImage = images[currentImageIndex];

  return (
    <div
      onClick={handleCardClick}
      className="w-full border border-gray-200 rounded-[42px] overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:h-[240px] lg:h-[280px] xl:h-[320px]"
    >
      {/* Image Section */}
      <div className="relative w-full h-[240px] md:w-[300px] md:h-auto lg:w-[300px] xl:w-[470px] md:flex-shrink-0 bg-gray-100">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name || "Vehicle"}
            className="w-full h-full object-cover rounded-t-[42px] md:rounded-t-none md:rounded-l-[42px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-t-[42px] md:rounded-t-none md:rounded-l-[42px]">
            <svg
              className="w-16 h-16 text-gray-400"
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
        <div className="absolute top-3 left-3 bg-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <FiMapPin className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">{city || "N/A"}</span>
        </div>

        {/* Image Counter */}
        {images.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all"
            >
              <svg
                className="w-4 h-4 text-gray-700"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all"
            >
              <svg
                className="w-4 h-4 text-gray-700"
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
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between px-5 py-5 md:py-0 gap-4">
        {/* Left Content: Title, Type, and Pricing */}
        <div className="md:px-3 lg:px-5 md:min-w-[180px] lg:min-w-[220px] xl:min-w-[240px] space-y-2 lg:space-y-3">
          {/* Title */}
          <h3 className="text-xl md:text-1xl lg:text-2xl xl:text-4xl font-semibold text-gray-900 leading-tight">
            {name}
          </h3>

          {/* Pricing Section */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div>
              <p className="text-xs md:text-xs lg:text-sm text-gray-500 font-medium mb-0.5">
                Daily
              </p>
              <p className="text-lg md:text-1xl lg:text-1xl xl:text-3xl text-gray-900 whitespace-nowrap">
                {formatCurrency(allPricingOptions?.[0]?.price || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-xs lg:text-sm text-gray-500 font-medium mb-0.5">
                Extra Hours
              </p>
              <p className="text-lg md:text-xl lg:text-1xl xl:text-3xl text-gray-900 whitespace-nowrap">
                {formatCurrency(extraHourlyRate || 0)}
              </p>
            </div>
          </div>

          {/* Vehicle Type */}
          <p className="text-sm text-gray-500 font-medium">
            {vehicleTypeName.replaceAll("_", " ")}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-24 lg:h-32 bg-gray-200"></div>

        {/* Right Content: Features */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-3 md:px-3 lg:px-5">
          <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-base 2xl:text-lg bg-gray-100 w-fit px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 rounded-md text-gray-700">
            <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Driver Available:{" "}
              <strong>{willProvideDriver ? "Yes" : "No"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-base 2xl:text-lg bg-gray-100 w-fit px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 rounded-md text-gray-700">
            <FiDroplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Fuel Available: <strong>{willProvideFuel ? "Yes" : "No"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-base 2xl:text-lg bg-gray-100 w-fit px-2.5 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 rounded-md text-gray-700">
            <MdAirlineSeatReclineNormal className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">
              Seats: <strong>{numberOfSeats || 0}</strong>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-20 lg:h-24 xl:h-28 bg-gray-200"></div>

        {/* Heart Button */}
        <div className="flex items-center justify-center md:pr-3 lg:pr-6 xl:pr-8">
          <button
            onClick={handleLike}
            className="p-2 sm:p-2.5 lg:p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add to favorites"
          >
            <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
