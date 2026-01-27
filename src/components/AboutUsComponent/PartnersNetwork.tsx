"use client";
import React, { useState } from "react";

const PartnersNetwork = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const partners = [
    {
      name: "BYD",
      url: "/images/image17.png",
      alt: "BYD Logo",
    },
    {
      name: "Geely",
      url: "/images/image18.png",
      alt: "Geely Logo",
    },
    {
      name: "Afrinance",
      url: "/images/image19.png",
      alt: "Afrinance Logo",
    },
    {
      name: "The Tony Elumelu Foundation",
      url: "/images/image20.png",
      alt: "The Tony Elumelu Foundation Logo",
    },
    {
      name: "GIZ",
      url: "/images/image21.png",
      alt: "GIZ Logo",
    },
    {
      name: "Seedstars",
      url: "/images/image22.png",
      alt: "Seedstars Logo",
    },
    {
      name: "Edete",
      url: "/images/image23.png",
      alt: "Edete Logo",
    },
    {
      name: "Wakanow",
      url: "/images/image24.png",
      alt: "Wakanow Logo",
    },
    {
      name: "Paystack",
      url: "/images/image25.png",
      alt: "Paystack Logo",
    },
    {
      name: "Afropolitan",
      url: "/images/image26.png",
      alt: "Afropolitan Logo",
    },
    {
      name: "Glovo",
      url: "/images/image27.png",
      alt: "Glovo Logo",
    },
    {
      name: "Oando",
      url: "/images/image28.png",
      alt: "Oando Logo",
    },
  ];

  return (
    <div className="bg-white py-8 md:py-20">
      <div className="max-w-8xl mx-auto px-3">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-500 text-[20px] font-medium mb-3 tracking-wide">
            Our Network
          </p>
          <h2 className="text-[#2c3e50] text-[28px] md:text-[36px] font-bold mb-4">
            Trusted by Leading Brands
          </h2>
          <p className="text-gray-600 text-[15px]">
            Partners, clients, and investors powering our growth.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-center h-16"
            >
              <img
                src={partner.url}
                alt={partner.alt}
                className="max-w-full max-h-12 object-contain  transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="md:hidden relative">
          <div className="overflow-x-auto overflow-y-visible scrollbar-hide no-scrollbar hide-scrollbar">
            <div
              className="flex gap-6 transition-transform duration-300 ease-in-out px-2"
              style={{ transform: `translateX(-${currentSlide * 180}px)` }}
            >
              {partners.map((partner, index) => (
                <div key={index} className="w-[160px] flex-shrink-0">
                  <div className="bg-white rounded-lg p-6 text-center h-20 flex items-center justify-center ">
                    <img
                      src={partner.url}
                      alt={partner.alt}
                      className="max-w-full max-h-10 object-contain "
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-6">
            {partners.map((_, index) => (
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

export default PartnersNetwork;
