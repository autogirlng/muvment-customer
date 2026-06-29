import React from "react";
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiGlobe,
  FiClock,
  FiHome,
  FiCheckCircle,
} from "react-icons/fi";
import {
  Partner,
  PaginatedVehicleResponse,
} from "@/components/pagesComponent/partner-ship/types/partner";
import PaginatedVehicleList from "./PaginatedVehicleList";

interface PartnershipDetailsProps {
  partner: Partner;
  priorityData: PaginatedVehicleResponse;
  otherData: PaginatedVehicleResponse;
  searchCity?: string;
  priorityIds?: string[];
}

const prettyType = (type: string) =>
  String(type || "")
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const VALUE_POINTS = [
  {
    icon: FiHome,
    title: "Stationed on site",
    text: "A dedicated fleet kept at the property, ready when you are.",
  },
  {
    icon: FiClock,
    title: "Hourly and airport",
    text: "Book by the hour or as an airport transfer, whatever the trip needs.",
  },
  {
    icon: FiCheckCircle,
    title: "Chauffeured and vetted",
    text: "Professional drivers and inspected vehicles on every ride.",
  },
];

export default function PartnerShip({
  partner,
  priorityData,
  otherData,
  searchCity,
  priorityIds,
}: PartnershipDetailsProps) {
  const hasNoVehicles =
    (!priorityData.content || priorityData.content.length === 0) &&
    (!otherData.content || otherData.content.length === 0);

  const states = (partner.operatingStates || []).map((s) => s.name);

  const partnerBookingParams: Record<string, string> = {
    partnerLock: "1",
    partnerId: partner.id,
    partnerName: partner.name,
    partnerAddress: partner.address || "",
  };
  if (partner.latitude != null && partner.longitude != null) {
    partnerBookingParams.partnerLat = String(partner.latitude);
    partnerBookingParams.partnerLng = String(partner.longitude);
  }

  return (
    <main className="flex-1 pb-20">
      <section className="relative h-[460px] w-full overflow-hidden md:h-[520px]">
        <img
          src={partner.imageUrl}
          alt={partner.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
          {partner.partnerType && (
            <span className="mb-4 inline-flex w-fit items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0673FF] backdrop-blur-sm">
              {prettyType(partner.partnerType)}
            </span>
          )}
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {partner.name}
          </h1>
          {partner.address && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/85">
              <FiMapPin className="flex-shrink-0" />
              <span>{partner.address}</span>
            </div>
          )}
          <div className="mt-7">
            <a
              href="#fleet"
              className="inline-flex items-center justify-center rounded-xl bg-[#0673ff] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0560d6]"
            >
              Book a car
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {VALUE_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0673FF]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101928]">
                    {point.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{point.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div
        id="fleet"
        className="mx-auto max-w-7xl space-y-12 px-4 pt-12 sm:px-6 lg:px-8"
      >
        <PaginatedVehicleList
          initialData={priorityData}
          slug={partner.slug}
          type="priority"
          title={`Available at ${partner.name}`}
          featured={true}
          bookingParams={partnerBookingParams}
        />
        <PaginatedVehicleList
          initialData={otherData}
          slug={partner.slug}
          type="other"
          title="More vehicles"
          subtitle={`Browse the rest of the fleet in ${partner.name}'s city`}
          searchCity={searchCity}
          excludeIds={priorityIds}
          sortFeaturedFirst={true}
          bookingParams={partnerBookingParams}
        />
        {hasNoVehicles && (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              No vehicles currently available for this partner.
            </p>
          </div>
        )}
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-[#101928]">
          About {partner.name}
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {partner.description && (
              <p className="text-sm leading-relaxed text-gray-600">
                {partner.description}
              </p>
            )}

            {states.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Operating states
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {states.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#0673FF]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 text-gray-700">
                <FiMapPin className="flex-shrink-0 text-[#0673FF]" />
                <span className="text-sm">{partner.address}</span>
              </div>
              {partner.contactEmail && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMail className="flex-shrink-0 text-[#0673FF]" />
                  <span className="text-sm">{partner.contactEmail}</span>
                </div>
              )}
              {partner.contactPhone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FiPhone className="flex-shrink-0 text-[#0673FF]" />
                  <span className="text-sm">{partner.contactPhone}</span>
                </div>
              )}
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#0673FF] hover:underline"
                >
                  <FiGlobe className="flex-shrink-0" />
                  <span className="text-sm">Visit website</span>
                </a>
              )}
            </div>
          </div>

          <div className="h-[260px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm lg:h-auto">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${partner.latitude},${partner.longitude}`}
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
