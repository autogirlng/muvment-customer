import { PlacePrediction } from "@/types/BookingSearch";
import {
  GOOGLE_PLACES_COUNTRY_RESTRICTION,
  MAX_GOOGLE_PLACES_RESULTS,
} from "./Constarain";

let googleMapsLoadPromise: Promise<void> | null = null;

export class GoogleMapsService {
  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;
  private placesService: google.maps.places.PlacesService | null = null;
  async loadGoogleMapsScript(): Promise<void> {
    if (window.google && window.google.maps && window.google.maps.places) {
      return Promise.resolve();
    }
    if (googleMapsLoadPromise) {
      return googleMapsLoadPromise;
    }
    googleMapsLoadPromise = new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const interval = setInterval(() => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        googleMapsLoadPromise = null;
        reject(new Error("Failed to load Google Maps script"));
      };
      document.head.appendChild(script);
    });
    return googleMapsLoadPromise;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadGoogleMapsScript();
      if (window.google && window.google.maps && window.google.maps.places) {
        if (!this.autocompleteService) {
          this.autocompleteService =
            new window.google.maps.places.AutocompleteService();
        }
        if (!this.placesService) {
          const attributionContainer = document.createElement("div");
          this.placesService = new window.google.maps.places.PlacesService(
            attributionContainer
          );
        }
      }
    } catch (error) {
      console.error("Failed to load Google Maps:", error);
      throw new Error("Location search is currently unavailable.");
    }
  }

  async searchPlaces(query: string): Promise<PlacePrediction[]> {
    if (!this.autocompleteService || !query.trim()) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      const request = {
        input: query,
        types: ["geocode", "establishment"],
        componentRestrictions: { country: GOOGLE_PLACES_COUNTRY_RESTRICTION },
      };

      this.autocompleteService!.getPlacePredictions(
        request,
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const googlePlaces: PlacePrediction[] = predictions
              .slice(0, MAX_GOOGLE_PLACES_RESULTS)
              .map((prediction, index) => ({
                id: prediction.place_id || `google-${index}`,
                place_id: prediction.place_id,
                name: prediction.structured_formatting.main_text,
                description: prediction.description,
                type: "google",
                icon: "location",
              }));
            resolve(googlePlaces);
          } else {
            console.error("Google Places API error:", status);
            resolve([]);
          }
        }
      );
    });
  }
  async getPlaceDetails(
    placeId: string
  ): Promise<google.maps.places.PlaceResult> {
    if (!this.placesService) {
      throw new Error("Places service is not initialized.");
    }
    return new Promise((resolve, reject) => {
      const request = {
        placeId: placeId,
        fields: ["geometry.location"],
      };
      this.placesService!.getDetails(request, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          resolve(place);
        } else {
          reject(new Error(`Failed to get place details. Status: ${status}`));
        }
      });
    });
  }

  isInitialized(): boolean {
    return this.autocompleteService !== null;
  }
}
