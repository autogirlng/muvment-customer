"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import VehicleCard from "@/components/Booking/VehicleCard";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import Footer from "../HomeComponent/Footer";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { FullPageSpinner } from "../general/spinner";
import { FavouritesVehicleData } from "@/types/favourites";
import { FiLoader } from "react-icons/fi";

export default function FavouritesVehiclesClient() {
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const router = useRouter();

  const [vehicles, setVehicles] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const getFavouriteVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await getSingleData("/api/v1/favourite-vehicle");

      const { data: favoritesData } = data[0] as FavouritesVehicleData;

      const vehicles = favoritesData.vehicles.map((vehicle) => {
        const {
          city,
          extraHourlyRate,
          willProvideDriver,
          willProvideFuel,
          numberOfSeats,
          photos,
          name,
          id,
        } = vehicle;
        return {
          id,
          city,
          extraHourlyRate,
          willProvideDriver,
          willProvideFuel,
          numberOfSeats,
          photos,
          name,
          allPricingOptions: vehicle.pricing,
          vehicleTypeName: vehicle.vehicleMake.name,
          bookingType: vehicle.pricing[0].bookingTypeId,
        };
      });
      setVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching favourite vehicles:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFavouriteVehicles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <FiLoader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-red-600 mb-4">
            An error occured. Try again later
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="lg:h-[1rem]"></div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                Favourites
              </h1>
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
                    // bookingType={bookingType}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
