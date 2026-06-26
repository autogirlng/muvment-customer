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
  const partner = await PartnerService.getPartnerBySlug(resolvedParams.slug);

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

export default async function PartnershipPage({ params }: PageProps) {
  const resolvedParams = await params;

  const [partner, priorityResponse, otherResponse] = await Promise.all([
    PartnerService.getPartnerBySlug(resolvedParams.slug),
    PartnerService.getPriorityVehicles(resolvedParams.slug, 0, 6),
    PartnerService.getOtherVehicles(resolvedParams.slug, 0, 6),
  ]);

  if (!partner) {
    notFound();
  }

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
      />

      <Footer />
    </div>
  );
}
