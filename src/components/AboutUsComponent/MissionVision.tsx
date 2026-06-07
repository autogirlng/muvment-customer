"use client";
import React from "react";
import { BsEye } from "react-icons/bs";
import { FiTarget } from "react-icons/fi";
import Reveal from "../general/Reveal";

const MissionVision = () => {
  return (
    <div className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            Who we are
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
            Driven by purpose,{" "}
            <span className="text-[#0673FF]">powered by innovation</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission - light */}
          <Reveal className="rounded-3xl border border-gray-200/80 bg-white p-9 md:p-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0673FF] flex items-center justify-center mb-7">
              <FiTarget className="w-7 h-7" />
            </div>
            <h3 className="text-gray-900 text-[26px] font-bold mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 text-[16px] leading-relaxed">
              To make reliable, premium, and sustainable mobility accessible to
              every African.
            </p>
          </Reveal>

          {/* Vision - dark anchor tile */}
          <Reveal
            delay={100}
            className="relative overflow-hidden rounded-3xl bg-[#101928] p-9 md:p-10"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#0673FF] opacity-25 blur-[80px]"
            />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-7">
                <BsEye className="w-7 h-7" />
              </div>
              <h3 className="text-white text-[26px] font-bold mb-4">
                Our Vision
              </h3>
              <p className="text-white/75 text-[16px] leading-relaxed">
                To become Africa's leading sustainable mobility platform, setting
                the standard for how the continent moves.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default MissionVision;
