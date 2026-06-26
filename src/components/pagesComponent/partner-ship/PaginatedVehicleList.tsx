"use client";

import React, { useState } from "react";
import VehicleCard from "@/components/Booking/VehicleCard";
import { PartnerService } from "@/controllers/partner/partnerService";
import { PaginatedVehicleResponse } from "@/components/pagesComponent/partner-ship/types/partner";
import { FaStar } from "react-icons/fa6";

interface PaginatedListProps {
  initialData: PaginatedVehicleResponse;
  slug: string;
  type: "priority" | "other";
  title: string;
  subtitle?: string;
  featured?: boolean;
}

export default function PaginatedVehicleList({
  initialData,
  slug,
  type,
  title,
  subtitle,
  featured = false,
}: PaginatedListProps) {
  const [vehicles, setVehicles] = useState<any[]>(initialData.content || []);
  const [currentPage, setCurrentPage] = useState(initialData.page || 0);
  const [loading, setLoading] = useState(false);

  const totalPages = initialData.totalPages || 1;
  const hasMore = currentPage < totalPages - 1;

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = currentPage + 1;

      const response =
        type === "priority"
          ? await PartnerService.getPriorityVehicles(slug, nextPage, 6)
          : await PartnerService.getOtherVehicles(slug, nextPage, 6);

      if (response && response.content) {
        setVehicles((prev) => [...prev, ...response.content]);
        setCurrentPage(response.page);
      }
    } catch (error) {
      console.error("Failed to load more vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  if (vehicles.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex items-start gap-2">
        {featured && (
          <div className="mt-1">
            <FaStar color="#F5A623" size={22} className="shrink-0" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            {...vehicle}
            viewMode="grid"
            featured={featured}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-xl border-2 border-[#0673FF] text-[#0673FF] px-8 py-2.5 font-semibold transition hover:bg-[#EAF2FF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-[#0673FF] border-t-transparent rounded-full animate-spin" />
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
