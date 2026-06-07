"use client";

import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const impactStories = [
  {
    eyebrow: "Partnership & grants",
    title: "AutoWomen Empowerment Grant",
    body: "We celebrated women advancing in mobility. Three recipients each received ₦250,000 toward their goals, surrounded by teammates including representatives from our electric vehicle driver programme.",
    caption: "Grant presentation · Lagos - July 16, 2025",
    imageSrc: "/images/autowomen_empowerment_grant.png",
    imageAlt:
      "Group celebrating AutoWomen Empowerment Grant cheques with Access Bank and AutoGIRL branding",
    accentBar: "bg-[#0673FF]",
    reverse: false,
  },
  {
    eyebrow: "Fleet & livelihoods",
    title: "Electric vehicle drivers",
    body: "Uniformed drivers stand with Nigeria's first large-scale EV fleet on ride-hailing platforms, a visible commitment to professional earnings, lower running costs, and clean kilometres across Lagos.",
    caption: "Muvment EV fleet · driver rollout - July 16, 2025",
    imageSrc: "/images/electric_vehicle_drivers.png",
    imageAlt: "Professional drivers in uniform beside a row of white electric vehicles",
    accentBar: "bg-[#1D2739]",
    reverse: true,
  },
  {
    eyebrow: "Skills & hands-on training",
    title: "Women at the workshop",
    body: "Through the Autowomen Empowerment Programme, women train alongside our partners in active workshops, gaining technical confidence and employable skills.",
    caption: "Autowomen trainees · workshop placement  - September 17, 2024",
    imageSrc: "/images/women_at_workshop.png",
    imageAlt: "Group of smiling women posing inside an automotive repair workshop",
    accentBar: "bg-[#101928]",
    reverse: false,
  },
] as const;

const metricCards = [
  {
    value: "₦500k",
    label: "Average monthly driver income with Muvment, up from ₦75,000",
    color: "bg-[#1D2739]",
  },
  {
    value: "60+",
    label: "Women trained free in driving, mechanics and affiliate sales",
    color: "bg-[#0673FF]",
  },
  {
    value: "Nigeria's 1st",
    label: "Large-scale EV fleet deployed on ride-hailing platforms",
    color: "bg-[#101928]",
  },
  {
    value: "3 managers",
    label: "Programme graduates promoted to management within one year",
    color: "bg-[#0673FF]",
  },
  {
    value: "200+",
    label: "Drivers empowered through our lease-to-own & rent to earn programme",
    color: "bg-[#1D2739]",
  },
];

const pillars = [
  {
    id: "01",
    title: "Driver income & vehicle ownership",
    body: "Our lease-to-own and rent-to-earn EV programme lifts driver earnings from ₦75,000 to ₦500,000 a month, and puts vehicle ownership within reach for the first time.",
    tags: ["SDG 1: No poverty"],
    headerBg: "bg-gray-50",
    iconBg: "bg-[#0673FF]",
    tagBg: "bg-blue-50 text-[#0560d6]",
    titleColor: "text-[#101928]",
    numberColor: "text-[#101928]",
    dark: false,
  },
  {
    id: "02",
    title: "Clean mobility & carbon reduction",
    body: "Electric cars placed directly on ride-hailing apps cut carbon per kilometre and widen clean mobility across Lagos, displacing about 660kg of CO₂ a day.",
    tags: [
      "SDG 7: Clean energy",
      "SDG 11: Sustainable cities",
      "SDG 13: Climate action",
    ],
    headerBg: "bg-[#1D2739]",
    iconBg: "bg-white/10",
    tagBg: "bg-blue-50 text-[#0560d6]",
    titleColor: "text-white",
    numberColor: "text-white",
    dark: true,
  },
  {
    id: "03",
    title: "Autowomen Empowerment Programme",
    body: "With partners like UAC and Ayomatics Mechanics, 60 women trained free in driving, car repair, and affiliate sales, with paid internships. Three won cash grants, seven became team leads, and three made manager within a year.",
    tags: [
      "SDG 4: Quality education",
      "SDG 5: Gender equality",
      "SDG 8: Decent work",
    ],
    headerBg: "bg-[#101928]",
    iconBg: "bg-white/10",
    tagBg: "bg-blue-50 text-[#0560d6]",
    titleColor: "text-white",
    numberColor: "text-white",
    dark: true,
  },
  {
    id: "04",
    title: "Female Drivers Outreach",
    body: "A community outreach spotlighting female drivers in one of Nigeria's toughest professions. We shared their stories, amplified their voices, and gave cash gifts and food packages as direct welfare support.",
    tags: ["SDG 5: Gender equality", "SDG 10: Reduced inequalities"],
    headerBg: "bg-blue-50",
    iconBg: "bg-[#0673FF]",
    tagBg: "bg-blue-50 text-[#0560d6]",
    titleColor: "text-[#101928]",
    numberColor: "text-[#101928]",
    dark: false,
  },
];

