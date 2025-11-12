"use client";
import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 my-12 ">
      <div className="max-w-3xl w-full">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            How it works
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
            Monthly getaway or long-term rental? Get the best rates on premium
            vehicles with our exclusive deals.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative flex flex-col justify-center">
          {/* Vertical Line (desktop only) */}
          <div className="hidden lg:block absolute left-1/2 top-23 bottom-23 transform -translate-x-1/2 w-1 bg-gray-300"></div>

          {/* Step 1 */}
          <div className="relative mb-10 sm:mb-14 lg:mb-28">
            <div className="flex flex-col lg:flex-row items-center lg:justify-end lg:pr-8">
              <div className="hidden lg:block w-5/12"></div>

              {/* Dot (desktop only) */}
              <div className="hidden lg:block absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 w-8 h-8 bg-gray-400 rounded-full border-4 border-white z-10"></div>

              {/* Card */}
              <div className="w-full lg:w-5/12 lg:pl-8 bg-gray-100 shadow-sm p-5 sm:p-6 rounded-2xl text-center lg:text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Step 1
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Sign Up
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our simple sign-up process gets you started in no time. Create
                  your account and join other hosts to start a business for
                  free.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-10 sm:mb-14 lg:mb-28">
            <div className="flex flex-col lg:flex-row items-center lg:justify-start lg:pl-8">
              {/* Card */}
              <div className="w-full lg:w-5/12 lg:pr-8 bg-gray-100 shadow-sm p-5 sm:p-6 rounded-2xl text-center lg:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Step 2
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  List Your Vehicle
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Adding your vehicle to the platform is straightforward.
                  Provide all vehicle and driver details, set your availability
                  schedule, and get your car ready for rental.
                </p>
              </div>

              {/* Dot (desktop only) */}
              <div className="hidden lg:block absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 w-8 h-8 bg-gray-400 rounded-full border-4 border-white z-10"></div>

              <div className="hidden lg:block w-5/12"></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center lg:justify-end lg:pr-8">
              <div className="hidden lg:block w-5/12"></div>

              {/* Dot (desktop only) */}
              <div className="hidden lg:block absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 w-8 h-8 bg-gray-400 rounded-full border-4 border-white z-10"></div>

              {/* Card */}
              <div className="w-full lg:w-5/12 lg:pl-8 bg-gray-100 shadow-sm p-5 sm:p-6 rounded-2xl text-center lg:text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Step 3
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Start Earning
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Get paid promptly and securely. Track your earnings and
                  withdraw your funds with ease, directly from your personal
                  wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
