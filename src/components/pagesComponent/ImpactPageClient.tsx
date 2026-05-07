"use client";

import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import Image from "next/image";
import { useEffect } from "react";

const impactStories = [
  {
    eyebrow: "Partnership & grants",
    title: "AutoWomen Empowerment Grant",
    body: "We celebrated women advancing in mobility. Three recipients each received ₦250,000 toward their goals, surrounded by teammates including representatives from our electric vehicle driver programme.",
    caption: "Grant presentation · Lagos - July 16, 2025",
    imageSrc: "/images/autowomen_empowerment_grant.png",
    imageAlt:
      "Group celebrating AutoWomen Empowerment Grant cheques with Access Bank and AutoGIRL branding",
    accentBar: "bg-blue-600",
    reverse: false,
  },
  {
    eyebrow: "Fleet & livelihoods",
    title: "Electric vehicle drivers",
    body: "Uniformed drivers stand with Nigeria's first large-scale EV fleet on ride-hailing platforms — a visible commitment to professional earnings, lower running costs, and clean kilometres across Lagos.",
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
    accentBar: "bg-[#2c3e50]",
    reverse: false,
  },
] as const;

const metricCards = [
  {
    value: "₦500k",
    label: "Average monthly driver income with Muvment — up from ₦75,000",
    color: "bg-[#1D2739]",
  },
  {
    value: "60+",
    label: "Women trained free in driving, mechanics and affiliate sales",
    color: "bg-blue-600",
  },
  {
    value: "Nigeria's 1st",
    label: "Large-scale EV fleet deployed on ride-hailing platforms",
    color: "bg-[#2c3e50]",
  },
  {
    value: "3 managers",
    label: "Programme graduates promoted to management within one year",
    color: "bg-blue-600",
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
    body: "Through our lease-to-own and rent-to-earn electric vehicle programme, micro-entrepreneur drivers gain access to clean, modern vehicles lifting average monthly earnings from ₦75,000 to ₦500,000 and placing ownership within reach for the first time.",
    tags: ["SDG 1 — No poverty"],
    headerBg: "bg-gray-50",
    iconBg: "bg-blue-600",
    tagBg: "bg-blue-50 text-blue-700",
    titleColor: "text-[#2c3e50]",
    numberColor: "text-[#2c3e50]",
    dark: false,
  },
  {
    id: "02",
    title: "Clean mobility & carbon reduction",
    body: "By placing electric cars directly on ride-hailing apps, Muvment displaces high-emission trips at scale — reducing carbon output per kilometre while expanding clean mobility access across Lagos. We displace approximately 660kg of CO₂ per day.",
    tags: [
      "SDG 7 — Clean energy",
      "SDG 11 — Sustainable cities",
      "SDG 13 — Climate action",
    ],
    headerBg: "bg-[#1D2739]",
    iconBg: "bg-white/10",
    tagBg: "bg-white/10 text-white/80",
    titleColor: "text-white",
    numberColor: "text-white",
    dark: true,
  },
  {
    id: "03",
    title: "Autowomen Empowerment Programme",
    body: "In partnership with UAC, Ayomatics Mechanics and others, we offered 60 women free training and certification in professional driving, car repair, and affiliate sales — with paid internships upon completion. Three graduates won external cash grants. Seven became team leads. Three were promoted to manager within one year.",
    tags: [
      "SDG 4 — Quality education",
      "SDG 5 — Gender equality",
      "SDG 8 — Decent work",
    ],
    headerBg: "bg-[#2c3e50]",
    iconBg: "bg-white/10",
    tagBg: "bg-white/10 text-white/80",
    titleColor: "text-white",
    numberColor: "text-white",
    dark: true,
  },
  {
    id: "04",
    title: "Female Drivers Outreach",
    body: "We ran a community outreach to spotlight the daily experiences, struggles, and resilience of female drivers — women who show up in one of Nigeria's toughest professions, often unseen. We heard their stories, amplified their voices, and delivered cash gifts and food packages as direct welfare support.",
    tags: ["SDG 5 — Gender equality", "SDG 10 — Reduced inequalities"],
    headerBg: "bg-blue-50",
    iconBg: "bg-blue-600",
    tagBg: "bg-blue-50 text-blue-700",
    titleColor: "text-[#2c3e50]",
    numberColor: "text-[#2c3e50]",
    dark: false,
  },
];

