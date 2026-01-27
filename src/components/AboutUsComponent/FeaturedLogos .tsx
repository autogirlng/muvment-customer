"use client";
import React, { useState } from "react";

const FeaturedLogos = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Array of logo URLs - easily updatable
  const logos = [
    {
      name: "CNN",
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
      alt: "CNN Logo",
    },
    {
      name: "TechCabal",
      url: "/images/image3.png",
      alt: "TechCabal Logo",
    },
    {
      name: "Nairametrics",
      url: "/images/image5.png",
      alt: "Nairametrics Logo",
    },
    {
      name: "Business Day",
      url: "/images/image4.png",
      alt: "Business Day Logo",
    },
    {
      name: "Vanguard",
      url: "/images/image6.png",
      alt: "Vanguard Logo",
    },
    {
      name: "The Guardian",
      url: "/images/image8.png",
      alt: "The Guardian Logo",
    },
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <h2 className="text-center text-[#2c3e50] text-[14px] font-medium mb-8 tracking-wide">
          As Featured In
        </h2>

        {/* Desktop Grid - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-6 gap-8 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-center h-16"
            >
              <img
                src={logo.url}
                alt={logo.alt}
                className="max-w-full max-h-12 object-contain  transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Mobile Slider - Visible only on mobile */}
        <div className="md:hidden relative">
          <div className="overflow-x-auto overflow-y-visible scrollbar-hide no-scrollbar hide-scrollbar">
            <div
              className="flex gap-6 transition-transform duration-300 ease-in-out px-6"
              style={{ transform: `translateX(-${currentSlide * 180}px)` }}
            >
              {logos.map((logo, index) => (
                <div key={index} className="w-[160px] flex-shrink-0">
                  <div className="bg-white rounded-lg p-6 text-center h-20 flex items-center justify-center ">
                    <img
                      src={logo.url}
                      alt={logo.alt}
                      className="max-w-full max-h-10 object-contain "
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-6">
            {logos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-6 bg-[#2c3e50]"
                    : "w-1.5 bg-gray-300"
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

export default FeaturedLogos;
