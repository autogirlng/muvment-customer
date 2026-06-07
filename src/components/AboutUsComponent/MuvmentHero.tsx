"use client";
import React from "react";
import { FiChevronDown } from "react-icons/fi";

const MuvmentHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#101928] min-h-[82vh] md:min-h-[88vh] flex items-center justify-center px-6 pt-28 pb-24">
      {/* ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span className="hero-glow hero-glow-1" />
        <span className="hero-glow hero-glow-2" />
        <span className="hero-grid" />
      </div>

      <div className="relative max-w-3xl w-full text-center">
        <span className="about-rise inline-block mb-7 px-5 py-2 rounded-full border border-white/20 text-white/85 text-[12px] tracking-[0.16em] uppercase font-medium">
          Muvment by Autogirl
        </span>

        <h1 className="about-rise about-rise-1 text-white font-bold leading-[1.08] mb-7 text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4rem]">
          Powering Africa's{" "}
          <em className="not-italic text-[#5AA2FF]">mobility future</em>
        </h1>

        <p className="about-rise about-rise-2 text-white/65 text-[15px] md:text-[17px] font-light leading-[1.75] max-w-[580px] mx-auto">
          We are building the continent's first integrated, sustainable mobility
          ecosystem. From premium vehicle rentals to EV ride-hailing, Muvment is
          transforming how Africa moves.
        </p>

        <div className="about-rise about-rise-3 hidden md:flex justify-center mt-16">
          <FiChevronDown
            className="about-scroll-cue w-7 h-7 text-white/35"
            aria-hidden="true"
          />
        </div>
      </div>

      <style jsx>{`
        .about-scroll-cue {
          animation: aboutBounce 2.4s ease-in-out infinite;
        }
        @keyframes aboutBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }
        .about-rise {
          opacity: 0;
          transform: translateY(24px);
          animation: aboutRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .about-rise-1 {
          animation-delay: 0.12s;
        }
        .about-rise-2 {
          animation-delay: 0.24s;
        }
        .about-rise-3 {
          animation-delay: 0.4s;
        }
        @keyframes aboutRise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-scroll-cue {
            animation: none;
          }
          .about-rise {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default MuvmentHero;
