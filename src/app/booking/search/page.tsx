import ExploreVehiclesClient from "@/components/pagesComponent/ExploreVehiclesClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { parseVehicleOrderBy } from "@/constants/vehicleSearchOrder";
import { VehicleSearchParams } from "@/types/vehicle";

interface PageProps {
  searchParams: Promise<{
    city?: string;
    location?: string;
    category?: string;
    fromDate?: string;
    untilDate?: string;
    lat?: string;
    lng?: string;
    bookingType?: string;
    startTime?: string;
    endTime?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const city = params.city || params.location || "Lagos";
  const categoryName = params.category;

  let title = `Rent Cars in ${city}`;
  if (categoryName) {
    title = `${categoryName} for Rent in ${city}`;
  }

  let description = `Browse verified rental cars in ${city} with Muvment. Compare sedans, SUVs, and luxury vehicles with professional chauffeurs. Hourly, daily, and monthly hire.`;

  if (params.fromDate && params.untilDate) {
    description = `Rent cars in ${city} from ${params.fromDate} to ${params.untilDate}. ${description}`;
  }

  return generatePageMetadata({
    title,
    description,
    url: `/booking/search?city=${city}`,
  });
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const [typesRes, makesRes, modelsRes, featuresRes, statesRes] =
    await Promise.all([
      VehicleSearchService.getVehicleTypes().catch(() => []),
      VehicleSearchService.getVehicleMakes().catch(() => []),
      VehicleSearchService.getVehicleModels().catch(() => []),
      VehicleSearchService.getVehicleFeatures().catch(() => []),
      VehicleSearchService.getStates().catch(() => []),
    ]);

  const orderByParam = Array.isArray(params.orderBy)
    ? params.orderBy[0]
    : params.orderBy;

  const searchArgs: VehicleSearchParams = {
    page: 0,
    size: 20,
    orderBy: parseVehicleOrderBy(orderByParam),
    city: params.city || params.location,
    vehicleTypeId: params.category,
    latitude: params.lat ? parseFloat(params.lat) : undefined,
    longitude: params.lng ? parseFloat(params.lng) : undefined,
    bookingTypeId: params.bookingType,
    startTime: params.startTime,
    endTime: params.endTime,
  };

  if (params.make)
    searchArgs.vehicleMakeId = Array.isArray(params.make)
      ? params.make[0]
      : params.make;
  if (params.model)
    searchArgs.vehicleModelId = Array.isArray(params.model)
      ? params.model[0]
      : params.model;
  if (params.minPrice)
    searchArgs.minPrice = parseInt(
      Array.isArray(params.minPrice) ? params.minPrice[0] : params.minPrice,
    );
  if (params.maxPrice)
    searchArgs.maxPrice = parseInt(
      Array.isArray(params.maxPrice) ? params.maxPrice[0] : params.maxPrice,
    );

  let initialVehicles = [];
  let totalCount = 0;
  let recommendedVehicles = [];

  try {
    const response = await VehicleSearchService.searchVehicles(searchArgs);
    initialVehicles = response?.data?.data?.content || [];
    totalCount = response?.data?.data?.totalElements || initialVehicles.length;

    if (initialVehicles.length === 0) {
      const recResponse = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
        bookingTypeId: params.bookingType,
        orderBy: searchArgs.orderBy,
      });
      recommendedVehicles = recResponse?.data?.data?.content || [];
    }
  } catch (err) {
    console.error("Failed to fetch vehicles on server:", err);
  }

  const city = params.city || params.location || "Lagos";

  return (
    <>
      <JsonLd
        schema={SchemaBuilder.searchResultsPage({
          city,
          category: params.category,
        })}
      />
      <ExploreVehiclesClient
        initialVehicles={initialVehicles}
        initialTotalCount={totalCount}
        initialRecommended={recommendedVehicles}
        initialVehicleTypes={typesRes || []}
        initialMakes={makesRes || []}
        initialModels={modelsRes || []}
        initialFeatures={featuresRes || []}
        initialStates={statesRes || []}
      />
    </>
  );
}