const sdgs = [
  ["1", "No poverty", "Driver income from ₦75k → ₦500k/month", "#0673FF"],
  ["4", "Quality education", "Free certified skills training for women", "#1D2739"],
  ["5", "Gender equality", "Autowomen programme & female driver outreach", "#0673FF"],
  ["7", "Clean energy", "EV fleet replacing fossil fuel ride-hailing vehicles", "#1D2739"],
  ["8", "Decent work", "Lease-to-own model and paid internships", "#0673FF"],
  ["10", "Reduced inequalities", "Expanding income access for underserved drivers", "#1D2739"],
  ["11", "Sustainable cities", "Low-carbon urban mobility infrastructure", "#0673FF"],
  ["13", "Climate action", "Displacing ICE vehicles on Lagos ride-hailing apps", "#1D2739"],
];

const testimonials = [
  {
    tag: "Autowomen graduate",
    quote:
      "I came in not knowing how to check a tyre pressure. I left with a certification, an internship, and a team to lead.",
    name: "Gift Eboyi",
    outcome:
      "One of 7 graduates promoted to team lead across Nigerian automotive organisations within 12 months of completing the programme.",
  },
  {
    tag: "Female driver outreach",
    quote:
      "Nobody asks how we're doing. They just ask where we're going. Muvment actually stopped to listen.",
    name: "Mrs Lilian O.",
    outcome:
      "Stories spotlighted publicly to shift perception of women in professional driving. Cash gifts and food packages provided as direct welfare support.",
  },
  {
    tag: "Driver income journey",
    quote:
      "I used to borrow a car and give most of what I earned back to the owner. Now I'm driving toward owning mine. I can pay my children's school fees and feed my family. Thank you Muvment.",
    name: "Mark Abuh",
    outcome:
      "Drivers on the Muvment lease-to-own programme earn an average of ₦500,000 monthly (up from ₦75,000) with a clear path to ownership.",
  },
];

const defaultMentions = [
  {
    label: "CNN Africa",
    href: "https://www.cnn.com/world/africa/nigerian-company-autogirl-airbnb-cars-spc/index.html",
  },
  {
    label: "The Guardian Nigeria",
    href: "https://guardian.ng/news/autogirl-ltd-pioneers-future-of-mobility-for-expatriates-businesses-in-africa/",
  },
  {
    label: "TechCabal × 3",
    href: "https://techcabal.com/2026/01/17/day-1-1000-muvment/",
  },
  {
    label: "Vanguard News",
    href: "https://www.vanguardngr.com/2024/09/autogirl-launches-initiative-to-increase-gender-inclusion-in-automotive-industry/",
  },
  {
    label: "Tribune Online",
    href: "https://tribuneonlineng.com/autogirl-launches-empowerment-initiative-for-gender-inclusion-in-automotive-industry/",
  },
  {
    label: "Aurora Tech Awards: Top 100 Globally 2026",
    href: "https://www.auroratechaward.com/2026-top-100",
  },
  {
    label: "ELOY Awards: Young Innovative Entrepreneur 2023",
    href: "https://www.eloyawards.com/past-recipients/",
  },
  {
    label: "Grey UpGreyed Her Grant 2024",
    href: "https://grey.co/blog/how-autogirl-breaks-gender-stereotypes-and-thrives-in-nigerias-difficult-transport-industry",
  },
  {
    label: "GET Accelerator Top 5 · 2024",
    href: "https://techcabal.com/2025/01/11/get-accelerated-cohort-3-awards-n55-million-equity-free-funding-to-startups/",
  },
  {
    label: "25 Under 25 · 2024",
    href: "https://25under25.org/2024-winners/",
  },
];

