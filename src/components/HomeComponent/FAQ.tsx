"use client";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from "react-icons/fa";

interface FAQItem {
  title: string;
  content: string;
}

interface FAQProps {
  title?: string;
  description?: string;
  faqs?: FAQItem[];
  className?: string;
}

export default function FAQ({
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about our services",
  faqs = defaultFAQs,
  className = "",
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={`py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6">
            <FaQuestionCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 rounded-2xl"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-semibold mt-1">
                    {index + 1}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 pr-4">
                    {faq.title}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <FaChevronUp className="w-5 h-5 text-blue-600 transition-transform duration-300" />
                  ) : (
                    <FaChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                  )}
                </div>
              </button>

              <div
                className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "opacity-100 max-h-96"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <div className="pl-12 border-t border-gray-100 pt-4">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {faq.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Our support team is here to help you get the answers you need
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Contact Support
              </button>
              <button className="border-2 border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                Send us an Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Default FAQ data
const defaultFAQs: FAQItem[] = [
  {
    title: "Do I need an account to book?",
    content:
      "No, you don't need to create an account to book. However, you must provide accurate contact details, including an emergency contact, to help us properly identify and reach the customer, especially in case of emergencies or support-related issues.",
  },
  {
    title: "How long is the standard rental period on AutoGirl?",
    content:
      "Our standard rental period is 12 hours. Any use of the vehicle beyond this time will attract overtime charges, which vary depending on the vehicle category. You can view applicable overtime rates at checkout or in your booking summary.",
  },
  {
    title: "What happens if I need the car for longer than 12 hours?",
    content:
      "If you plan to extend your trip, please make the request and complete payment before your initial 12-hour period expires. This ensures the vehicle remains available for you and avoids overtime disputes. If payment isn't made in time, the driver may leave after notifying you via call or SMS.",
  },
  {
    title: "Can I reject a vehicle if something is wrong with it?",
    content:
      "Yes. You have a 1-hour inspection window once the vehicle is delivered. If there's a mechanical issue, like a faulty AC, you can reject the vehicle within that period, and our support team will step in to assist.",
  },
  {
    title: "Will I always have the same driver during my trip?",
    content:
      "For trips that last three days or longer, your initially assigned chauffeur may be replaced by another verified Muvment driver. This rotation is for safety reasons, ensuring our drivers stay well-rested and alert. Rest assured, all our chauffeurs are professional, courteous, and fully vetted.",
  },
  {
    title: "Are prices the same across all locations in Lagos?",
    content:
      "Our pricing covers most central city areas in Lagos. However, trips involving outskirts locations like Sangotedo, Ikorodu Town, Festac, Badagry, or Alimosho will attract additional charges. The fee reflects the longer travel times and logistics involved in serving those areas.",
  },
  {
    title: "Do I need to fuel the car during my rental?",
    content:
      "Yes, if you're responsible for refueling, there's a minimum fuel purchase requirement: ₦5,000 minimum for Sedans and ₦10,000 minimum for SUVs.",
  },
  {
    title: "Can I book a trip outside Lagos?",
    content:
      "Yes, but any journey outside Lagos is treated as a full-day rental. Your rental period ends upon your return to Lagos, it doesn't continue after reentry.",
  },
  {
    title: "What happens if I forget something in the vehicle?",
    content:
      "Please notify us within 24 hours of the trip ending if you've left something behind. While we do our best to help, Muvment is not liable for lost items after that window.",
  },
];
