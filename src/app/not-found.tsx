"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaArrowRight } from "react-icons/fa";
import Footer from "@/components/HomeComponent/Footer";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen w-full flex items-center justify-center  px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full max-w-4xl">
          {/* Large 404 Text */}
          <div className="relative">
            <h1 className="text-[12rem] sm:text-[16rem] md:text-[20rem] lg:text-[24rem] font-bold text-gray-200 leading-none select-none">
              404
            </h1>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-4">
                Page not found
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md px-4">
                Oops! We can't seem to find the page you're looking for.
              </p>

              {/* Back to Home Button */}
              <button
                onClick={() => router.push("/")}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <FaHome className="text-base sm:text-lg" />
                <span className="text-sm sm:text-base">Back to home</span>
                <FaArrowRight className="text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 sm:mt-12">
            <p className="text-xs sm:text-sm text-gray-500 px-4">
              If you believe this is an error, please contact support or try
              again later.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
