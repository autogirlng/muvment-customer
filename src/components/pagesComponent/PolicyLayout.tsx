"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Navbar } from "../Navbar";
import Footer from "../HomeComponent/Footer";
import BookingCTA from "../general/BookingCTA";

type PolicySection = { id: string; label: string };

type PolicyLayoutProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: PolicySection[];
  children: ReactNode;
};

function PolicyLayout({
  eyebrow = "Legal",
  title,
  intro,
  lastUpdated,
  sections,
  children,
}: PolicyLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeLabel =
    sections.find((s) => s.id === activeSection)?.label ??
    sections[0]?.label ??
    "";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top =
      element.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      const elements = sections
        .map((s) => document.getElementById(s.id))
        .filter((el): el is HTMLElement => Boolean(el));

      let current = elements[0]?.id ?? "";
      for (const el of elements) {
        if (scrollPosition >= el.offsetTop) {
          current = el.id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <header className="px-4 pt-28 pb-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
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
                {eyebrow}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.1] text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-blue-50/90 sm:text-lg">
                {intro}
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur-sm ring-1 ring-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Last updated {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 pb-24">
        {/* Mobile section nav (sticky collapsible dropdown) */}
        <div className="lg:hidden sticky top-24 z-40 -mx-4 mb-6 px-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label="Jump to section"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-[0_4px_14px_rgba(16,24,40,0.06)]"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  On this page
                </span>
                <span className="truncate text-sm font-medium text-gray-900">
                  {activeLabel}
                </span>
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <path
                  d="M5 7.5l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-[60vh] overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.14)]">
                {sections.map((section) => {
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

        <div className="lg:flex lg:gap-10">
          {/* Desktop table of contents */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-2 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  On this page
                </p>
                <nav className="flex flex-col pb-1">
                  {sections.map((section) => {
                    const active = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`relative rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "bg-blue-50 font-medium text-[#0673FF]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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

          {/* Document */}
          <article className="policy-prose min-w-0 flex-1 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] sm:p-10">
            {children}
          </article>
        </div>
      </div>

      <BookingCTA />
      <Footer />
    </div>
  );
}

export default PolicyLayout;
