"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface VehicleCategory {
  name: string;
  image: string;
  id: string;
}

const TARGET_VEHICLES = ["sedan", "truck", "suv", "bus"];

const IMAGE_MAPPING: Record<string, string> = {
  sedan: "/images/vehicles/sedan.webp",
  truck: "/images/vehicles/truck.webp",
  suv: "/images/vehicles/suv.webp",
  bus: "/images/vehicles/bus.webp",
};

const VehicleCategories: React.FC = () => {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  const getvechileType = async () => {
    const result = await VehicleSearchService.getVechielType();
    if (!Array.isArray(result) || result.length === 0) {
      return;
    }

    const filteredAndMapped = result
      .filter((item: any) => TARGET_VEHICLES.includes(item.name.toLowerCase()))
      .map((item: any) => ({
        id: item.id,
        name: item.name.replace("_", " "),
        image: IMAGE_MAPPING[item.name.toLowerCase()],
      }));

    setCategories(filteredAndMapped);
  };

  useEffect(() => {
    getvechileType();
  }, []);

  return (
    <div className="bg-white min-h-[60vh] w-full flex flex-col items-center justify-center py-10">
      <div className="w-[80%] max-w-6xl flex flex-col items-center sm:items-start justify-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-10">
          Vehicle Categories
        </h2>

        <div className="flex flex-wrap justify-center sm:justify-between w-full gap-10">
          {categories.map((category, index) => (
            <Link
              key={category.id || index}
              href={`/booking/search?vehicleTypeId=${category.id}`}
              className="flex flex-col items-center text-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 block"
              aria-label={`Browse ${category.name} rentals`}
            >
              <Image
                src={category.image}
                alt={`${category.name} car rental category`}
                width={252}
                height={144}
                className="w-36 h-24 object-contain"
                loading="lazy"
              />
              <p className="text-sm font-medium text-gray-800">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleCategories;