const moreMentions = [
  {
    label: "BusinessDay",
    href: "https://businessday.ng/interview/enterpreneur/article/arinze-chinazom-succeeding-where-peers-fear-to-tread/",
  },
  {
    label: "Nairametrics",
    href: "https://nairametrics.com/2022/06/01/how-auto-girl-is-providing-unique-services-in-the-automobile-boat-and-private-jet-sector-in-nigeria-chinazom-arinze-founder-auto-girl/",
  },
  {
    label: "TC Insights: The Baobab Model",
    href: "https://insights.techcabal.com/the-baobab-model-how-women-are-scaling-impact-in-africas-tech-economy/",
  },
  {
    label: "TechCabal: Female Founders & Funders",
    href: "https://techcabal.com/2025/07/25/female-founders-and-funders/",
  },
  {
    label: "Premium Times",
    href: "https://www.premiumtimesng.com/entertainment/naija-fashion/866413-entrepreneurs-champion-womens-economic-empowerment-at-west-africa-business-summit.html",
  },
  {
    label: "Technext: Top 10 Female Tech Founders 2026",
    href: "https://technext24.com/2026/02/13/top-10-nigerian-female-tech-founders/",
  },
  {
    label: "THISDAY: GET Accelerator",
    href: "https://www.thisdaylive.com/index.php/2025/01/10/get-accelerated-cohort-3-awards-n55m-equity-free-funding-to-startups/",
  },
  {
    label: "THISDAY: Grey UpGreyed Her",
    href: "https://www.thisdaylive.com/2024/05/08/y-combinator-backed-fintech-grey-announces-recipients-of-2024-upgreyed-her-grants-programme/",
  },
  {
    label: "BellaNaija: ELOY Awards",
    href: "https://www.bellanaija.com/2023/12/15th-eloy-awards-2023/",
  },
  {
    label: "The Benchmark",
    href: "https://thebenchmark.com.ng/chinazom-arinze-is-reshaping-car-rentals-in-nigeria-through-autogirl/",
  },
  {
    label: "The Stack Journal",
    href: "https://www.thestackjournal.com/posts/startup-spotlight-autogirl",
  },
  {
    label: "Tony Elumelu Foundation",
    href: "https://www.tonyelumelufoundation.org/",
  },
  {
    label: "Seedstars Accelerator",
    href: "https://www.seedstars.com/",
  },
  {
    label: "Future Females Business School",
    href: "https://www.futurefemales.co/",
  },
];

