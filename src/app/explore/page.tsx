import ExploreVehiclesClient from "@/components/pagesComponent/ExploreVehiclesClient";
import { generatePageMetadata } from "@/helpers/metadata";

interface PageProps {
  searchParams: {
    city?: string;
    location?: string;
    category?: string;
    fromDate?: string;
    untilDate?: string;
    [key: string]: string | undefined;
  };
}

export function generateMetadata({ searchParams }: PageProps) {
  const city = searchParams.city || searchParams.location || "Lagos";
  const categoryName = searchParams.category;

  let title = `Rent Cars in ${city}`;
  if (categoryName) {
    title = `${categoryName} for Rent in ${city}`;
  }

  let description = `Browse verified rental vehicles in ${city}.`;

  if (searchParams.fromDate && searchParams.untilDate) {
    description = `Rent cars in ${city} from ${searchParams.fromDate} to ${searchParams.untilDate}. ${description}`;
  }

  return generatePageMetadata({
    title,
    description,
    url: `/booking/search?city=${city}`,
  });
}

export default function Page() {
  return <ExploreVehiclesClient />;
}
