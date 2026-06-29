import React from "react";
import { PartnerService } from "@/controllers/partner/partnerService";
import { generatePageMetadata } from "@/helpers/metadata";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import PartnersDirectory from "@/components/pagesComponent/partner-ship/PartnersDirectory";
import { PaginatedPartnerResponse } from "@/components/pagesComponent/partner-ship/types/partner";

export const dynamic = "force-dynamic";

const emptyData: PaginatedPartnerResponse = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true,
  first: true,
};

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Our Partners",
    description:
      "Browse the hotels, venues and brands that partner with Muvment for vehicle rentals across Nigeria, each with a dedicated fleet for their guests.",
    url: "/partnership",
    keywords: [
      "Muvment partners",
      "Hotel car rental Nigeria",
      "Partner fleet",
      "Federal Palace Hotel",
    ],
  });
}

export default async function PartnershipDirectoryPage() {
  const data = (await PartnerService.getAllActivePartners("", 0, 12)) || emptyData;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PartnersDirectory initialData={data} />
      <Footer />
    </div>
  );
}
