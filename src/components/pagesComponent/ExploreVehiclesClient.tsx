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
import { clarityEvent } from "@/services/clarity";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import LocationPrompt from "../Booking/LocationPrompt";
import Footer from "../HomeComponent/Footer";

export default function ExploreVehiclesClient() {
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isInitialized = useRef(false);

  const initializationInProgress = useRef(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterState, setFilterState] = useState<FilterState>({
    priceRange: undefined,
    selectedVehicleTypes: undefined,
    selectedMakes: undefined,
    selectedYears: undefined,
    selectedSeats: undefined,
    selectedFeatures: undefined,
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
  const [models, setModels] = useState([]);
  const [dynamicMaxPrice, setDynamicMaxPrice] = useState(100000);
  const [dynamicMinPrice, setDynamicMinPrice] = useState(25000);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const location = searchParams.get("location");
  const bookingType = searchParams.get("bookingType");
  const category = searchParams.get("category");
  const fromDate = searchParams.get("fromDate");
  const untilDate = searchParams.get("untilDate");
  const city = searchParams.get("city");

  const {
    status: locationStatus,
    location: detectedLocation,
    isDefault,
    requestLocation,
    isDetecting,
  } = useLocationDetection();

  const hasLocationParams = lat && lng;
  const PAG_SIZE = 20;

  const initializeFiltersFromUrl = useCallback((): FilterState => {
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const type = searchParams.getAll("type");
    const make = searchParams.getAll("make");
    const model = searchParams.getAll("model");
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
      selectedModels: model.length > 0 ? model : undefined,
      selectedYears: yearOfRelease.length > 0 ? yearOfRelease : undefined,
      selectedSeats: numberOfSeats.length > 0 ? numberOfSeats : undefined,
      selectedFeatures: featuresList.length > 0 ? featuresList : undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    if (isInitialized.current || initializationInProgress.current) return;

    initializationInProgress.current = true;

    const initialize = async () => {
      try {
        const [typesData, makesData, modelsData, featuresData] =
          await Promise.all([
            VehicleSearchService.getVehicleTypes(),
            VehicleSearchService.getVehicleMakes(),
            VehicleSearchService.getVehicleModels(),
            VehicleSearchService.getVehicleFeatures(),
          ]);

        setVehicleTypes(typesData[0].data);
        setMakes(makesData[0].data);
        setModels(modelsData[0].data);
        setFeatures(featuresData[0].data);

        if (
          locationStatus === "granted" &&
          !hasLocationParams &&
          detectedLocation
        ) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("lat", detectedLocation.lat.toString());
          params.set("lng", detectedLocation.lng.toString());
          params.set("location", detectedLocation.name);

          router.replace(`/booking/search?${params.toString()}`);

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const initialFilters = initializeFiltersFromUrl();
        setFilterState(initialFilters);
        await performSearch(0, false, initialFilters);

        isInitialized.current = true;
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize");
        setLoading(false);
      } finally {
        initializationInProgress.current = false;
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    performSearchRef.current = performSearch;
  });
  useEffect(() => {
    if (!isInitialized.current) return;

    setCurrentPage(0);
    setHasMore(true);
    performSearch(0, false, filterState);
  }, [filterState, lat, lng, category, fromDate, untilDate, city]);

  const performSearch = async (
    page: number = 0,
    append: boolean = false,
    filters: FilterState = filterState,
  ) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const params: VehicleSearchParams = {
        page,
        size: PAG_SIZE,
      };
      const currentLat = searchParams.get("lat") || lat;
      const currentLng = searchParams.get("lng") || lng;
      const currentCity = searchParams.get("city") || city;

      if (currentLat && currentLng) {
        params.latitude = parseFloat(currentLat);
        params.longitude = parseFloat(currentLng);
      }
      if (currentCity) params.city = currentCity;
      if (category) params.vehicleTypeId = category;
      if (fromDate) params.fromDate = fromDate;
      if (untilDate) params.untilDate = untilDate;
      if (bookingType) params.bookingTypeId = bookingType;

      if (filters.selectedVehicleTypes !== undefined) {
        params.vehicleTypeId = filters.selectedVehicleTypes[0];
      }
      if (filters.selectedMakes !== undefined) {
        params.vehicleMakeId = filters.selectedMakes[0];
      }
      if (filters.selectedYears !== undefined) {
        params.yearOfRelease = filters.selectedYears[0];
      }
      if (filters.selectedSeats !== undefined) {
        params.numberOfSeats = filters.selectedSeats[0];
      }
      if (filters.selectedFeatures !== undefined) {
        params.featureIds = filters.selectedFeatures[0];
      }
      if (filters.selectedModels !== undefined) {
        params.vehicleModelId = filters.selectedModels[0];
      }

      if (filters.priceRange && filters.priceRange[0] >= 0) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      clarityEvent("vehicle_search", {
        location: searchParams.get("location") || location,
        lat: currentLat,
        lng: currentLng,
        bookingType,
        category,
        fromDate,
        untilDate,
        city: currentCity,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        vehicleTypeFilter: params.vehicleTypeId,
        makeFilter: params.vehicleMakeId,
        seatsFilter: params.numberOfSeats,
        page,
      });

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
        setHasMore(vehiclesData.length === PAG_SIZE);
        if (vehiclesData.length > 0) {
          const allVehicles = append
            ? [...vehicles, ...vehiclesData]
            : vehiclesData;

          const allPrices = allVehicles
            .map((v: any) => {
              if (v.allPricingOptions && v.allPricingOptions.length > 0) {
                return v.allPricingOptions[0].price;
              }
              return 0;
            })
            .filter((price: number) => price > 0);

          if (allPrices.length > 0) {
            let minPrice = allPrices[0];
            let maxPrice = allPrices[0];

            for (let i = 1; i < allPrices.length; i++) {
              const price = allPrices[i];

              if (price < minPrice) minPrice = price;
              if (price > maxPrice) maxPrice = price;
            }
            const roundedMin = Math.floor(minPrice / 1000) * 1000;
            const roundedMax = Math.ceil(maxPrice / 1000) * 1000;
            setDynamicMinPrice(roundedMin);
            setDynamicMaxPrice(roundedMax);
            if (!filters.priceRange && page === 0 && !append) {
              setFilterState((prev) => ({
                ...prev,
                priceRange: [roundedMin, roundedMax],
              }));
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  const performSearchRef = useRef(performSearch);
  const fetchRecommendedVehicles = async () => {
    try {
      const response = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
        bookingTypeId: bookingType ?? "",
      });
      setRecommendedVehicles(response.data.data.content || []);
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleClearAll = () => {
    setFilterState({
      priceRange: undefined,
      selectedVehicleTypes: undefined,
      selectedMakes: undefined,
      selectedYears: undefined,
      selectedSeats: undefined,
      selectedFeatures: undefined,
    });
    router.replace("/booking/search");
  };

  useEffect(() => {
    if (!isInitialized.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          performSearch(nextPage, true);
        }
      },
      { threshold: 0.1 },
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
  }, [hasMore, loading, loadingMore, currentPage]);

  return (
    <div>
      <Navbar showSearchBar={true} />
      {!hasLocationParams && (
        <LocationPrompt
          isDefault={isDefault}
          status={locationStatus}
          onRequestLocation={requestLocation}
          isDetecting={isDetecting}
        />
      )}
      <div className="mt-22"></div>

      {!isInitialized.current ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading vehicles...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="lg:h-[1rem]"></div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CiLocationOn
                    color="#0673FF"
                    size={24}
                    className="hidden lg:block"
                  />
                  {city
                    ? `Vehicles in ${city.charAt(0).toUpperCase() + city.slice(1)}`
                    : location
                      ? `Vehicles in ${location}`
                      : "Vehicles in Lagos"}
                </h1>
                <p className="text-[1.2rem] md:text-2xl font-bold text-gray-900 mb-2">
                  {loading && vehicles.length === 0
                    ? "Loading..."
                    : totalCount < 10
                      ? `${totalCount || 0} vehicles available`
                      : `${totalCount || 0}+ vehicles available`}
                </p>
              </div>

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
            <div className="sticky top-0 z-10 bg-white pb-1 mb-2">
              <SimplifiedFilterBar
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                vehicleTypes={vehicleTypes}
                makes={makes}
                models={models}
                features={features}
                totalCount={childCount as number}
                maxPrice={dynamicMaxPrice}
                minPrice={dynamicMinPrice}
              />
            </div>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <main className="h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar pb-20">
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
      )}
      <Footer />
    </div>
  );
}
