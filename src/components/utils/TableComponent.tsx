"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TbDots } from "react-icons/tb";
import { FiInbox, FiSearch } from "react-icons/fi";

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SeeMoreData {
  name: string | ((row: any) => string);
  handleAction?: (row: any) => void;
  icon: React.ElementType;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  height?: string;
  title?: string;
  seeMoreData?: SeeMoreData[];
  onRowClick?: (row: T) => void;
  renderMobileCard?: (row: T) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  itemLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  isFiltered?: boolean;
  filteredTitle?: string;
  filteredMessage?: string;
  hideMobileActions?: boolean;
  flush?: boolean;
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
          {actions.map((action, i) => {
            const Icon = action.icon;
            const label =
              typeof action.name === "function"
                ? action.name(row)
                : action.name;
            return (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-md touch-manipulation select-none text-left"
              // Mark interaction start, prevents the outside handler from
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
              <Icon className="text-base text-gray-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 whitespace-nowrap">
                {label}
              </span>
            </button>
            );
          })}
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
  onRowClick,
  renderMobileCard,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  itemLabel = "result",
  emptyTitle,
  emptyMessage,
  isFiltered = false,
  filteredTitle,
  filteredMessage,
  hideMobileActions = false,
  flush = false,
}: DataTableProps<T>): React.ReactElement {
  const pluralLabel = itemLabel.endsWith("s") ? itemLabel : `${itemLabel}s`;
  const resolvedEmptyTitle = emptyTitle ?? `No ${pluralLabel} yet`;
  const resolvedEmptyMessage =
    emptyMessage ?? `When you have ${pluralLabel}, they will appear here.`;
  const resolvedFilteredTitle = filteredTitle ?? "No results found";
  const resolvedFilteredMessage =
    filteredMessage ?? "Try adjusting your search or filters.";
  const sentinelRef = useRef<HTMLDivElement>(null);

  const uniqueRows = useMemo(() => {
    const seen = new Set<string | number>();
    return data.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  const showFilteredEmpty = isFiltered && uniqueRows.length === 0;
  const EmptyIcon = showFilteredEmpty ? FiSearch : FiInbox;
  const emptyHeading = showFilteredEmpty
    ? resolvedFilteredTitle
    : resolvedEmptyTitle;
  const emptyBody = showFilteredEmpty
    ? resolvedFilteredMessage
    : resolvedEmptyMessage;

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
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0673ff]" />
      Loading more...
    </div>
  );

  return (
    <div
      className={
        flush
          ? "w-full"
          : "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full"
      }
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}

      {/* ── Mobile / Tablet Card View ── */}
      <div
        className={`lg:hidden ${flush ? "" : `overflow-y-auto ${height}`} py-2`}
      >
        {uniqueRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <EmptyIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-3 font-semibold text-gray-900">{emptyHeading}</p>
            <p className="mt-1 text-sm text-gray-500">{emptyBody}</p>
          </div>
        ) : (
          uniqueRows.map((row) => (
            <div
              key={row.id}
              className={
                flush
                  ? "py-4 border-b border-gray-100 last:border-0"
                  : "px-4 py-4 border-b border-gray-100 last:border-0"
              }
            >
              <div
                className={onRowClick ? "cursor-pointer" : ""}
                onClick={() => onRowClick?.(row)}
              >
                {renderMobileCard ? (
                  renderMobileCard(row)
                ) : (
                  <div className="space-y-2">
                    {columns.map((column, colIndex) => (
                      <div
                        key={colIndex}
                        className="flex justify-between items-center gap-3"
                      >
                        <span className="text-xs text-gray-500">
                          {column.label}
                        </span>
                        <span className="text-sm text-gray-900 font-medium text-right">
                          {column.render
                            ? column.render(row[column.key], row)
                            : (row[column.key] as React.ReactNode)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!hideMobileActions &&
                seeMoreData &&
                seeMoreData.length > 0 && (
                  <div
                    className="mt-2 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionMenu row={row} actions={seeMoreData} />
                  </div>
                )}
            </div>
          ))
        )}

        <div ref={sentinelRef} className="h-1" />
        {loadingMore && loadingRow}
      </div>

      {/* ── Desktop Table View ── */}
      <div
        className={`hidden lg:block overflow-x-auto ${flush ? "" : `overflow-y-auto ${height}`}`}
      >
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
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
                  className="py-14"
                >
                  <div className="flex flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <EmptyIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 font-semibold text-gray-900">
                      {emptyHeading}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{emptyBody}</p>
                  </div>
                </td>
              </tr>
            ) : (
              uniqueRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 transition-colors text-sm ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-gray-700 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}
                  {seeMoreData && (
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0673ff]" />
            Loading more...
          </div>
        )}
      </div>

      {!flush && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs md:text-sm text-gray-600">
            {uniqueRows.length} {itemLabel}
            {uniqueRows.length !== 1 ? "s" : ""}
            {hasMore ? " · scroll to load more" : ""}
          </p>
        </div>
      )}
    </div>
  );
}