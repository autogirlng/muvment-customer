"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaChevronRight,
  FaChevronLeft,
  FaUsers,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

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
  slug: string;
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

const FavouriteButton: React.FC<{
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  onFavorite: () => void;
  className?: string;
  iconSize?: string;
}> = ({
  isFavorited,
  isFavoriteLoading,
  onFavorite,
  className = "",
  iconSize = "w-4 h-4",
}) => (
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

const TopRating: React.FC<TopRatingProps> = ({
  vehicle,
  onFavorite,
  isFavorited,
  isFavoriteLoading = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const price = vehicle.allPricingOptions[0]?.price || 0;
  const bookingType = vehicle.allPricingOptions[0]?.bookingTypeName || "";

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === vehicle.photos.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? vehicle.photos.length - 1 : prev - 1,
    );
  };

  return (
    <div className="group w-[78%] flex-shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg lg:w-[calc(25%-12px)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={optimizeCloudinaryUrl(
            vehicle.photos[currentImageIndex]?.cloudinaryUrl ||
              "/placeholder.jpg",
          )}
          alt={vehicle.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {vehicle.photos.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
            >
              <FaChevronLeft className="h-3 w-3 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
            >
              <FaChevronRight className="h-3 w-3 text-gray-700" />
            </button>
          </>
        )}

        <FavouriteButton
          isFavorited={isFavorited}
          isFavoriteLoading={isFavoriteLoading}
          onFavorite={onFavorite}
          className="absolute right-2 top-2 h-8 w-8"
          iconSize="w-4 h-4"
        />
      </div>

      <Link
        href={`/booking/details/${vehicle.slug}`}
        className="block w-full p-3 text-left"
      >
        <h3 className="truncate text-sm font-semibold text-[#0d1320]">
          {vehicle.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <FaStar className="h-3 w-3 text-[#FBB034]" />
            {vehicle.rating?.toFixed(1) || "4.6"}
          </span>
          <span>&middot;</span>
          <span className="truncate">{vehicle.vehicleTypeName}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FaUsers className="h-3 w-3" />
            {vehicle.numberOfSeats} seats
          </span>
          <span className="flex items-center gap-1 truncate">
            <MdLocationOn className="h-3.5 w-3.5" />
            {vehicle.city}
          </span>
        </div>
        <p className="mt-2 text-[#0d1320]">
          <span className="text-base font-bold">
            NGN {price.toLocaleString()}
          </span>
          {bookingType && (
            <span className="text-xs font-normal text-gray-500">
              {" "}
              /{bookingType}
            </span>
          )}
        </p>
      </Link>
    </div>
  );
};

export default TopRating;
