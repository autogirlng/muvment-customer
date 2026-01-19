"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { BsBuildings } from "react-icons/bs";
import { useRouter } from "next/navigation";

interface City {
  name: string;
  image: string;
}

const cities: City[] = [
  { name: "Lagos", image: "/images/landing/1.jpg" },
  { name: "Accra", image: "/images/landing/2.jpg" },
  { name: "Port-Harcourt", image: "/images/landing/3.jpg" },
  { name: "Abuja", image: "/images/landing/4.jpg" },
  { name: "Benin", image: "/images/landing/5.jpg" },
  { name: "Enugu", image: "/images/landing/6.jpg" },
];

const ExploreCities: React.FC<{ bookingTypeId?: string }> = ({
  bookingTypeId,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCityClick = (cityName: string) => {
    const formattedCity = cityName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/booking/search?city=${formattedCity}&bookingType=${bookingTypeId}`);
  };

  // Optional: Function to make dots scroll the container
  const scrollToSlide = (index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.scrollWidth;
      // Approximate scroll calculation
      const scrollPos = (width / cities.length) * index;
      scrollContainerRef.current.scrollTo({
        left: scrollPos,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full text-center py-12">
      {/* Header */}
      <div className="flex flex-col items-start justify-center md:justify-start mb-6 max-w-[95%] ml-auto px-4 md:px-12">
        <BsBuildings className="text-blue-600 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">
          Explore Popular Cities
        </h2>
        <p className="text-gray-500 mt-2 text-left">
          Find the ideal vehicle in these bustling cities and start your
          adventure in style
        </p>
      </div>

      {/* Cities Carousel - Horizontal Scroll with Snapping */}
      <div
        ref={scrollContainerRef}
        className="flex justify-start gap-6 overflow-x-auto no-scrollbar px-4 md:px-12 py-4 snap-x snap-mandatory scroll-smooth"
      >
        {cities.map((city, index) => (
          <div
            key={index}
            onClick={() => handleCityClick(city.name)}
            // Changed w-60 to w-72 or min-w-[18rem] for better stretch/presence
            // Added snap-center to make it stop evenly
            className="relative flex-shrink-0 w-72 h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group snap-center border border-gray-100"
          >
            {/* Image */}
            <Image
              src={city.image}
              alt={city.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 300px"
            />

            {/* Gradient Overlay (Improved visibility) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* City Name */}
            <div className="absolute bottom-5 left-5 text-white text-xl font-bold drop-shadow-md flex items-center gap-1 transform translate-y-0 group-hover:-translate-y-1 transition-transform">
              {city.name}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {cities.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            className={`transition-all duration-300 rounded-full ${activeIndex === i
                ? "w-8 h-2.5 bg-blue-600" // Stretch the active dot for better UI
                : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ExploreCities;
