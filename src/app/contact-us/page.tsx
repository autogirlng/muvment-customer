import ContactUsClient from "@/components/pagesComponent/ContactUsClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Muvment by Autogirl for your car rental needs. Visit us at 16 Bankole Street, Oregun, Ikeja, Lagos, or reach us by phone, email, or social.",
  keywords: [
    "contact Autogirl",
    "Muvment contact",
    "car rental support Nigeria",
    "Autogirl customer service",
    "Lagos car rental contact",
    "Oregun Ikeja",
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
