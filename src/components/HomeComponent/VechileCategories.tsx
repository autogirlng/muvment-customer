"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface VehicleCategory {
  name: string;
  image: string;
  id: string;
}

const VehicleCategories: React.FC = () => {
  const router = useRouter();
  const [category, setCategory] = useState([]);
  const categories: VehicleCategory[] = [
    { name: "Sedan", image: "/images/vehicles/sedan.png", id: "sedan-id" },
    { name: "Truck", image: "/images/vehicles/truck.png", id: "truck-id" },
    { name: "SUV", image: "/images/vehicles/suv.png", id: "suv-id" },
    { name: "Bus", image: "/images/vehicles/bus.png", id: "bus-id" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/booking/search?category=${categoryId}`);
  };

  const getvechileType = async () => {
    const result = await VehicleSearchService.getVechielType();
    const data = result[0].data;
    const transformedOptions = data.map((item: any) => ({
      value: item.id,
      label: item.name.replace("_", " "),
    }));
    setCategory(transformedOptions);
  };
  console.log(category);
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
            <div
              key={index}
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center text-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-36 h-24 object-contain"
              />
              <p className="text-sm font-medium text-gray-800">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleCategories;
