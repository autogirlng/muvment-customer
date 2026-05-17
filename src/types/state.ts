export interface TravelState {
  stateId: string;
  stateName: string;
  countryName: string;
}

export function buildStateExploreUrl(state: TravelState): string {
  const params = new URLSearchParams({
    stateName: state.stateName,
  });
  if (state.countryName) {
    params.set("countryName", state.countryName);
  }
  return `/booking/states/${state.stateId}?${params.toString()}`;
}
