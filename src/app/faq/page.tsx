import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import FAQPageClient from "./FAQPageClient";

export default function FAQPage() {
  return (
    <>
      <JsonLd schema={SchemaBuilder.faqPage()} />
      <FAQPageClient />
    </>
  );
}
