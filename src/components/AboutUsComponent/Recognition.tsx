"use client";
import React from "react";
import Reveal from "../general/Reveal";

const Recognition = () => {
  const recognitions = [
    {
      name: "The Tony Elumelu Foundation",
      logo: "/images/image23.png",
      alt: "The Tony Elumelu Foundation logo",
    },
    { name: "GetGrant", logo: "/images/image29.png", alt: "GetGrant logo" },
    { name: "Seedstars", logo: "/images/image19.png", alt: "Seedstars logo" },
  ];

  return (
    <div className="bg-white py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            Recognition
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
            Backed by the best
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recognitions.map((recognition, index) => (
            <Reveal
              key={index}
              delay={index * 90}
              className="flex items-center justify-center rounded-2xl border border-gray-200/80 bg-[#F5F8FD] h-32 px-8 transition-all hover:shadow-sm hover:bg-white"
            >
              <img
                src={recognition.logo}
                alt={recognition.alt}
                className="max-w-full max-h-16 object-contain"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recognition;
