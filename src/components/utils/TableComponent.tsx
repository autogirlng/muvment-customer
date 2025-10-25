"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TbDots } from "react-icons/tb";
import Image from "next/image";

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
  pageSize?: number;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  height = "max-h-[400px]",
  title = "",
  seeMoreData,
  pageSize = 6,
}: DataTableProps<T>): React.ReactElement {
  const [displayedData, setDisplayedData] = useState<T[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Unique rows (avoid duplicates)
  const uniqueRows = useMemo(() => {
    const seen = new Set();
    return data.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  useEffect(() => {
    setDisplayedData(uniqueRows.slice(0, pageSize));
  }, [uniqueRows, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayedData.length < uniqueRows.length
        ) {
          const newSize = Math.min(
            displayedData.length + pageSize,
            uniqueRows.length
          );
          setDisplayedData(uniqueRows.slice(0, newSize));
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [displayedData, uniqueRows, pageSize]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setExpandedRow(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      )}

      <div className={`${height} overflow-y-auto`}>
        <table className="w-full border-collapse">
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
                <th className="py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (seeMoreData ? 1 : 0)}
                  className="text-center py-6 text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              displayedData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}

                  {seeMoreData && (
                    <td className="relative px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRow(expandedRow === index ? null : index);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-md text-gray-700"
                      >
                        <TbDots />
                      </button>

                      {expandedRow === index && (
                        <div
                          ref={popupRef}
                          className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-lg p-2 z-20"
                        >
                          {seeMoreData.map((action, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                action.handleAction?.(row);
                                setExpandedRow(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                            >
                              <action.icon className="text-lg text-gray-600" />
                              <span className="text-sm text-gray-700">
                                {action.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div ref={sentinelRef} className="h-1" />
        {displayedData.length === uniqueRows.length &&
          displayedData.length > 0 && (
            <div className="flex justify-center items-center py-4 text-gray-500 text-sm">
              End of results
            </div>
          )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing {displayedData.length} of {uniqueRows.length} records
        </p>
      </div>
    </div>
  );
}
