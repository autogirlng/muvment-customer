"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiSearch, FiMapPin, FiArrowRight, FiInbox } from "react-icons/fi";
import { PartnerService } from "@/controllers/partner/partnerService";
import {
  Partner,
  PaginatedPartnerResponse,
} from "@/components/pagesComponent/partner-ship/types/partner";

interface Props {
  initialData: PaginatedPartnerResponse;
}

const PAGE_SIZE = 12;

const prettyType = (type: string) =>
  String(type || "")
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

function PartnerCard({ partner }: { partner: Partner }) {
  const states = (partner.operatingStates || []).map((s) => s.name);
  return (
    <Link
      href={`/partnership/${partner.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        {partner.imageUrl ? (
          <img
            src={partner.imageUrl}
            alt={partner.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <FiInbox size={32} />
          </div>
        )}
        {partner.partnerType && (
          <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0673FF] shadow-sm backdrop-blur-sm">
            {prettyType(partner.partnerType)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[#101928] line-clamp-1">
          {partner.name}
        </h3>
        {partner.address && (
          <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-500">
            <FiMapPin className="flex-shrink-0 text-[#0673FF]" size={14} />
            <span className="line-clamp-1">{partner.address}</span>
          </div>
        )}
        {partner.description && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">
            {partner.description}
          </p>
        )}

        {states.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {states.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#0673FF]"
              >
                {s}
              </span>
            ))}
            {states.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                +{states.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-1.5 pt-1 text-sm font-semibold text-[#0673FF]">
          View fleet
          <FiArrowRight className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function PartnersDirectory({ initialData }: Props) {
  const [partners, setPartners] = useState<Partner[]>(initialData.content || []);
  const [page, setPage] = useState(initialData.page || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const isFirst = useRef(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMore = page < totalPages - 1;

  const runSearch = async (term: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await PartnerService.getAllActivePartners(term, 0, PAGE_SIZE);
      if (res === null) {
        setError(true);
      } else {
        setPartners(res.content || []);
        setPage(res.page || 0);
        setTotalPages(res.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const term = search.trim();
    if (debounce.current) clearTimeout(debounce.current);

    if (!term) {
      runSearch("");
      return;
    }

    debounce.current = setTimeout(() => runSearch(term), 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await PartnerService.getAllActivePartners(
        search.trim(),
        next,
        PAGE_SIZE,
      );
      if (res?.content) {
        setPartners((prev) => [...prev, ...res.content]);
        setPage(res.page);
        setTotalPages(res.totalPages);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="flex-1 pb-20">
      <section className="relative overflow-hidden bg-[#101928] px-6 pt-32 pb-24 md:pt-36 md:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="hero-glow hero-glow-1" />
          <span className="hero-glow hero-glow-2" />
          <span className="hero-grid" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-[2.4rem] font-bold leading-[1.1] text-white sm:text-5xl md:text-[3.5rem]">
            The brands that{" "}
            <span className="text-[#5AA2FF]">move with Muvment</span>
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-[15px] font-light leading-[1.75] text-white/65 md:text-[17px]">
            Hotels, venues and businesses across Nigeria trust us with their
            guest and client rentals, each with a dedicated fleet ready on the
            premises.
          </p>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
              <FiSearch className="flex-shrink-0 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partners by name"
                className="w-full bg-transparent text-base outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
            <FiInbox className="mx-auto text-gray-300" size={40} />
            <p className="mt-4 text-lg text-gray-500">
              We couldn&apos;t load partners right now.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Check your connection and try again.
            </p>
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
            <FiInbox className="mx-auto text-gray-300" size={40} />
            <p className="mt-4 text-lg text-gray-500">
              {search.trim()
                ? `No partners match "${search.trim()}".`
                : "No partners to show yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-w-[150px] rounded-xl border-2 border-[#0673ff] px-8 py-2.5 font-semibold text-[#0673ff] transition hover:bg-[#EAF2FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
