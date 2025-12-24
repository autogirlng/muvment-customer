import VehicleDetailsClient from "@/components/pagesComponent/VehicleDetailsClient ";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { generatePageMetadata } from "@/helpers/metadata";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  // AWAIT params FIRST before accessing any properties
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // Now use the awaited id
    const vehicleData = await VehicleSearchService.getVehicleById(id);
    const vehicle = vehicleData[0]?.data;

    if (!vehicle) {
      return generatePageMetadata({
        title: "Vehicle Not Found",
        description: "The requested vehicle could not be found.",
        url: `/Booking/details/${id}`,
      });
    }

    // Build dynamic title and description
    const title = `${vehicle.name} - Rent in ${vehicle.city || "Nigeria"}`;

    const features = vehicle.vehicleFeatures?.slice(0, 3).join(", ") || "";
    const description = `Rent ${vehicle.name} (${vehicle.year}) in ${
      vehicle.city
    }. ${vehicle.vehicleTypeName?.replaceAll("_", " ")} with ${
      vehicle.numberOfSeats
    } seats. ${
      features ? `Features: ${features}.` : ""
    } Book instantly with flexible pricing.`;

    return generatePageMetadata({
      title,
      description,
      keywords: [
        vehicle.vehicleMakeName,
        vehicle.vehicleModelName,
        `${vehicle.name} rental`,
        `rent ${vehicle.vehicleTypeName?.replaceAll("_", " ")}`,
        vehicle.city,
        "car rental Nigeria",
      ],
      url: `/Booking/details/${id}`,
      image: vehicle.photos?.[0]?.cloudinaryUrl || "/images/image1.png",
      type: "website",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Use the already awaited id here too
    return generatePageMetadata({
      title: "Vehicle Details",
      description: "View detailed information about this rental vehicle.",
      url: `/Booking/details/${id}`,
    });
  }
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsClient />;
}
