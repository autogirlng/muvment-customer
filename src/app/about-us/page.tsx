import AboutUsClient from "@/components/pagesComponent/AboutUsClient";
import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "About Us",
  description:
    "Learn about Muvment by Autogirl - Nigeria's premier car rental service. Discover our mission to provide exceptional vehicle rental experiences with quality cars, transparent pricing, and outstanding customer service in Lagos and beyond.",
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
  return <AboutUsClient />;
}
