"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import StatePickerModal from "@/components/Booking/StatePickerModal";

export default function BeninRepublicTravel() {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="w-full my-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative bg-gray-950 min-h-[420px] flex flex-col md:flex-row">
        {/* Left — content */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-12 md:py-16 md:px-14 flex-1 md:max-w-[55%]">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-5 w-fit">
            <FiMapPin className="w-3.5 h-3.5" />
            International Travel
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Travel To{" "}
            <span className="text-blue-400">Benin Republic</span>{" "}
            With A Private Car Or SUV
          </h2>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            Skip the stress of public transport. Ride in comfort and privacy
            with a dedicated chauffeur — straight from your door to Cotonou
            and beyond.
          </p>

          {/* Highlights */}
          {/* <ul className="space-y-3 mb-10">
            {highlights.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-gray-200 text-sm">{item.text}</span>
              </li>
            ))}
          </ul> */}

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-700/40 transition-all duration-200 w-fit text-sm"
          >
            Choose Destination
            <span className="transition-transform duration-200 group-hover:translate-x-1 text-base">
              →
            </span>
          </button>

        </div>

        {/* Right — image */}
        <div className="relative flex-1 min-h-[280px] md:min-h-0">
          {/* Dark gradient blending into the left panel on md+ */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent z-10 hidden md:block" />
          {/* Bottom fade on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10 md:hidden" />
          <Image
            src="/images/vehicles/suv.png"
            alt="Luxury SUV for Benin Republic travel"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      </div>

      <StatePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Where are you traveling?"
        subtitle="Pick a state to see available private cars and SUVs"
      />
    </section>
  );
}
