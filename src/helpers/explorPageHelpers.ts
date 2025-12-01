export const getSelectedVehicleTypeName = (
  selectedIds: string[] | undefined,
  vehicleTypes: any[]
) => {
  if (!selectedIds || selectedIds.length === 0) return undefined;
  return vehicleTypes.find((v) => v.id === selectedIds[0])?.name;
};

export const getSelectedMakeName = (
  selectedIds: string[] | undefined,
  makes: any[]
) => {
  if (!selectedIds || selectedIds.length === 0) return undefined;
  return makes.find((m) => m.id === selectedIds[0])?.name;
};

export const getSelectedYearName = (selectedIds: string[] | undefined) => {
  if (!selectedIds || selectedIds.length === 0) return undefined;
  return selectedIds[0];
};

export const getSelectedSeatName = (selectedIds: string[] | undefined) => {
  if (!selectedIds || selectedIds.length === 0) return undefined;
  const seatMap: { [key: string]: string } = {
    "2": "2 seater",
    "3": "3 seater",
    "4": "4 seater",
    "5": "5 seater",
    "6": "6 seater",
    "7": "7+ seater",
  };
  return seatMap[selectedIds[0]];
};

export const getSelectedFeatureName = (
  selectedIds: string[] | undefined,
  features: any[]
) => {
  if (!selectedIds || selectedIds.length === 0) return undefined;
  return features.find((f) => f.id === selectedIds[0])?.name;
};
