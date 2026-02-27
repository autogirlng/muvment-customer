"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  /** Called when the sentinel enters the viewport and more data is available */
  onLoadMore?: () => void;
  /** Whether there are more pages to fetch from the server */
  hasMore?: boolean;
  /** Whether a fetch is currently in-flight */
  loadingMore?: boolean;
}

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
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Deduplicate by id
  const uniqueRows = useMemo(() => {
    const seen = new Set<string | number>();
    return data.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  // Observe sentinel to trigger server-side load more
  useEffect(() => {
    if (!onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setExpandedRow(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderActions = (row: T, index: number) =>
    seeMoreData ? (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandedRow(expandedRow === index ? null : index);
          }}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-700"
        >
          <TbDots className="text-xl" />
        </button>

        {expandedRow === index && (
          <div
            ref={popupRef}
            className="absolute right-0 mt-2 min-w-40 bg-white shadow-lg border rounded-lg p-2 z-20"
          >
            {seeMoreData.map((action, i) => (
              <div
                key={i}
                onClick={() => {
                  action.handleAction?.(row);
                  setExpandedRow(null);
                }}
                className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              >
                <action.icon className="text-base text-gray-600" />
                <span className="text-sm text-gray-700 truncate whitespace-nowrap max-w-[120px]">
                  {action.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null;

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
          uniqueRows.map((row, index) => (
            <div
              key={row.id}
              className="bg-white border border-gray-200 rounded-lg px-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-end items-center">
                {renderActions(row, index)}
              </div>

              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 space-y-3">
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
            </div>
          ))
        )}

        {/* Sentinel */}
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
              uniqueRows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors text-sm"
                >
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
                    <td className="relative px-4 py-3 text-right">
                      {renderActions(row, index)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Sentinel sits inside the scrollable container so it fires when user nears the bottom */}
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