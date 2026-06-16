"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VehicleCard from "@/components/Booking/VehicleCard";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { FavouritesVehicleData } from "@/types/favourites";
import { FiLoader } from "react-icons/fi";
import Link from "next/link";
import { BiHeart, BiSolidHeart } from "react-icons/bi";

const BRAND = "#0673ff";

export default function FavouritesVehiclesClient() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const router = useRouter();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const getFavouriteVehicles = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getSingleData("/api/v1/favourite-vehicle");
      const { data: favoritesData } = data[0] as FavouritesVehicleData;

      const mapped = favoritesData?.vehicles?.map((vehicle) => {
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
          allPricingOptions: vehicle?.pricing,
          vehicleTypeName: vehicle?.vehicleMake.name || "",
          bookingType: vehicle?.pricing[0]?.bookingTypeId || "",
        };
      });
      setVehicles(mapped || []);
    } catch (err) {
      console.error("Error fetching favourite vehicles:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFavouriteVehicles();
  }, []);

  const wrap = "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto";

  if (loading) {
    return (
      <div className={wrap}>
        <div className="flex items-center justify-center py-24">
          <FiLoader
            className="w-12 h-12 animate-spin"
            style={{ color: BRAND }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={wrap}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">An error occurred. Try again later.</p>
          <button
            onClick={getFavouriteVehicles}
            className="px-6 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className={wrap}>
        <FavoritesHeader vehicles={0} />
        <div className="flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="mb-6">
            <Image
              src={"/images/empty_state.png"}
              alt="Empty state"
              width={180}
              height={180}
              className="opacity-80"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            You haven&apos;t saved any cars yet
          </h2>
          <p className="mt-2 text-gray-500 max-w-sm">
            Tap the heart icon on any car to save it here.
          </p>
          <Link
            href="/booking/search"
            className="mt-5 px-6 py-3 text-white rounded-full hover:opacity-90 transition font-semibold"
            style={{ backgroundColor: BRAND }}
          >
            Browse cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <FavoritesHeader vehicles={vehicles.length} />

        <div className="hidden lg:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-[#0673ff] text-white"
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
                ? "bg-[#0673ff] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Grid view"
          >
            <BsFillGridFill className="w-5 h-5" />
          </button>
        </div>
      </div>

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
    </div>
  );
}

const FavoritesHeader = ({ vehicles }: { vehicles: number }) => (
  <div className="flex items-center gap-2">
    <span className="bg-red-50 p-2 rounded-full flex items-center justify-center">
      {vehicles > 0 ? (
        <BiSolidHeart className="text-red-500" size={18} />
      ) : (
        <BiHeart className="text-red-500" size={18} />
      )}
    </span>
    <span className="text-base font-semibold text-gray-900">
      {vehicles} saved {vehicles === 1 ? "car" : "cars"}
    </span>
  </div>
);
