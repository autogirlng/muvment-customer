"use client";
import React from "react";
import { FiAward, FiHeart } from "react-icons/fi";
import { LuHandshake, LuLeaf } from "react-icons/lu";
import { GiBrain } from "react-icons/gi";
import { BsLightningCharge } from "react-icons/bs";
import Reveal from "../general/Reveal";

const OurValues = () => {
  const values = [
    {
      icon: <GiBrain className="w-6 h-6" />,
      title: "Innovation First",
      description:
        "We push boundaries with AI-powered fleet management and EV adoption.",
    },
    {
      icon: <LuLeaf className="w-6 h-6" />,
      title: "Sustainable Impact",
      description:
        "Our EV program is our commitment to cleaner African cities.",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Premium Always",
      description:
        "From vehicle condition to driver professionalism, quality is non-negotiable.",
    },
    {
      icon: <LuHandshake className="w-6 h-6" />,
      title: "Partnership Mindset",
      description:
        "Fleet owners, drivers, and clients are stakeholders in our shared vision.",
    },
    {
      icon: <BsLightningCharge className="w-6 h-6" />,
      title: "Relentless Execution",
      description:
        "We turn vision into results, with profitability every year since launch.",
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: "Empowerment",
      description:
        "Our Auto Women Empowerment program creates opportunities wherever we operate.",
    },
  ];

  return (
    <div className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            Our values
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
            What drives us forward
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <Reveal
              key={index}
              delay={(index % 3) * 80}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] bg-[#0673FF] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
                {value.icon}
              </div>
              <h3 className="text-gray-900 text-[18px] font-bold mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                {value.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurValues;
