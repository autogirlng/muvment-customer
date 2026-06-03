export type VehicleSearchOrderBy = "LOW_HIGH" | "HIGH_LOW";

export const DEFAULT_VEHICLE_ORDER_BY: VehicleSearchOrderBy = "LOW_HIGH";

export const VEHICLE_ORDER_BY_LABELS: Record<VehicleSearchOrderBy, string> = {
  LOW_HIGH: "Cheapest first",
  HIGH_LOW: "Most expensive first",
};

export function parseVehicleOrderBy(
  value: string | null | undefined,
): VehicleSearchOrderBy {
  return value === "HIGH_LOW" ? "HIGH_LOW" : DEFAULT_VEHICLE_ORDER_BY;
}
