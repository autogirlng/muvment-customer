"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface CustomerCategory {
  id: string;
  vehicleType: {
    id: string;
    name: string;
    description?: string;
  };
  image: string;
}

const FALLBACK_IMAGE = "/images/vehicles/sedan.webp";

const imageForType = (name = "") => {
  const n = name.toUpperCase();
  if (n.includes("ELECTRIC") && n.includes("SUV"))
    return "/images/vehicles/electric-suv.webp";
  if (n.includes("ELECTRIC") && n.includes("SEDAN"))
    return "/images/vehicles/electric-sedan.webp";
  if (n.includes("LUXURY")) return "/images/vehicles/luxury-suv.webp";
  if (n.includes("MID")) return "/images/vehicles/mid-sized-suv.webp";
  if (n.includes("MINI") || n.includes("VAN"))
    return "/images/vehicles/mini-van.webp";
  if (n.includes("BOAT")) return "/images/vehicles/boat.webp";
  if (n.includes("BUS")) return "/images/vehicles/bus.webp";
  if (n.includes("TRUCK")) return "/images/vehicles/truck.webp";
  if (n.includes("SUV")) return "/images/vehicles/suv.webp";
  if (n.includes("SEDAN")) return "/images/vehicles/sedan.webp";
  return FALLBACK_IMAGE;
};

const formatName = (name: string) =>
  name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryCard: React.FC<{
  category: CustomerCategory;
  href: string;
}> = ({ category, href }) => {
  const [imgSrc, setImgSrc] = useState(
    imageForType(category.vehicleType?.name),
  );
  const label = formatName(category.vehicleType?.name ?? "");

  return (
    <Link
      href={href}
      aria-label={`Browse ${label} rentals`}
      className="group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0673FF]/30 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0673FF] basis-[72%] sm:basis-[calc(50%-8px)] md:basis-[calc(33.333%-11px)] lg:basis-[calc(25%-12px)]"
    >
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 sm:h-36">
        <Image
          src={imgSrc}
          alt={`${label} car rental category`}
          width={252}
          height={144}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="h-24 w-auto max-w-[80%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-900">{label}</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-300 group-hover:bg-[#0673FF] group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

const CategoryCardSkeleton: React.FC = () => (
  <div className="flex shrink-0 basis-[72%] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:basis-[calc(50%-8px)] md:basis-[calc(33.333%-11px)] lg:basis-[calc(25%-12px)]">
    <div className="h-32 w-full animate-pulse bg-gray-100 sm:h-36" />
    <div className="flex items-center justify-between px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
      <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
    </div>
  </div>
);

const ArrowButton: React.FC<{
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={direction === "left" ? "Previous categories" : "Next categories"}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:border-[#0673FF]/40 hover:text-[#0673FF] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
  >
    {direction === "left" ? (
      <FaChevronLeft className="h-3.5 w-3.5" />
    ) : (
      <FaChevronRight className="h-3.5 w-3.5" />
    )}
  </button>
);

const VehicleCategories: React.FC = () => {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: (direction === "left" ? -1 : 1) * el.clientWidth,
      behavior: "smooth",
    });
  };

  const getCategories = async () => {
    try {
      const result = await VehicleSearchService.getCustomerCategories();
      const valid = (Array.isArray(result) ? result : []).filter(
        (item: CustomerCategory) => item?.vehicleType?.id,
      );
      if (valid.length > 0) {
        setCategories(valid);
        return;
      }
      // Fallback: some backends (production) only serve vehicle-types, not customer-categories
      const types = await VehicleSearchService.getVehicleTypes();
      const mapped: CustomerCategory[] = (Array.isArray(types) ? types : [])
        .filter((t) => t?.id)
        .map((t) => ({
          id: t.id,
          vehicleType: { id: t.id, name: t.name, description: t.description },
          image: imageForType(t.name),
        }));
      setCategories(mapped);
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [categories, updateArrows]);

  // Hide the section entirely if there is nothing to show
  if (ready && categories.length === 0) {
    return null;
  }

  const showArrows = canScrollLeft || canScrollRight;

  return (
    <section className="w-full bg-[#f7f9fc] py-16 lg:py-20">
      <div className="mx-auto flex w-[90%] max-w-6xl flex-col">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Browse by Category
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              From city sedans to spacious SUVs and buses.
            </p>
          </div>

          {showArrows && (
            <div className="flex shrink-0 items-center justify-center gap-2">
              <ArrowButton
                direction="left"
                disabled={!canScrollLeft}
                onClick={() => scroll("left")}
              />
              <ArrowButton
                direction="right"
                disabled={!canScrollRight}
                onClick={() => scroll("right")}
              />
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {!ready
            ? Array.from({ length: 4 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))
            : categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  href={`/explore?vehicleTypeId=${category.vehicleType.id}`}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default VehicleCategories;
