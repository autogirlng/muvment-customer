import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  FaFolder,
  FaLeaf,
  FaToolbox,
  FaTools,
  FaArrowRight,
} from "react-icons/fa";
import { GiEnergyBreath } from "react-icons/gi";

export default function RideSection() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8 py-4 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl shadow-lg mb-6">
            <FaLeaf className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Need a Ride for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              as Little as 1 Hour?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the freedom of electric car rentals—from quick hourly
            trips to full-day adventures with premium chauffeur service.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-green-100 rounded-full -translate-y-32 translate-x-32 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-50 to-amber-100 rounded-full translate-y-24 -translate-x-24 opacity-60"></div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
            {/* Left Content */}
            <div className="flex-1 w-full">
              {/* Image Stack */}
              <div className="relative mb-12">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    {/* Base Image */}
                    <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl z-30 bg-gradient-to-br from-orange-200 to-amber-200 transform -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                      <Image
                        src="/images/landing/10.png"
                        alt="Premium Electric Car"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 192px, 224px"
                      />
                    </div>

                    {/* Middle Image */}
                    <div className="absolute w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl z-20 bg-gradient-to-br from-orange-300 to-amber-300 transform -rotate-3 top-4 left-12 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                      <Image
                        src="/images/landing/9.png"
                        alt="Luxury EV Interior"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 192px, 224px"
                      />
                    </div>

                    {/* Top Image */}
                    <div className="absolute w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl z-10 bg-gradient-to-br from-orange-400 to-amber-400 transform rotate-2 top-8 left-24 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                      <Image
                        src="/images/landing/8.png"
                        alt="Fast Charging"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 192px, 224px"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-10 text-lg leading-relaxed text-center lg:text-left max-w-2xl">
                Whether you're commuting to work, heading to the airport,
                attending important meetings, or simply exploring the city, our
                premium chauffeur-driven electric vehicles deliver an
                unforgettable experience.
              </p>

              {/* CTA Button */}
              <div className="flex justify-center lg:justify-start">
                <Link
                  href="/explore/categories?type=SUVElectric"
                  className="group bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold py-4 px-8 rounded-2xl hover:from-emerald-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
                >
                  Explore Electric Cars
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Right Content - Features */}
            <div className="flex-1 w-full max-w-md">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                  Why Choose Electric?
                </h3>

                {[
                  { icon: FaFolder, text: "No fuel stops required" },
                  { icon: GiEnergyBreath, text: "Whisper-quiet premium ride" },
                  { icon: FaTools, text: "Fully charged and maintained" },
                  { icon: FaToolbox, text: "Perfect for short urban trips" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 hover:transform hover:-translate-y-1"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium group-hover:text-gray-900 transition-colors duration-300">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[
            { value: "1hr", label: "Minimum Rental" },
            { value: "24/7", label: "Available" },
            { value: "100%", label: "Electric Fleet" },
            { value: "5★", label: "Rated Service" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
