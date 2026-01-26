"use client";
import React from "react";

const Recognition = () => {
  const recognitions = [
    {
      name: "The Tony Elumelu Foundation",
      logo: "/images/image23.png",
      alt: "The Tony Elumelu Foundation Logo",
    },
    {
      name: "GetGrant",
      logo: "/images/image29.png",
      alt: "GetGrant Logo",
    },
    {
      name: "Seedstars",
      logo: "/images/image19.png",
      alt: "Seedstars Logo",
    },
  ];

  return (
    <div className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-500 text-[13px] font-medium mb-3 tracking-wide">
            Recognition
          </p>
          <h2 className="text-[#2c3e50] text-[28px] md:text-[36px] font-bold">
            Backed by the Best
          </h2>
        </div>

        {/* Recognition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recognitions.map((recognition, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-32"
            >
              <img
                src={recognition.logo}
                alt={recognition.alt}
                className="max-w-full max-h-16 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recognition;
