import React from "react";

function cn(...inputs: any[]): string {
  const res: string[] = [];
  const handle = (v: any) => {
    if (!v && v !== 0) return;
    const t = typeof v;
    if (t === "string" || t === "number") {
      res.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(handle);
    } else if (t === "object") {
      for (const k in v) {
        if (Object.prototype.hasOwnProperty.call(v, k) && v[k]) {
          res.push(k);
        }
      }
    }
  };
  inputs.forEach(handle);
  return res.join(" ");
}

import {
  FaCar,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import Button from "./Button";

type Props = {
  title: string;
  className?: string;
  steps: HowItWorksProps[];
};

type HowItWorksProps = {
  title: string;
  description: string;
  button?: string;
};

function HowItWorks({ title, steps, className }: Props) {
  const icons = [FaCar, FaCalendarCheck, FaMapMarkerAlt];

  return (
    <section
      id="how-it-works"
      className={cn(
        "py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-8">
            <FaCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Vertical Connection Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 hidden lg:block"></div>

          {/* Steps Container */}
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => {
              const IconComponent = icons[index] || FaCheckCircle;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col lg:flex-row items-center gap-8 lg:gap-12",
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  )}
                >
                  {/* Content Card */}
                  <div
                    className={cn(
                      "flex-1 w-full",
                      isEven ? "lg:pr-12" : "lg:pl-12"
                    )}
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:transform hover:-translate-y-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1 block">
                            Step {index + 1}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {step.button && (
                        <div className="mt-6">
                          <Button
                            variant="filled"
                            color="primary"
                            className="group/btn"
                          >
                            {step.button}
                            <FaArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Number Indicator */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-xl font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Join thousands of satisfied customers who trust us for their
              transportation needs
            </p>
            <Button variant="filled" color="primary" size="large">
              Get Started Today
              <FaArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
