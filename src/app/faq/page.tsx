"use client";
import Footer from "@/components/HomeComponent/Footer";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { Navbar } from "@/components/Navbar";

function FAQPageClient() {
  const [activeSection, setActiveSection] = useState("booking-account");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    { id: "booking-account", label: "Becoming a Host" },
    { id: "rental-period", label: "Host Requirement" },
    { id: "drivers-vehicles", label: "Host Criteria" },
    { id: "pricing-payments", label: "Host Guidelines" },
    { id: "policies", label: "Host Basics" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      const sectionElements = sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      for (const section of sectionElements) {
        if (!section) continue;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId || "");
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqData = {
    bookingAccount: [
      {
        id: "faq-1",
        question: "Do I need an account to book?",
        answer:
          "No, you don't need to create an account to book. However, you must provide accurate contact details, including an emergency contact, to help us properly identify and reach the customer, especially in case of emergencies or support-related issues.",
      },
    ],
    rentalPeriod: [
      {
        id: "faq-2",
        question: "How long is the standard rental period on AutoGirl?",
        answer:
          "Our standard rental period is 12 hours. Any use of the vehicle beyond this time will attract overtime charges, which vary depending on the vehicle category. You can view applicable overtime rates at checkout or in your booking summary.",
      },
      {
        id: "faq-3",
        question: "What happens if I need the car for longer than 12 hours?",
        answer:
          "If you plan to extend your trip, please make the request and complete payment before your initial 12-hour period expires. This ensures the vehicle remains available for you and avoids overtime disputes. If payment isn't made in time, the driver may leave after notifying you via call or SMS.",
      },
    ],
    driversVehicles: [
      {
        id: "faq-4",
        question: "Can I reject a vehicle if something is wrong with it?",
        answer:
          "Yes. You have a 1-hour inspection window once the vehicle is delivered. If there's a mechanical issue, like a faulty AC, you can reject the vehicle within that period, and our support team will step in to assist.",
      },
      {
        id: "faq-5",
        question: "Will I always have the same driver during my trip?",
        answer:
          "For trips that last three days or longer, your initially assigned chauffeur may be replaced by another verified Muvment driver. This rotation is for safety reasons, ensuring our drivers stay well-rested and alert. Rest assured, all our chauffeurs are professional, courteous, and fully vetted.",
      },
      {
        id: "faq-6",
        question: "What happens if I forget something in the vehicle?",
        answer:
          "Please notify us within 24 hours of the trip ending if you've left something behind. While we do our best to help, Muvment is not liable for lost items after that window.",
      },
    ],
    pricingPayments: [
      {
        id: "faq-7",
        question: "Are prices the same across all locations in Lagos?",
        answer:
          "Our pricing covers most central city areas in Lagos. However, trips involving outskirts locations like Sangotedo, Ikorodu Town, Festac, Badagry, or Alimosho will attract additional charges. The fee reflects the longer travel times and logistics involved in serving those areas.",
      },
      {
        id: "faq-8",
        question: "Do I need to fuel the car during my rental?",
        answer:
          "Yes, if you're responsible for refueling, there's a minimum fuel purchase requirement: ₦5,000 minimum for Sedans and ₦10,000 minimum for SUVs.",
      },
    ],
    policies: [
      {
        id: "faq-9",
        question: "Can I book a trip outside Lagos?",
        answer:
          "Yes, but any journey outside Lagos is treated as a full-day rental. Your rental period ends upon your return to Lagos, it doesn't continue after reentry.",
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 lg:pt-20">

        {/* Header Section with Logo Background */}
        <div className="relative h-64 lg:h-[70vh] w-full bg-[#0673FF] overflow-hidden">
          {/* Logo Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("/images/image1.png")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "350px 350px",
              }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-4">
              <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-3">
                Frequently Asked
              </h1>
              <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                Questions
              </h1>
              <p className="text-white text-sm md:text-base max-w-md mx-auto">
                Quick answers to common questions about Product/Service.
              </p>
              <p className="text-white text-sm md:text-base">
                If you need more help, we're here.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-start  items-center px-6 pt-6">
          <button onClick={() => router.push("/")}> BACK HOME</button>
        </div>
        {/* Mobile Navigation */}
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm">
          <div className="overflow-x-auto py-3 scrollbar-hide">
            <div className="flex space-x-4 px-4 min-w-max">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSection === section.id
                    ? "text-[#0673FF] bg-blue-50"
                    : "text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <div className="flex gap-8">
            {/* Desktop Navigation Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex flex-col space-y-1 p-4 border-2 border-gray-200 bg-white rounded-2xl">
                  <p className="py-2 mb-3 text-[#101928] font-medium text-sm border-b-2 border-[#E4E7EC]">
                    Quick Navigation
                  </p>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`px-4 py-3 rounded-lg text-left text-sm transition-colors ${activeSection === section.id
                        ? "text-[#0673FF] bg-blue-50"
                        : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-3">
              {/* Booking & Account */}
              <section id="booking-account">
                {faqData.bookingAccount.map((faq) => (
                  <div
                    key={faq.id}
                    className=" rounded-xl mb-3 overflow-hidden bg-gray-100"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-[#0B2253] pr-4">
                        {faq.question}
                      </h3>
                      <BiChevronDown
                        className={`w-5 h-5 text-[#0B2253] flex-shrink-0 transition-transform ${openFAQ === faq.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"
                        }`}
                    >
                      <div className="px-5 pb-5 pt-2">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Rental Period */}
              <section id="rental-period">
                {faqData.rentalPeriod.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-100 rounded-xl mb-3 overflow-hidden "
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-[#0B2253] pr-4">
                        {faq.question}
                      </h3>
                      <BiChevronDown
                        className={`w-5 h-5 text-[#0B2253] flex-shrink-0 transition-transform ${openFAQ === faq.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"
                        }`}
                    >
                      <div className="px-5 pb-5 pt-2">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Drivers & Vehicles */}
              <section id="drivers-vehicles">
                {faqData.driversVehicles.map((faq) => (
                  <div
                    key={faq.id}
                    className=" rounded-xl mb-3 overflow-hidden bg-gray-100"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-[#0B2253] pr-4">
                        {faq.question}
                      </h3>
                      <BiChevronDown
                        className={`w-5 h-5 text-[#0B2253] flex-shrink-0 transition-transform ${openFAQ === faq.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"
                        }`}
                    >
                      <div className="px-5 pb-5 pt-2">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Pricing & Payments */}
              <section id="pricing-payments">
                {faqData.pricingPayments.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-100 rounded-xl mb-3 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-[#0B2253] pr-4">
                        {faq.question}
                      </h3>
                      <BiChevronDown
                        className={`w-5 h-5 text-[#0B2253] flex-shrink-0 transition-transform ${openFAQ === faq.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"
                        }`}
                    >
                      <div className="px-5 pb-5 pt-2">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Policies */}
              <section id="policies">
                {faqData.policies.map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-xl mb-3 overflow-hidden bg-gray-100"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-[#0B2253] pr-4">
                        {faq.question}
                      </h3>
                      <BiChevronDown
                        className={`w-5 h-5 text-[#0B2253] flex-shrink-0 transition-transform ${openFAQ === faq.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"
                        }`}
                    >
                      <div className="px-5 pb-5 pt-2">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Still Have Questions? */}
              {/* <div className="bg-white rounded-xl p-6 md:p-8 text-center  mt-8">
              <h3 className="text-xl md:text-2xl font-bold text-[#0B2253] mb-3">
                Still have questions?
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-6">
                Have more questions? Send us a message and we'll get back to you
                quickly
              </p>
              <a
                href="mailto:info@muvment.ng"
                className="inline-block bg-[#0673FF] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0558CC] transition-colors"
              >
                Send an Email
              </a>
            </div> */}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default FAQPageClient;
