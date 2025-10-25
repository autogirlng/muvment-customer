"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCar,
  FaGasPump,
  FaUsers,
  FaCog,
} from "react-icons/fa";

export default function TopVehiclesSection() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const topVehicles = [
    {
      id: "1",
      name: "Tesla Model S Plaid",
      type: "Electric Sedan",
      location: "Lagos",
      dailyPrice: 85000,
      rating: 4.9,
      reviews: 127,
      image: "/images/vehicles/tesla-model-s.png",
      features: ["Auto Pilot", "Ludicrous Mode", "Premium Sound"],
      specs: { seats: 5, power: "Electric", transmission: "Auto" },
    },
    {
      id: "2",
      name: "Mercedes-Benz EQS",
      type: "Luxury Electric",
      location: "Abuja",
      dailyPrice: 92000,
      rating: 4.8,
      reviews: 89,
      image: "/images/vehicles/mercedes-eqs.png",
      features: ["MBUX Hyperscreen", "Air Suspension", "Massage Seats"],
      specs: { seats: 5, power: "Electric", transmission: "Auto" },
    },
    {
      id: "3",
      name: "BMW i7",
      type: "Executive Sedan",
      location: "Port Harcourt",
      dailyPrice: 78000,
      rating: 4.7,
      reviews: 64,
      image: "/images/vehicles/bmw-i7.png",
      features: ["Theatre Screen", "Crystal Headlights", "Sky Lounge"],
      specs: { seats: 5, power: "Electric", transmission: "Auto" },
    },
    {
      id: "4",
      name: "Audi e-tron GT",
      type: "Sports Electric",
      location: "Lagos",
      dailyPrice: 95000,
      rating: 4.9,
      reviews: 42,
      image: "/images/vehicles/audi-etron.png",
      features: ["Quattro AWD", "Sport Seats", "Bang & Olufsen"],
      specs: { seats: 4, power: "Electric", transmission: "Auto" },
    },
    {
      id: "5",
      name: "Porsche Taycan",
      type: "Performance EV",
      location: "Abuja",
      dailyPrice: 110000,
      rating: 4.9,
      reviews: 56,
      image: "/images/vehicles/porsche-taycan.png",
      features: ["Launch Control", "Sport Chrono", "Premium Package"],
      specs: { seats: 4, power: "Electric", transmission: "Auto" },
    },
  ];

  const toggleFavorite = (vehicleId: string) => {
    setFavorites((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <FaStar className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Most Popular{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Electric Rides
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our most-booked premium electric vehicles, loved by
            customers for their exceptional performance and luxury features
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Top Rated Vehicles
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center hover:scale-105"
            >
              <FaChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center hover:scale-105"
            >
              <FaChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-8 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {topVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className="flex-none w-80 lg:w-96 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(vehicle.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    favorites.includes(vehicle.id)
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500"
                  }`}
                >
                  <FaHeart
                    className={`w-4 h-4 ${
                      favorites.includes(vehicle.id) ? "fill-current" : ""
                    }`}
                  />
                </button>

                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-3 h-3 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    {vehicle.location}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 right-4 bg-black/80 text-white rounded-full px-3 py-1 flex items-center gap-1">
                  <FaStar className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">
                    {vehicle.rating}
                  </span>
                  <span className="text-xs text-gray-300">
                    ({vehicle.reviews})
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {vehicle.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{vehicle.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(vehicle.dailyPrice)}
                    </div>
                    <div className="text-gray-500 text-sm">per day</div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Specs */}
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUsers className="w-4 h-4" />
                    <span className="text-sm">{vehicle.specs.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaGasPump className="w-4 h-4" />
                    <span className="text-sm">{vehicle.specs.power}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCog className="w-4 h-4" />
                    <span className="text-sm">
                      {vehicle.specs.transmission}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/vehicles/${vehicle.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group/btn"
                >
                  <FaCar className="w-4 h-4" />
                  Book This Ride
                  <FaChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/explore/top-vehicles"
            className="inline-flex items-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            View All Premium Vehicles
            <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
