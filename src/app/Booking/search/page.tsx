"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiFilter } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";

import { FilterState } from "@/types/filters";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import VehicleCard from "@/components/Booking/VehicleCard";
import { createFilterConfig } from "@/hooks/filterConfig";
import { SearchBar } from "@/components/Booking/SearchBar";
import { GenericFilterSidebar } from "@/components/Booking/GenericFilterSidebar";
import { VehicleSearchParams } from "@/types/vehicle";

export default function ExploreVehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);

  const [filterState, setFilterState] = useState<FilterState>({
    priceRange: [0, 100000],
    selectedVehicleTypes: [],
    selectedMakes: [],
    selectedYears: [],
    selectedSeats: [],
    selectedFeatures: [],
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [recommendedVehicles, setRecommendedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [makes, setMakes] = useState([]);
  const [features, setFeatures] = useState([]);

  // Get URL params
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const location = searchParams.get("location");
  const bookingType = searchParams.get("bookingType");
  const category = searchParams.get("category");
  const fromDate = searchParams.get("fromDate");
  const untilDate = searchParams.get("untilDate");

  // Initialize filters from URL
  const initializeFiltersFromUrl = useCallback((): FilterState => {
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const minPrice = minPriceParam ? parseInt(minPriceParam) : 0;
    const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : 100000;

    const type = searchParams.getAll("type");
    const make = searchParams.getAll("make");
    const yearOfRelease = searchParams.getAll("yearOfRelease");
    const numberOfSeats = searchParams.getAll("numberOfSeats");
    const featuresList = searchParams.getAll("features");

    return {
      priceRange: [
        isNaN(minPrice) ? 0 : minPrice,
        isNaN(maxPrice) ? 100000 : maxPrice,
      ],
      selectedVehicleTypes: type,
      selectedMakes: make,
      selectedYears: yearOfRelease,
      selectedSeats: numberOfSeats,
      selectedFeatures: featuresList,
    };
  }, [searchParams]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [typesData, makesData, featuresData] = await Promise.all([
          VehicleSearchService.getVehicleTypes(),
          VehicleSearchService.getVehicleMakes(),
          VehicleSearchService.getVehicleFeatures(),
        ]);
        setVehicleTypes(typesData[0].data);
        setMakes(makesData[0].data);
        setFeatures(featuresData[0].data);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Initialize filters from URL on mount
  useEffect(() => {
    setFilterState(initializeFiltersFromUrl());
  }, [initializeFiltersFromUrl]);

  const filterConfigs = createFilterConfig(vehicleTypes, makes, features);

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleClearAll = () => {
    setFilterState({
      priceRange: [0, 100000],
      selectedVehicleTypes: [],
      selectedMakes: [],
      selectedYears: [],
      selectedSeats: [],
      selectedFeatures: [],
    });
  };

  const searchVehicles = useCallback(
    async (page: number = 0, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setVehicles([]);
      }
      setError("");

      try {
        const params: VehicleSearchParams = {
          page,
          size: 100,
          latitude: 0,
          longitude: 0,
        };
        if (lat && lng) {
          params.latitude = parseFloat(lat);
          params.longitude = parseFloat(lng);
        }

        if (category) {
          params.vehicleTypeId = category;
        }

        if (fromDate) {
          params.fromDate = fromDate;
        }

        if (untilDate) {
          params.untilDate = untilDate;
        }

        // Add filter params
        if (filterState.selectedVehicleTypes.length > 0)
          params.vehicleTypeId = filterState.selectedVehicleTypes[0];

        if (filterState.selectedMakes.length > 0)
          params.vehicleMakeId = filterState.selectedMakes[0];

        if (filterState.selectedFeatures.length > 0)
          params.featureIds = filterState.selectedFeatures;

        if (filterState.priceRange) {
          params.minPrice = filterState.priceRange[0];
          params.maxPrice = filterState.priceRange[1];
        }

        const response = await VehicleSearchService.searchVehicles(params);

        if (response.data.length === 0 && page === 0) {
          setError("No items found");
          setVehicles([]);
          setHasMore(false);
          await fetchRecommendedVehicles();
        } else {
          const vehiclesData = response.data.data.content;

          if (append) {
            setVehicles((prev) => [...prev, ...vehiclesData]);
          } else {
            setVehicles(vehiclesData);
          }

          setTotalCount(response.data.data.totalElements || 0);
          setHasMore(vehiclesData.length === 10);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load vehicles");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [lat, lng, category, fromDate, untilDate, filterState]
  );

  const fetchRecommendedVehicles = async () => {
    try {
      const response = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
        latitude: 0,
        longitude: 0,
      });
      setRecommendedVehicles(response.data.data.content || []);
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
    }
  };

  // Initial load
  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    searchVehicles(0, false);
  }, [searchParams, filterState]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          searchVehicles(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, currentPage, searchVehicles]);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    setHasMore(true);
    searchVehicles(0, false);
  };

  return (
    <div>
      <Navbar />

      <div className="sticky top-12 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <SearchBar onSearch={() => {}} variant="navbar" />
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-12 md:mt-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block lg:w-80 flex-shrink-0 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide bg-white border border-gray-200 rounded-lg p-4">
              <GenericFilterSidebar
                isOpen={true}
                onClose={() => {}}
                filterConfigs={filterConfigs}
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                onApply={handleApplyFilters}
                mode="desktop"
              />
            </aside>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <FiFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* Mobile Filter Sidebar */}
            <GenericFilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filterConfigs={filterConfigs}
              filterState={filterState}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              onApply={handleApplyFilters}
              mode="mobile"
            />

            {/* Explore Section */}
            <main className="flex-1 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {location ? `Vehicles in ${location}` : "Explore Vehicles"}
                </h1>
                <p className="text-gray-600">
                  {loading
                    ? "Loading..."
                    : `${totalCount || 0}+ vehicles available`}
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {loading && vehicles.length === 0 && (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && vehicles.length > 0 && (
                <div className="grid grid-cols-1 gap-6 pb-6">
                  {vehicles.map((v: any) => (
                    <VehicleCard key={v.id} {...v} bookingType={bookingType} />
                  ))}
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMore && vehicles.length > 0 && (
                <div ref={observerTarget} className="py-8 flex justify-center">
                  {loadingMore && (
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              )}

              {!loading && !hasMore && vehicles.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  No more vehicles to load
                </div>
              )}

              {!loading &&
                vehicles.length === 0 &&
                recommendedVehicles.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Recommended Cars
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {recommendedVehicles.map((v: any) => (
                        <VehicleCard
                          key={v.id}
                          {...v}
                          bookingType={bookingType}
                        />
                      ))}
                    </div>
                  </div>
                )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
