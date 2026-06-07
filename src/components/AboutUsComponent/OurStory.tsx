"use client";
import React from "react";
import { ImQuotesLeft } from "react-icons/im";
import Reveal from "../general/Reveal";

const OurStory = () => {
  return (
    <div className="bg-[#F5F8FD] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Narrative */}
          <Reveal>
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              Our story
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] mb-7">
              From Lagos to the continent
            </h2>
            <div className="space-y-5">
              <p className="text-gray-600 text-[16px] leading-relaxed">
                Muvment began as Autogirl in Lagos with a simple observation:
                Africa's urban mobility was broken. Vehicles sat idle for 16+
                hours daily, fleet owners had no technology to optimize
                operations, and riders had no reliable premium options.
              </p>
              <p className="text-gray-600 text-[16px] leading-relaxed">
                We built a platform that changes that. Today we operate across 6
                cities in Nigeria and Ghana with a team of over 70 staff,
                partnerships with Uber and Bolt, a growing EV fleet, and an
                AI-powered control center managing hundreds of bookings daily.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-gray-200/80">
              <div>
                <p className="text-[#0673FF] text-[34px] font-bold leading-none">
                  6
                </p>
                <p className="text-gray-500 text-[13px] mt-2">Cities live</p>
              </div>
              <div>
                <p className="text-[#0673FF] text-[34px] font-bold leading-none">
                  70+
                </p>
                <p className="text-gray-500 text-[13px] mt-2">Team members</p>
              </div>
              <div>
                <p className="text-[#0673FF] text-[34px] font-bold leading-none">
                  2
                </p>
                <p className="text-gray-500 text-[13px] mt-2">Countries</p>
              </div>
            </div>
          </Reveal>

          {/* Founder quote card */}
          <Reveal delay={120} className="relative">
            <div className="relative rounded-3xl bg-white border border-gray-200/80 shadow-sm p-9 md:p-11">
              <ImQuotesLeft
                className="w-10 h-10 text-[#0673FF]/25 mb-6"
                aria-hidden="true"
              />
              <p className="text-gray-900 text-[20px] md:text-[24px] leading-[1.5] italic mb-8">
                We started with one car and a belief that Africans deserve
                world-class mobility. Every vehicle we add, every city we enter,
                proves that belief right.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src="/images/image9.png"
                    alt="Chinazom Arinze, CEO and Co-Founder of Muvment by Autogirl"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-gray-900 text-[15px] font-bold leading-tight">
                    Chinazom Arinze
                  </p>
                  <p className="text-gray-500 text-[13px]">CEO & Co-Founder</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default OurStory;
