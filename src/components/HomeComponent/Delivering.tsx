"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

type BookingOpt = { value: string; label: string };

const SERVICES = [
  { title: "Airport transfers", match: "airport", description: "Reliable, on-time transfers, both pickup and drop-off.", image: "/images/s4.webp" },
  { title: "Self-drive rentals", match: "self", description: "Take the wheel yourself, on your own schedule.", image: "/images/s3.webp" },
  { title: "Monthly rentals", match: "month", description: "Flexible monthly plans at better long-term rates.", image: "/images/s5.webp" },
  { title: "Convoys for occasions", match: "convoy", description: "Coordinated convoys for weddings and VIP events.", image: "/images/s1.webp" },
  { title: "Night life", match: "night", description: "Safe, stylish rides for your nights out.", image: "/images/s6.webp" },
  { title: "Everyday use", match: "", description: "A car for errands, meetings, and daily life.", image: "/images/s7.webp" },
];

export default function OurServices({
  bookingOptions = [],
}: {
  bookingOptions?: BookingOpt[];
}) {
  const urlFor = (match: string) => {
    if (match) {
      const opt = bookingOptions.find((o) =>
        o.label?.toLowerCase().includes(match),
      );
      if (opt?.value) return `/booking/search?bookingType=${opt.value}`;
    }
    return "/booking/search";
  };

  return (
    <section className="bg-[#f7f9fc] px-4 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0673FF]">
            What we offer
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#0d1320] sm:text-4xl">
            Our services
          </h2>
          <p className="mt-2 max-w-xl text-gray-600">
            Everything you can book with Muvment, in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={urlFor(s.match)}
              className="group relative block h-48 overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0673FF] sm:h-56"
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-base font-bold text-white drop-shadow">
                  {s.title}
                </h3>
                <p className="mt-0.5 text-xs leading-snug text-gray-200 drop-shadow">
                  {s.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
