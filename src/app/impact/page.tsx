import ImpactPageClient from "@/components/pagesComponent/ImpactPageClient";
import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Our Impact",
  description:
    "See how Muvment by Autogirl lifts driver incomes, trains women in mobility careers, and leads Nigeria's EV ride-hailing fleet — mapped to the UN Sustainable Development Goals.",
  keywords: [
    "Muvment impact",
    "Autogirl social impact",
    "EV fleet Nigeria",
    "driver income Nigeria",
    "Autowomen programme",
    "sustainable mobility Lagos",
    "SDG alignment",
  ],
  url: "/impact",
});

export default function ImpactPage() {
  return <ImpactPageClient />;
}
