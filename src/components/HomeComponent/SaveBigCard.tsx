import React, { useState, useEffect, useRef } from "react";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaUsers,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

export interface SaveBigVehicle {
  photos: Array<{
    isPrimary: boolean;
    cloudinaryUrl: string;
  }>;
  allPricingOptions: Array<{
    bookingTypeName: string;
    price: number;
  }>;
  name: string;
  rating?: number;
  numberOfSeats: number;
  vehicleTypeName: string;
  city: string;
  id: string;
}

export interface SaveBigCardProps {
  vehicle: SaveBigVehicle;
  onFavorite: () => void;
  isFavorited: boolean;
  onCardClick: (id: string) => void;
}

const SaveBigCard: React.FC<SaveBigCardProps> = ({
  vehicle,
  onFavorite,
  isFavorited,
  onCardClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Filter to show only primary photos
  const primaryPhotos = vehicle.photos.filter((photo) => photo.isPrimary);
  const displayPhotos =
    primaryPhotos.length > 0 ? primaryPhotos : [vehicle.photos[0]];

  const monthlyPrice =
    vehicle.allPricingOptions.find(
      (option) => option.bookingTypeName.toLowerCase() === "monthly"
    )?.price || 0;

  const dailyPrice =
    vehicle.allPricingOptions.find(
      (option) => option.bookingTypeName.toLowerCase() === "daily"
    )?.price ||
    vehicle.allPricingOptions[0]?.price ||
    0;

  const savings =
    monthlyPrice > 0 && dailyPrice > 0
      ? Math.abs(monthlyPrice - dailyPrice)
      : 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayPhotos.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="flex-shrink-0 w-full md:w-full lg:w-[calc(50%-12px)] bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
      <div className="md:hidden">
        <div className="relative h-48 rounded-t-xl overflow-hidden">
          <img
            src={
              displayPhotos[currentImageIndex]?.cloudinaryUrl ||
              "/placeholder.jpg"
            }
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />

          {displayPhotos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <FaChevronLeft className="w-3 h-3 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <FaChevronRight className="w-3 h-3 text-gray-700" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              {vehicle.city}
            </span>
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <FaStar className="w-3 h-3" />
              {vehicle.rating?.toFixed(1) || "4.5"}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={onFavorite}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            {isFavorited ? (
              <FaHeart className="w-4 h-4 text-red-500" />
            ) : (
              <FaRegHeart className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Seats Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <FaUsers className="w-3 h-3" />
              {vehicle.numberOfSeats}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {vehicle.name}
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <p className="text-xs text-gray-500">Monthly</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NGN {monthlyPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Daily</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NGN {dailyPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{vehicle.vehicleTypeName}</p>
              {savings > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Save ₦{savings.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Location & Action */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdLocationOn className="w-4 h-4 text-blue-600" />
              <span>{vehicle.city}</span>
            </div>
            <button
              onClick={() => onCardClick(vehicle.id)}
              className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Open Front Door
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Image Section - Left Side */}
        <div className="relative w-[280px] h-[220px] flex-shrink-0">
          <img
            src={
              displayPhotos[currentImageIndex]?.cloudinaryUrl ||
              "/placeholder.jpg"
            }
            alt={vehicle.name}
            className="w-full h-full object-cover rounded-l-xl"
          />

          {/* Image Navigation */}
          {displayPhotos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FaChevronLeft className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FaChevronRight className="w-3 h-3 text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Favorite Button */}
          <button
            onClick={onFavorite}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            {isFavorited ? (
              <FaHeart className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <FaRegHeart className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>

          {/* Seats Badge */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <FaUsers className="w-3 h-3" />
              {vehicle.numberOfSeats}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              {vehicle.city}
            </span>
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <FaStar className="w-3 h-3" />
              {vehicle.rating?.toFixed(1) || "4.5"}
            </span>
          </div>
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 pl-8 py-6 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {vehicle.name}
            </h3>
            <div className="flex items-center gap-4 mb-2">
              <div>
                <p className="text-xs text-gray-500">Monthly</p>
                <p className="text-sm font-semibold text-gray-900">
                  NGN {monthlyPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Daily</p>
                <p className="text-sm font-semibold text-gray-900">
                  NGN {dailyPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600">{vehicle.vehicleTypeName}</p>
            {savings > 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                Save ₦{savings.toLocaleString()}
              </p>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between mt-3">
            {/* Left: Location */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onMouseEnter={() => setShowTooltip("location")}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <MdLocationOn className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-700">{vehicle.city}</span>
                </div>
                {showTooltip === "location" && (
                  <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                    Vehicle location
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Button */}
            <button
              onClick={() => onCardClick(vehicle.id)}
              className="text-blue-600 text-xs pr-4 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Open Front Door
              <FaChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveBigCard;
