import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "FAQ",
  description:
    "Get answers to the most common questions about booking a car on Muvment: rental periods, pricing, drivers, vehicles, payments, and our policies.",
  url: "/faq",
  keywords: [
    "Muvment FAQ",
    "Car rental questions Nigeria",
    "How to book a car Lagos",
    "Car rental pricing Nigeria",
    "Chauffeur FAQs",
    "Muvment help",
  ],
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
