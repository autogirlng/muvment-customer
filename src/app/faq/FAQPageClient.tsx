"use client";

import { useEffect, useMemo, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { FiSearch, FiX } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import BookingCTA from "@/components/general/BookingCTA";
import Reveal from "@/components/general/Reveal";
import { faqSections } from "@/data/faq";

function FAQPageClient() {
  const [activeSection, setActiveSection] = useState(faqSections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(
    faqSections[0]?.items[0]?.id ?? null
  );
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Sections filtered by the search query (matches question or answer).
  const visibleSections = useMemo(() => {
    if (!isSearching) return faqSections;
    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(normalizedQuery) ||
            item.answer.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [isSearching, normalizedQuery]);

  const visibleSectionIds = useMemo(
    () => new Set(visibleSections.map((s) => s.id)),
    [visibleSections]
  );

  const totalMatches = useMemo(
    () => visibleSections.reduce((sum, s) => sum + s.items.length, 0),
    [visibleSections]
  );

  const activeLabel =
    faqSections.find((s) => s.id === activeSection)?.label ??
    faqSections[0]?.label ??
    "";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const toggleFAQ = (id: string) =>
    setOpenFAQ((cur) => (cur === id ? null : id));

  // While searching, every match is expanded so results read at a glance.
  const isOpen = (id: string) => (isSearching ? true : openFAQ === id);

  useEffect(() => {
    if (isSearching) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      const elements = faqSections
        .map((s) => document.getElementById(s.id))
        .filter((el): el is HTMLElement => Boolean(el));

      let current = elements[0]?.id ?? "";
      for (const el of elements) {
        if (scrollPosition >= el.offsetTop) current = el.id;
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearching]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <header className="px-4 pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0673FF] to-[#0a328f] px-7 py-12 sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/90">
                Help Center
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.1] text-white sm:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-blue-50/90 sm:text-lg">
                Quick answers about booking, pricing, drivers, fuel, and
                travelling with Muvment. If you need more help, our team is
                here.
              </p>

              {/* Search */}
              <div className="relative mt-7 max-w-xl">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search questions..."
                  aria-label="Search frequently asked questions"
                  className="w-full rounded-full border border-transparent bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 shadow-lg outline-none placeholder:text-gray-400 focus:ring-4 focus:ring-white/40 sm:text-base"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Mobile section nav (sticky collapsible dropdown) */}
        {!isSearching && (
          <div className="lg:hidden sticky top-24 z-40 -mx-4 mb-6 px-4">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="Jump to category"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(16,24,40,0.06)]"
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Category
                  </span>
                  <span className="truncate text-sm font-medium text-gray-900">
                    {activeLabel}
                  </span>
                </span>
                <BiChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-[60vh] overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.14)]">
                  {faqSections.map((section) => {
                    const active = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          scrollToSection(section.id);
                          setMenuOpen(false);
                        }}
                        className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "bg-blue-50 font-medium text-[#0673FF]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <Reveal>
        <div className="lg:flex lg:gap-10">
          {/* Desktop table of contents */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-2 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Categories
                </p>
                <nav className="flex flex-col pb-1">
                  {faqSections.map((section) => {
                    const active = activeSection === section.id && !isSearching;
                    const reachable = visibleSectionIds.has(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => reachable && scrollToSection(section.id)}
                        disabled={!reachable}
                        className={`relative rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "bg-blue-50 font-medium text-[#0673FF]"
                            : reachable
                              ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              : "cursor-not-allowed text-gray-300"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#0673FF]" />
                        )}
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Questions */}
          <div className="min-w-0 flex-1">
            {isSearching && (
              <p className="mb-5 text-sm text-gray-500">
                {totalMatches === 0
                  ? "No questions match your search."
                  : `${totalMatches} ${
                      totalMatches === 1 ? "result" : "results"
                    } for "${query.trim()}"`}
              </p>
            )}

            {isSearching && totalMatches === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-[#f7f9fc] p-8 text-center">
                <h2 className="text-lg font-semibold text-[#0d1320]">
                  We couldn't find an answer for that.
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
                  Try a different word, or reach our team directly.
                </p>
                <a
                  href="mailto:info@muvment.ng"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0673FF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0558cc]"
                >
                  Email support
                </a>
              </div>
            ) : (
              visibleSections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={index > 0 ? "mt-10 scroll-mt-28" : "scroll-mt-28"}
                >
                  <h2 className="mb-4 text-xl font-bold tracking-[-0.01em] text-[#0d1320] sm:text-2xl">
                    {section.label}
                  </h2>
                  <div className="space-y-3">
                    {section.items.map((faq) => {
                      const open = isOpen(faq.id);
                      return (
                        <div
                          key={faq.id}
                          className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                            open ? "border-[#0673FF]/40" : "border-gray-200"
                          }`}
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                          >
                            <h3 className="text-[15px] font-semibold text-[#0d1320] sm:text-base">
                              {faq.question}
                            </h3>
                            <BiChevronDown
                              className={`h-5 w-5 flex-shrink-0 text-[#0673FF] transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <div
                            className={`grid transition-all duration-300 ease-out ${
                              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-gray-600">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
        </Reveal>
      </div>

      <BookingCTA />
      <Footer />
    </div>
  );
}

export default FAQPageClient;
