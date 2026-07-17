"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import Reveal from "@/components/general/Reveal";
import {
  MdBusinessCenter,
  MdAccountBalanceWallet,
  MdGroups,
  MdFactCheck,
  MdReceiptLong,
  MdInsertChartOutlined,
  MdRoute,
  MdFlightTakeoff,
  MdLocalShipping,
  MdExpandMore,
  MdCheckCircle,
  MdArrowForward,
} from "react-icons/md";

const benefits = [
  {
    icon: MdAccountBalanceWallet,
    title: "One company wallet",
    description:
      "Fund a single company wallet and let your team book rides from it. Every trip is paid from one place, so reconciliation stays simple.",
  },
  {
    icon: MdGroups,
    title: "Team management",
    description:
      "Invite staff, assign admins, and set who can book. Add or remove members at any time, with roles you control.",
  },
  {
    icon: MdFactCheck,
    title: "Spending controls and approvals",
    description:
      "Set spending limits per member and require approval on bookings above a threshold, so spend stays within budget.",
  },
  {
    icon: MdReceiptLong,
    title: "Clear company invoices",
    description:
      "Every booking generates an invoice that shows exactly how it was paid, including when it was funded from the company wallet.",
  },
  {
    icon: MdRoute,
    title: "Track every trip",
    description:
      "See the status of each trip your team takes, from upcoming to completed, and follow a booking from one dashboard.",
  },
  {
    icon: MdInsertChartOutlined,
    title: "Spend visibility",
    description:
      "See what your team is spending and where, with company bookings and wallet activity in one clear view.",
  },
];

const steps = [
  {
    title: "Set up your business account",
    description:
      "Create your organization in a few minutes with your company details.",
  },
  {
    title: "Fund your company wallet",
    description:
      "Top up the wallet your team will book from, using your dedicated funding details.",
  },
  {
    title: "Invite your team",
    description:
      "Add staff, assign admins, and set spending limits and approvals that fit your business.",
  },
  {
    title: "Book and track",
    description:
      "Your team books rides from the wallet while you track trips and spend in one place.",
  },
];

const useCases = [
  {
    icon: MdBusinessCenter,
    title: "Staff and executive travel",
    description:
      "Reliable rides for your team and leadership across every city we operate in.",
  },
  {
    icon: MdFlightTakeoff,
    title: "Airport runs and client pickups",
    description:
      "Move visiting clients and staff to and from airports without the back and forth.",
  },
  {
    icon: MdLocalShipping,
    title: "Day to day operations",
    description:
      "Cover recurring trips for field teams and daily operations with dependable vehicles and drivers.",
  },
];

const faqs = [
  {
    q: "What is a Muvment business account?",
    a: "It is a company account that lets your team book rides from a shared company wallet, with team roles, spending limits, approvals, and company bookings all managed from one dashboard.",
  },
  {
    q: "How does the company wallet work?",
    a: "You fund one company wallet, and members book rides that are paid from it. You can set spending limits per member and require approval on larger bookings, so spend stays within budget.",
  },
  {
    q: "Can a staff member pay with their own card?",
    a: "Yes. A member can pay for a company booking with their own card or transfer while the booking still appears under your company bookings. Card payments do not touch the wallet balance or the spending limit.",
  },
  {
    q: "Can I control who can spend and how much?",
    a: "Yes. You assign admins, set spending limits per member, and require approval on bookings above a threshold you choose.",
  },
  {
    q: "How do I get started?",
    a: "Set up your business account, fund the company wallet, invite your team, and start booking. It takes only a few minutes to get going.",
  },
];

