"use client";

import { ServicePricingShowcase } from "@/types/Servicepricing";
import React from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

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
    return (
      optimizeCloudinaryUrl(data.imageUrl || "") || "/images/default-car.png"
    );
  };

  const getBadgeColor = () => {
    switch (data?.rideType?.toUpperCase()) {
      case "EXECUTIVE":
        return "bg-[#0560d6]";
      case "BASIC":
        return "bg-[#0673FF]";
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
      <div className="absolute left-3 top-3 z-10">
        <span
          className={`${getBadgeColor()} rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white`}
        >
          {data.rideType}
        </span>
      </div>

      <div className="flex h-40 items-center justify-center overflow-hidden bg-gray-50 sm:h-44">
        <div className="relative h-full w-full">
          <Image
            src={getVehicleImage()}
            alt={data.servicePricingName}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={data.imageUrl?.includes("cloudinary")}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-sm font-bold uppercase tracking-wide text-gray-900">
          {data.servicePricingName}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <IoCalendarOutline className="h-3.5 w-3.5" />
          <span>
            {data.minYear} - {data.maxYear}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <p className="text-[11px] text-gray-500">From</p>
          <p className="text-xl font-bold leading-tight text-[#0673FF]">
            NGN {minimumPrice.toLocaleString()}
          </p>
          <button
            onClick={() => router.push(`/booking/${data.slug}/special-pricing`)}
            className="group mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0673FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6] active:bg-[#0450b0]"
          >
            <span>Book now</span>
            <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
