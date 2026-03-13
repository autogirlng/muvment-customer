
import { PartnerWithUs } from "@/components/partnerwithUs/Main";
import { generatePageMetadata } from "@/helpers/metadata";

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
  url: "/partner",
});

export default function PartnerWithUsPage() {
  return <PartnerWithUs />;
}