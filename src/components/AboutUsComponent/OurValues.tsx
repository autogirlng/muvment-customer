"use client";
import React from "react";
import { FiAward, FiHeart } from "react-icons/fi";
import { LuHandshake, LuLeaf } from "react-icons/lu";
import { GiBrain } from "react-icons/gi";
import { BsPiggyBank } from "react-icons/bs";

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
      icon: <BsPiggyBank className="w-6 h-6" />,
      title: "Relentless Execution",
      description:
        "We turn vision into results. Profitability every year since launch.",
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: "Empowerment",
      description:
        "Our Auto Women Empowerment program creates opportunities wherever we operate.",
    },
  ];

  return (
    <div className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-500 text-[13px] font-medium mb-3 tracking-wide">
            Our Values
          </p>
          <h2 className="text-[#2c3e50] text-[28px] md:text-[32px] font-bold">
            What Drives Us Forward
          </h2>
        </div>

        {/* Responsive Grid with Flex Wrap */}
        <div className="flex flex-wrap gap-6 justify-center">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                {value.icon}
              </div>
              <h3 className="text-[#2c3e50] text-[18px] font-bold mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurValues;
