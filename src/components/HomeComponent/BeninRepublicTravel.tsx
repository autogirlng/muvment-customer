"use client";

import React, { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import StatePickerModal from "@/components/Booking/StatePickerModal";

const LAGOS = { x: 138, y: 270 };

type Dest = {
  label: string;
  sub?: string;
  x: number;
  y: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  anchor: "start" | "middle" | "end";
  cross?: boolean;
};

const DESTINATIONS: Dest[] = [
  { label: "Cotonou", sub: "Benin", x: 64, y: 206, cx: 92, cy: 250, tx: 64, ty: 192, anchor: "middle", cross: true },
  { label: "Accra", sub: "Ghana", x: 44, y: 116, cx: 70, cy: 196, tx: 54, ty: 110, anchor: "start", cross: true },
  { label: "Abuja", x: 286, y: 90, cx: 220, cy: 150, tx: 276, ty: 86, anchor: "end" },
  { label: "Enugu", x: 338, y: 156, cx: 252, cy: 196, tx: 328, ty: 152, anchor: "end" },
  { label: "Benin City", x: 228, y: 214, cx: 192, cy: 252, tx: 228, ty: 234, anchor: "middle" },
  { label: "Port Harcourt", x: 300, y: 300, cx: 240, cy: 300, tx: 290, ty: 304, anchor: "end" },
];

function RouteMap() {
  return (
    <svg
      viewBox="0 0 380 360"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Routes from Lagos to other Nigerian states and across the border to Cotonou"
    >
      <defs>
        <pattern id="ag-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="#ffffff" opacity="0.07" />
        </pattern>
        <radialGradient id="ag-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0673FF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0673FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="380" height="360" fill="url(#ag-dots)" />

      {DESTINATIONS.map((d) => (
        <path
          key={`route-${d.label}`}
          d={`M ${LAGOS.x} ${LAGOS.y} Q ${d.cx} ${d.cy} ${d.x} ${d.y}`}
          fill="none"
          stroke={d.cross ? "#0673FF" : "#5AA2FF"}
          strokeWidth="1.5"
          strokeDasharray="4 5"
          strokeLinecap="round"
          opacity={d.cross ? 0.8 : 0.5}
        />
      ))}

      {DESTINATIONS.map((d) => (
        <g key={`pin-${d.label}`}>
          <circle cx={d.x} cy={d.y} r="4" fill={d.cross ? "#0673FF" : "#5AA2FF"} />
          <circle cx={d.x} cy={d.y} r="8" fill="none" stroke={d.cross ? "#0673FF" : "#5AA2FF"} strokeWidth="1" opacity="0.4" />
          <text
            x={d.tx}
            y={d.ty}
            textAnchor={d.anchor}
            fontSize="11"
            fontWeight="600"
            fill="#e5edff"
          >
            {d.label}
          </text>
          {d.sub && (
            <text x={d.tx} y={d.ty + 12} textAnchor={d.anchor} fontSize="9" fill="#5AA2FF">
              {d.sub}
            </text>
          )}
        </g>
      ))}

      {/* Cars travelling out from Lagos along each route, looping */}
      {DESTINATIONS.map((d, i) => (
        <g key={`car-${d.label}`}>
          <animateMotion
            dur="4s"
            begin={`${i * 0.6}s`}
            repeatCount="indefinite"
            path={`M ${LAGOS.x} ${LAGOS.y} Q ${d.cx} ${d.cy} ${d.x} ${d.y}`}
          />
          <circle r="5" fill={d.cross ? "#0673FF" : "#5AA2FF"} opacity="0.35" />
          <circle r="2.5" fill="#ffffff" />
        </g>
      ))}

      {/* Lagos hub */}
      <circle cx={LAGOS.x} cy={LAGOS.y} r="40" fill="url(#ag-glow)" />
      <circle cx={LAGOS.x} cy={LAGOS.y} r="13" fill="#0673FF" opacity="0.25">
        <animate attributeName="r" values="13;22;13" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={LAGOS.x} cy={LAGOS.y} r="7" fill="#0673FF" stroke="#ffffff" strokeWidth="2" />
      <text x={LAGOS.x} y={LAGOS.y + 26} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
        Lagos
      </text>
    </svg>
  );
}

export default function InterstateTravel() {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="w-full bg-white px-4 py-16 lg:px-8 lg:py-20">
      <div className="relative mx-auto flex max-w-7xl flex-col overflow-hidden rounded-3xl bg-[#101928] shadow-2xl lg:min-h-[420px] lg:flex-row">
        {/* Left: content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-7 py-12 lg:max-w-[52%] lg:px-14 lg:py-16">
          <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0673FF]/40 bg-[#0673FF]/15 px-3 py-1 text-xs font-semibold text-[#5AA2FF]">
            <FiMapPin className="h-3.5 w-3.5" />
            Interstate and cross-border
          </span>

          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white lg:text-4xl">
            Travel beyond Lagos, to{" "}
            <span className="text-[#5AA2FF]">other states</span> and{" "}
            <span className="text-[#5AA2FF]">Cotonou</span>
          </h2>

          <p className="mb-7 max-w-lg text-base leading-relaxed text-gray-300 lg:text-lg">
            Book a chauffeured car from Lagos to other states, or across the
            border to Cotonou. Comfortable and direct, on your schedule.
          </p>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#0673FF] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0673FF]/30 transition-all duration-200 hover:bg-[#0560d6] active:scale-95"
          >
            Choose destination
            <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        {/* Right: route map */}
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#101928] via-[#101928]/50 to-transparent" />
          <div className="absolute inset-0 p-6">
            <RouteMap />
          </div>
        </div>
      </div>

      <StatePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Where are you traveling?"
        subtitle="Pick a destination to see available private cars and SUVs"
      />
    </section>
  );
}
