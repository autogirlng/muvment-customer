import AboutUsClient from "@/components/pagesComponent/AboutUsClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "About Us",
  description:
    "Learn about Muvment by Autogirl, Nigeria's premier car rental service, our mission, and how we deliver quality cars, transparent pricing, and great service.",
  keywords: [
    "about Autogirl",
    "Muvment car rental",
    "car rental Nigeria",
    "about us car rental Lagos",
    "vehicle rental company Nigeria",
    "Autogirl mission",
    "car hire Lagos",
    "reliable car rental Nigeria",
  ],
  url: "/about-us",
});

export default function AboutUsPage() {
  return (
    <>
      <JsonLd schema={SchemaBuilder.aboutPage()} />
      <AboutUsClient />
    </>
  );
}
