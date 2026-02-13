"use client";

import { ServicePricingShowcase } from "@/types/Servicepricing";
import React from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { MdCalendarViewDay } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface ServicePricingCardProps {
  data: ServicePricingShowcase;
}

export const ServicePricingCard: React.FC<ServicePricingCardProps> = ({
  data,
}) => {
    const router =  useRouter()
  const getMinimumPrice = () => {
    if (!data.prices || data.prices.length === 0) return 0;
    return Math.min(...data.prices.map((p) => p.price));
  };

  const minimumPrice = getMinimumPrice();

  const getVehicleImage = () => {
    return data.imageUrl || "/images/default-car.png";
  };

  const getBadgeColor = () => {
    switch (data?.rideType?.toUpperCase()) {
      case "EXECUTIVE":
        return "bg-blue-600";
      case "BASIC":
        return "bg-blue-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Badge */}
   

      {/* Vehicle Image */}
      <div className="relative h-48  flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={getVehicleImage()}
            alt={data.servicePricingName}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={data.imageUrl?.includes('cloudinary')} // Disable optimization for external URLs
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Vehicle Name */}
        <h3 className="text-lg font-bold text-gray-900 uppercase">
          {data.servicePricingName}
        </h3>

        {/* Year Range */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-1"><IoCalendarOutline/></span>
          <span>
            {data.minYear} - {data.maxYear}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
  
          <span>{data.name}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          {/* Pricing */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Starting from</p>
            <p className="text-2xl font-bold text-blue-600">
              NGN {minimumPrice.toLocaleString()}
            </p>
          </div>

          {/* Book Now Button */}
          <button onClick={()=>router.push(`/booking/${data.servicePricingId}/special-pricing`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group">
            <span>Book Now</span>
            <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 text-end mt-2">
            +{data?.prices?.length - 1} more pricing option
            {data?.prices?.length > 2 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};