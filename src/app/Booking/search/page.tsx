import ExploreVehiclesClient from "@/components/pagesComponent/ExploreVehiclesClient";
import { generatePageMetadata } from "@/helpers/metadata";

interface PageProps {
  searchParams: Promise<{
    city?: string;
    location?: string;
    category?: string;
    fromDate?: string;
    untilDate?: string;
    [key: string]: string | undefined;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  // AWAIT searchParams before accessing properties
  const params = await searchParams;

  const city = params.city || params.location || "Lagos";
  const categoryName = params.category;

  // Build dynamic title
  let title = `Rent Cars in ${city}`;
  if (categoryName) {
    title = `${categoryName} for Rent in ${city}`;
  }

  // Build dynamic description
  let description = `Browse verified rental vehicles in ${city}. Flexible pricing, instant booking, and quality cars for business, trips, and daily mobility.`;

  if (params.fromDate && params.untilDate) {
    description = `Rent cars in ${city} from ${params.fromDate} to ${params.untilDate}. ${description}`;
  }

  return generatePageMetadata({
    title,
    description,
    keywords: [
      `car rental ${city}`,
      `rent a car ${city}`,
      city,
      "vehicle hire",
      "car booking",
    ],
    url: `/Booking/search?city=${city}`,
  });
}

export default function ExploreVehiclesPage() {
  return <ExploreVehiclesClient />;
}
