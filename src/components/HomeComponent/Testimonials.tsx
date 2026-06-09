"use client";
import React from "react";
import { FaStar } from "react-icons/fa";

type Review = { name: string; text: string };

const ROW_ONE: Review[] = [
  { name: "Tomisin", text: "Wonderful drivers, wonderful customer service, and a really lovely car. A great experience all round." },
  { name: "Dotun", text: "Lagos can be madness, but booking with Muvment was refreshing. Smooth from start to finish." },
  { name: "Olaoluwa", text: "A smooth ride and a comfortable SUV. I already can't wait for my next trip." },
  { name: "Omole", text: "The driver was professional, punctual, and courteous throughout the trip." },
  { name: "Precious", text: "Seamless experience, friendly staff, a clean vehicle, and flexible options. Five stars." },
  { name: "Boluwatife", text: "Very smooth and seamless, and fast support when I had an issue. A real pleasure." },
  { name: "Kennedy", text: "A wonderful experience. The customer service is top notch. I would recommend everyone." },
  { name: "Gloria", text: "A lovely ride. I enjoyed the drive and the driver was super friendly." },
];

const ROW_TWO: Review[] = [
  { name: "Osinachi", text: "Used it for a three-day mainland to island trip. The driver was a real pro." },
  { name: "Oluwaferanmi", text: "The most professional rental service I have used in Nigeria. Timely and consistent over three days." },
  { name: "Michael", text: "Reliable and customer-focused. They really stand out from the rest." },
  { name: "Praise", text: "The best rental experience I have had in a while. Zero hassles. Would recommend." },
  { name: "Kome", text: "Great service, and the overall experience was top notch." },
  { name: "Adeneye", text: "The ride was smooth and easy. I would happily recommend them." },
  { name: "Daniel", text: "Top notch car rental service from booking to drop-off." },
  { name: "Ekenechukwu", text: "I love the service. I would choose them over and over again." },
];

function Card({ r }: { r: Review }) {
  return (
    <div className="w-[280px] flex-shrink-0 rounded-2xl border border-gray-200 bg-white p-5 sm:w-[320px]">
      <div className="mb-3 flex gap-0.5 text-[#FBB034]">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} className="h-3.5 w-3.5" />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{r.text}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0673FF]/10 text-sm font-bold text-[#0673FF]">
          {r.name.charAt(0)}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-[#0d1320]">{r.name}</p>
          <p className="text-xs text-gray-400">Google review</p>
        </div>
      </div>
    </div>
  );
}

function Row({ items, reverse }: { items: Review[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="ag-row overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="ag-track flex w-max gap-4 py-1"
        style={{
          animation: `${reverse ? "ag-marqueeR" : "ag-marqueeL"} 60s linear infinite`,
        }}
      >
        {doubled.map((r, i) => (
          <Card key={`${r.name}-${i}`} r={r} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="overflow-hidden bg-white py-16 lg:py-20">
      <style>{`
        @keyframes ag-marqueeL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ag-marqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .ag-row:hover .ag-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .ag-track { animation: none !important; } }
      `}</style>

      <div className="mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-2 flex flex-col items-center gap-1.5 lg:flex-row lg:justify-center">
          <div className="flex gap-1 text-[#FBB034]">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar key={i} className="h-4 w-4" />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#0d1320] lg:ml-1">
            4.6 from 80+ Google reviews
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#0d1320] sm:text-4xl">
          Riders keep coming back
        </h2>
      </div>

      <div className="space-y-4">
        <Row items={ROW_ONE} />
        <Row items={ROW_TWO} reverse />
      </div>
    </section>
  );
}
