import ImpactPageClient from "@/components/pagesComponent/ImpactPageClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "Our Impact",
  description:
    "See how Muvment by Autogirl raises driver incomes, trains women for mobility careers, and leads Nigeria's EV ride-hailing fleet, mapped to the UN SDGs.",
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
  return (
    <>
      <JsonLd
        schema={SchemaBuilder.genericWebPage({
          path: "/impact",
          name: "Our Impact",
          description:
            "How Muvment by Autogirl drives social and environmental impact through mobility: lifting driver incomes, training women, and leading Nigeria's EV fleet.",
        })}
      />
      <ImpactPageClient />
    </>
  );
}
