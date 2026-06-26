import React from "react";
import { FiMapPin, FiMail, FiPhone, FiGlobe } from "react-icons/fi";
import {
  Partner,
  PaginatedVehicleResponse,
} from "@/components/pagesComponent/partner-ship/types/partner";
import PaginatedVehicleList from "./PaginatedVehicleList";

interface PartnershipDetailsProps {
  partner: Partner;
  priorityData: PaginatedVehicleResponse;
  otherData: PaginatedVehicleResponse;
}

export default function PartnerShip({
  partner,
  priorityData,
  otherData,
}: PartnershipDetailsProps) {
  const hasNoVehicles =
    (!priorityData.content || priorityData.content.length === 0) &&
    (!otherData.content || otherData.content.length === 0);

  return (
    <main className="flex-1 pb-20">
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 flex-shrink-0">
              <div className="relative h-[250px] lg:h-[300px] w-full rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={partner.imageUrl}
                  alt={partner.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm">
                  <span className="text-xs font-bold text-[#0673FF] tracking-wider uppercase">
                    {partner.partnerType}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {partner.name}
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiMapPin className="text-[#0673FF] flex-shrink-0" />
                    <span className="text-sm">{partner.address}</span>
                  </div>
                  {partner.contactEmail && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiMail className="text-[#0673FF] flex-shrink-0" />
                      <span className="text-sm">{partner.contactEmail}</span>
                    </div>
                  )}
                  {partner.contactPhone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiPhone className="text-[#0673FF] flex-shrink-0" />
                      <span className="text-sm">{partner.contactPhone}</span>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-3 text-[#0673FF] hover:underline">
                      <FiGlobe className="flex-shrink-0" />
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-[220px] sm:h-[280px] md:h-auto md:flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-200">
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
          </div>
        </div>
      </div>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        <PaginatedVehicleList
          initialData={priorityData}
          slug={partner.slug}
          type="priority"
          title="At the premises"
          featured={true}
        />
        <PaginatedVehicleList
          initialData={otherData}
          slug={partner.slug}
          type="other"
          title="Vehicles Near you"
          subtitle={`Browse the rest of the fleet from ${partner.name}`}
        />
        {hasNoVehicles && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-lg">
              No vehicles currently available for this partner.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
