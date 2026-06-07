import Link from "next/link";
import ServicePricingDetailsClient from "@/components/Booking/Servicepricingdetailsclient";
import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { generatePageMetadata } from "@/helpers/metadata";

interface PageProps {
  params: Promise<{
    yearRangeId: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { yearRangeId, id: slug } = await params;

  try {
    const pricingData =
      await ServicePricingService.getServicePricingBySlug(slug);

    if (!pricingData) {
      return generatePageMetadata({
        title: "Service Pricing Not Found",
        description:
          "This service pricing is no longer available. Explore Muvment's verified rental cars with professional chauffeurs and current rates for hourly, daily, and monthly hire.",
        url: `/booking/special-pricing/${slug}`,
      });
    }

    const prices = Array.isArray(pricingData.prices) ? pricingData.prices : [];
    const images = Array.isArray(pricingData.imageUrl)
      ? pricingData.imageUrl
      : [];
    const lowestPrice =
      prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : 0;
    const title = `${pricingData.servicePricingName} - ${pricingData.minYear}-${pricingData.maxYear}`;
    const description = `${pricingData.name} - ${pricingData.rideType} service for vehicles from ${pricingData.minYear} to ${pricingData.maxYear}. Starting from NGN ${lowestPrice.toLocaleString()}. ${prices.length} pricing option${prices.length > 1 ? "s" : ""} available.`;

    return generatePageMetadata({
      title,
      description,
      keywords: [
        pricingData.servicePricingName,
        pricingData.rideType,
        `${pricingData.minYear}-${pricingData.maxYear}`,
        "service pricing",
        "vehicle rental",
        "booking options",
      ],
      url: `/service-pricing/details/${yearRangeId}/${slug}`,
      image: images[0] || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    return generatePageMetadata({
      title: "Service Pricing Details",
      description:
        "We couldn't load this service pricing right now. Explore Muvment's verified rental cars with professional chauffeurs and rates for hourly, daily, and monthly hire.",
      url: `/service-pricing/details/${yearRangeId}/${slug}`,
    });
  }
}

export default async function ServicePricingDetailsPage({ params }: PageProps) {
  const { id: slug } = await params;
  const pricingData = await ServicePricingService.getServicePricingBySlug(slug);

  return (
    <main>
      {pricingData && (
        <div className="sr-only">
          <h1>{pricingData.servicePricingName} Special Pricing</h1>
          <p>
            Explore exclusive special pricing for the{" "}
            {pricingData.servicePricingName} {pricingData.rideType} service.
            Vehicles range from {pricingData.minYear} to {pricingData.maxYear}.
            Secure your affordable, verified rental car today.
          </p>
          <nav>
            <Link href="/">Back to Home</Link>
            <Link href="/explore">Explore More Vehicles</Link>
          </nav>
        </div>
      )}
      <ServicePricingDetailsClient initialData={pricingData} />
    </main>
  );
}
