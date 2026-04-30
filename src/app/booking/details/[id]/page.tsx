import VehicleDetailsClient from "@/components/pagesComponent/VehicleDetailsClient ";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { generatePageMetadata } from "@/helpers/metadata";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const vehicleData = await VehicleSearchService.getVehicleById(id);
    const vehicle = vehicleData[0]?.data;

    if (!vehicle) {
      return generatePageMetadata({
        title: "Vehicle Not Found",
        description: "The requested vehicle could not be found.",
        url: `/booking/details/${id}`,
      });
    }

    const title = `${vehicle.name} - Rent in ${vehicle.city || "Nigeria"}`;
    const features = vehicle.vehicleFeatures?.slice(0, 3).join(", ") || "";
    const description = `Rent ${vehicle.name} (${vehicle.year}) in ${
      vehicle.city
    }. ${vehicle.vehicleTypeName?.replaceAll("_", " ")} with ${
      vehicle.numberOfSeats
    } seats. Book instantly with flexible pricing.`;

    return generatePageMetadata({
      title,
      description,
      keywords: [
        vehicle.vehicleMakeName,
        vehicle.vehicleModelName,
        `${vehicle.name} rental`,
        vehicle.city,
        "car rental Nigeria",
      ],
      url: `/booking/details/${id}`,
      image: vehicle.photos?.[0]?.cloudinaryUrl || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return generatePageMetadata({
      title: "Vehicle Details",
      description: "View detailed information about this rental vehicle.",
      url: `/booking/details/${id}`,
    });
  }
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const vehicleData = await VehicleSearchService.getVehicleById(id);
    const vehicle = vehicleData[0]?.data;

    if (!vehicle) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-xl text-red-600 mb-4">Vehicle not found</p>
        </div>
      );
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Car",
      name: vehicle.name,
      description:
        vehicle.description || `Rent a ${vehicle.name} in ${vehicle.city}`,
      image: vehicle.photos?.map((photo: any) => photo.cloudinaryUrl) || [],
      vehicleModelDate: vehicle.year,
      manufacturer: {
        "@type": "Organization",
        name: vehicle.vehicleMakeName,
      },
      seatingCapacity: vehicle.numberOfSeats,
      offers: {
        "@type": "Offer",
        priceCurrency: "NGN",
        price:
          vehicle.allPricingOptions?.length > 0
            ? Math.min(
                ...vehicle.allPricingOptions.map((opt: any) => opt.price),
              )
            : 0,
        availability: "https://schema.org/InStock",
        url: `https://www.muvment.ng/booking/details/${id}`,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <VehicleDetailsClient initialVehicleData={vehicle} />
      </>
    );
  } catch (error) {
    console.error("Error generating page:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-xl text-red-600 mb-4">
          Failed to load vehicle details
        </p>
      </div>
    );
  }
}