export const MuvmentForBusiness = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Route the primary call to action to the right place based on sign-in state.
  // A signed-in organization admin goes straight to business setup; another
  // signed-in user goes to the create-organization flow; a signed-out visitor
  // is sent to register to create an account first.
  const startBusinessAccount = () => {
    if (!user) {
      // Use a full navigation so the register page loads with the query
      // parameter read on a fresh mount, the same as opening the URL directly.
      window.location.assign("/auth/register?type=business");
      return;
    }
    if (user.userType === "ORGANIZATION_ADMIN") {
      router.push("/business-setup");
      return;
    }
    router.push("/dashboard/integrations/create-organization");
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#101928] px-6 pt-32 pb-24 md:pt-36 md:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="hero-glow hero-glow-1" />
          <span className="hero-glow hero-glow-2" />
          <span className="hero-grid" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full border border-white/20 text-white/85 text-[12px] tracking-[0.16em] uppercase font-medium">
            <MdBusinessCenter className="w-4 h-4" />
            Muvment for Business
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-white font-bold leading-[1.1] mb-6 text-[2.4rem] sm:text-5xl md:text-[3.5rem]">
              Mobility for your{" "}
              <span className="text-[#5AA2FF]">whole team</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-white/65 text-[15px] md:text-[17px] font-light leading-[1.75] max-w-xl mx-auto mb-9">
              Give your team reliable rides from one company wallet, with the
              roles, spending limits, and approvals you need to stay in control.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={startBusinessAccount}
                className="inline-flex items-center gap-2 bg-[#0673FF] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors w-full sm:w-auto justify-center"
              >
                Set up a business account
                <MdArrowForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/contact-us")}
                className="border border-white/30 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
              >
                Talk to our team
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              Why Muvment for Business
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Everything your team needs to move
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal
                  key={f.title}
                  delay={(i % 3) * 80}
                  className="group rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-[#EAF2FF] rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 text-[18px] font-bold mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-[14px] leading-relaxed">
                    {f.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F8FD] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              How it works
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Up and running in four steps
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 80}
                className="relative rounded-2xl border border-gray-200/80 bg-white p-7 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-[#0673FF] text-white flex items-center justify-center font-bold mb-5">
                  {i + 1}
                </div>
                <h3 className="text-gray-900 text-[16px] font-bold mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {s.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              Built for how you work
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Made for every kind of trip
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {useCases.map((u, i) => {
              const Icon = u.icon;
              return (
                <Reveal
                  key={u.title}
                  delay={i * 80}
                  className="rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-[#EAF2FF] rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 text-[18px] font-bold mb-3">
                    {u.title}
                  </h3>
                  <p className="text-gray-600 text-[14px] leading-relaxed">
                    {u.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="bg-[#F5F8FD] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
                Stay in control
              </p>
              <h2 className="text-gray-900 text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-[1.15] mb-6">
                Your budget, your rules
              </h2>
              <p className="text-gray-600 text-[15px] leading-[1.8] mb-6">
                Fund one wallet, decide who can book, cap what each member can
                spend, and approve larger bookings before they go through. Every
                trip and every naira stays visible.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <ul className="space-y-4">
                {[
                  "One company wallet for the whole team",
                  "Spending limits per member",
                  "Approvals on bookings above your threshold",
                  "Company invoices that show wallet payments",
                  "Trip tracking and spend visibility in one place",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <MdCheckCircle className="w-6 h-6 text-[#0673FF] flex-shrink-0" />
                    <span className="text-gray-800 text-[15px] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              FAQ
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Questions, answered
            </h2>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={item.q} delay={(i % 3) * 60}>
                  <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                      aria-expanded={open}
                    >
                      <span className="text-gray-900 font-medium text-[15px]">
                        {item.q}
                      </span>
                      <MdExpandMore
                        className={`w-5 h-5 text-[#0673FF] flex-shrink-0 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        open
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-gray-600 text-[14px] leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#101928] py-20 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="hero-glow hero-glow-1" />
          <span className="hero-glow hero-glow-2" />
          <span className="hero-grid" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-white text-[clamp(2.1rem,4.5vw,3.25rem)] font-bold leading-[1.1] mb-6">
              Ready to move your team?
            </h2>
            <p className="text-white/70 text-[15px] md:text-[17px] font-light leading-[1.75] mb-10 max-w-xl mx-auto">
              Set up your business account in minutes and give your team a
              simpler way to move.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={startBusinessAccount}
                className="inline-flex items-center gap-2 bg-[#0673FF] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors w-full sm:w-auto justify-center"
              >
                Set up a business account
                <MdArrowForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/contact-us")}
                className="border border-white/30 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
              >
                Talk to our team
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
};
