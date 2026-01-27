"use client";
import React from "react";
import { TbQuote } from "react-icons/tb";

const OurStory = () => {
  return (
    <div className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-blue-500 text-[20px] font-medium mb-3 tracking-wide">
            Our Story
          </p>
          <h2 className="text-[#2c3e50] text-[28px] md:text-[36px] font-bold mb-8">
            From Lagos to <span className="text-blue-500">the Continent</span>
          </h2>
        </div>

        {/* Story Content */}
        <div className="space-y-6 text-center mb-10">
          <p className="text-[#2c3e50] text-[15px] md:text-[16px] leading-relaxed">
            Muvment began as Autogirl in Lagos with a simple observation:
            Africa's urban mobility was broken. Vehicles sat idle for 16+ hours
            daily, fleet owners had no technology to optimize operations, and
            riders had no reliable premium options.
          </p>

          <p className="text-[#2c3e50] text-[15px] md:text-[16px] leading-relaxed">
            We built a platform that changes that. Today, we operate across 6
            cities in Nigeria and Ghana with a team of over 70 staff,
            partnerships with Uber and Bolt, a growing EV fleet, and an
            AI-powered control center managing hundreds of bookings daily.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm max-w-2xl mx-auto relative">
          {/* Quote Icon - Top Left */}
          <div className="absolute top-6 left-6 text-blue-500 text-3xl font-serif leading-none">
            <TbQuote />
          </div>

          <div className="flex flex-col items-center text-center pt-8">
            {/* Quote Text */}
            <p className="text-[#2c3e50] text-[15px] md:text-[16px] leading-relaxed italic mb-6">
              We started with one car and a belief that Africans deserve
              world-class mobility. Every vehicle we add, every city we enter,
              proves that belief right.
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                <img src="/images/image9.png" alt="Founder" />
              </div>
              <div className="text-left">
                <p className="text-[#2c3e50] text-[14px] font-bold">
                  Gbemisola Ajiwe
                </p>
                <p className="text-gray-500 text-[12px]">CEO & Co-Founder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;
