import VehicleDetailsClient from "@/components/pagesComponent/VehicleDetailsClient ";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
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
  const slug = resolvedParams.id;

  try {
    const vehicle = await VehicleSearchService.getVehicleBySlug(slug);

    if (!vehicle) {
      return generatePageMetadata({
        title: "Vehicle Not Found",
        description: "The requested vehicle could not be found.",
        url: `/booking/details/${slug}`,
      });
    }

    const title = `${vehicle.name} - Rent in ${vehicle.city || "Nigeria"}`;
    const description = `Rent ${vehicle.name} (${vehicle.year}) in ${
      vehicle.city || "Nigeria"
    } with a professional chauffeur. ${vehicle.vehicleTypeName?.replaceAll(
      "_",
      " "
    )} seating ${
      vehicle.numberOfSeats
    }. Hourly, daily, and monthly hire on Muvment.`;

    return generatePageMetadata({
      title,
      titleAbsolute: true,
      description,
      keywords: [
        vehicle.vehicleMakeName,
        vehicle.vehicleModelName,
        `${vehicle.name} rental`,
        vehicle.city,
        "car rental Nigeria",
      ],
      url: `/booking/details/${slug}`,
      image: vehicle.photos?.[0]?.cloudinaryUrl || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return generatePageMetadata({
      title: "Vehicle Details",
      description: "View detailed information about this rental vehicle.",
      url: `/booking/details/${slug}`,
    });
  }
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  try {
    const vehicle = await VehicleSearchService.getVehicleBySlug(slug);

    if (!vehicle) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-xl text-red-600 mb-4">Vehicle not found</p>
        </div>
      );
    }

    return (
      <>
        <JsonLd schema={SchemaBuilder.vehicle(vehicle, slug)} />
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
