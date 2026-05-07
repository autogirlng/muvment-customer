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
    caption: "Grant presentation · Lagos",
    imageSrc: "/images/autowomen_empowerment_grant.png",
    imageAlt:
      "Group celebrating AutoWomen Empowerment Grant cheques with Access Bank and AutoGIRL branding",
    accentBar: "bg-[#C8963E]",
    reverse: false,
  },
  {
    eyebrow: "Fleet & livelihoods",
    title: "Electric vehicle drivers",
    body: "Uniformed drivers stand with Nigeria's first large-scale EV fleet on ride-hailing platforms — a visible commitment to professional earnings, lower running costs, and clean kilometres across Lagos.",
    caption: "Muvment EV fleet · driver rollout",
    imageSrc: "/images/electric_vehicle_drivers.png",
    imageAlt: "Professional drivers in uniform beside a row of white electric vehicles",
    accentBar: "bg-[#1A6B47]",
    reverse: true,
  },
  {
    eyebrow: "Skills & hands-on training",
    title: "Women at the workshop",
    body: "Through the Autowomen Empowerment Programme, women train alongside our partners in active workshops, gaining technical confidence and employable skills.",
    caption: "Autowomen trainees · workshop placement",
    imageSrc: "/images/women_at_workshop.png",
    imageAlt: "Group of smiling women posing inside an automotive repair workshop",
    accentBar: "bg-[#C4522A]",
    reverse: false,
  },
] as const;

const metricCards = [
  {
    value: "₦500k",
    label: "Average monthly driver income with Muvment — up from ₦75,000",
    color: "bg-[#1A6B47]",
  },
  {
    value: "60+",
    label: "Women trained free in driving, mechanics and affiliate sales",
    color: "bg-[#C8963E]",
  },
  {
    value: "Nigeria's 1st",
    label: "Large-scale EV fleet deployed on ride-hailing platforms",
    color: "bg-[#1A4B7A]",
  },
  {
    value: "3 managers",
    label: "Programme graduates promoted to management within one year",
    color: "bg-[#C4522A]",
  },
];

const pillars = [
  {
    id: "01",
    title: "Driver income & vehicle ownership",
    body: "Through our lease-to-own and rent-to-earn electric vehicle programme, micro-entrepreneur drivers gain access to clean, modern vehicles lifting average monthly earnings from ₦75,000 to ₦500,000 and placing ownership within reach for the first time.",
    tags: ["SDG 1 — No poverty"],
    headerBg: "bg-[#E8F5EE]",
    iconBg: "bg-[#1A6B47]",
  },
  {
    id: "02",
    title: "Clean mobility & carbon reduction",
    body: "By placing electric cars directly on ride-hailing apps, Muvment displaces high-emission trips at scale — reducing carbon output per kilometre while expanding clean mobility access across Lagos.",
    tags: [
      "SDG 7 — Clean energy",
      "SDG 11 — Sustainable cities",
      "SDG 13 — Climate action",
    ],
    headerBg: "bg-[#E8EFF8]",
    iconBg: "bg-[#1A4B7A]",
  },
  {
    id: "03",
    title: "Autowomen Empowerment Programme",
    body: "In partnership with UAC, Ayomatics Mechanics and others, we offered 60 women free training and certification in professional driving, car repair, and affiliate sales — with paid internships upon completion.",
    tags: [
      "SDG 4 — Quality education",
      "SDG 5 — Gender equality",
      "SDG 8 — Decent work",
    ],
    headerBg: "bg-[#FAEEE8]",
    iconBg: "bg-[#C4522A]",
  },
  {
    id: "04",
    title: "Female Drivers Outreach",
    body: "We ran a community outreach to spotlight the daily experiences and resilience of female drivers. We amplified their voices and delivered cash gifts and food packages as direct welfare support.",
    tags: ["SDG 5 — Gender equality", "SDG 10 — Reduced inequalities"],
    headerBg: "bg-[#FBF3E4]",
    iconBg: "bg-[#C8963E]",
  },
];

