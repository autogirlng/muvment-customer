"use client";
import {
  formatCurrency,
  getDisplayLabel,
  getDisplayPrice,
} from "@/services/vechilePriceUtiles";
import { VehicleCardProps } from "@/types/vehicle";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { FiMapPin, FiUser, FiDroplet, FiHeart } from "react-icons/fi";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { IoInformationCircleOutline } from "react-icons/io5";
import { getBookingOption } from "@/context/Constarain";

interface VehicleCardPropsExtended extends VehicleCardProps {
  viewMode?: "list" | "grid";
}

const VehicleCard: React.FC<VehicleCardPropsExtended> = ({
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
  viewMode = "list",
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
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);
  const router = useRouter();
  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
  };
  useEffect(() => {
    getBookingOptions();
  }, []);
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
    // Add like functionality here
  };

  const handleCardClick = () => {
    router.push(
      `/Booking/details/${id}?vehicleType=${encodeURIComponent(
        vehicleTypeName
      )}&bookingType=${bookingType}`
    );
  };

  const currentImage = images[currentImageIndex];

  // Grid View Component
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleCardClick}
        className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
      >
        {/* Image Section */}
        <div className="relative w-full h-[180px] bg-gray-100">
          {currentImage ? (
            <img
              src={currentImage}
              alt={name || "Vehicle"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <FiMapPin className="w-3 h-3 text-gray-700" />
            <span className="text-xs font-medium text-gray-700 uppercase">
              {city || "N/A"}
            </span>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
            aria-label="Add to favorites"
          >
            <FiHeart className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">
                  {getDisplayLabel(bookingType, bookingOptions)}
                </span>
                <IoInformationCircleOutline className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                {formatCurrency(
                  getDisplayPrice(
                    bookingType,
                    allPricingOptions,
                    bookingOptions
                  )
                )}
              </p>
            </div>
            {extraHourlyRate > 0 && (
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Extra hours</span>
                  <IoInformationCircleOutline className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(extraHourlyRate)}
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Type */}
          <p className="text-sm text-gray-600">
            {vehicleTypeName.replaceAll("_", " ")}
          </p>

          {/* Features */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser className="w-4 h-4" />
                <span>
                  Driver available: {willProvideDriver ? "Yes" : "No"}
                </span>
              </div>
              {/* <div className="flex items-center gap-2 text-gray-700">
                <FiUser className="w-4 h-4" />
                <span>Transmission: Manual</span>
              </div> */}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <FiDroplet className="w-4 h-4" />
                <span>Fuel available: {willProvideFuel ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MdAirlineSeatReclineNormal className="w-4 h-4" />
                <span>Seats: {numberOfSeats || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View Component
  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:h-[180px]"
    >
      {/* Image Section */}
      <div className="relative w-full md:w-[260px] h-[200px] md:h-full bg-gray-100 flex-shrink-0">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name || "Vehicle"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded flex items-center gap-1">
          <FiMapPin className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-xs font-semibold text-gray-700 uppercase">
            {city || "N/A"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center p-4 md:p-0 gap-4 md:gap-0">
        {/* Left Content */}
        <div className="flex-1 md:px-6 md:py-4">
          {/* Title */}
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2.5">
            {name}
          </h3>

          {/* Pricing */}
          <div className="flex items-start gap-8 mb-2.5">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">
                  {getDisplayLabel(bookingType, bookingOptions)}
                </span>
                <IoInformationCircleOutline className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                {formatCurrency(
                  getDisplayPrice(
                    bookingType,
                    allPricingOptions,
                    bookingOptions
                  )
                )}
              </p>
            </div>
            {extraHourlyRate > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-600">Extra hours</span>
                  <IoInformationCircleOutline className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(extraHourlyRate)}
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Type */}
          <p className="text-sm text-gray-600">
            {vehicleTypeName.replaceAll("_", " ")}
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-28 bg-gray-200 flex-shrink-0"></div>

        {/* Right Content - Features */}
        <div className="flex flex-col gap-3 md:px-6 md:py-4 md:min-w-[380px]">
          <div className="flex items-center gap-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              <span>
                Driver available:{" "}
                <strong>{willProvideDriver ? "Yes" : "No"}</strong>
              </span>
            </div>
            {/* <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              <span>
                Transmission: <strong>Manual</strong>
              </span>
            </div> */}
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FiDroplet className="w-4 h-4" />
              <span>
                Fuel available:{" "}
                <strong>{willProvideFuel ? "Yes" : "No"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MdAirlineSeatReclineNormal className="w-4 h-4" />
              <span>
                Seats: <strong>{numberOfSeats || 0}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-28 bg-gray-200 flex-shrink-0"></div>

        {/* Like Button */}
        <div className="hidden md:flex items-center justify-center px-5">
          <button
            onClick={handleLike}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add to favorites"
          >
            <FiHeart className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Mobile Like Button */}
        <button
          onClick={handleLike}
          className="md:hidden absolute top-2 right-2 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Add to favorites"
        >
          <FiHeart className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
