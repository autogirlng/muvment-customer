"use client";
import React from "react";
import Reveal from "../general/Reveal";

const FeaturedLogos = () => {
  const logos = [
    {
      name: "CNN",
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
      alt: "CNN logo",
    },
    { name: "TechCabal", url: "/images/image3.png", alt: "TechCabal logo" },
    { name: "Nairametrics", url: "/images/image5.png", alt: "Nairametrics logo" },
    { name: "Business Day", url: "/images/image4.png", alt: "Business Day logo" },
    { name: "Vanguard", url: "/images/image6.png", alt: "Vanguard logo" },
    { name: "The Guardian", url: "/images/image8.png", alt: "The Guardian logo" },
  ];

  return (
    <div className="bg-[#F5F8FD] border-y border-gray-200/70 py-12 md:py-14">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-9">
          <p className="text-gray-400 text-[12px] font-semibold tracking-[0.18em] uppercase">
            As featured in
          </p>
        </Reveal>

        <Reveal
          delay={80}
          className="grid grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-8 items-center"
        >
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center h-12">
              <img
                src={logo.url}
                alt={logo.alt}
                className="max-h-9 md:max-h-10 max-w-full object-contain"
              />
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
};

export default FeaturedLogos;
