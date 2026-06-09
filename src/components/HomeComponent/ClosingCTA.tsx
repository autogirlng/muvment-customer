"use client";
import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function ClosingCTA() {
  return (
    <section className="bg-white px-4 py-16 lg:px-8 lg:py-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#101928] px-8 py-14 text-center md:px-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0673FF]/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Ready to ride?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-300 md:text-lg">
            Find a car with a professional driver in minutes.
          </p>
          <Link
            href="/booking/search"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#0673FF] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0673FF]/30 transition-colors hover:bg-[#0560d6]"
          >
            Find your car
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
