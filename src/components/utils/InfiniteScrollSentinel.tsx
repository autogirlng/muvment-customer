"use client";

import { useEffect, useRef } from "react";

type Props = {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

// Matches the infinite-scroll behaviour and "Loading more..." row used by the
// shared DataTable (components/utils/TableComponent), so pages that keep their own
// layout still paginate consistently with payment, favourites, and my-trips.
export default function InfiniteScrollSentinel({
  hasMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (!hasMore && !loadingMore) return null;

  return (
    <div ref={sentinelRef}>
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#0673ff]" />
          Loading more...
        </div>
      )}
    </div>
  );
}
