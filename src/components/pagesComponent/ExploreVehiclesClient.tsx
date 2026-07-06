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
import WelcomeOfferNote from "@/components/general/WelcomeOfferNote";
import { VehicleSearchParams } from "@/types/vehicle";
import { SimplifiedFilterBar } from "@/components/Booking/SimplifiedFilterBarProps ";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { FaStar } from "react-icons/fa6";
import { clarityEvent } from "@/services/clarity";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import LocationPrompt from "../Booking/LocationPrompt";
import Footer from "../HomeComponent/Footer";

import { TravelState } from "@/types/state";
import { getBookingOption } from "@/context/Constarain";

// The search endpoint can return the same vehicle across paginated pages, which
// would render two cards with the same React key. Keep the list unique by id.
const dedupeById = (arr: any[]) =>
  Array.from(new Map((arr || []).map((v: any) => [v.id, v])).values());

interface ExploreVehiclesClientProps {
  initialVehicles: any[];
  initialTotalCount: number;
  initialRecommended: any[];
  initialRecommendedNearby?: boolean;
  initialVehicleTypes: any[];
  initialMakes: any[];
  initialModels: any[];
  initialFeatures: any[];
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

type SearchParamsLike = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

function filtersFromParams(searchParams: SearchParamsLike): FilterState {
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
}

function ExploreVehiclesClientContent({
  initialVehicles,
  initialTotalCount,
  initialRecommended,
  initialRecommendedNearby,
  initialVehicleTypes,
  initialMakes,
  initialModels,
  initialFeatures,
}: ExploreVehiclesClientProps) {
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showInterstate, setShowInterstate] = useState(false);
  const [interstateTypeId, setInterstateTypeId] = useState<string>("");
  const [monthlyTypeId, setMonthlyTypeId] = useState<string>("");
  const [interstateStates, setInterstateStates] = useState<TravelState[]>([]);
  const pathname = usePathname();

  const isFirstMount = useRef(true);

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [filterState, setFilterState] = useState<FilterState>(() =>
    filtersFromParams(searchParams),
  );

  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [recommendedVehicles, setRecommendedVehicles] =
    useState<any[]>(initialRecommended);
  const [recommendedNearby, setRecommendedNearby] = useState<boolean>(
    initialRecommendedNearby ?? false,
  );
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
  const [bookingTypeOptions, setBookingTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);

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
  const searchedAreaName = city
    ? city.charAt(0).toUpperCase() + city.slice(1)
    : "your area";
  const destinationStateId = searchParams.get("destinationStateId");
  const featuredOnly = searchParams.get("featured") === "true";

  const {
    status: locationStatus,
    location: detectedLocation,
    isDefault,
    requestLocation,
    isDetecting,
  } = useLocationDetection();

  const hasLocationParams = lat && lng;
  const PAG_SIZE = 20;

