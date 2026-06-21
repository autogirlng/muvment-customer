"use client";

import React from "react";

export const BRAND = "#0673ff";

export const ngn = (amount?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);

export const fmt = (d?: string, withTime = false) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

export const prettyStatus = (s?: string) =>
  s
    ? s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())
    : "Unknown";

export const statusClasses = (s?: string) => {
  const v = (s || "").toUpperCase();
  if (v.includes("CONFIRM") || v.includes("COMPLETE"))
    return "bg-green-50 text-green-700";
  if (v.includes("PROGRESS") || v.includes("ACTIVE"))
    return "bg-blue-50 text-blue-700";
  if (v.includes("PENDING")) return "bg-amber-50 text-amber-700";
  if (v.includes("CANCEL")) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
};

export const Card: React.FC<{
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
    {(title || action) && (
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </h3>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  hideIfEmpty?: boolean;
}> = ({ icon, label, value, hideIfEmpty }) => {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim().toUpperCase() === "N/A");
  if (hideIfEmpty && isEmpty) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">
          {value ?? "N/A"}
        </p>
      </div>
    </div>
  );
};

export const driverValue = (trip: any): React.ReactNode => (
  <span>
    {trip?.driverName || "Assigned"}
    {trip?.driverPhoneNumber ? (
      <>
        {" · "}
        <a
          href={`tel:${trip.driverPhoneNumber}`}
          className="text-[#0673ff] hover:underline"
        >
          {trip.driverPhoneNumber}
        </a>
      </>
    ) : null}
  </span>
);
