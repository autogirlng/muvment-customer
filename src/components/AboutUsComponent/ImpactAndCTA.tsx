"use client";
import React from "react";

import { IoCarSportOutline, IoArrowForward } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { FaBrain, FaLeaf } from "react-icons/fa";
import { BiBriefcase } from "react-icons/bi";
import { useRouter } from "next/navigation";

const ImpactAndCTA = ({
  bookingTypeID,
}: {
  bookingTypeID: string | undefined;
}) => {
  const route = useRouter();
  const impacts = [
    {
      icon: <FaBrain className="w-6 h-6" />,
      title: "Environmental",
      description:
        "Our EV fleet is replacing fuel vehicles with low-emission alternatives.",
    },
    {
      icon: <FaLeaf className="w-6 h-6" />,
      title: "Women Empowerment",
      description:
        "The AWE program has impacted 100+ women in the mobility sector.",
    },
    {
      icon: <BiBriefcase className="w-6 h-6" />,
      title: "Job Creation",
      description:
        "Over 70 staff and hundreds of driver partners across every city we enter.",
    },
  ];

  return (
    <>
      {/* Impact Section */}
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-blue-500 text-[13px] font-medium mb-3 tracking-wide">
              Our Impact
            </p>
            <h2 className="text-[#2c3e50] text-[28px] md:text-[36px] font-bold">
              Driving Change Beyond Mobility
            </h2>
          </div>

          {/* Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impacts.map((impact, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                  {impact.icon}
                </div>
                <h3 className="text-[#2c3e50] text-[18px] font-bold mb-3">
                  {impact.title}
                </h3>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {impact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1D2739] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Heading */}
          <h2 className="text-white text-[32px] md:text-[42px] font-bold mb-6">
            Join the Muvment
          </h2>

          {/* Description */}
          <p className="text-white/90 text-[15px] md:text-[16px] leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you are a rider, a fleet owner, a corporate partner, or a
            potential team member, there is a place for you in Africa's mobility
            future.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => route.push("/contact-us")}
              className="bg-white text-[#2c3e50] px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <IoCarSportOutline className="w-5 h-5" />
              Partner with Us
            </button>

            <button
              onClick={() =>
                route.push(`/booking/search?bookingType=${bookingTypeID}`)
              }
              className="bg-blue-500 text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Book a Ride
              <IoArrowForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => route.push("/contact-us")}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <HiOutlineMail className="w-5 h-5" />
              Join Our Team
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImpactAndCTA;
