import { PlacePrediction } from "@/types/BookingSearch";
import { useState, useRef, useEffect, useCallback } from "react";
import { addRecentSearch, getRecentSearches } from "./recentSearch";
import { GoogleMapsService } from "@/context/googleMapConnector";
import { GOOGLE_MAPS_DEBOUNCE_DELAY } from "@/context/Constarain";

type SelectedLocation = {
  name: string;
  lat: number | null;
  lng: number | null;
};

export const useLocationSearch = () => {
  const [showLocationDropdown, setShowLocationDropdown] =
    useState<boolean>(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    PlacePrediction[]
  >([]);

  const [recentSearches, setRecentSearches] = useState<PlacePrediction[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");

  const googleMapsService = useRef<GoogleMapsService>(new GoogleMapsService());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const initialize = async () => {
      const loadedRecentSearches = getRecentSearches();
      setRecentSearches(loadedRecentSearches);
      setLocationSuggestions(loadedRecentSearches);
      try {
        await googleMapsService.current.initialize();
      } catch (error) {
        console.error("Failed to initialize Google Maps service:", error);
        setSearchError("Location search is currently unavailable.");
      }
    };
    initialize();
  }, []);

  const searchGooglePlaces = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setLocationSuggestions(recentSearches);
        setIsLoadingPlaces(false);
        return;
      }

      setIsLoadingPlaces(true);
      setSearchError("");

      try {
        const suggestions = await googleMapsService.current.searchPlaces(query);

        setLocationSuggestions(suggestions);
      } catch (error) {
        setSearchError("Location search is currently unavailable.");
        console.error("Location search error:", error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    },
    [recentSearches]
  );

  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(() => {
        searchGooglePlaces(searchValue);
      }, GOOGLE_MAPS_DEBOUNCE_DELAY);
    },
    [searchGooglePlaces]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const handleLocationSelect = useCallback(
    async (location: PlacePrediction): Promise<SelectedLocation> => {
      setShowLocationDropdown(false);
      setSearchError("");

      addRecentSearch(location);
      setRecentSearches((prev) =>
        [
          location,
          ...prev.filter((p) => p.place_id !== location.place_id),
        ].slice(0, 5)
      );

      if (!location.place_id) {
        return { name: location.name, lat: null, lng: null };
      }

      try {
        const placeDetails = await googleMapsService.current.getPlaceDetails(
          location.place_id
        );
        const lat = placeDetails.geometry?.location?.lat();
        const lng = placeDetails.geometry?.location?.lng();

        return { name: location.name, lat: lat ?? null, lng: lng ?? null };
      } catch (error) {
        console.error("Error fetching place details:", error);
        setSearchError("Could not retrieve location details.");
        return { name: location.name, lat: null, lng: null };
      }
    },
    []
  );

  const handleSearchInputFocus = useCallback(() => {
    setShowLocationDropdown(true);
  }, []);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      if (!showLocationDropdown) setShowLocationDropdown(true);
      setSearchError("");
      debouncedSearch(value);
    },
    [showLocationDropdown, debouncedSearch]
  );

  return {
    showLocationDropdown,
    setShowLocationDropdown,
    locationSuggestions,
    isLoadingPlaces,
    searchError,
    handleLocationSelect,
    handleSearchInputFocus,
    handleSearchInputChange,
  };
};
