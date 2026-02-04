import ServicePricingDetailsClient from "@/components/Booking/Servicepricingdetailsclient";
import { ServicePricingService } from "@/controllers/booking/Servicepricingservice ";
import { generatePageMetadata } from "@/helpers/metadata";

interface PageProps {
  params: Promise<{
    yearRangeId: string;
    servicePricingId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { yearRangeId, servicePricingId } = await params;

  try {
    const pricingData =
      await ServicePricingService.getServicePricingById(servicePricingId);

    if (!pricingData) {
      return generatePageMetadata({
        title: "Service Pricing Not Found",
        description: "The requested service pricing could not be found.",
        url: `/service-pricing/details/${yearRangeId}/${servicePricingId}`,
      });
    }

    // ✅ Normalize arrays ONCE
    const prices = Array.isArray(pricingData.prices) ? pricingData.prices : [];

    const images = Array.isArray(pricingData.sampleImages)
      ? pricingData.sampleImages
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
      url: `/service-pricing/details/${yearRangeId}/${servicePricingId}`,
      image: images[0] || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    return generatePageMetadata({
      title: "Service Pricing Details",
      description:
        "View detailed information about this service pricing option.",
      url: `/service-pricing/details/${yearRangeId}/${servicePricingId}`,
    });
  }
}

export default function ServicePricingDetailsPage() {
  return <ServicePricingDetailsClient />;
}
