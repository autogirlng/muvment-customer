"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FilterState } from "@/types/filters";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import VehicleCard from "@/components/Booking/VehicleCard";
import { VehicleSearchParams } from "@/types/vehicle";
import { SimplifiedFilterBar } from "@/components/Booking/SimplifiedFilterBarProps ";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";

export default function ExploreVehiclesPage() {
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(null);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterState, setFilterState] = useState<FilterState>({
    priceRange: [0, 100000],
    selectedVehicleTypes: [],
    selectedMakes: [],
    selectedYears: [],
    selectedSeats: [],
    selectedFeatures: [],
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [recommendedVehicles, setRecommendedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [childCount, setChildCount] = useState<number | string>(0);
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

  const initializeFiltersFromUrl = useCallback((): FilterState => {
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const type = searchParams.getAll("type");
    const make = searchParams.getAll("make");
    const yearOfRelease = searchParams.getAll("yearOfRelease");
    const numberOfSeats = searchParams.getAll("numberOfSeats");
    const featuresList = searchParams.getAll("features");

    return {
      priceRange:
        minPriceParam && maxPriceParam
          ? [parseInt(minPriceParam), parseInt(maxPriceParam)]
          : undefined,
      selectedVehicleTypes: type.length > 0 ? type : undefined,
      selectedMakes: make.length > 0 ? make : undefined,
      selectedYears: yearOfRelease.length > 0 ? yearOfRelease : undefined,
      selectedSeats: numberOfSeats.length > 0 ? numberOfSeats : undefined,
      selectedFeatures: featuresList.length > 0 ? featuresList : undefined,
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

  useEffect(() => {
    setFilterState(initializeFiltersFromUrl());
  }, [initializeFiltersFromUrl]);

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    searchVehicles(0, false);
  }, [filterState, lat, lng, category, fromDate, untilDate]);

  const handleClearAll = () => {
    setFilterState({
      priceRange: undefined,
      selectedVehicleTypes: undefined,
      selectedMakes: undefined,
      selectedYears: undefined,
      selectedSeats: undefined,
      selectedFeatures: undefined,
    });

    router.replace("/Booking/search");
  };
  // REMOVE THE OLD useCallback VERSION
  // MAKE searchVehicles A NORMAL FUNCTION SO IT ALWAYS USES LATEST STATE
  async function searchVehicles(
    page: number = 0,
    append: boolean = false,
    clearAll: boolean = false
  ) {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const params: VehicleSearchParams = {
        page,
        size: 10,
      };

      if (!clearAll) {
        if (lat && lng) {
          params.latitude = parseFloat(lat);
          params.longitude = parseFloat(lng);
        }
        if (category) params.vehicleTypeId = category;
        if (fromDate) params.fromDate = fromDate;
        if (untilDate) params.untilDate = untilDate;
        if (bookingType) params.bookingTypeId = bookingType;

        if (filterState.selectedVehicleTypes !== undefined) {
          params.vehicleTypeId = filterState.selectedVehicleTypes[0];
        }
        if (filterState.selectedMakes !== undefined) {
          params.vehicleMakeId = filterState.selectedMakes[0];
        }
        if (filterState.selectedYears !== undefined) {
          params.yearOfRelease = filterState.selectedYears[0];
        }
        if (filterState.selectedSeats !== undefined) {
          params.numberOfSeats = filterState.selectedSeats[0];
        }
        if (filterState.selectedFeatures !== undefined) {
          params.featureIds = filterState.selectedFeatures[0];
        }

        if (
          filterState.priceRange &&
          filterState.priceRange[0] >= 0 &&
          filterState.priceRange[1] <= 100000
        ) {
          params.minPrice = filterState.priceRange[0];
          params.maxPrice = filterState.priceRange[1];
        }
      }
      const response = await VehicleSearchService.searchVehicles(params);
      const vehiclesData = response.data.data?.content || [];

      if (vehiclesData.length === 0 && page === 0) {
        setError("No vehicles found matching your criteria");
        setVehicles([]);
        setHasMore(false);
        await fetchRecommendedVehicles();
      } else {
        if (append) {
          setVehicles((prev) => [...prev, ...vehiclesData]);
        } else {
          setVehicles(vehiclesData);
        }

        const total = response.data.data?.totalElements || vehiclesData.length;
        setTotalCount(total);

        setChildCount(total > 100 ? "100+" : total);
        setHasMore(vehiclesData.length === 10);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const fetchRecommendedVehicles = async () => {
    try {
      const response = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
      });
      setRecommendedVehicles(response.data.data.content || []);
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    searchVehicles(0, false);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

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

  return (
    <div>
      <Navbar showSearchBar={true} />
      <div className="mt-22"></div>
      <div className="min-h-screen ">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="h-[2rem] lg:h-[3rem]"></div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CiLocationOn
                  color="#0673FF"
                  size={24}
                  className="hidden lg:block"
                />{" "}
                {location ? `Vehicles in ${location}` : "Vehicles In Lagos"}
              </h1>
              <p className="text-[1.2rem] md:text-2xl font-bold text-gray-900 mb-2">
                {loading && vehicles.length === 0
                  ? "Loading..."
                  : `${totalCount || 0}+ vehicles available`}
              </p>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex hidden lg:block items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="List view"
              >
                <HiViewList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="Grid view"
              >
                <BsFillGridFill className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <SimplifiedFilterBar
              filterState={filterState}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              vehicleTypes={vehicleTypes}
              makes={makes}
              features={features}
              totalCount={childCount as number}
            />
          </div>

          {/* Header with View Toggle */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-300px)] pb-10">
            {loading && vehicles.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && vehicles.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "grid grid-cols-1 gap-6"
                }
              >
                {vehicles.map((v: any) => (
                  <VehicleCard
                    key={v.id}
                    {...v}
                    bookingType={bookingType}
                    viewMode={viewMode}
                  />
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
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "grid grid-cols-1 gap-6"
                    }
                  >
                    {recommendedVehicles.map((v: any) => (
                      <VehicleCard
                        key={v.id}
                        {...v}
                        bookingType={bookingType}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
