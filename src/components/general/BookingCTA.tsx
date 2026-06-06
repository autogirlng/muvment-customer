"use client";

import { useRouter } from "next/navigation";

type BookingCTAProps = {
  className?: string;
};

function BookingCTA({ className = "" }: BookingCTAProps) {
  const router = useRouter();

  return (
    <section className={`px-4 pb-16 pt-4 ${className}`}>
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
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/15 blur-3xl"
          />

          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">
                Ready to ride with Muvment?
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-blue-50/90 sm:text-lg">
                Book a verified car with a professional driver in minutes. Pick
                your city, choose your dates, and we'll handle the rest.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                onClick={() => router.push("/booking/search")}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0673FF] shadow-sm transition-transform duration-200 hover:scale-[1.02] hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                Book a ride
              </button>
              <button
                onClick={() => router.push("/contact-us")}
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                Talk to our team
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookingCTA;
