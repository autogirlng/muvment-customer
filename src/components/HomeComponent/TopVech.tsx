"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  FaStar,
  FaUserTie,
  FaGasPump,
  FaHeart,
  FaRegHeart,
  FaUsers,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

export interface TopVehicle {
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
  willProvideDriver: boolean;
  willProvideFuel: boolean;
  numberOfSeats: number;
  vehicleTypeName: string;
  city: string;
  id: string;
}

export interface TopRatingProps {
  vehicle: TopVehicle;
  onFavorite: () => void;
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
}

// ─── Shared heart button ──────────────────────────────────────────────────────
const FavouriteButton: React.FC<{
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  onFavorite: () => void;
  className?: string;
  iconSize?: string;
}> = ({ isFavorited, isFavoriteLoading, onFavorite, className = "", iconSize = "w-4 h-4" }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onFavorite();
    }}
    disabled={isFavoriteLoading}
    aria-label={isFavorited ? "Remove from favourites" : "Add to favourites"}
    className={`flex items-center justify-center rounded-full shadow-md transition-colors
      ${isFavorited ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-gray-50"}
      ${isFavoriteLoading ? "cursor-not-allowed opacity-70" : ""}
      ${className}`}
  >
    {isFavoriteLoading ? (
      <span
        className={`block border-2 border-gray-300 border-t-red-500 rounded-full animate-spin ${iconSize}`}
      />
    ) : isFavorited ? (
      <FaHeart className={`${iconSize} text-red-500`} />
    ) : (
      <FaRegHeart className={`${iconSize} text-gray-600`} />
    )}
  </button>
);

// ─── Main card ────────────────────────────────────────────────────────────────
const TopRating: React.FC<TopRatingProps> = ({
  vehicle,
  onFavorite,
  isFavorited,
  isFavoriteLoading = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const router = useRouter();

  const price = vehicle.allPricingOptions[0]?.price || 0;
  const bookingType = vehicle.allPricingOptions[0]?.bookingTypeName || "";

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === vehicle.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? vehicle.photos.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => setCurrentImageIndex(index);

  const handleRouteToDetails = () => {
    router.push(`/booking/details/${vehicle.id}`);
  };

  return (
    <div className="flex-shrink-0 w-full md:w-full lg:w-[calc(50%-12px)] bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">

      {/* ── Mobile Layout ──────────────────────────────────────────── */}
      <div className="md:hidden">
        <div className="relative h-48 rounded-t-xl overflow-hidden">
          <img
            src={vehicle.photos[currentImageIndex]?.cloudinaryUrl || "/placeholder.jpg"}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />

          {vehicle.photos.length > 1 && (
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
                {vehicle.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded-full">
              {vehicle.city}
            </span>
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <FaStar className="w-3 h-3" />
              {vehicle.rating?.toFixed(1) || "4.5"}
            </span>
          </div>

          {/* Favourite */}
          <FavouriteButton
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            onFavorite={onFavorite}
            className="absolute top-3 right-3 w-8 h-8"
            iconSize="w-4 h-4"
          />

          {/* Seats */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <FaUsers className="w-3 h-3" />
              {vehicle.numberOfSeats}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{vehicle.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                NGN {price.toLocaleString()}/{bookingType}
              </p>
              <p className="text-sm text-gray-600">{vehicle.vehicleTypeName}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdLocationOn className="w-4 h-4 text-blue-600" />
              <span>{vehicle.city}</span>
            </div>
            <button
              onClick={handleRouteToDetails}
              className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 cursor-pointer transition-all"
            >
              Open Front Door
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop Layout ─────────────────────────────────────────── */}
      <div className="hidden md:flex">
        {/* Image - Left */}
        <div className="relative w-[280px] h-[220px] flex-shrink-0">
          <img
            src={vehicle.photos[currentImageIndex]?.cloudinaryUrl || "/placeholder.jpg"}
            alt={vehicle.name}
            className="w-full h-full object-cover rounded-l-xl"
          />

          {vehicle.photos.length > 1 && (
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {vehicle.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Favourite */}
          <FavouriteButton
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            onFavorite={onFavorite}
            className="absolute top-2 right-2 w-7 h-7"
            iconSize="w-3.5 h-3.5"
          />

          {/* Seats */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <FaUsers className="w-3 h-3" />
              {vehicle.numberOfSeats}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded-full">
              {vehicle.city}
            </span>
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <FaStar className="w-3 h-3" />
              {vehicle.rating?.toFixed(1) || "4.5"}
            </span>
          </div>
        </div>

        {/* Content - Right */}
        <div className="flex-1 pl-8 py-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">{vehicle.name}</h3>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              NGN {price.toLocaleString()}/{bookingType}
            </p>
            <p className="text-xs text-gray-600">{vehicle.vehicleTypeName}</p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {/* Location */}
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

              {/* Driver */}
              {vehicle.willProvideDriver && (
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onMouseEnter={() => setShowTooltip("driver")}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <FaUserTie className="w-4 h-4 text-gray-600" />
                  </div>
                  {showTooltip === "driver" && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                      Driver provided
                    </div>
                  )}
                </div>
              )}

              {/* Fuel */}
              {vehicle.willProvideFuel && (
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onMouseEnter={() => setShowTooltip("fuel")}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <FaGasPump className="w-4 h-4 text-gray-600" />
                  </div>
                  {showTooltip === "fuel" && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                      Fuel provided
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleRouteToDetails}
              className="text-blue-600 text-xs pr-4 font-medium flex cursor-pointer items-center gap-1 hover:gap-2 transition-all"
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

export default TopRating;