const sdgs = [
  ["1", "No poverty", "Driver income from ₦75k → ₦500k/month", "#2563eb"],
  ["4", "Quality education", "Free certified skills training for women", "#1D2739"],
  ["5", "Gender equality", "Autowomen programme & female driver outreach", "#2563eb"],
  ["7", "Clean energy", "EV fleet replacing fossil fuel ride-hailing vehicles", "#1D2739"],
  ["8", "Decent work", "Lease-to-own model and paid internships", "#2563eb"],
  ["10", "Reduced inequalities", "Expanding income access for underserved drivers", "#1D2739"],
  ["11", "Sustainable cities", "Low-carbon urban mobility infrastructure", "#2563eb"],
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
      "I used to borrow a car and give most of what I earned back to the owner. Now I'm driving toward owning mine — I can pay my children's school fees and feed my family. Thank you Muvment.",
    name: "Mark Abuh",
    outcome:
      "Drivers on the Muvment lease-to-own programme earn an average of ₦500,000 monthly — up from ₦75,000 — with a clear path to ownership.",
  },
];

const pressMentions = [
  "CNN Africa",
  "The Guardian Nigeria",
  "TechCabal × 3",
  "Vanguard News",
  "Tribune Online",
  "Aurora Tech Awards — Top 100 Globally 2026",
  "ELOY Awards — Young Innovative Entrepreneur 2024",
  "Grey UpGreyed Her Grant 2024",
  "GET Accelerator Top 3 · 2024",
  "25 Under 25 · 2024",
];

