"use client";

import { ServicePricingShowcase } from "@/types/Servicepricing";
import React from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface ServicePricingCardProps {
  data: ServicePricingShowcase;
}

export const ServicePricingCard: React.FC<ServicePricingCardProps> = ({
  data,
}) => {
  const router = useRouter();

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

  const extraPricingOptions =
    data?.prices?.length > 1 ? data.prices.length - 1 : 0;

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-visible hover:shadow-lg transition-shadow duration-300">
   
      <div className="absolute top-3 left-3 z-10">
        <span
          className={`${getBadgeColor()} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide`}
        >
          {data.rideType}
        </span>
      </div>

      <div className=" flex items-center justify-center overflow-hidden"
           style={{ height: "280px" }}>
        <div className="relative w-full h-full">
          <Image
            src={getVehicleImage()}
            alt={data.servicePricingName}
            fill
            className="object-contain p-2"
             sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={data.imageUrl?.includes("cloudinary")}
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
     
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          {data.servicePricingName}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <IoCalendarOutline className="w-4 h-4" />
          <span>
            {data.minYear} - {data.maxYear}
          </span>
        </div>

        <div className="text-sm text-gray-500">{data.name}</div>

        <div className="border-t border-gray-100 pt-3 mt-1 space-y-3">
          {/* Pricing */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Starting from</p>
            <p className="text-2xl font-bold text-blue-600 text-center">
              NGN {minimumPrice.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() =>
              router.push(`/booking/${data.servicePricingId}/special-pricing`)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Book Now</span>
            <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          {extraPricingOptions > 0 && (
            <p className="text-xs text-gray-400 text-right">
              +{extraPricingOptions} more pricing option
              {extraPricingOptions > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};