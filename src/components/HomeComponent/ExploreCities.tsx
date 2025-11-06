"use client";
import Image from "next/image";
import React, { useState } from "react";
import { BsBuildings } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";

interface City {
  name: string;
  image: string;
}

const cities: City[] = [
  {
    name: "Lagos",
    image: "/images/landing/1.jpg",
  },
  {
    name: "Accra",
    image: "/images/landing/2.jpg",
  },
  {
    name: "Port-Harcourt",
    image: "/images/landing/3.jpg",
  },
  {
    name: "Abuja",
    image: "/images/landing/4.jpg",
  },
  {
    name: "Benin",
    image: "/images/landing/5.jpg",
  },
  {
    name: "Benin",
    image: "/images/landing/6.jpg",
  },
];

const ExploreCities: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full text-center py-12">
      {/* Header */}
      <div className="flex flex-col items-start  justify-center  md:justify-start mb-6  max-w-[95%] ml-auto  px-4">
        <BsBuildings className="text-blue-600 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">
          Explore Popular Cities
        </h2>
        <p className="text-gray-500 mt-2 ">
          Find the ideal vehicle in these bustling cities and start your
          adventure in style
        </p>
      </div>

      {/* Cities Carousel */}
      <div className="flex justify-start gap-4 overflow-x-auto no-scrollbar px-12">
        {cities.map((city, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-60 h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition"
          >
            {/* Image */}
            <Image
              src={city.image}
              alt={city.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* City Name */}
            <div className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow-lg">
              {city.name}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {[0, 1, 2, 3, 4].map((dot, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2.5 h-2.5 rounded-full ${
              activeIndex === i ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default ExploreCities;
