"use client";
import React, { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote: "Service Has been Great So far",
      name: "KAYODE OMODEBI",
      title: "CEO, SeedsCrunch Capital",
      image: "/images/image30.png",
    },
    {
      quote:
        "Service Has been amazing so far! Mr Shola (The Driver) is doing a good Job.",
      name: "TOLA SPENCE",
      title: "Office Manager, Glovo Nigeria",
      image: "/images/image32.png",
    },
    {
      quote:
        "My driver has been super helpful since I moved into Nigeria with my wife. I am able to enjoy comfortable and safe transportation without buying a vehicle",
      name: "SARFARAZ ABID",
      title: "IFC - World Bank",
      image: "/images/image31.png",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  // Auto-advance every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 30000); // 30 seconds (change to 60000 for 1 minute)

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Testimonial Content */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all z-10"
            aria-label="Previous testimonial"
          >
            <IoChevronBack className="w-6 h-6 text-[#2c3e50]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all z-10"
            aria-label="Next testimonial"
          >
            <IoChevronForward className="w-6 h-6 text-[#2c3e50]" />
          </button>

          {/* Testimonial Card */}
          <div className="text-center px-4 md:px-16">
            {/* Quote */}
            <p className="text-[#2c3e50] text-[16px] md:text-[18px] leading-relaxed mb-8 font-medium">
              "{testimonials[currentSlide].quote}"
            </p>

            {/* Author Image */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={testimonials[currentSlide].image}
                  alt={testimonials[currentSlide].name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xl font-bold">${testimonials[
                        currentSlide
                      ].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}</div>`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Author Info */}
            <h3 className="text-[#2c3e50] text-[14px] font-bold mb-1 tracking-wide">
              {testimonials[currentSlide].name}
            </h3>
            <p className="text-gray-600 text-[13px]">
              {testimonials[currentSlide].title}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentSlide === index ? "bg-[#2c3e50]" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
