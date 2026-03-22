"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TbDots } from "react-icons/tb";

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SeeMoreData {
  name: string;
  handleAction?: (row: any) => void;
  icon: React.ElementType;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  height?: string;
  title?: string;
  seeMoreData?: SeeMoreData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

// ─── ActionMenu ───────────────────────────────────────────────────────────────
function ActionMenu({ row, actions }: { row: any; actions: SeeMoreData[] }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Track whether a menu-item interaction is in progress so we don't
  // accidentally close the menu before the action fires.
  const interactingRef = useRef(false);

  const openMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 176;
    const left =
      window.innerWidth - rect.right >= menuWidth
        ? rect.left
        : rect.right - menuWidth;
    setCoords({ top: rect.bottom + 4, left });
    setOpen(true);
  }, []);

  // Close when tapping/clicking outside — but only if not interacting with a menu item
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      // If a menu item interaction is in progress, skip this close handler
      if (interactingRef.current) return;
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleScroll = () => setOpen(false);

    // Use capture phase so we catch it before any stopPropagation in children
    document.addEventListener("touchstart", handleOutside, { passive: true });
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const handleActionClick = useCallback(
    (action: SeeMoreData) => {
      setOpen(false);
      action.handleAction?.(row);
    },
    [row],
  );

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onTouchEnd={(e) => {
          e.preventDefault(); // prevent ghost click
          e.stopPropagation();
          open ? setOpen(false) : openMenu();
        }}
        onClick={(e) => {
          e.stopPropagation();
          // onClick fires on desktop; on mobile onTouchEnd already handled it
          if (!("ontouchstart" in window)) {
            open ? setOpen(false) : openMenu();
          }
        }}
        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md text-gray-700 touch-manipulation select-none"
      >
        <TbDots className="text-xl" />
      </button>

      {/* Floating menu — position:fixed so it's never clipped */}
      {open && coords && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
          }}
          className="w-44 bg-white shadow-xl border border-gray-200 rounded-lg p-1"
        >
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-md touch-manipulation select-none text-left"
              // Mark interaction start — prevents the outside handler from
              // closing the menu before the action fires on touch devices
              onTouchStart={() => {
                interactingRef.current = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                interactingRef.current = false;
                handleActionClick(action);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Only handle on non-touch (touch is handled by onTouchEnd)
                if (!("ontouchstart" in window)) {
                  handleActionClick(action);
                }
              }}
            >
              <action.icon className="text-base text-gray-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 whitespace-nowrap">
                {action.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  height = "max-h-[400px]",
  title = "",
  seeMoreData,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: DataTableProps<T>): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const uniqueRows = useMemo(() => {
    const seen = new Set<string | number>();
    return data.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  useEffect(() => {
    if (!onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) onLoadMore();
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  const loadingRow = (
    <div className="flex justify-center items-center py-4 gap-2 text-gray-500 text-sm">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      Loading more...
    </div>
  );

  const endMessage = (
    <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
      End of results
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      {title && (
        <div className="py-3 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}

      {/* ── Mobile / Tablet Card View ── */}
      <div className={`lg:hidden overflow-y-auto ${height} py-2`}>
        {uniqueRows.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-6">No data found</div>
        ) : (
          uniqueRows.map((row) => (
            <div
              key={row.id}
              className="bg-white border border-gray-200 rounded-lg px-4 mb-3 shadow-sm"
            >
              {seeMoreData && (
                <div className="flex justify-end items-center pt-1">
                  <ActionMenu row={row} actions={seeMoreData} />
                </div>
              )}

              <div className="flex-1 space-y-3 mb-2">
                {columns.map((column, colIndex) => (
                  <div
                    key={String(column.key)}
                    className={`flex justify-between items-center pb-3 ${
                      colIndex < columns.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {column.label}
                    </span>
                    <span className="text-sm text-gray-900 font-medium ml-4 text-right">
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div ref={sentinelRef} className="h-1" />
        {loadingMore && loadingRow}
        {!hasMore && uniqueRows.length > 0 && endMessage}
      </div>

      {/* ── Desktop Table View ── */}
      <div className={`hidden lg:block overflow-y-auto ${height}`}>
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
              {seeMoreData && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {uniqueRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (seeMoreData ? 1 : 0)}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No data found
                </td>
              </tr>
            ) : (
              uniqueRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors text-sm">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-gray-700 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}
                  {seeMoreData && (
                    <td className="px-4 py-3">
                      <ActionMenu row={row} actions={seeMoreData} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div ref={sentinelRef} className="h-1" />
        {loadingMore && (
          <div className="flex justify-center items-center py-4 gap-2 text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            Loading more...
          </div>
        )}
        {!hasMore && uniqueRows.length > 0 && endMessage}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs md:text-sm text-gray-600">
          Showing {uniqueRows.length} record{uniqueRows.length !== 1 ? "s" : ""}
          {hasMore ? " — scroll for more" : " — all loaded"}
        </p>
      </div>
    </div>
  );
}