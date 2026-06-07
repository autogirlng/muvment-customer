"use client";
import React from "react";
import Reveal from "../general/Reveal";

const PartnersNetwork = () => {
  const partners = [
    { name: "BYD", url: "/images/image17.png", alt: "BYD logo" },
    { name: "Geely", url: "/images/image18.png", alt: "Geely logo" },
    { name: "Afrinance", url: "/images/image19.png", alt: "Afrinance logo" },
    {
      name: "The Tony Elumelu Foundation",
      url: "/images/image20.png",
      alt: "The Tony Elumelu Foundation logo",
    },
    { name: "GIZ", url: "/images/image21.png", alt: "GIZ logo" },
    { name: "Seedstars", url: "/images/image22.png", alt: "Seedstars logo" },
    { name: "Edete", url: "/images/image23.png", alt: "Edete logo" },
    { name: "Wakanow", url: "/images/image24.png", alt: "Wakanow logo" },
    { name: "Paystack", url: "/images/image25.png", alt: "Paystack logo" },
    { name: "Afropolitan", url: "/images/image26.png", alt: "Afropolitan logo" },
    { name: "Glovo", url: "/images/image27.png", alt: "Glovo logo" },
    { name: "Oando", url: "/images/image28.png", alt: "Oando logo" },
  ];

  return (
    <div className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            Our network
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] mb-5">
            Trusted by leading brands
          </h2>
          <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
            Partners, clients, and investors powering our growth.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((partner, index) => (
            <Reveal
              key={index}
              delay={(index % 6) * 60}
              className="flex items-center justify-center rounded-xl border border-gray-200/70 bg-white h-24 px-4 transition-all hover:shadow-sm hover:border-gray-300/80"
            >
              <img
                src={partner.url}
                alt={partner.alt}
                className="max-w-full max-h-11 object-contain"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersNetwork;
