"use client";
import React from "react";
import { FiSearch, FiCreditCard } from "react-icons/fi";
import { IoCarSportOutline } from "react-icons/io5";

const STEPS = [
  {
    icon: <FiSearch className="h-6 w-6" />,
    title: "Search",
    body: "Enter your location, dates, and booking type to see the cars available near you.",
  },
  {
    icon: <IoCarSportOutline className="h-6 w-6" />,
    title: "Choose your car",
    body: "Compare vehicles, prices, and options, then pick the one that fits your trip.",
  },
  {
    icon: <FiCreditCard className="h-6 w-6" />,
    title: "Book and pay",
    body: "Confirm your details and pay securely. Your car and driver are assigned right away.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-white px-4 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0673FF]">
            How it works
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-[-0.01em] text-[#0d1320] lg:text-4xl">
            Book a car in just three simple steps
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0673FF]/10 text-[#0673FF]">
                {step.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0673FF]">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#0d1320]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