function PillarIcon({ id }: { id: string }) {
  if (id === "01") {
    return (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (id === "02") {
    return (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (id === "03") {
    return (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // Initial render is the real value, so it is correct for SEO and no-JS.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (!match) return;
    const target = parseInt(match[2].replace(/,/g, ""), 10);
    const prefix = match[1];
    const suffix = match[3];

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Skip the animation for small or non-numeric values; show them as-is.
    if (
      reduce ||
      typeof IntersectionObserver === "undefined" ||
      Number.isNaN(target) ||
      target < 10
    ) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    let started = false;
    const format = (n: number) => `${prefix}${n.toLocaleString()}${suffix}`;
    const run = () => {
      if (started) return;
      started = true;
      const duration = 1400;
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(format(Math.round(eased * target)));
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setDisplay(value);
        }
      };
      setDisplay(format(0));
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    const fallback = window.setTimeout(run, 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

function PressSection() {
  const [showMore, setShowMore] = useState(false);

  const pillClass =
    "text-[13px] px-5 py-2 rounded-full border border-gray-200/80 text-gray-600 bg-white transition-all duration-200 hover:border-[#0673FF] hover:text-[#0673FF] hover:bg-blue-50 no-underline";

  return (
    <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-24">
      <div className="max-w-6xl mx-auto">
        <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
          As seen in
        </p>
        <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#101928] mb-10">
          Press & recognition
        </h2>

        <div className="flex flex-wrap gap-3">
          {defaultMentions.map((mention) => (
            <a
              key={mention.label}
              href={mention.href}
              target="_blank"
              rel="noopener noreferrer"
              className={pillClass}
            >
              {mention.label}
            </a>
          ))}

          {showMore &&
            moreMentions.map((mention) => (
              <a
                key={mention.label}
                href={mention.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${pillClass} animate-[fadeIn_0.3s_ease_both]`}
              >
                {mention.label}
              </a>
            ))}
        </div>

        <button
          onClick={() => setShowMore((prev) => !prev)}
          className="mt-6 flex items-center gap-2 text-[13px] font-medium text-[#0673FF] hover:text-[#0560d6] transition-colors"
        >
          {showMore ? (
            <>
              Show less
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </>
          ) : (
            <>
              See {moreMentions.length} more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default function ImpactPageClient() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>(".impact-reveal")
    );
    const revealAll = () =>
      revealEls.forEach((el) => el.classList.add("impact-revealed"));

    const fillBars = () => {
      const before = document.getElementById("income-before");
      const after = document.getElementById("income-after");
      if (before && after) {
        before.style.width = "15%";
        after.style.width = "100%";
      }
    };

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      revealAll();
      fillBars();
      return;
    }

    // threshold 0 so blocks taller than the screen (common when stacked on
    // mobile) still reveal as soon as they appear.
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("impact-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          fillBars();
          barObserver.disconnect();
        });
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    const incomeSection = document.getElementById("income-impact");
    if (incomeSection) barObserver.observe(incomeSection);

    // Safety nets: never leave content or the income bars stuck hidden.
    const revealFallback = window.setTimeout(revealAll, 1400);
    const barFallback = window.setTimeout(fillBars, 2000);

    return () => {
      revealObserver.disconnect();
      barObserver.disconnect();
      window.clearTimeout(revealFallback);
      window.clearTimeout(barFallback);
    };
  }, []);

  return (
    <div className="bg-white text-[#101928]">
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen bg-[#101928] pt-28 pb-16 px-6 md:px-10 lg:px-16 flex flex-col justify-center items-center relative overflow-hidden">
        {/* ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="impact-glow impact-glow-1" />
          <span className="impact-glow impact-glow-2" />
        </div>
        {/* Centered text content */}
        <div className="relative text-center max-w-3xl mx-auto mb-10 lg:mb-14">
          <span className="impact-reveal inline-block mb-6 px-5 py-2 rounded-full border border-white/25 text-white/90 text-[12px] tracking-[0.12em] uppercase font-medium">
            Driving change across Nigeria
          </span>

          <h1 className="impact-reveal impact-delay-1 impact-display text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-bold leading-[1.12] mb-6">
            Mobility that{" "}
            <em className="not-italic text-[#5AA2FF]">lifts people</em> and
            protects the planet.
          </h1>

          <p className="impact-reveal impact-delay-2 text-white/70 text-[15px] md:text-[17px] font-light leading-[1.75] max-w-[560px] mx-auto">
            We believe every journey should create opportunity for drivers, for
            women, and for communities. Here is the impact Muvment by Autogirl
            is building.
          </p>
        </div>

        {/* Stat cards row */}
        <div className="relative w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { value: "60+", label: "Women trained free" },
            { value: "567%", label: "Driver income growth" },
            { value: "200+", label: "Drivers empowered" },
            { value: "7", label: "SDGs addressed" },
            { value: "#1", label: "EV fleet on ride-hailing in Nigeria" },
          ].map((stat, i) => (
            <div
              key={stat.value}
              className="impact-reveal bg-white rounded-2xl px-5 py-5 flex flex-col items-center justify-center text-center min-h-[110px] last:col-span-2 sm:last:col-span-1"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-[2rem] font-bold text-[#101928] leading-none"><CountUp value={stat.value} /></p>
              <p className="text-[11px] text-gray-500 font-normal mt-2 leading-[1.4]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* scroll cue */}
        <div
          aria-hidden="true"
          className="hidden md:flex justify-center absolute bottom-6 left-0 right-0 text-white/40"
        >
          <svg
            className="impact-scroll-cue"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* METRICS ROW */}
      <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="impact-reveal grid sm:grid-cols-2 lg:grid-cols-5 border border-gray-200/80 rounded-2xl overflow-hidden">
            {metricCards.map((metric) => (
              <div
                key={metric.value}
                className="p-6 border-r last:border-r-0 border-b lg:border-b-0 border-gray-200/80 relative bg-white flex flex-col items-center justify-center text-center min-h-[160px] transition-colors duration-300 hover:bg-gray-50"
              >
                <span className={`absolute left-0 top-0 h-[3px] w-full ${metric.color}`} />
                <p className="text-[1.75rem] font-bold leading-tight mb-3 text-[#101928] break-words">
                  <CountUp value={metric.value} />
                </p>
                <p className="text-[12px] leading-5 text-gray-500 font-normal">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section className="px-6 md:px-10 lg:px-16 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
            What we stand for
          </p>
          <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#101928] mb-4">
            Four pillars of{" "}
            <em className="not-italic text-[#0673FF]">lasting impact</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-[560px] leading-[1.75] font-light">
            Every programme we run is anchored to a real-world problem and a
            measurable outcome.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.id}
                className={`group impact-reveal impact-delay-${Math.min(index + 1, 4)} border border-gray-200/80 rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`${pillar.headerBg} p-8 relative`}>
                  <span className={`absolute right-6 top-4 text-[4rem] font-bold opacity-[0.08] leading-none select-none ${pillar.numberColor}`}>
                    {pillar.id}
                  </span>
                  <span
                    className={`${pillar.iconBg} inline-flex h-11 w-11 items-center justify-center rounded-[10px] mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <PillarIcon id={pillar.id} />
                  </span>
                  <h3 className={`text-[1.3rem] font-bold leading-[1.25] ${pillar.titleColor}`}>
                    {pillar.title}
                  </h3>
                </div>
                <div className="p-8">
                  <p className="text-[14.5px] leading-[1.75] font-light mb-6 text-gray-600">
                    {pillar.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] font-medium px-3 py-1 rounded-full tracking-[0.04em] ${pillar.tagBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT IN FOCUS (kept intact) */}
      <section className="bg-gray-50 border-y border-gray-200/80 px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
            Impact in focus
          </p>
          <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#101928] mb-4 max-w-3xl">
            Stories from the <em className="not-italic text-[#0673FF]">ground</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-2xl leading-8">
            Grants, electric fleets, and workshop training. Each programme shows up in real rooms,
            on real roads, with people we are proud to stand beside.
          </p>

          <div className="mt-14 lg:mt-20 space-y-20 lg:space-y-28">
            {impactStories.map((story, index) => (
              <article
                key={story.title}
                className={`impact-reveal grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${index === 1 ? "impact-delay-2" : index === 2 ? "impact-delay-3" : ""}`}
              >
                <div
                  className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EAE8E2] shadow-[0_28px_64px_-16px_rgba(28,28,28,0.35)] ring-1 ring-black/6 ${story.reverse ? "lg:order-2" : ""}`}
                >
                  <Image
                    src={story.imageSrc}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    priority={index === 0}
                  />
                </div>
                <div
                  className={`space-y-5 ${story.reverse ? "lg:order-1 lg:pr-6" : "lg:pl-2"}`}
                >
                  <span
                    className={`inline-block h-1 w-14 rounded-full ${story.accentBar}`}
                    aria-hidden
                  />
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                    {story.eyebrow}
                  </p>
                  <h3 className="text-3xl lg:text-[2.125rem] font-bold leading-tight text-[#101928]">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 leading-8 text-sm lg:text-[15px]">{story.body}</p>
                  <p className="text-xs text-gray-400 tracking-wide">{story.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INCOME JOURNEY */}
      <section id="income-impact" className="bg-[#1D2739] text-white px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: heading and income comparison */}
            <div>
              <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-white/60 mb-3">
                The economic case
              </p>
              <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] mb-4">
                From ₦75k to{" "}
                <span className="text-[#5AA2FF]">₦500k</span>
                <br />a month.
              </h2>
              <p className="impact-reveal impact-delay-2 text-white/80 leading-[1.75] font-light">
                Access to a vehicle isn&apos;t a luxury; it&apos;s infrastructure.
                Our lease-to-own model gives drivers the tool they need to build
                real income, with a clear pathway to ownership.
              </p>

              <div className="impact-reveal mt-10">
              <p className="text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
                Before Muvment
              </p>
              <div className="bg-white/8 rounded-lg h-[52px] overflow-hidden">
                <div
                  id="income-before"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-white/15 flex items-center px-4 text-xl font-bold text-white/60"
                >
                  <CountUp value="₦75,000" />
                </div>
              </div>

              <div className="flex items-center gap-3 my-4">
                <span className="flex-1 h-px bg-[#0673FF]/30" />
                <span className="text-[13px] font-medium text-[#5AA2FF]">
                  +<CountUp value="567" />% income growth
                </span>
                <span className="flex-1 h-px bg-[#0673FF]/30" />
              </div>

              <p className="text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
                With Muvment
              </p>
              <div className="bg-white/8 rounded-lg h-[52px] overflow-hidden">
                <div
                  id="income-after"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-[#0673FF] flex items-center px-4 text-xl font-bold text-white"
                >
                  <CountUp value="₦500,000" />
                </div>
              </div>
              <p className="text-[13px] text-white/40 mt-6 font-light">
                Average monthly driver earnings. Pathway to vehicle ownership included.
              </p>
            </div>
            </div>

            <div className="impact-reveal impact-delay-2 flex flex-col gap-6">
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16202b] border-[#101928]">
                <p className="text-xl font-bold text-white mb-2">Lease-to-own</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Drivers earn from day one while steadily working toward
                  ownership, no large upfront capital required.
                </p>
              </div>
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16202b] border-[#0673FF]">
                <p className="text-xl font-bold text-white mb-2">Electric vehicles</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Lower fuel and maintenance costs than ICE vehicles mean more
                  of every fare stays in the driver&apos;s pocket.
                </p>
              </div>
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#16202b] border-[#0673FF]">
                <p className="text-xl font-bold text-white mb-2">Ride-hailing ready</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Vehicles are placed directly on Bolt, Uber and other
                  platforms; drivers start earning immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
            Real outcomes
          </p>
          <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#101928] mb-10">
            The people behind
            <br />
            the <em className="not-italic text-[#0673FF]">numbers</em>
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`impact-reveal impact-delay-${i + 1} bg-white border border-gray-200/80 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-block w-4 h-0.5 bg-[#0673FF] rounded" />
                  <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-[#0673FF]">
                    {t.tag}
                  </p>
                </div>
                <blockquote className="italic text-[15px] text-[#101928] leading-[1.65] mb-4 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="text-[13px] font-medium text-[#101928] mb-4">
                  {t.name}
                </p>
                <div className="border-t border-gray-200/80 pt-4">
                  <p className="text-[13px] text-gray-600 font-light leading-[1.55]">
                    <span className="font-medium text-[#101928]">Outcome: </span>
                    {t.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG ALIGNMENT */}
      <section className="bg-white px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
            UN Sustainable Development Goals
          </p>
          <h2 className="impact-reveal impact-delay-1 impact-display text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#101928] mb-4">
            Our <em className="not-italic text-[#0673FF]">SDG alignment</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-[560px] leading-[1.75] font-light">
            Every programme we run is directly mapped to global development goals,
            because local impact and global accountability are not separate ambitions.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {sdgs.map(([num, title, desc], i) => (
              <div
                key={num}
                className="impact-reveal bg-gray-50 border border-gray-200/80 rounded-xl p-5 flex gap-3 transition-colors duration-300 hover:border-[#0673FF]/40 hover:bg-white"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className="text-[1.6rem] font-bold leading-none flex-shrink-0 w-9 text-[#101928]">
                  {num}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#101928]">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-5 font-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS & RECOGNITION */}
      <PressSection />

      {/* BOOK NOW CTA */}
      <section className="bg-white px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#0673FF] mb-3">
            Ride with purpose
          </p>
          <h2 className="impact-reveal impact-delay-1 impact-display text-[#101928] text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] mb-5">
            Every ride moves{" "}
            <em className="not-italic text-[#0673FF]">someone</em> forward.
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 text-[15px] md:text-[17px] font-light leading-[1.7] max-w-[560px] mx-auto mb-8">
            Book a Muvment ride today and put your everyday journeys behind
            cleaner mobility, higher driver incomes, and women building careers
            in transport.
          </p>
          <div className="impact-reveal impact-delay-3 flex justify-center">
            <Link
              href="/booking/search"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0673FF] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-[#0560d6] sm:w-auto"
            >
              Book a ride
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .impact-display {
          font-family: var(--font-impact-playfair), Georgia, "Times New Roman",
            serif;
          letter-spacing: -0.01em;
        }
        .impact-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.32;
          pointer-events: none;
        }
        .impact-glow-1 {
          width: 420px;
          height: 420px;
          background: #0673ff;
          top: -90px;
          left: -60px;
          animation: impactFloat1 16s ease-in-out infinite;
        }
        .impact-glow-2 {
          width: 360px;
          height: 360px;
          background: #5aa2ff;
          bottom: -110px;
          right: -50px;
          animation: impactFloat2 20s ease-in-out infinite;
        }
        @keyframes impactFloat1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, 30px);
          }
        }
        @keyframes impactFloat2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, -40px);
          }
        }
        .impact-scroll-cue {
          animation: impactBounce 2.4s ease-in-out infinite;
        }
        @keyframes impactBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .impact-glow-1,
          .impact-glow-2,
          .impact-scroll-cue {
            animation: none;
          }
        }
        .impact-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .impact-revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .impact-delay-1 {
          transition-delay: 0.1s;
        }
        .impact-delay-2 {
          transition-delay: 0.2s;
        }
        .impact-delay-3 {
          transition-delay: 0.3s;
        }
        .impact-delay-4 {
          transition-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
