"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface VehicleCategory {
  name: string;
  image: string;
  id: string;
}

const VehicleCategories: React.FC = () => {
  const router = useRouter();
  const [category, setCategory] = useState<{ value: string; label: string }[]>([]);
  const categories: VehicleCategory[] = [
    { name: "Sedan", image: "/images/vehicles/sedan.webp", id: "sedan-id" },
    { name: "Truck", image: "/images/vehicles/truck.webp", id: "truck-id" },
    { name: "SUV", image: "/images/vehicles/suv.webp", id: "suv-id" },
    { name: "Bus", image: "/images/vehicles/bus.webp", id: "bus-id" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/booking/search?category=${categoryId}`);
  };

  const getvechileType = async () => {
    const result = await VehicleSearchService.getVechielType();
    if (!Array.isArray(result) || result.length === 0) {
      return;
    }
    const transformedOptions = result.map((item: any) => ({
      value: item.id,
      label: item.name.replace("_", " "),
    }));
    setCategory(transformedOptions);
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
            <button
              key={index}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center text-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleCategories;
