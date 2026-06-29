import React from "react";
import { notFound } from "next/navigation";
import { PartnerService } from "@/controllers/partner/partnerService";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import PartnerShip from "@/components/pagesComponent/partner-ship/PartnerShip";
import { PaginatedVehicleResponse } from "@/components/pagesComponent/partner-ship/types/partner";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const emptyPagination: PaginatedVehicleResponse = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true,
  first: true,
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  let partner = null;
  try {
    partner = await PartnerService.getPartnerBySlug(resolvedParams.slug);
  } catch {
    partner = null;
  }

  if (!partner || !partner.name) {
    return generatePageMetadata({
      title: "Partner Not Found",
      description: "The partner page you are looking for does not exist.",
    });
  }

  return generatePageMetadata({
    title: `${partner.name} Partnership`,
    description:
      partner.description ||
      `Browse available vehicles and priority fleets from ${partner.name} in ${partner.address}.`,
    url: `/partnership/${resolvedParams.slug}`,
    image: partner.imageUrl,
    keywords: [partner.name, "Partner fleet", "Car rental", partner.address],
  });
}

function PartnerLoadError() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar showSearchBar={true} />
      <div className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="text-2xl font-bold text-[#101928]">
            We couldn&apos;t load this partner
          </h1>
          <p className="mt-3 text-gray-500">
            Something went wrong reaching our servers. Please try again.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href=""
              className="rounded-xl bg-[#0673ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0560d6]"
            >
              Try again
            </a>
            <a
              href="/partnership"
              className="rounded-xl border-2 border-[#0673ff] px-6 py-3 text-sm font-semibold text-[#0673ff] transition hover:bg-[#EAF2FF]"
            >
              All partners
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default async function PartnershipPage({ params }: PageProps) {
  const resolvedParams = await params;

  let partner = null;
  let priorityResponse: PaginatedVehicleResponse | null = null;
  let otherResponse: PaginatedVehicleResponse | null = null;
  let loadFailed = false;

  try {
    [partner, priorityResponse] = await Promise.all([
      PartnerService.getPartnerBySlug(resolvedParams.slug),
      PartnerService.getPriorityVehicles(resolvedParams.slug, 0, 6),
    ]);

    if (partner) {
      const states = (partner.operatingStates || [])
        .map((s) => s.name)
        .filter(Boolean);
      const addr = (partner.address || "").toLowerCase();
      const cityToken =
        states.find((s) => addr.includes(s.toLowerCase())) || states[0] || "";

      otherResponse = cityToken
        ? await PartnerService.getCityVehicles(cityToken, 0, 6)
        : await PartnerService.getOtherVehicles(resolvedParams.slug, 0, 6);
    }
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return <PartnerLoadError />;
  }

  if (!partner) {
    notFound();
  }

  const states = (partner.operatingStates || [])
    .map((s) => s.name)
    .filter(Boolean);
  const addr = (partner.address || "").toLowerCase();
  const cityToken =
    states.find((s) => addr.includes(s.toLowerCase())) || states[0] || "";
  const priorityIds = (priorityResponse?.content || []).map(
    (v: { id: string }) => v.id,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showSearchBar={true} />
      <div className="mt-22"></div>

      <JsonLd
        schema={SchemaBuilder.genericWebPage({
          path: `/partnership/${partner.slug}`,
          name: `${partner.name} Partnership`,
          description: partner.description,
        })}
      />

      <PartnerShip
        partner={partner}
        priorityData={priorityResponse || emptyPagination}
        otherData={otherResponse || emptyPagination}
        searchCity={cityToken}
        priorityIds={priorityIds}
      />

      <Footer />
    </div>
  );
}
