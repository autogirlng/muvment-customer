"use client";
import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FilterState } from "@/types/filters";
import {
  DEFAULT_VEHICLE_ORDER_BY,
  parseVehicleOrderBy,
} from "@/constants/vehicleSearchOrder";
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

import { TravelState, buildStateExploreUrl } from "@/types/state";

interface ExploreVehiclesClientProps {
  initialVehicles: any[];
  initialTotalCount: number;
  initialRecommended: any[];
  initialVehicleTypes: any[];
  initialMakes: any[];
  initialModels: any[];
  initialFeatures: any[];
  initialStates?: TravelState[];
}

const VehicleCardSkeleton: React.FC<{ viewMode: "list" | "grid" }> = ({
  viewMode,
}) => {
  if (viewMode === "grid") {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="h-[180px] w-full animate-pulse bg-gray-100" />
        <div className="p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white md:h-[180px] md:flex-row">
      <div className="h-[200px] w-full flex-shrink-0 animate-pulse bg-gray-100 md:h-full md:w-[260px]" />
      <div className="flex-1 p-4">
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-7 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
};

function ExploreVehiclesClientContent({
  initialVehicles,
  initialTotalCount,
  initialRecommended,
  initialVehicleTypes,
  initialMakes,
  initialModels,
  initialFeatures,
  initialStates = [],
}: ExploreVehiclesClientProps) {
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showInterstate, setShowInterstate] = useState(false);
  const pathname = usePathname();

  const isFirstMount = useRef(true);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterState, setFilterState] = useState<FilterState>({
    orderBy: DEFAULT_VEHICLE_ORDER_BY,
    priceRange: undefined,
    selectedVehicleTypes: undefined,
    selectedMakes: undefined,
    selectedYears: undefined,
    selectedSeats: undefined,
    selectedFeatures: undefined,
  });

  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [recommendedVehicles, setRecommendedVehicles] =
    useState<any[]>(initialRecommended);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [childCount, setChildCount] = useState<number | string>(
    initialTotalCount > 100 ? "100+" : initialTotalCount,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialVehicles.length === 20);

  const [vehicleTypes] = useState(initialVehicleTypes);
  const [makes] = useState(initialMakes);
  const [features] = useState(initialFeatures);
  const [models] = useState(initialModels);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const location = searchParams.get("location");
  const bookingType = searchParams.get("bookingType");
  const category = searchParams.get("category");
  const startDate = searchParams.get("startDate");
  const startTime = searchParams.get("startTime");
  const endDate = searchParams.get("endDate");
  const endTime = searchParams.get("endTime");
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
    const type = searchParams.getAll("vehicleTypeId");
    const make = searchParams.getAll("make");
    const model = searchParams.getAll("model");
    const yearOfRelease = searchParams.getAll("yearOfRelease");
    const numberOfSeats = searchParams.getAll("numberOfSeats");
    const featuresList = searchParams.getAll("features");

    return {
      orderBy: parseVehicleOrderBy(searchParams.get("orderBy")),
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
    setFilterState(initializeFiltersFromUrl());
  }, []);

  useEffect(() => {
    if (
      locationStatus === "granted" &&
      !hasLocationParams &&
      detectedLocation
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", detectedLocation.lat.toString());
      params.set("lng", detectedLocation.lng.toString());
      params.set("location", detectedLocation.name);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [locationStatus, hasLocationParams, detectedLocation]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setCurrentPage(0);
    setHasMore(true);
    performSearch(0, false, filterState);
  }, [
    filterState,
    lat,
    lng,
    category,
    startDate,
    startTime,
    endDate,
    endTime,
    city,
  ]);

  const performSearch = async (
    page: number = 0,
    append: boolean = false,
    filters: FilterState = filterState,
  ) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const params: VehicleSearchParams = { page, size: PAG_SIZE };
      const currentLat = searchParams.get("lat") || lat;
      const currentLng = searchParams.get("lng") || lng;
      const currentCity = searchParams.get("city") || city;

      if (currentLat && currentLng) {
        params.latitude = parseFloat(currentLat);
        params.longitude = parseFloat(currentLng);
      }
      if (currentCity) params.city = currentCity;
      if (category) params.vehicleTypeId = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (bookingType) params.bookingTypeId = bookingType;

      if (filters.selectedVehicleTypes)
        params.vehicleTypeId = filters.selectedVehicleTypes[0];
      if (filters.selectedMakes)
        params.vehicleMakeId = filters.selectedMakes[0];
      if (filters.selectedYears)
        params.yearOfRelease = filters.selectedYears[0];
      if (filters.selectedSeats)
        params.numberOfSeats = filters.selectedSeats[0];
      if (filters.selectedFeatures && filters.selectedFeatures.length > 0)
        params.featureIds = filters.selectedFeatures.join(",");
      if (filters.selectedModels)
        params.vehicleModelId = filters.selectedModels[0];

      if (filters.priceRange && filters.priceRange[0] >= 0) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      params.orderBy = filters.orderBy ?? DEFAULT_VEHICLE_ORDER_BY;

      clarityEvent("vehicle_search", {
        location: searchParams.get("city") || location,
        lat: currentLat,
        lng: currentLng,
        bookingType,
        category,
        startDate,
        startTime,
        endDate,
        endTime,
        city: currentCity,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        vehicleTypeFilter: params.vehicleTypeId,
        page,
      });

      const response = await VehicleSearchService.searchVehicles(params);
      const vehiclesData = response.data?.data?.content || [];

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

        const total = response.data?.data?.totalElements || vehiclesData.length;
        setTotalCount(total);
        setChildCount(total > 100 ? "100+" : total);
        setHasMore(vehiclesData.length === PAG_SIZE);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchRecommendedVehicles = async () => {
    try {
      const response = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
        bookingTypeId: bookingType ?? "",
        orderBy: filterState.orderBy ?? DEFAULT_VEHICLE_ORDER_BY,
      });
      setRecommendedVehicles(response.data?.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
    }
  };

  const syncFiltersToUrl = useCallback(
    (filters: FilterState) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const setMulti = (key: string, vals?: string[]) => {
        params.delete(key);
        vals?.forEach((v) => params.append(key, v));
      };
      setMulti("vehicleTypeId", filters.selectedVehicleTypes);
      setMulti("make", filters.selectedMakes);
      setMulti("model", filters.selectedModels);
      setMulti("yearOfRelease", filters.selectedYears);
      setMulti("numberOfSeats", filters.selectedSeats);
      setMulti("features", filters.selectedFeatures);

      params.delete("minPrice");
      params.delete("maxPrice");
      if (filters.priceRange) {
        params.set("minPrice", String(filters.priceRange[0]));
        params.set("maxPrice", String(filters.priceRange[1]));
      }

      params.delete("orderBy");
      if (filters.orderBy && filters.orderBy !== DEFAULT_VEHICLE_ORDER_BY) {
        params.set("orderBy", String(filters.orderBy));
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const urlSyncReady = useRef(false);
  useEffect(() => {
    if (!urlSyncReady.current) {
      urlSyncReady.current = true;
      return;
    }
    syncFiltersToUrl(filterState);
  }, [filterState, syncFiltersToUrl]);

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterState((prev) => ({ ...prev, [filterId]: value }));
  };

  const handleClearAll = () => {
    setFilterState({
      orderBy: DEFAULT_VEHICLE_ORDER_BY,
      priceRange: undefined,
      selectedVehicleTypes: undefined,
      selectedMakes: undefined,
      selectedYears: undefined,
      selectedSeats: undefined,
      selectedFeatures: undefined,
    });
    router.replace(pathname);
  };

  useEffect(() => {
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
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loading, loadingMore, currentPage, filterState]);


  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 gap-6";

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

      <div className="min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="lg:h-[1rem]"></div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
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
              <p
                aria-live="polite"
                className="text-sm md:text-base font-medium text-gray-500 mb-2"
              >
                {loading && vehicles.length === 0
                  ? "Loading..."
                  : `${totalCount > 100 ? "100+" : totalCount || 0} ${
                      totalCount === 1 ? "vehicle" : "vehicles"
                    } available`}
              </p>
            </div>

            <div className="flex hidden lg:block items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#0673FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <HiViewList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#0673FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
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
              maxPrice={500000}
              minPrice={25000}
            />
          </div>

          {initialStates && initialStates.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowInterstate((v) => !v)}
                aria-expanded={showInterstate}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0673FF] hover:text-[#0560d6]"
              >
                Is this an interstate trip?
                <svg
                  className={`h-4 w-4 transition-transform ${
                    showInterstate ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showInterstate && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {initialStates.map((st) => (
                    <button
                      key={st.stateId}
                      onClick={() => router.push(buildStateExploreUrl(st))}
                      className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#0673FF] hover:text-[#0673FF]"
                    >
                      <span className="whitespace-nowrap">{st.stateName}</span>
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-[#0673FF]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && vehicles.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <main className="pb-20">
            {loading && vehicles.length === 0 ? (
              <div className={gridClass}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : vehicles.length > 0 ? (
              <div
                aria-busy={loading}
                className={`${gridClass} transition-opacity ${
                  loading ? "pointer-events-none opacity-60" : ""
                }`}
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
            ) : null}

            {hasMore && vehicles.length > 0 && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="w-8 h-8 border-4 border-[#0673FF] border-t-transparent rounded-full animate-spin" />
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
              recommendedVehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    No vehicles match your search
                  </p>
                  <p className="mt-1 max-w-md text-sm text-gray-500">
                    Try removing some filters, or broadening your location and
                    dates.
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="mt-5 rounded-full bg-[#0673FF] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6]"
                  >
                    Clear filters
                  </button>
                </div>
              )}

            {!loading &&
              vehicles.length === 0 &&
              recommendedVehicles.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Recommended Cars
                  </h2>
                  <div className={gridClass}>
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

      <Footer />
    </div>
  );
}

export default function ExploreVehiclesClient(props: ExploreVehiclesClientProps) {
  return (
    <Suspense fallback={null}>
      <ExploreVehiclesClientContent {...props} />
    </Suspense>
  );
}
