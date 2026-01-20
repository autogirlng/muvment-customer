"use client";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { TopVehicle } from "@/types/vehicle";
import React, { useState, useEffect, useRef } from "react";
import { TbMedal2 } from "react-icons/tb";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import TopRating from "./TopVech";
import { useRouter } from "next/navigation";

interface TopRatedVehiclesProps {
  cardsPerSlide?: number;
  bookingId?: string;
}

const TopRatedVehicles: React.FC<TopRatedVehiclesProps> = ({
  cardsPerSlide = 2,
  bookingId
}) => {
  const [vehicles, setVehicles] = useState<TopVehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState(cardsPerSlide);

  const ITEMS_PER_PAGE = 20;
  const MAX_DOTS = 5;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Update cards on resize
  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else setVisibleCards(2);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  // Load initial data
  useEffect(() => {
    loadVehicles(0);
  }, []);

  const loadVehicles = async (page: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await VehicleSearchService.fetchFeaturedVehicles(
        page,
        ITEMS_PER_PAGE
      );
      const dataResponse = response[0]?.data?.content;
      if (dataResponse) {
        setVehicles((prev) =>
          page === 0 ? dataResponse : [...prev, ...dataResponse]
        );
        setCurrentPage(response[0]?.data?.currentPage || 0);
        setHasMore(
          (response[0]?.data?.currentPage || 0) <
          (response[0]?.data?.totalPages || 1) - 1
        );
      }
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move next (1 card at a time for smooth peek effect)
  const handleNext = () => {
    const maxIndex = Math.max(vehicles.length - visibleCards, 0);
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(newIndex);

    // Fetch next page when near end
    if (newIndex + visibleCards >= vehicles.length && hasMore && !loading) {
      loadVehicles(currentPage + 1);
    }
  };

  // Move previous (1 card at a time)
  const handlePrev = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  // Check if arrows should be disabled
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= vehicles.length - visibleCards;

  // Handle dots
  const handleDotClick = (dotIndex: number) => {
    const totalVehicles = vehicles.length;
    const targetIndex = Math.min(
      dotIndex * visibleCards,
      totalVehicles - visibleCards
    );
    setCurrentIndex(targetIndex);
  };

  // Active dot logic
  const getActiveDot = () => {
    const totalVehicles = vehicles.length;
    const slidesCount = Math.ceil(totalVehicles / visibleCards);
    const active = Math.floor(currentIndex / visibleCards);
    return Math.min(active, slidesCount - 1, MAX_DOTS - 1);
  };

  // Smooth scroll logic (shows 2 full cards and peek of 3rd)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (!firstChild) return;

      const cardWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap || "16", 10);
      const scrollPosition = currentIndex * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchStartX.current - touchEndX.current;
      const threshold = 50;
      if (delta > threshold) handleNext();
      else if (delta < -threshold) handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Favorite toggle
  const toggleFavorite = (vehicleId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) newFavorites.delete(vehicleId);
      else newFavorites.add(vehicleId);
      return newFavorites;
    });
  };

  const handeleRoute = () => {
    router.push(`/booking/search${bookingId && `?bookingType=${bookingId}`}`);
  };

  return (
    <div className="w-full py-6 my-[50px]">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-[95%] ml-auto px-6">
          <div className="text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 w-full">
              <div className="flex justify-center">
                <TbMedal2 className="text-blue-600 text-4xl mb-2" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Top-rated vehicles
            </h2>
            <p className="text-gray-600">
              Our most popular choices offer the perfect balance of luxury,
              reliability, and comfort for your trip
            </p>
          </div>
          <button
            onClick={handeleRoute}
            className="hidden md:block text-blue-600 cursor-pointer font-medium flex items-center gap-2 hover:gap-3 transition-all"
          >
            See All
          </button>
        </div>

        {/* Carousel with Navigation Arrows */}
        <div className="relative">
          {/* Left Arrow - Desktop */}
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${isPrevDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50"
              }`}
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Carousel Container */}
          <div
            className="relative px-4 md:px-16"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden scroll-smooth select-none w-full"
              style={{
                // This creates the peek effect by showing slightly more than 2 cards
                maxWidth: "100%",
              }}
            >
              {vehicles.map((vehicle) => (
                <TopRating
                  key={vehicle.id}
                  vehicle={vehicle}
                  onFavorite={() => toggleFavorite(vehicle.id)}
                  isFavorited={favorites.has(vehicle.id)}
                />
              ))}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Right Arrow - Desktop */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${isNextDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50"
              }`}
          >
            <FaChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({
            length: Math.min(
              Math.ceil(vehicles.length / visibleCards),
              MAX_DOTS
            ),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === getActiveDot()
                ? "bg-blue-600 w-8"
                : "bg-gray-300 hover:bg-gray-400"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopRatedVehicles;
