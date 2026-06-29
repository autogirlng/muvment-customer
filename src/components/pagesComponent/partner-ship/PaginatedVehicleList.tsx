"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  searchCity?: string;
  excludeIds?: string[];
  sortFeaturedFirst?: boolean;
  bookingParams?: Record<string, string>;
}

export default function PaginatedVehicleList({
  initialData,
  slug,
  type,
  title,
  subtitle,
  featured = false,
  searchCity,
  excludeIds,
  sortFeaturedFirst = false,
  bookingParams,
}: PaginatedListProps) {
  const [vehicles, setVehicles] = useState<any[]>(initialData.content || []);
  const [currentPage, setCurrentPage] = useState(initialData.page || 0);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const totalPages = initialData.totalPages || 1;
  const hasMore = currentPage < totalPages - 1;

  const visible = useMemo(() => {
    let list = vehicles;
    if (excludeIds && excludeIds.length) {
      const exclude = new Set(excludeIds);
      list = list.filter((v) => !exclude.has(v.id));
    }
    if (sortFeaturedFirst) {
      list = [...list].sort(
        (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
      );
    }
    return list;
  }, [vehicles, excludeIds, sortFeaturedFirst]);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = currentPage + 1;

      let response: PaginatedVehicleResponse | null;
      if (type === "priority") {
        response = await PartnerService.getPriorityVehicles(slug, nextPage, 6);
      } else if (searchCity) {
        response = await PartnerService.getCityVehicles(searchCity, nextPage, 6);
      } else {
        response = await PartnerService.getOtherVehicles(slug, nextPage, 6);
      }

      if (response && response.content) {
        setVehicles((prev) => {
          const seen = new Set(prev.map((v) => v.id));
          const merged = [...prev];
          for (const v of response.content) {
            if (!seen.has(v.id)) merged.push(v);
          }
          return merged;
        });
        setCurrentPage(response.page);
      }
    } catch (error) {
      console.error("Failed to load more vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, currentPage]);

  if (visible.length === 0) return null;

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
        {visible.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            {...vehicle}
            viewMode="grid"
            featured={featured}
            bookingParams={bookingParams}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-10 flex h-12 items-center justify-center"
        >
          {loading && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
          )}
        </div>
      )}
    </section>
  );
}
