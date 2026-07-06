"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import VehicleCard from "@/components/Booking/VehicleCard";
import WelcomeOfferNote from "@/components/general/WelcomeOfferNote";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { FiArrowLeft } from "react-icons/fi";
import Footer from "../HomeComponent/Footer";

interface StateExploreVehiclesClientProps {
  stateId: string;
  stateName: string;
  countryName?: string;
  initialVehicles: any[];
  initialTotalCount: number;
}

const PAGE_SIZE = 20;

export default function StateExploreVehiclesClient({
  stateId,
  stateName,
  countryName,
  initialVehicles,
  initialTotalCount,
}: StateExploreVehiclesClientProps) {
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialVehicles.length === PAGE_SIZE);

  const displayLocation = countryName
    ? `${stateName}, ${countryName}`
    : stateName;

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");

      try {
        const response = await VehicleSearchService.searchVehiclesByState(
          stateId,
          page,
          PAGE_SIZE,
        );
        const vehiclesData = response.data?.data?.content || [];
        const total = response.data?.data?.totalElements || vehiclesData.length;

        if (vehiclesData.length === 0 && page === 0) {
          setVehicles([]);
          setTotalCount(0);
          setHasMore(false);
          setError(`No vehicles available for trips to ${stateName}`);
        } else {
          setVehicles((prev) =>
            append ? [...prev, ...vehiclesData] : vehiclesData,
          );
          setTotalCount(total);
          setHasMore(vehiclesData.length === PAGE_SIZE);
        }
      } catch {
        setError("Failed to load vehicles. Please try again.");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [stateId, stateName],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadPage(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, loadingMore, currentPage, loadPage]);

  return (
    <div>
      <Navbar showSearchBar={true} />
      <div className="mt-22" />

      <div className="min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="lg:h-[1rem]" />

          <WelcomeOfferNote />

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CiLocationOn
                  color="#0673FF"
                  size={24}
                  className="hidden lg:block"
                />
                Vehicles traveling to {displayLocation}
              </h1>
              <p className="text-[1.2rem] md:text-2xl font-bold text-gray-900 mb-2">
                {loading && vehicles.length === 0
                  ? "Loading..."
                  : `${totalCount} vehicle${totalCount === 1 ? "" : "s"} available`}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <HiViewList className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <BsFillGridFill className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 text-sm">{error}</p>
              {vehicles.length === 0 && (
                <Link
                  href="/booking/search"
                  className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Browse all vehicles →
                </Link>
              )}
            </div>
          )}

          <main className="h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar pb-20">
            {loading && vehicles.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
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
                  <VehicleCard key={v.id} {...v} viewMode={viewMode} />
                ))}
              </div>
            )}

            {hasMore && vehicles.length > 0 && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {loadingMore && <LoadingSpinner size="sm" />}
              </div>
            )}

            {!loading && !hasMore && vehicles.length > 0 && (
              <p className="text-center py-8 text-gray-500">
                No more vehicles to load
              </p>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function LoadingSpinner({ size = "lg" }: { size?: "sm" | "lg" }) {
  const cls =
    size === "sm"
      ? "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
      : "w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin";
  return <div className={cls} />;
}
