"use client";

import { VehicleSearchService } from "@/controllers/booking/vechicle";
import type { TopVehicle } from "./TopVech";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TbMedal2 } from "react-icons/tb";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import TopVehicleCard from "./TopVech";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { FavouriteVehicleService } from "@/controllers/booking/favouritevehicleservice";
import LoginPromptModal from "../Booking/Loginpromptmodal";

interface TopRatedVehiclesProps {
  bookingId?: string;
}

const TopRatedVehicles: React.FC<TopRatedVehiclesProps> = ({ bookingId }) => {
  const [vehicles, setVehicles] = useState<TopVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [favouriteLoading, setFavouriteLoading] = useState<Set<string>>(
    new Set(),
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { isAuthenticated } = useAuth();
  const ITEMS_PER_PAGE = 20;
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadVehicles = useCallback(
    async (page: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await VehicleSearchService.fetchFeaturedVehicles(
          page,
          ITEMS_PER_PAGE,
        );
        const dataResponse = response[0]?.data?.content;
        if (dataResponse) {
          setVehicles((prev) =>
            page === 0 ? dataResponse : [...prev, ...dataResponse],
          );
          setCurrentPage(response[0]?.data?.currentPage || 0);
          setHasMore(
            (response[0]?.data?.currentPage || 0) <
              (response[0]?.data?.totalPages || 1) - 1,
          );
        }
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading],
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
          (data?.vehicles ?? []).map((v: { id: string }) => v.id),
        );
        setFavouriteIds(ids);
      } catch {}
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
      const { updatedFavouriteIds } =
        await FavouriteVehicleService.toggleFavourite(vehicleId, currentList);
      setFavouriteIds(new Set(updatedFavouriteIds));
    } catch {
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

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    if (
      scrollLeft + clientWidth >= scrollWidth - 600 &&
      hasMore &&
      !loading
    ) {
      loadVehicles(currentPage + 1);
    }
  }, [hasMore, loading, currentPage, loadVehicles]);

  useEffect(() => {
    const id = setTimeout(updateArrows, 100);
    return () => clearTimeout(id);
  }, [vehicles, updateArrows]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const handleRoute = () => {
    router.push(
      `/booking/search${bookingId ? `?bookingType=${bookingId}` : ""}`,
    );
  };

  const showArrows = canScrollLeft || canScrollRight;

  const arrowClasses = (disabled: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
      disabled
        ? "cursor-not-allowed border-gray-200 text-gray-300"
        : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
    }`;

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="w-full bg-[#f7f9fc] py-16 lg:py-20">
        <div className="mb-6 flex items-end justify-between gap-4 px-4 lg:px-8">
          <div>
            <TbMedal2 className="mb-1 text-3xl text-[#0673FF]" />
            <h2 className="text-2xl font-bold text-[#0d1320]">
              Top-rated vehicles
            </h2>
            <p className="mt-1 max-w-md text-sm text-gray-600">
              Popular picks our riders book again and again.
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={handleRoute}
              className="mr-1 hidden text-sm font-medium text-[#0673FF] hover:underline lg:block"
            >
              See all
            </button>
            {showArrows && (
              <>
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous vehicles"
                  className={arrowClasses(!canScrollLeft)}
                >
                  <FaChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next vehicles"
                  className={arrowClasses(!canScrollRight)}
                >
                  <FaChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-4 lg:px-8">
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vehicles.length === 0 && loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[78%] flex-shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white lg:w-[calc(25%-12px)]"
                  >
                    <div className="aspect-[4/3] w-full animate-pulse bg-gray-100" />
                    <div className="p-3">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                      <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              : vehicles.map((vehicle) => (
                  <TopVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onFavorite={() => handleToggleFavourite(vehicle.id)}
                    isFavorited={favouriteIds.has(vehicle.id)}
                    isFavoriteLoading={favouriteLoading.has(vehicle.id)}
                  />
                ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopRatedVehicles;
