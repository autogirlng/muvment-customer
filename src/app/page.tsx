import type { Metadata } from "next";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import HomePage from "@/components/HomeComponent/HomePage";

export const metadata: Metadata = generatePageMetadata({
  title: "Rent a Car in Nigeria's Top Cities",
  description:
    "Muvment by Autogirl helps you rent cars easily for business, trips, events, and daily mobility across Nigeria. Flexible pricing. Verified cars. Fast booking.",
  url: "/",
});

export default function Page() {
  return (
    <>
      <JsonLd schema={SchemaBuilder.homePage()} />
      <JsonLd schema={SchemaBuilder.faqPage()} />
      <HomePage />
    </>
  );
}
