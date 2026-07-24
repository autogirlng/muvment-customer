"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";

interface FAQItem {
  title: string;
  content: string;
}

interface FAQProps {
  title?: string;
  eyebrow?: string;
  faqs?: FAQItem[];
  className?: string;
}

export default function FAQ({
  title = "Frequently asked questions",
  eyebrow = "Good to know",
  faqs = defaultFAQs,
  className = "bg-[#f7f9fc]",
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className={`py-16 lg:py-20 ${className}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0673FF]">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#101928] sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  open ? "border-[#0673FF]/40" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <h3 className="text-[15px] font-semibold text-[#101928] sm:text-base">
                    {faq.title}
                  </h3>
                  <FiChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-[#0673FF] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-gray-600">
                      {faq.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/faq"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0673FF] transition-colors hover:text-[#0560d6]"
        >
          See all FAQs
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

const defaultFAQs: FAQItem[] = [
  {
    title: "Do I need an account to book?",
    content:
      "No. You can book without an account. You will need to provide accurate contact details, including an emergency contact, so we can reach you if anything comes up during your trip.",
  },
  {
    title: "How long is the standard rental period?",
    content:
      "The standard rental period is 12 hours. Going beyond that attracts overtime charges that depend on the vehicle category, and you can see the applicable rates at checkout.",
  },
  {
    title: "Do your cars come with a driver?",
    content:
      "Yes. Every booking comes with a professional chauffeur, and fuel is included at the start of your trip: 30 litres for sedans and 35 litres for SUVs.",
  },
  {
    title: "Do I need to fuel the car during my rental?",
    content:
      "You start with 30 litres for a sedan or 35 litres for an SUV. If it runs low, you top up enough to finish the trip, with a minimum of ₦12,000 for sedans and ₦20,000 for SUVs. If you would rather start with a full tank, you can add it to your booking for ₦35,000 on a sedan or ₦55,000 on an SUV, confirmed and paid before your booking starts.",
  },
  {
    title: "Can I book a trip outside Lagos?",
    content:
      "Yes. You can travel from Lagos to other states and across the border to Cotonou. Trips outside Lagos are treated as full-day rentals, and the period ends once you return to Lagos.",
  },
  {
    title: "What if something is wrong with the vehicle when it arrives?",
    content:
      "You have a one-hour inspection window when the vehicle is delivered. If there is a mechanical issue, like a faulty AC, you can reject it within that window and our support team will step in to help.",
  },
];