function PillarIcon({ id }: { id: string }) {
  if (id === "01") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (id === "02") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (id === "03") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ImpactPageClient() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("impact-revealed");
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".impact-reveal").forEach((el) => {
      revealObserver.observe(el);
    });

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const before = document.getElementById("income-before");
          const after = document.getElementById("income-after");
          if (before && after) {
            before.style.width = "15%";
            after.style.width = "100%";
          }
          barObserver.disconnect();
        });
      },
      { threshold: 0.3 },
    );

    const incomeSection = document.getElementById("income-impact");
    if (incomeSection) {
      barObserver.observe(incomeSection);
    }

    return () => {
      revealObserver.disconnect();
      barObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-white text-[#2c3e50]">
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen bg-[#1D2739] pt-28 pb-20 px-6 md:px-10 lg:px-16 flex items-end relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_30%,rgba(6,115,255,0.2),transparent_70%),radial-gradient(ellipse_40%_60%_at_10%_70%,rgba(26,107,71,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="hidden lg:flex absolute top-28 right-10 flex-col gap-2 impact-reveal impact-delay-3">
          <span className="text-[10px] font-medium tracking-[0.1em] px-3 py-1 rounded-full uppercase text-right bg-white/10 text-white/80 border border-white/20">
            SDG 5 — Gender equality
          </span>
          <span className="text-[10px] font-medium tracking-[0.1em] px-3 py-1 rounded-full uppercase text-right bg-white/10 text-white/80 border border-white/20">
            SDG 8 — Decent work
          </span>
          <span className="text-[10px] font-medium tracking-[0.1em] px-3 py-1 rounded-full uppercase text-right bg-blue-600/20 text-blue-300 border border-blue-500/30">
            SDG 11 — Sustainable cities
          </span>
          <span className="text-[10px] font-medium tracking-[0.1em] px-3 py-1 rounded-full uppercase text-right bg-white/10 text-white/80 border border-white/20">
            SDG 13 — Climate action
          </span>
        </div>

        <div className="relative max-w-6xl w-full mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400 mb-6">
            Driving change across Nigeria
          </p>
          <h1 className="impact-reveal impact-delay-1 text-white text-4xl lg:text-[5.5rem] font-bold leading-[1.05] max-w-4xl mb-6">
            Mobility that{" "}
            <em className="not-italic text-blue-400">lifts people</em>
            <br />
            and protects the planet.
          </h1>
          <p className="impact-reveal impact-delay-2 text-white/80 max-w-[520px] text-[17px] font-light leading-[1.75] mb-10">
            We believe every journey should create opportunity — for drivers, for
            women, and for communities. Here is the impact Muvment by Autogirl
            is building.
          </p>

          <div className="impact-reveal impact-delay-3 flex flex-wrap gap-8 lg:gap-10">
            <div>
              <p className="text-[2.2rem] font-bold text-white leading-none">60+</p>
              <p className="text-xs text-white/50 mt-1 font-light">Women trained free</p>
            </div>
            <div className="hidden sm:block w-px bg-white/10 self-stretch" />
            <div>
              <p className="text-[2.2rem] font-bold text-white leading-none">567%</p>
              <p className="text-xs text-white/50 mt-1 font-light">Driver income growth</p>
            </div>
            <div className="hidden sm:block w-px bg-white/10 self-stretch" />
            <div>
              <p className="text-[2.2rem] font-bold text-white leading-none">200+</p>
              <p className="text-xs text-white/50 mt-1 font-light">Drivers empowered</p>
            </div>
            <div className="hidden sm:block w-px bg-white/10 self-stretch" />
            <div>
              <p className="text-[2.2rem] font-bold text-white leading-none">#1</p>
              <p className="text-xs text-white/50 mt-1 font-light">EV fleet on ride-hailing in Nigeria</p>
            </div>
            <div className="hidden sm:block w-px bg-white/10 self-stretch" />
            <div>
              <p className="text-[2.2rem] font-bold text-white leading-none">7</p>
              <p className="text-xs text-white/50 mt-1 font-light">SDGs addressed</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-10 hidden lg:flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-white/30">
          <span className="w-10 h-px bg-white/30" />
          Scroll to explore
        </div>
      </section>

      {/* METRICS ROW */}
      <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="impact-reveal grid sm:grid-cols-2 lg:grid-cols-5 border border-gray-200 rounded-2xl overflow-hidden">
            {metricCards.map((metric) => (
              <div
                key={metric.value}
                className="p-8 lg:p-10 border-r last:border-r-0 border-b lg:border-b-0 border-gray-200 relative bg-white"
              >
                <span className={`absolute left-0 top-0 h-[3px] w-full ${metric.color}`} />
                <p className="text-[2.6rem] font-bold leading-none mb-3 text-[#2c3e50]">
                  {metric.value}
                </p>
                <p className="text-[13px] leading-6 text-gray-600 font-light">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section className="px-6 md:px-10 lg:px-16 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-blue-500 mb-3">
            What we stand for
          </p>
          <h2 className="impact-reveal impact-delay-1 text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#2c3e50] mb-4">
            Four pillars of{" "}
            <em className="not-italic text-blue-600">lasting impact</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-[560px] leading-[1.75] font-light">
            Every programme we run is anchored to a real-world problem and a
            measurable outcome.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.id}
                className={`impact-reveal impact-delay-${Math.min(index + 1, 4)} border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`${pillar.headerBg} p-8 relative`}>
                  <span className={`absolute right-6 top-4 text-[4rem] font-bold opacity-[0.08] leading-none select-none ${pillar.numberColor}`}>
                    {pillar.id}
                  </span>
                  <span
                    className={`${pillar.iconBg} inline-flex h-11 w-11 items-center justify-center rounded-[10px] mb-4`}
                  >
                    <PillarIcon id={pillar.id} />
                  </span>
                  <h3 className={`text-[1.3rem] font-bold leading-[1.25] ${pillar.titleColor}`}>
                    {pillar.title}
                  </h3>
                </div>
                <div className="p-8">
                  <p className={`text-[14.5px] leading-[1.75] font-light mb-6 ${pillar.dark ? "text-gray-600" : "text-gray-600"}`}>
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

      {/* IMPACT IN FOCUS — kept intact */}
      <section className="bg-gray-50 border-y border-gray-200 px-4 md:px-10 lg:px-16 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-blue-500 mb-3">
            Impact in focus
          </p>
          <h2 className="impact-reveal impact-delay-1 text-3xl lg:text-5xl font-bold leading-tight text-[#2c3e50] mb-4 max-w-3xl">
            Stories from the <em className="not-italic text-blue-600">ground</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-2xl leading-8">
            Grants, electric fleets, and workshop training — each programme shows up in real rooms,
            on real roads, with people we are proud to stand beside.
          </p>

          <div className="mt-14 lg:mt-20 space-y-20 lg:space-y-28">
            {impactStories.map((story, index) => (
              <article
                key={story.title}
                className={`impact-reveal grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${index === 1 ? "impact-delay-2" : index === 2 ? "impact-delay-3" : ""}`}
              >
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EAE8E2] shadow-[0_28px_64px_-16px_rgba(28,28,28,0.35)] ring-1 ring-black/6 ${story.reverse ? "lg:order-2" : ""}`}
                >
                  <Image
                    src={story.imageSrc}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
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
                  <h3 className="text-3xl lg:text-[2.125rem] font-bold leading-tight text-[#2c3e50]">
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
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-white/60 mb-3">
            The economic case
          </p>
          <h2 className="impact-reveal impact-delay-1 text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] mb-4">
            From ₦75k to{" "}
            <span className="text-blue-400">₦500k</span>
            <br />a month.
          </h2>
          <p className="impact-reveal impact-delay-2 text-white/80 max-w-[560px] leading-[1.75] font-light">
            Access to a vehicle isn&apos;t a luxury — it&apos;s infrastructure. Our
            lease-to-own model gives drivers the tool they need to build real
            income, with a clear pathway to ownership.
          </p>

          <div className="grid lg:grid-cols-2 gap-16 mt-14 items-start">
            <div className="impact-reveal">
              <p className="text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
                Before Muvment
              </p>
              <div className="bg-white/8 rounded-lg h-[52px] overflow-hidden">
                <div
                  id="income-before"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-white/15 flex items-center px-4 text-xl font-bold text-white/60"
                >
                  ₦75,000
                </div>
              </div>

              <div className="flex items-center gap-3 my-4">
                <span className="flex-1 h-px bg-blue-500/30" />
                <span className="text-[13px] font-medium text-blue-400">
                  +567% income growth
                </span>
                <span className="flex-1 h-px bg-blue-500/30" />
              </div>

              <p className="text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
                With Muvment
              </p>
              <div className="bg-white/8 rounded-lg h-[52px] overflow-hidden">
                <div
                  id="income-after"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-blue-600 flex items-center px-4 text-xl font-bold text-white"
                >
                  ₦500,000
                </div>
              </div>
              <p className="text-[13px] text-white/40 mt-6 font-light">
                Average monthly driver earnings. Pathway to vehicle ownership included.
              </p>
            </div>

            <div className="impact-reveal impact-delay-2 flex flex-col gap-6">
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 border-[#2c3e50]">
                <p className="text-xl font-bold text-white mb-2">Lease-to-own</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Drivers earn from day one while steadily working toward
                  ownership — no large upfront capital required.
                </p>
              </div>
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 border-blue-500">
                <p className="text-xl font-bold text-white mb-2">Electric vehicles</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Lower fuel and maintenance costs than ICE vehicles mean more
                  of every fare stays in the driver&apos;s pocket.
                </p>
              </div>
              <div className="bg-[#101928] rounded-2xl p-6 border-l-4 border-blue-500">
                <p className="text-xl font-bold text-white mb-2">Ride-hailing ready</p>
                <p className="text-[13px] font-light text-gray-300 leading-6">
                  Vehicles are placed directly on Bolt, Uber and other
                  platforms — drivers start earning immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-blue-500 mb-3">
            Real outcomes
          </p>
          <h2 className="impact-reveal impact-delay-1 text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#2c3e50] mb-12">
            The people behind
            <br />
            the <em className="not-italic text-blue-600">numbers</em>
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`impact-reveal impact-delay-${i + 1} bg-white border border-gray-200 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-block w-4 h-0.5 bg-blue-500 rounded" />
                  <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-blue-500">
                    {t.tag}
                  </p>
                </div>
                <blockquote className="italic text-[15px] text-[#2c3e50] leading-[1.65] mb-4 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="text-[13px] font-medium text-[#2c3e50] mb-4">
                  — {t.name}
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-[13px] text-gray-600 font-light leading-[1.55]">
                    <span className="font-medium text-[#2c3e50]">Outcome: </span>
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
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-blue-500 mb-3">
            UN Sustainable Development Goals
          </p>
          <h2 className="impact-reveal impact-delay-1 text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-[1.15] text-[#2c3e50] mb-4">
            Our <em className="not-italic text-blue-600">SDG alignment</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-gray-600 max-w-[560px] leading-[1.75] font-light">
            Every programme we run is directly mapped to global development goals —
            because local impact and global accountability are not separate ambitions.
          </p>

          <div className="impact-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {sdgs.map(([num, title, desc, color]) => (
              <div
                key={num}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex gap-3"
              >
                <span
                  className="text-[1.6rem] font-bold leading-none flex-shrink-0 w-9"
                  style={{ color }}
                >
                  {num}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#2c3e50]">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-5 font-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS & RECOGNITION */}
      <section className="bg-gray-50 px-6 md:px-10 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-blue-500 mb-3">
            As seen in
          </p>
          <h2 className="impact-reveal impact-delay-1 text-[2rem] font-bold leading-[1.15] text-[#2c3e50] mb-8">
            Press & recognition
          </h2>
          <div className="impact-reveal flex flex-wrap gap-3">
            {pressMentions.map((mention) => (
              <span
                key={mention}
                className="text-[13px] px-5 py-2 rounded-full border border-gray-200 text-gray-600 bg-white transition-all duration-200 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 cursor-default"
              >
                {mention}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
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
