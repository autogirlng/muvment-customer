import ContactUsClient from "@/components/pagesComponent/ContactUsClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Muvment by Autogirl. We're here to help with your car rental needs. Visit us at Victoria Island, Lagos or reach out via phone, email, or social media.",
  keywords: [
    "contact Autogirl",
    "Muvment contact",
    "car rental support Nigeria",
    "Autogirl customer service",
    "Lagos car rental contact",
    "Victoria Island",
  ],
  url: "/contact-us",
});

export default function ContactUsPage() {
  return (
    <>
      <JsonLd schema={SchemaBuilder.contactPage()} />
      <ContactUsClient />
    </>
  );
}