const sdgs = [
  ["1", "No poverty", "Driver income from ₦75k → ₦500k/month", "#C4522A"],
  ["4", "Quality education", "Free certified skills training for women", "#C4522A"],
  ["5", "Gender equality", "Autowomen programme & female driver outreach", "#C4522A"],
  ["7", "Clean energy", "EV fleet replacing fossil fuel ride-hailing vehicles", "#1A6B47"],
  ["8", "Decent work", "Lease-to-own model and paid internships", "#C8963E"],
  ["10", "Reduced inequalities", "Expanding income access for underserved drivers", "#C8963E"],
  ["11", "Sustainable cities", "Low-carbon urban mobility infrastructure", "#1A4B7A"],
  ["13", "Climate action", "Displacing ICE vehicles on Lagos ride-hailing apps", "#1A6B47"],
];

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
      { threshold: 0.15 },
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
    <div className="bg-[#FAFAF7] text-[#1C1C1C]">
      <Navbar />

      <section className="min-h-screen bg-[#0A0A0A] pt-28 pb-16 px-4 md:px-10 lg:px-16 flex items-end relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_80%_30%,rgba(26,107,71,0.35),transparent_70%),radial-gradient(ellipse_45%_60%_at_10%_70%,rgba(200,150,62,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-6xl w-full mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.18em] font-medium text-[#2D9B67] mb-4">
            Driving change across Nigeria
          </p>
          <h1 className="impact-reveal impact-delay-1 font-[var(--font-impact-playfair)] text-[#FAFAF7] text-4xl lg:text-7xl leading-[1.05] max-w-4xl mb-6">
            Mobility that <em className="italic text-[#C8963E]">lifts people</em>
            <br />
            and protects the planet.
          </h1>
          <p className="impact-reveal impact-delay-2 text-[#FAFAF7]/70 max-w-2xl text-base lg:text-lg leading-8">
            We believe every journey should create opportunity — for drivers, for
            women, and for communities. Here is the impact Muvment by Autogirl
            is building.
          </p>

          <div className="impact-reveal impact-delay-3 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-[var(--font-impact-playfair)] text-4xl text-white">60+</p>
              <p className="text-xs text-white/60 mt-1">Women trained free</p>
            </div>
            <div>
              <p className="font-[var(--font-impact-playfair)] text-4xl text-white">567%</p>
              <p className="text-xs text-white/60 mt-1">Driver income growth</p>
            </div>
            <div>
              <p className="font-[var(--font-impact-playfair)] text-4xl text-white">#1</p>
              <p className="text-xs text-white/60 mt-1">EV fleet on ride-hailing in Nigeria</p>
            </div>
            <div>
              <p className="font-[var(--font-impact-playfair)] text-4xl text-white">7</p>
              <p className="text-xs text-white/60 mt-1">SDGs addressed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F2EC] px-4 md:px-10 lg:px-16 py-14">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 border border-[#E2E0D8] rounded-2xl overflow-hidden">
          {metricCards.map((metric) => (
            <div key={metric.value} className="p-8 border-r last:border-r-0 border-b sm:border-b-0 border-[#E2E0D8] relative">
              <span className={`absolute left-0 top-0 h-[3px] w-full ${metric.color}`} />
              <p className="font-[var(--font-impact-playfair)] text-4xl leading-none mb-3">
                {metric.value}
              </p>
              <p className="text-sm leading-6 text-[#6B6B5E]">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#6B6B5E] mb-3">
            What we stand for
          </p>
          <h2 className="impact-reveal impact-delay-1 font-[var(--font-impact-playfair)] text-3xl lg:text-5xl leading-tight mb-4">
            Four pillars of <em className="italic text-[#1A6B47]">lasting impact</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-[#6B6B5E] max-w-2xl leading-8">
            Every programme we run is anchored to a real-world problem and a
            measurable outcome.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.id}
                className={`impact-reveal impact-delay-${Math.min(index + 1, 4)} border border-[#E2E0D8] rounded-2xl overflow-hidden bg-white`}
              >
                <div className={`${pillar.headerBg} p-8 relative`}>
                  <span className="absolute right-6 top-4 font-[var(--font-impact-playfair)] text-6xl opacity-10">
                    {pillar.id}
                  </span>
                  <span
                    className={`${pillar.iconBg} inline-flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg`}
                  >
                    ✦
                  </span>
                  <h3 className="font-[var(--font-impact-playfair)] text-2xl mt-4 leading-tight max-w-md">
                    {pillar.title}
                  </h3>
                </div>
                <div className="p-8">
                  <p className="text-[#6B6B5E] leading-7 text-sm">{pillar.body}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-[#F4F2EC] text-[#1C1C1C]"
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

      <section className="bg-[#FAFAF7] border-y border-[#E8E6DE] px-4 md:px-10 lg:px-16 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#6B6B5E] mb-3">
            Impact in focus
          </p>
          <h2 className="impact-reveal impact-delay-1 font-[var(--font-impact-playfair)] text-3xl lg:text-5xl leading-tight mb-4 max-w-3xl">
            Stories from the <em className="italic text-[#1A4B7A]">ground</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-[#6B6B5E] max-w-2xl leading-8">
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
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B6B5E]">
                    {story.eyebrow}
                  </p>
                  <h3 className="font-[var(--font-impact-playfair)] text-3xl lg:text-[2.125rem] leading-tight text-[#1C1C1C]">
                    {story.title}
                  </h3>
                  <p className="text-[#5C5C54] leading-8 text-sm lg:text-[15px]">{story.body}</p>
                  <p className="text-xs text-[#9C9A8F] tracking-wide">{story.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="income-impact" className="bg-[#0A0A0A] text-white px-4 md:px-10 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-white/50 mb-3">
            The economic case
          </p>
          <h2 className="impact-reveal impact-delay-1 font-[var(--font-impact-playfair)] text-3xl lg:text-5xl leading-tight mb-4">
            From ₦75k to <em className="italic text-[#2D9B67]">₦500k</em> a month.
          </h2>
          <p className="impact-reveal impact-delay-2 text-white/65 max-w-2xl leading-8">
            Access to a vehicle is infrastructure. Our lease-to-own model gives
            drivers the tool they need to build real income, with a clear
            pathway to ownership.
          </p>

          <div className="grid lg:grid-cols-2 gap-10 mt-12">
            <div className="impact-reveal">
              <p className="text-xs uppercase tracking-[0.1em] text-white/45 mb-2">
                Before Muvment
              </p>
              <div className="bg-white/10 rounded-lg h-12 overflow-hidden">
                <div
                  id="income-before"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-white/30 flex items-center px-4 font-[var(--font-impact-playfair)] text-lg text-white/80"
                >
                  ₦75,000
                </div>
              </div>

              <p className="text-center text-[#C8963E] my-4 text-sm">+567% income growth</p>

              <p className="text-xs uppercase tracking-[0.1em] text-white/45 mb-2">
                With Muvment
              </p>
              <div className="bg-white/10 rounded-lg h-12 overflow-hidden">
                <div
                  id="income-after"
                  className="h-full w-0 transition-[width] duration-[1600ms] ease-out bg-[#2D9B67] flex items-center px-4 font-[var(--font-impact-playfair)] text-lg text-white"
                >
                  ₦500,000
                </div>
              </div>
            </div>

            <div className="impact-reveal impact-delay-2 space-y-6">
              <div className="border-l-2 border-[#2D9B67] pl-4">
                <p className="font-[var(--font-impact-playfair)] text-3xl">Lease-to-own</p>
                <p className="text-sm text-white/60 mt-1">
                  Drivers earn from day one while steadily working toward ownership
                  with no large upfront capital required.
                </p>
              </div>
              <div className="border-l-2 border-[#C8963E] pl-4">
                <p className="font-[var(--font-impact-playfair)] text-3xl">Electric vehicles</p>
                <p className="text-sm text-white/60 mt-1">
                  Lower fuel and maintenance costs mean more of each fare stays
                  in the driver&apos;s pocket.
                </p>
              </div>
              <div className="border-l-2 border-[#C4522A] pl-4">
                <p className="font-[var(--font-impact-playfair)] text-3xl">Ride-hailing ready</p>
                <p className="text-sm text-white/60 mt-1">
                  Vehicles are placed directly on Bolt, Uber and similar
                  platforms so drivers can start earning immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F2EC] px-4 md:px-10 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="impact-reveal text-[11px] uppercase tracking-[0.16em] text-[#6B6B5E] mb-3">
            UN Sustainable Development Goals
          </p>
          <h2 className="impact-reveal impact-delay-1 font-[var(--font-impact-playfair)] text-3xl lg:text-5xl mb-4">
            Our <em className="italic text-[#1A6B47]">SDG alignment</em>
          </h2>
          <p className="impact-reveal impact-delay-2 text-[#6B6B5E] max-w-3xl leading-8">
            Every programme we run is directly mapped to global development goals,
            because local impact and global accountability are not separate ambitions.
          </p>

          <div className="impact-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {sdgs.map(([num, title, desc, color]) => (
              <div key={num} className="bg-white border border-[#E2E0D8] rounded-xl p-5 flex gap-3">
                <span
                  className="font-[var(--font-impact-playfair)] text-3xl leading-none min-w-8"
                  style={{ color }}
                >
                  {num}
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-[#6B6B5E] mt-1 leading-5">{desc}</p>
                </div>
              </div>
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
