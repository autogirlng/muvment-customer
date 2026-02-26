"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import VehicleCard from "@/components/Booking/VehicleCard";
import { HiViewList } from "react-icons/hi";
import { BsFillGridFill } from "react-icons/bs";
import Footer from "../HomeComponent/Footer";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { FavouritesVehicleData } from "@/types/favourites";
import { FiLoader } from "react-icons/fi";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { BiHeart, BiSolidHeart } from "react-icons/bi";

export default function FavouritesVehiclesClient() {
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

      const vehicles = favoritesData?.vehicles?.map((vehicle) => {
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

  if (!vehicles || vehicles.length === 0) {
    return (
      <>
        <Navbar />
        <FavoritesHeader vehicles={vehicles?.length || 0} />

        <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
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
            You haven't saved any cars yet
          </h2>

          <p className="mt-2 text-gray-500 max-w-sm">
            Tap the heart icon on any car to save it there
          </p>

          <Link
            href="/booking/search"
            className="mt-3 px-4 py-3 bg-blue-600 text-white text-lg  rounded-xl hover:bg-blue-800 transition duration-200"
          >
            Browse Cars
          </Link>
        </div>
      </>
    );
  }
  return (
    <div>
      <Navbar />

      <div className="min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="lg:h-[1rem]"></div>
          <div className="mb-3 flex items-center justify-between">
            <FavoritesHeader vehicles={vehicles.length || 0} />

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
                {vehicles &&
                  vehicles.length > 0 &&
                  vehicles?.map((v: any) => (
                    <VehicleCard
                      key={v.id}
                      {...v}
                      // bookingType={v.bookingType}
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

const FavoritesHeader = ({ vehicles }: { vehicles: number }) => {
  return (
    <>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="bg-red-100 p-2 rounded-full flex items-center justify-center">
            {vehicles > 0 ? (
              <BiSolidHeart className="text-red-500" size={20} />
            ) : (
              <BiHeart className="text-red-500" size={20} />
            )}
          </span>
          My Favourites
        </h1>

        <h2 className="text-xl mt-5 font-bold text-gray-900 flex items-center gap-2">
          {vehicles} saved cars
        </h2>
      </div>
    </>
  );
};
