import StateExploreVehiclesClient from "@/components/pagesComponent/StateExploreVehiclesClient";
import { generatePageMetadata } from "@/helpers/metadata";
import { VehicleSearchService } from "@/controllers/booking/vechicle";

interface PageProps {
  params: Promise<{ stateId: string }>;
  searchParams: Promise<{
    stateName?: string;
    countryName?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { stateId } = await params;
  const query = await searchParams;
  const stateName = query.stateName || "destination";

  return generatePageMetadata({
    title: `Vehicles to ${stateName}`,
    description: `Browse private cars and SUVs available for travel to ${stateName}.`,
    url: `/booking/states/${stateId}?stateName=${encodeURIComponent(stateName)}`,
  });
}

export default async function StateExplorePage({
  params,
  searchParams,
}: PageProps) {
  const { stateId } = await params;
  const query = await searchParams;
  const stateName = query.stateName || "your destination";
  const countryName = query.countryName;

  let initialVehicles: any[] = [];
  let totalCount = 0;

  try {
    const response = await VehicleSearchService.searchVehiclesByState(
      stateId,
      0,
      20,
    );
    initialVehicles = response?.data?.data?.content || [];
    totalCount =
      response?.data?.data?.totalElements || initialVehicles.length;
  } catch (err) {
    console.error("Failed to fetch state vehicles on server:", err);
  }

  return (
    <StateExploreVehiclesClient
      stateId={stateId}
      stateName={stateName}
      countryName={countryName}
      initialVehicles={initialVehicles}
      initialTotalCount={totalCount}
    />
  );
}
