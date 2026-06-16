"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import Reveal from "@/components/general/Reveal";
import {
  MdRocketLaunch,
  MdKey,
  MdBarChart,
  MdSecurity,
  MdArrowForward,
  MdHandshake,
  MdAccountBalanceWallet,
  MdEventAvailable,
  MdBusinessCenter,
  MdLocalShipping,
  MdFlightTakeoff,
  MdCode,
  MdExpandMore,
  MdCheckCircle,
} from "react-icons/md";

const features = [
  {
    icon: MdRocketLaunch,
    title: "Fast onboarding",
    description:
      "Set up your organization in minutes and start booking right away. No lengthy paperwork or waiting periods.",
  },
  {
    icon: MdAccountBalanceWallet,
    title: "Dedicated virtual account",
    description:
      "Receive a dedicated virtual account powered by Paystack, so every payment and reconciliation stays clean and traceable.",
  },
  {
    icon: MdKey,
    title: "Secure API access",
    description:
      "Integrate mobility into your own systems with secure API keys, and test everything in a sandbox before going live.",
  },
  {
    icon: MdEventAvailable,
    title: "Booking management",
    description:
      "Create, track, and manage corporate bookings across every city we operate in, all from one dashboard.",
  },
  {
    icon: MdBarChart,
    title: "Analytics and reporting",
    description:
      "View real-time payment reports, monitor settlements, and keep a clear record of your spend in one place.",
  },
  {
    icon: MdSecurity,
    title: "Enterprise security",
    description:
      "Role-based access control, encrypted keys, and audit logs keep your account and your data protected.",
  },
];

const steps = [
  {
    title: "Create your corporate account",
    description: "Sign up and set up your organization in a few minutes.",
  },
  {
    title: "Get your account and keys",
    description:
      "Receive a dedicated Paystack virtual account and your sandbox API keys instantly.",
  },
  {
    title: "Integrate and test",
    description:
      "Connect the API to your systems and test everything safely in the sandbox.",
  },
  {
    title: "Go live and manage",
    description:
      "Start booking, track settlements, and manage your team from one dashboard.",
  },
];

const useCases = [
  {
    icon: MdBusinessCenter,
    title: "Corporate travel",
    description:
      "Reliable, premium rides for staff, executives, and visiting clients across your cities.",
  },
  {
    icon: MdLocalShipping,
    title: "Logistics and operations",
    description:
      "Vehicles and vetted drivers to keep your day-to-day operations moving without owning a fleet.",
  },
  {
    icon: MdFlightTakeoff,
    title: "Travel and hospitality",
    description:
      "Offer dependable ground mobility to your guests and customers as part of your service.",
  },
  {
    icon: MdCode,
    title: "Platforms and developers",
    description:
      "Build mobility directly into your own product with our API and a clean sandbox to test against.",
  },
];

const included = [
  "Dedicated Paystack virtual account",
  "Secure API keys with sandbox testing",
  "Real-time bookings and settlement reports",
  "Role-based access for your whole team",
];

const faqs = [
  {
    q: "How long does onboarding take?",
    a: "Minutes. Once you create your corporate account you receive a dedicated virtual account and your sandbox keys right away.",
  },
  {
    q: "How do payments and settlements work?",
    a: "Every partner gets a dedicated virtual account powered by Paystack. You can track payments and view settlement reports in real time from your dashboard.",
  },
  {
    q: "Is there a sandbox for testing?",
    a: "Yes. You can integrate and test the API with sandbox keys before switching to live, so nothing goes live untested.",
  },
  {
    q: "Can I add my team?",
    a: "Yes. Role-based access lets you invite multiple users and give each the right level of permissions.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on your usage and needs. Create a corporate account to get started, or reach out to our team and we will walk you through the options.",
  },
];

export const PartnerWithUs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToOnboarding = () => {
    if (user) {
      router.push("/dashboard/integrations/create-organization");
    } else {
      router.push(
        "/auth/login?redirect=/dashboard/integrations/create-organization",
      );
    }
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
            <MdHandshake className="w-4 h-4" />
            Corporate Partnership
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-white font-bold leading-[1.1] mb-6 text-[2.4rem] sm:text-5xl md:text-[3.5rem]">
              Power your business with{" "}
              <span className="text-[#5AA2FF]">our platform</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-white/65 text-[15px] md:text-[17px] font-light leading-[1.75] max-w-xl mx-auto mb-9">
              Join as a corporate partner and unlock API access, a dedicated
              virtual account, and advanced booking management, all in one
              place.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={goToOnboarding}
                className="group bg-[#0673FF] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Create corporate account
                <MdArrowForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => router.push("/contact-us")}
                className="border border-white/30 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
              >
                Talk to our team
              </button>
            </div>
          </Reveal>

          {!user && (
            <Reveal delay={300}>
              <p className="mt-6 text-sm text-white/50">
                Already have an account?{" "}
                <button
                  onClick={() =>
                    router.push(
                      "/auth/login?redirect=/dashboard/integrations/create-organization",
                    )
                  }
                  className="text-[#5AA2FF] hover:underline font-medium"
                >
                  Sign in to continue
                </button>
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
              The platform
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Everything you need to scale
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal
                  key={f.title}
                  delay={(i % 3) * 80}
                  className="group rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
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
              Live in four simple steps
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
              Who it is for
            </p>
            <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1]">
              Built for businesses that move
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((u, i) => {
              const Icon = u.icon;
              return (
                <Reveal
                  key={u.title}
                  delay={(i % 4) * 70}
                  className="rounded-2xl border border-gray-200/80 bg-white p-7 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-[#0673FF]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 text-[16px] font-bold mb-2">
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

      {/* API / what you get */}
      <section className="bg-[#F5F8FD] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
                Developer friendly
              </p>
              <h2 className="text-gray-900 text-[clamp(1.9rem,3.5vw,2.6rem)] font-bold leading-[1.15] mb-6">
                Integrate mobility into your own product
              </h2>
              <p className="text-gray-600 text-[16px] leading-relaxed mb-8">
                Our API lets you create and manage bookings, handle payments
                through a dedicated virtual account, and pull settlement reports
                straight into your systems. Test against a sandbox first, then
                flip to live when you are ready.
              </p>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-gray-700 text-[15px]"
                  >
                    <MdCheckCircle className="w-5 h-5 text-[#0673FF] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-3xl bg-[#101928] p-7 md:p-9 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="ml-3 text-white/40 text-[12px] tracking-wide">
                    corporate dashboard
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-white/45 text-[11px] uppercase tracking-[0.14em] mb-1">
                      Virtual account
                    </p>
                    <p className="text-white font-semibold">
                      Powered by Paystack
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <p className="text-white/45 text-[11px] uppercase tracking-[0.14em] mb-1">
                        Sandbox key
                      </p>
                      <p className="text-[#5AA2FF] font-mono text-sm">
                        sk_test_••••••
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <p className="text-white/45 text-[11px] uppercase tracking-[0.14em] mb-1">
                        Live key
                      </p>
                      <p className="text-[#5AA2FF] font-mono text-sm">
                        sk_live_••••••
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                    <span className="text-white/70 text-sm">Settlements</span>
                    <span className="text-emerald-400 text-sm font-medium">
                      Real time
                    </span>
                  </div>
                </div>
              </div>
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
              Ready to power your business?
            </h2>
            <p className="text-white/70 text-[15px] md:text-[17px] font-light leading-[1.75] mb-10 max-w-xl mx-auto">
              Create your corporate account today and start integrating our
              platform into your workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={goToOnboarding}
                className="group bg-[#0673FF] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Create corporate account
                <MdArrowForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
