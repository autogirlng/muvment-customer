type VehicleLinkSource = {
  id?: string | null;
  slug?: string | null;
};

export function getVehicleBookingIdentifier(
  vehicle: VehicleLinkSource,
): string | null {
  const identifier = vehicle.slug || vehicle.id;

  if (!identifier || identifier === "undefined") {
    return null;
  }

  return identifier;
}

export function getVehicleBookingPath(vehicle: VehicleLinkSource): string | null {
  const identifier = getVehicleBookingIdentifier(vehicle);

  if (!identifier) {
    return null;
  }

  return `/booking/details/${identifier}`;
}
