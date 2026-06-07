"use client";
import React from "react";
import { IoArrowForward } from "react-icons/io5";
import { LuLeaf } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import { BiBriefcase } from "react-icons/bi";
import { useRouter } from "next/navigation";
import Reveal from "../general/Reveal";

const ImpactAndCTA = ({
  bookingTypeID,
}: {
  bookingTypeID: string | undefined;
}) => {
  const route = useRouter();
  const impacts = [
    {
      icon: <LuLeaf className="w-6 h-6" />,
      title: "Environmental",
      description:
        "Our EV fleet is replacing fuel vehicles with low-emission alternatives.",
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: "Women Empowerment",
      description:
        "The AWE program has impacted 100+ women in the mobility sector.",
    },
    {
      icon: <BiBriefcase className="w-6 h-6" />,
      title: "Job Creation",
      description:
        "Over 70 staff and hundreds of driver partners across every city we enter.",
    },
  ];

  return (
    <>
      {/* Impact */}
      <div className="bg-[#F5F8FD] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              Our impact
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Driving change beyond mobility
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impacts.map((impact, index) => (
              <Reveal
                key={index}
                delay={index * 90}
                className="rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
                  {impact.icon}
                </div>
                <h3 className="text-gray-900 text-[18px] font-bold mb-3">
                  {impact.title}
                </h3>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {impact.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CTA - white, flows into footer */}
      <div className="bg-white py-20 md:py-28 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-gray-900 text-[clamp(2.1rem,4.5vw,3.25rem)] font-bold leading-[1.1] mb-6">
              Join the Muvment
            </h2>
            <p className="text-gray-600 text-[15px] md:text-[17px] leading-[1.75] mb-10 max-w-xl mx-auto">
              Whether you are a rider, a fleet owner, a corporate partner, or a
              future team member, there is a place for you in Africa's mobility
              future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() =>
                  route.push(`/booking/search?bookingType=${bookingTypeID}`)
                }
                className="group bg-[#0673FF] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Book a ride
                <IoArrowForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => route.push("/contact-us")}
                className="bg-white border border-gray-300 text-gray-700 px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
              >
                Partner with us
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default ImpactAndCTA;
