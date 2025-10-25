import { PlacePrediction } from "@/types/BookingSearch";

const STORAGE_KEY = "recentMuvmentSearches";
const MAX_RECENT_SEARCHES = 5;

export const getRecentSearches = (): PlacePrediction[] => {
  try {
    const storedSearches = window.localStorage.getItem(STORAGE_KEY);
    return storedSearches ? JSON.parse(storedSearches) : [];
  } catch (error) {
    console.error("Failed to parse recent searches from localStorage", error);
    return [];
  }
};

export const addRecentSearch = (location: PlacePrediction): void => {
  try {
    const currentSearches = getRecentSearches();

    const filteredSearches = currentSearches.filter(
      (search) => search.place_id !== location.place_id
    );

    const newSearches = [location, ...filteredSearches];

    const cappedSearches = newSearches.slice(0, MAX_RECENT_SEARCHES);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cappedSearches));
  } catch (error) {
    console.error("Failed to save recent search to localStorage", error);
  }
};
