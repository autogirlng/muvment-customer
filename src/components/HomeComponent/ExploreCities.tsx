"use client";
import Image from "next/image";
import React from "react";
import { BsBuildings } from "react-icons/bs";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { buildCitySearchHref } from "@/utils/cityLocations";

interface City {
  name: string;
  country: string;
  image: string;
}

const cities: City[] = [
  { name: "Lagos", country: "Nigeria", image: "/images/landing/1.jpg" },
  { name: "Abuja", country: "Nigeria", image: "/images/landing/4.jpg" },
  { name: "Port-Harcourt", country: "Nigeria", image: "/images/landing/3.jpg" },
  { name: "Benin", country: "Nigeria", image: "/images/landing/5.jpg" },
  { name: "Enugu", country: "Nigeria", image: "/images/landing/6.jpg" },
  { name: "Accra", country: "Ghana", image: "/images/landing/2.jpg" },
];

const ExploreCities: React.FC<{ bookingTypeId?: string }> = ({
  bookingTypeId,
}) => {
  const cityHref = (name: string) => buildCitySearchHref(name);

  return (
    <section className="bg-white px-4 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <BsBuildings className="mb-2 text-4xl text-[#0673FF]" />
          <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#0d1320] sm:text-4xl">
            Cities we operate in
          </h2>
          <p className="mt-2 max-w-xl text-gray-600">
            Tap a city to see the cars available near you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={cityHref(city.name)}
              className="group relative block h-52 overflow-hidden rounded-2xl border border-gray-100 text-left shadow-sm transition-shadow hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0673FF] sm:h-60"
            >
              <Image
                src={city.image}
                alt={`${city.name}, ${city.country}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                {city.country}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <span className="text-xl font-bold text-white drop-shadow">
                  {city.name}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  View cars <FiArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCities;