  // Resolve the interstate booking type id once (same keyword match as the bar).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { rawBookingOptions, dropdownOptions } = await getBookingOption();
        const opts: any[] = rawBookingOptions || [];
        const id =
          opts.find((t) =>
            String(t?.name || "")
              .toLowerCase()
              .includes("interstate"),
          )?.id || "";
        const monthId =
          opts.find((t) =>
            String(t?.name || "")
              .toLowerCase()
              .includes("month"),
          )?.id || "";
        if (alive) {
          setInterstateTypeId(id);
          setMonthlyTypeId(monthId);
          setBookingTypeOptions(dropdownOptions || []);
        }
      } catch {
        // leave empty; the interstate prompt simply will not show
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Interstate destinations reachable from the current origin, same source as
  // the search bar, so the prompt only offers states served from here.
  useEffect(() => {
    if (!interstateTypeId || !lat || !lng) {
      setInterstateStates([]);
      return;
    }
    let alive = true;
    VehicleSearchService.getInterstateDestinations(
      parseFloat(lat),
      parseFloat(lng),
      interstateTypeId,
    )
      .then((list) => {
        if (!alive) return;
        setInterstateStates(
          (list || []).map((d) => ({
            stateId: d.stateId,
            stateName: d.name,
            countryName: d.country,
          })),
        );
      })
      .catch(() => {
        if (alive) setInterstateStates([]);
      });
    return () => {
      alive = false;
    };
  }, [interstateTypeId, lat, lng]);

  // Run the origin-to-destination route search for the chosen state, preserving
  // the full current query (origin, dates, category, and any active filters).
  const goInterstate = (stateId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (interstateTypeId) p.set("bookingType", interstateTypeId);
    p.set("destinationStateId", stateId);
    p.set("radiusInKm", "100");
    router.push(`/booking/search?${p.toString()}`);
  };

  const onBookingTypeChange = (value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set("bookingType", value);
    else p.delete("bookingType");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (
      locationStatus === "granted" &&
      !hasLocationParams &&
      !city &&
      !location &&
      !featuredOnly &&
      detectedLocation
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", detectedLocation.lat.toString());
      params.set("lng", detectedLocation.lng.toString());
      params.set("location", detectedLocation.name);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    locationStatus,
    hasLocationParams,
    detectedLocation,
    city,
    location,
    featuredOnly,
  ]);

  useEffect(() => {
    if (featuredOnly) return;
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
    bookingType,
    destinationStateId,
  ]);

  useEffect(() => {
    if (!featuredOnly) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res: any = await VehicleSearchService.fetchFeaturedVehicles(
          0,
          100,
        );
        const content =
          res?.[0]?.data?.content ??
          res?.data?.content ??
          res?.content ??
          [];
        if (!cancelled) {
          setVehicles(content);
          setTotalCount(content.length);
          setHasMore(false);
          setRecommendedVehicles([]);
        }
      } catch {
        if (!cancelled) {
          setVehicles([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [featuredOnly]);

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
      const isMonthly = !!monthlyTypeId && bookingType === monthlyTypeId;

      if (currentLat && currentLng) {
        params.latitude = parseFloat(currentLat);
        params.longitude = parseFloat(currentLng);
      }
      if (currentCity) params.city = currentCity;
      if (category) params.vehicleTypeId = category;
      if (startDate && !isMonthly) params.startDate = startDate;
      if (endDate && !isMonthly) params.endDate = endDate;
      if (startTime && !isMonthly) params.startTime = startTime;
      if (endTime && !isMonthly) params.endTime = endTime;
      if (bookingType) params.bookingTypeId = bookingType;
      if (destinationStateId) params.destinationStateId = destinationStateId;

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
          setVehicles((prev) => {
            const seen = new Set(prev.map((v: any) => v.id));
            return [...prev, ...vehiclesData.filter((v: any) => !seen.has(v.id))];
          });
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
      // Keep recommendations in the searched area using the city field, which
      // is reliable even when a vehicle's coordinates are missing or wrong, so
      // we never surface cars from another city.
      const recCity =
        searchParams.get("city") ||
        city ||
        searchParams.get("location") ||
        undefined;
      const params: VehicleSearchParams = {
        page: 0,
        size: 6,
        bookingTypeId: bookingType ?? "",
        orderBy: filterState.orderBy ?? DEFAULT_VEHICLE_ORDER_BY,
      };
      if (recCity) params.city = recCity;
      const response = await VehicleSearchService.searchVehicles(params);
      let recs = response.data?.data?.content || [];
      let nearby = false;

      // If the searched area has no cars at all, fall back to the nearest cars
      // by distance so the page is not empty.
      if (recs.length === 0) {
        const currentLat = searchParams.get("lat") || lat;
        const currentLng = searchParams.get("lng") || lng;
        if (currentLat && currentLng) {
          const nearbyResponse = await VehicleSearchService.searchVehicles({
            page: 0,
            size: 6,
            latitude: parseFloat(currentLat),
            longitude: parseFloat(currentLng),
            radiusInKm: 500,
            bookingTypeId: bookingType ?? "",
            orderBy: filterState.orderBy ?? DEFAULT_VEHICLE_ORDER_BY,
          });
          recs = nearbyResponse.data?.data?.content || [];
          nearby = recs.length > 0;
        }
      }
      setRecommendedVehicles(recs);
      setRecommendedNearby(nearby);
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
          <WelcomeOfferNote />
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {featuredOnly ? (
                  <>
                    <FaStar color="#F5A623" size={22} className="shrink-0" />
                    Top rated vehicles
                  </>
                ) : (
                  <>
                    <CiLocationOn
                      color="#0673FF"
                      size={24}
                      className="hidden lg:block"
                    />
                    {recommendedNearby
                      ? "Vehicles near you"
                      : city
                        ? `Vehicles in and around ${city.charAt(0).toUpperCase() + city.slice(1)}`
                        : location
                          ? "Vehicles near your selected location"
                          : "Available vehicles"}
                  </>
                )}
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

          {!featuredOnly && (
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
                bookingTypeOptions={bookingTypeOptions}
                bookingTypeValue={bookingType || ""}
                onBookingTypeChange={onBookingTypeChange}
              />
              {bookingType === interstateTypeId &&
                interstateStates.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <label
                      htmlFor="destination-filter"
                      className="text-sm font-medium text-gray-700"
                    >
                      Destination
                    </label>
                    <select
                      id="destination-filter"
                      value={destinationStateId || ""}
                      onChange={(e) => {
                        if (e.target.value) goInterstate(e.target.value);
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-[#0673FF] focus:outline-none"
                    >
                      <option value="">Select destination</option>
                      {interstateStates.map((st) => (
                        <option key={st.stateId} value={st.stateId}>
                          {st.stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          )}

          {!featuredOnly && !startDate && (
            <div className="mb-4 rounded-xl border border-[#EAF2FF] bg-[#EAF2FF] px-4 py-3 text-sm text-[#101928]">
              Showing all cars
              {city ? ` in ${city}` : location ? ` near ${location}` : ""}. Add
              your travel dates to confirm availability and see pricing.
            </div>
          )}

          {!bookingType && interstateStates.length > 0 && (
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
                  {interstateStates.map((st) => (
                    <button
                      key={st.stateId}
                      onClick={() => goInterstate(st.stateId)}
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
                {dedupeById(vehicles).map((v: any) => (
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

            {!loading && vehicles.length === 0 && (
              <>
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {recommendedVehicles.length === 0
                      ? `No vehicles available in ${searchedAreaName} yet.`
                      : recommendedNearby
                        ? `No vehicles in ${searchedAreaName} yet.`
                        : `No vehicles in ${searchedAreaName} match your dates or filters.`}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {recommendedVehicles.length === 0
                      ? "We could not find cars nearby. Try another location, or start a new search."
                      : recommendedNearby
                        ? "Here are the nearest available cars."
                        : `Try widening your dates or clearing your filters. Other cars in ${searchedAreaName} are shown below.`}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleClearAll}
                      className="text-sm font-semibold text-[#0673FF] hover:underline"
                    >
                      Clear filters
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="text-sm font-semibold text-gray-700 hover:underline"
                    >
                      Start a new search
                    </button>
                  </div>
                </div>

                {recommendedVehicles.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                      {recommendedNearby
                        ? "Nearest available cars"
                        : `Other cars in ${searchedAreaName}`}
                    </h2>
                    <div className={gridClass}>
                      {dedupeById(recommendedVehicles).map((v: any) => (
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
              </>
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
