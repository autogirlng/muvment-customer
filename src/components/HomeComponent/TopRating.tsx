"use client";
// components/TopRatedVehicles.tsx

import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { TopVehicle } from "@/types/vehicle";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TbMedal2 } from "react-icons/tb";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import TopRating from "./TopVech";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { FavouriteVehicleService } from "@/controllers/booking/favouritevehicleservice";
import LoginPromptModal from "../Booking/Loginpromptmodal";

interface TopRatedVehiclesProps {
  cardsPerSlide?: number;
  bookingId?: string;
}

const TopRatedVehicles: React.FC<TopRatedVehiclesProps> = ({
  cardsPerSlide = 2,
  bookingId,
}) => {
  const [vehicles, setVehicles] = useState<TopVehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState(cardsPerSlide);

  // --- Favourite state ---
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [favouriteLoading, setFavouriteLoading] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isAuthenticated } = useAuth();

  const ITEMS_PER_PAGE = 20;
  const MAX_DOTS = 5;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else setVisibleCards(2);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);


  const loadVehicles = useCallback(
    async (page: number) => {
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
    },
    [loading]
  );

  useEffect(() => {
    loadVehicles(0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadFavourites = async () => {
      try {
        const data = await FavouriteVehicleService.getFavourites();
        const ids = new Set(
          (data?.vehicles ?? []).map((v: { id: string }) => v.id)
        );
        setFavouriteIds(ids);
      } catch {
      }
    };

    loadFavourites();
  }, [isAuthenticated]);


  const handleToggleFavourite = async (vehicleId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });

    setFavouriteLoading((prev) => new Set(prev).add(vehicleId));

    try {
      const currentList = Array.from(favouriteIds);
      const { updatedFavouriteIds } = await FavouriteVehicleService.toggleFavourite(
        vehicleId,
        currentList
      );
      setFavouriteIds(new Set(updatedFavouriteIds));
    } catch (error) {
    
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(vehicleId)) next.delete(vehicleId);
        else next.add(vehicleId);
        return next;
      });
    } finally {
      setFavouriteLoading((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
    }
  };

  const handleNext = () => {
    const maxIndex = Math.max(vehicles.length - visibleCards, 0);
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(newIndex);

    if (newIndex + visibleCards >= vehicles.length && hasMore && !loading) {
      loadVehicles(currentPage + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= vehicles.length - visibleCards;

  const handleDotClick = (dotIndex: number) => {
    const targetIndex = Math.min(
      dotIndex * visibleCards,
      vehicles.length - visibleCards
    );
    setCurrentIndex(targetIndex);
  };

  const getActiveDot = () => {
    const slidesCount = Math.ceil(vehicles.length / visibleCards);
    const active = Math.floor(currentIndex / visibleCards);
    return Math.min(active, slidesCount - 1, MAX_DOTS - 1);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (!firstChild) return;
      const cardWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap || "16", 10);
      container.scrollTo({
        left: currentIndex * (cardWidth + gap),
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchStartX.current - touchEndX.current;
      if (delta > 50) handleNext();
      else if (delta < -50) handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleRoute = () => {
    router.push(`/booking/search${bookingId ? `?bookingType=${bookingId}` : ""}`);
  };

  return (
    <>
      {/* Login prompt modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

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
              onClick={handleRoute}
              className="hidden md:block text-blue-600 cursor-pointer font-medium hover:gap-3 transition-all"
            >
              See All
            </button>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              disabled={isPrevDisabled}
              className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                isPrevDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              <FaChevronLeft className="w-4 h-4 text-gray-700" />
            </button>

            {/* Cards */}
            <div
              className="relative px-4 md:px-16"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-hidden scroll-smooth select-none w-full"
              >
                {vehicles.map((vehicle) => (
                  <TopRating
                    key={vehicle.id}
                    vehicle={vehicle}
                    onFavorite={() => handleToggleFavourite(vehicle.id)}
                    isFavorited={favouriteIds.has(vehicle.id)}
                    isFavoriteLoading={favouriteLoading.has(vehicle.id)}
                  />
                ))}
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                isNextDisabled
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
                className={`w-2 h-2 rounded-full transition-all ${
                  i === getActiveDot()
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopRatedVehicles;