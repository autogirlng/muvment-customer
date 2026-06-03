
import { PartnerWithUs } from "@/components/partnerwithUs/Main";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "Partner With Us",
  description:
    "Join Muvment by Autogirl as a corporate partner. Get API access, dedicated virtual accounts, and advanced booking management tools to power your business.",
  keywords: [
    "Muvment corporate partnership",
    "Autogirl business partner",
    "car rental API Nigeria",
    "corporate booking platform",
    "business integration Muvment",
    "fleet management Nigeria",
    "corporate travel solutions",
  ],
  url: "/partner-with-us",
});

export default function PartnerWithUsPage() {
  return (
    <>
      <JsonLd
        schema={SchemaBuilder.genericWebPage({
          path: "/partner-with-us",
          name: "Partner With Us",
          description:
            "Partner with Muvment by Autogirl. API access, dedicated virtual accounts, corporate booking management for businesses across Nigeria.",
        })}
      />
      <PartnerWithUs />
    </>
  );
}
