"use client";
import React from "react";
import { BsEye } from "react-icons/bs";
import { FiTarget } from "react-icons/fi";

const MissionVision = () => {
  const content = [
    {
      icon: <FiTarget className="w-7 h-7" />,
      title: "Our Mission",
      description:
        "To make reliable, premium, and sustainable mobility accessible to every African.",
      bgColor: "bg-white",
      textColor: "text-[#2c3e50]",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: <BsEye className="w-7 h-7" />,
      title: "Our Vision",
      description:
        "To become Africa's leading sustainable mobility platform, setting the standard for how the continent moves.",
      bgColor: "bg-[#2c3e50]",
      textColor: "text-white",
      iconBg: "bg-white/10",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-500 text-[20px] font-medium mb-3 tracking-wide">
            Who We Are
          </p>
          <h2 className="text-[#2c3e50] text-[20px] md:text-[32px] font-bold">
            Driven by Purpose,{" "}
            <span className="text-blue-500">Powered by Innovation</span>
          </h2>
        </div>

        {/* Responsive Grid with Flex Wrap */}
        <div className="flex flex-wrap gap-6 justify-center">
          {content.map((item, index) => (
            <div
              key={index}
              className={`${item.bgColor} rounded-3xl p-4 md:p-8 shadow-sm w-full md:w-[calc(50%-12px)] md:flex-1`}
            >
              <div
                className={`${item.iconBg} ${item.iconColor} w-14 h-14 rounded-full flex items-center justify-center mb-6`}
              >
                {item.icon}
              </div>
              <h3 className={`${item.textColor} text-[24px] font-bold mb-4`}>
                {item.title}
              </h3>
              <p
                className={`${item.textColor} ${item.bgColor === "bg-white" ? "text-gray-600" : "text-white/90"} text-[15px] leading-relaxed`}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionVision;
