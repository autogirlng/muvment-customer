"use client";
import React from "react";
import { ImQuotesLeft } from "react-icons/im";
import Reveal from "../general/Reveal";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Service has been great so far.",
      name: "Kayode Omodebi",
      title: "CEO, SeedsCrunch Capital",
      image: "/images/image30.png",
    },
    {
      quote:
        "Service has been amazing so far. Mr Shola, the driver, is doing a good job.",
      name: "Tola Spence",
      title: "Office Manager, Glovo Nigeria",
      image: "/images/image32.png",
    },
    {
      quote:
        "My driver has been super helpful since I moved to Nigeria with my wife. I get comfortable, safe transportation without buying a vehicle.",
      name: "Sarfaraz Abid",
      title: "IFC, World Bank",
      image: "/images/image31.png",
    },
  ];

  return (
    <div className="bg-[#F5F8FD] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            What riders say
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
            Trusted by people who move with us
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <Reveal
              key={index}
              delay={index * 90}
              className="flex flex-col h-full rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <ImQuotesLeft
                className="w-8 h-8 text-[#0673FF]/25 mb-5"
                aria-hidden="true"
              />
              <p className="text-gray-700 text-[15px] md:text-[16px] leading-relaxed mb-8">
                {item.quote}
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={`${item.name}, ${item.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-[#0673FF] text-white text-lg font-bold">${item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}</div>`;
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-gray-900 text-[15px] font-bold leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-[13px]">{item.title}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
