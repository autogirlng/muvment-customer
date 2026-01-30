"use client";
import React, { useState } from "react";

const MuvmentHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const stats = [
    { number: "6", label: "CITIES ACTIVE" },
    { number: "2", label: "COUNTRIES" },
    { number: "800+", label: "VEHICLES IN FLEET" },
    { number: "50K+", label: "RIDES SINCE 2021" },
  ];

  return (
    <div className="min-h-screen bg-[#1D2739] flex items-center justify-center px-6 py-16">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="h-[10vh] md:h-0"></div>
        <div className="text-center mb-12">
          <div className="inline-block mb-8">
            <span className="bg-white text-[#2c3e50] text-[11px] font-medium px-5 py-2 rounded-full">
              by Autogirl
            </span>
            ""
          </div>

          <h1 className="text-white text-[32px] md:text-[38px] font-bold mb-5 leading-tight">
            Powering Africa's Mobility Future
          </h1>

          <p className="text-white/90 text-[13px] md:text-[14px] max-w-2xl mx-auto leading-relaxed px-4">
            We are building the continent's first integrated, sustainable
            mobility ecosystem. From premium vehicle rentals to EV ride-hailing,
            Muvment is transforming how Africa moves.
          </p>
        </div>

        {/* Desktop Stats Grid - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] p-6 text-center"
            >
              <div className="text-[#2c3e50] text-[42px] font-bold mb-2 leading-none">
                {stat.number}
              </div>
              <div className="text-[#2c3e50] text-[10px] font-semibold tracking-wider mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Slider - Visible only on mobile */}
        <div className="md:hidden relative">
          <div className="overflow-x-auto overflow-y-visible scrollbar-hide">
            <div
              className="flex gap-4 transition-transform duration-300 ease-in-out px-2"
              style={{ transform: `translateX(-${currentSlide * 280}px)` }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="w-[260px] flex-shrink-0">
                  <div className="bg-white rounded-[20px] p-8 text-center h-full">
                    <div className="text-[#2c3e50] text-[42px] font-bold mb-2 leading-none">
                      {stat.number}
                    </div>
                    <div className="text-[#2c3e50] text-[10px] font-semibold tracking-wider mt-2">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-8">
            {stats.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuvmentHero;
