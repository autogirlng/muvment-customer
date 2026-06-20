import { Suspense } from "react";
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
  const { yearRangeId, id } = await params;
  const slug = id;
  try {
    const pricingData =
      await ServicePricingService.getServicePricingBySlug(slug);
    if (!pricingData) {
      return generatePageMetadata({
        title: "Service Pricing Not Found",
        description:
          "This service pricing is no longer available. Explore Muvment's verified rental cars with professional chauffeurs and current rates for hourly, daily, and monthly hire.",
        url: `/booking/${slug}/special-pricing`,
      });
    }
    const prices = Array.isArray(pricingData.prices) ? pricingData.prices : [];
    const images = Array.isArray(pricingData.imageUrl)
      ? pricingData.imageUrl
      : [];

    const lowestPrice =
      prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : 0;

    const title = `${pricingData.servicePricingName} - ${pricingData.minYear}-${pricingData.maxYear}`;

    const description = `${pricingData.name} - ${
      pricingData.rideType
    } service for vehicles from ${pricingData.minYear} to ${
      pricingData.maxYear
    }. Starting from NGN ${lowestPrice.toLocaleString()}. ${
      prices.length
    } pricing option${prices.length > 1 ? "s" : ""} available.`;

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
      url: `/booking/${slug}/special-pricing`,
      image: images[0] || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    return generatePageMetadata({
      title: "Service Pricing Details",
      description:
        "We couldn't load this service pricing right now. Explore Muvment's verified rental cars with professional chauffeurs and rates for hourly, daily, and monthly hire.",
      url: `/booking/${slug}/special-pricing`,
    });
  }
}

export default function ServicePricingDetailsPage() {
  return (
    <Suspense fallback={null}>
      <ServicePricingDetailsClient />
    </Suspense>
  );
}
