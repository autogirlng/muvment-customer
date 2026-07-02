import ExploreVehiclesClient from "@/components/pagesComponent/ExploreVehiclesClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { JsonLd, SchemaBuilder } from "@/helpers/schema";
import { VehicleSearchService } from "@/controllers/booking/vechicle";
import { getBookingOption } from "@/context/Constarain";
import { parseVehicleOrderBy } from "@/constants/vehicleSearchOrder";
import { VehicleSearchParams } from "@/types/vehicle";

interface PageProps {
  searchParams: Promise<{
    city?: string;
    location?: string;
    category?: string;
    categoryName?: string;
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
  const categoryName = params.categoryName;

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

  const [typesRes, makesRes, modelsRes, featuresRes, bookingOpts] =
    await Promise.all([
      VehicleSearchService.getVehicleTypes().catch(() => []),
      VehicleSearchService.getVehicleMakes().catch(() => []),
      VehicleSearchService.getVehicleModels().catch(() => []),
      VehicleSearchService.getVehicleFeatures().catch(() => []),
      getBookingOption().catch(() => ({
        rawBookingOptions: [],
        dropdownOptions: [],
      })),
    ]);

  const monthlyTypeId =
    (bookingOpts?.rawBookingOptions || []).find((t: any) =>
      String(t?.name || "")
        .toLowerCase()
        .includes("month"),
    )?.id || "";
  const isMonthly = !!params.bookingType && params.bookingType === monthlyTypeId;

  const orderByParam = Array.isArray(params.orderBy)
    ? params.orderBy[0]
    : params.orderBy;

  const searchArgs: VehicleSearchParams = {
    page: 0,
    size: 20,
    orderBy: parseVehicleOrderBy(orderByParam),
    // Only filter by city when an explicit city was provided. The location
    // string is a full place name and is not a city, so it must not be used
    // here; the search is already scoped by latitude, longitude and radius.
    city: params.city,
    vehicleTypeId: params.category,
    latitude: params.lat ? parseFloat(params.lat) : undefined,
    longitude: params.lng ? parseFloat(params.lng) : undefined,
    bookingTypeId: params.bookingType,
    startTime: params.startTime,
    endTime: params.endTime,
    startDate: Array.isArray(params.startDate)
      ? params.startDate[0]
      : params.startDate,
    endDate: Array.isArray(params.endDate) ? params.endDate[0] : params.endDate,
  };

  // A monthly browse must not be gated on a single day's availability. Showing
  // the list dateless surfaces every monthly-capable car; the specific month is
  // confirmed at selection where the real per-day check runs.
  if (isMonthly) {
    searchArgs.startDate = undefined;
    searchArgs.endDate = undefined;
    searchArgs.startTime = undefined;
    searchArgs.endTime = undefined;
  }

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
  let recommendedNearby = false;

  try {
    const response = await VehicleSearchService.searchVehicles(searchArgs);
    initialVehicles = response?.data?.data?.content || [];
    totalCount = response?.data?.data?.totalElements || initialVehicles.length;

    if (initialVehicles.length === 0) {
      // Keep recommendations in the searched area using the city field, which
      // is reliable even when a vehicle's coordinates are missing or wrong.
      // Relax the narrowing filters (dates, price, type) but never surface a
      // car from another city.
      const recCity = params.city || params.location;
      const recResponse = await VehicleSearchService.searchVehicles({
        page: 0,
        size: 6,
        city: Array.isArray(recCity) ? recCity[0] : recCity,
        bookingTypeId: params.bookingType,
        orderBy: searchArgs.orderBy,
      });
      recommendedVehicles = recResponse?.data?.data?.content || [];

      // If the searched area has no cars at all, fall back to the nearest cars
      // by distance so the page is not empty. These are flagged as nearby.
      if (
        recommendedVehicles.length === 0 &&
        searchArgs.latitude &&
        searchArgs.longitude
      ) {
        const nearbyResponse = await VehicleSearchService.searchVehicles({
          page: 0,
          size: 6,
          latitude: searchArgs.latitude,
          longitude: searchArgs.longitude,
          radiusInKm: 500,
          bookingTypeId: params.bookingType,
          orderBy: searchArgs.orderBy,
        });
        recommendedVehicles = nearbyResponse?.data?.data?.content || [];
        recommendedNearby = recommendedVehicles.length > 0;
      }
    }
  } catch (err) {
    console.error("Failed to fetch vehicles on server:", err);
  }

  const city = params.city || params.location || "Lagos";

  return (
    <>
      <JsonLd schema={SchemaBuilder.searchResultsPage({ city, category: params.categoryName })} />
      <ExploreVehiclesClient
        initialVehicles={initialVehicles}
        initialTotalCount={totalCount}
        initialRecommended={recommendedVehicles}
        initialRecommendedNearby={recommendedNearby}
        initialVehicleTypes={typesRes || []}
        initialMakes={makesRes || []}
        initialModels={modelsRes || []}
        initialFeatures={featuresRes || []}
      />
    </>
  );
}
