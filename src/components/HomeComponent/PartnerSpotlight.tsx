import React from "react";
import Link from "next/link";
import { FiArrowRight, FiMapPin, FiStar, FiCheckCircle } from "react-icons/fi";

const FEDERAL_PALACE = {
  slug: "federal-palace-hotel",
  name: "The Federal Palace Hotel & Casino",
  location: "Victoria Island, Lagos",
  image:
    "https://wa-uploads.profitroom.com/federalpalace/820x615/17274452687066_.federalpalacepool4590.jpg.sunimage.600.640.jpg.sunimage.800.400.webp",
};

const POINTS = [
  "On-site fleet stationed at the hotel for guests",
  "Hourly, half-day and airport transfers",
  "Chauffeured, vetted and ready on arrival",
];

export default function PartnerSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-[460px]">
            <img
              src={FEDERAL_PALACE.image}
              alt={FEDERAL_PALACE.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r" />
            <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <FiStar className="text-[#F5A623]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0673FF]">
                5-star partner
              </span>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0673FF]">
              Trusted by Nigeria&apos;s finest
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[34px] font-bold leading-tight text-[#101928]">
              We move the guests at Federal Palace Hotel
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600">
              Lagos&apos; iconic 5-star landmark trusts Muvment with rentals for
              its guests, with the fleet stationed right on the premises.
            </p>

            <ul className="mt-6 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <FiCheckCircle className="mt-0.5 flex-shrink-0 text-[#0673FF]" />
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <FiMapPin className="text-[#0673FF]" />
              <span>{FEDERAL_PALACE.location}</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Host of Nigeria&apos;s 1960 Independence declaration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/partnership/${FEDERAL_PALACE.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0673ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0560d6]"
              >
                Explore the fleet
                <FiArrowRight />
              </Link>
              <Link
                href="/partnership"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#0673ff] px-6 py-3 text-sm font-semibold text-[#0673ff] transition hover:bg-[#EAF2FF]"
              >
                See all partners
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
