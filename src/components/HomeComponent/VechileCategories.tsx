"use client";
import React from "react";

interface VehicleCategory {
  name: string;
  image: string;
}

const VehicleCategories: React.FC = () => {
  const categories: VehicleCategory[] = [
    { name: "Sedan", image: "/images/vehicles/sedan.png" },
    { name: "Truck", image: "/images/vehicles/truck.png" },
    { name: "SUV", image: "/images/vehicles/suv.png" },
    { name: "Bus", image: "/images/vehicles/bus.png" },
  ];

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
              className="flex flex-col items-center text-center space-y-2"
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
