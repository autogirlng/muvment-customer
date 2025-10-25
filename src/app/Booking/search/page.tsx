"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiFilter } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";

import { FilterState } from "@/types/filters";
import {
  VehicleSearchService,
  VehicleSearchParams,
} from "@/controllers/booking/vechicle";
import VehicleCard from "@/components/Booking/VehicleCard";
import { createFilterConfig } from "@/hooks/filterConfig";
import { SearchBar } from "@/components/Booking/SearchBar";
import { GenericFilterSidebar } from "@/components/Booking/GenericFilterSidebar";

export default function ExploreVehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [makes, setMakes] = useState([]);
  const [features, setFeatures] = useState([]);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

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

  const searchVehicles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params: VehicleSearchParams = {
        page: currentPage - 1,
        size: 4,
        latitude: 0,
        longitude: 0,
      };

      if (lat && lng) {
        params.latitude = parseFloat(lat);
        params.longitude = parseFloat(lng);
      }

      if (filterState.selectedVehicleTypes.length > 0)
        params.vehicleTypeId = filterState.selectedVehicleTypes[0];

      if (filterState.selectedMakes.length > 0)
        params.vehicleMakeId = filterState.selectedMakes[0];

      if (filterState.selectedFeatures.length > 0)
        params.featureIds = filterState.selectedFeatures;

      if (filterState.priceRange)
        (params.minPrice = filterState.priceRange[0]),
          (params.maxPrice = filterState.priceRange[1]);

      const response = await VehicleSearchService.searchVehicles(params);

      if (response.data.length === 0) {
        setError("No items found");
        setVehicles([]);
        await fetchRecommendedVehicles();
      } else {
        console.log("Search response:", response.data.data.content);
        const vehiclesData = response.data.data.content;
        setVehicles(vehiclesData);
        setTotalCount(vehiclesData.length || 0);
        setTotalPages(vehiclesData.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, currentPage, filterState]);

  const fetchRecommendedVehicles = async () => {
    try {
      const response = await VehicleSearchService.searchVehicles();
      setRecommendedVehicles(response.data || []);
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
    }
  };

  useEffect(() => {
    searchVehicles();
  }, [searchVehicles]);

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
                onApply={searchVehicles}
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

            {/* Explore Section */}
            <main className="flex-1 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Explore Vehicles
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

              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && vehicles.length > 0 && (
                <div className="grid grid-cols-1  gap-6 pb-6">
                  {vehicles.map((v: any) => (
                    <VehicleCard key={v.id} {...v} />
                  ))}
                </div>
              )}

              {!loading &&
                vehicles.length === 0 &&
                recommendedVehicles.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Recommended Cars
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {recommendedVehicles.map((v: any) => (
                        <VehicleCard key={v.id} {...v} />
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
