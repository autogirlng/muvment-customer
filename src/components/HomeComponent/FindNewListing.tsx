"use client";
import React, { useEffect, useRef, useState } from "react";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { TopVehicle } from "@/types/vehicle";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { VscSparkle } from "react-icons/vsc";

const FindNewListings: React.FC = () => {
  const [vehicles, setVehicles] = useState<TopVehicle[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await VehicleSearchService.fetchFeaturedVehicles(
        0,
        ITEMS_PER_PAGE
      );
      const data = response[0]?.data?.content || [];
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    }
  };

  const CARDS_PER_SLIDE = isMobile ? 1 : 2;
  const totalSlides = Math.ceil(vehicles.length / CARDS_PER_SLIDE);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    const container = scrollContainerRef.current;
    if (container) {
      const height = container.clientHeight;
      container.scrollTo({ top: height * index, behavior: "smooth" });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const height = container.clientHeight;
    const newIndex = Math.round(container.scrollTop / height);
    setCurrentIndex(newIndex);
  };

  const handleCardClick = (id: string) => {
    router.push(`/Booking/details/${id}`);
  };

  const priceOf = (v: TopVehicle) => v.allPricingOptions[0]?.price || 0;

  return (
    <div className="bg-[#1D2739] text-white py-10 px-4 md:px-16">
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-10">
        {/* Left section - Heading */}
        <div className="flex items-center h-[100%] md:justify-center md:w-1/3">
          <div className="flex flex-col items-start justify-center gap-2 mb-3">
            <span className="text-[2rem]">
              <VscSparkle />
            </span>
            <h2 className="text-xl md:text-[2rem] font-semibold">
              Find New Listings
            </h2>
          </div>
        </div>

        {/* Right section - Vertical Carousel with peek effect */}
        <div className="relative md:w-2/3 w-full overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-col overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth"
            style={{
              height: isMobile ? "350px" : "400px",
              paddingTop: "25%",
              paddingBottom: "25%",
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const start = slideIndex * CARDS_PER_SLIDE;
              const group = vehicles.slice(start, start + CARDS_PER_SLIDE);
              const distance = Math.abs(slideIndex - currentIndex);
              const isActive = distance === 0;
              const opacity = isActive ? 1 : Math.max(0.2, 1 - distance * 0.4);

              return (
                <div
                  key={slideIndex}
                  className="snap-center flex-shrink-0 w-full md:w-[80%] mx-auto px-4 md:px-8 transition-all duration-500"
                  style={{
                    opacity: opacity,
                    transform: isActive ? "scale(1)" : "scale(0.92)",
                    minHeight: isMobile ? "250px" : "300px",
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
                    {group.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="relative bg-[#101928] p-3 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                        onClick={() => handleCardClick(vehicle.id)}
                      >
                        <img
                          src={
                            vehicle.photos[0]?.cloudinaryUrl ||
                            "/placeholder.jpg"
                          }
                          alt={vehicle.name}
                          className="w-full h-48 md:h-56 object-cover rounded-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-sm md:text-base truncate">
                            {vehicle.name}
                          </h3>
                          <p className="text-gray-300 text-xs md:text-sm mt-1">
                            NGN {priceOf(vehicle).toLocaleString()}/day
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {vehicle.vehicleTypeName}
                          </p>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(vehicle.id);
                          }}
                          className="absolute top-3 right-3 bg-white/10 p-2 rounded-full hover:bg-white/20"
                        >
                          {favorites.has(vehicle.id) ? (
                            <FaHeart className="text-red-500 w-4 h-4" />
                          ) : (
                            <FaRegHeart className="text-white w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots on the right (indicating vertical position) */}
          <div className="flex md:flex-col absolute md:right-2 bottom-4 md:top-1/2 md:-translate-y-1/2 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 gap-3 z-10">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-white w-3" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindNewListings;
