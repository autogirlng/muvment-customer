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
  private geocoder: google.maps.Geocoder | null = null;

  async loadGoogleMapsScript(): Promise<void> {
    // If already loaded, return immediately
    if (window.google?.maps?.places) {
      return Promise.resolve();
    }

    // If loading is in progress, wait for it
    if (googleMapsLoadPromise) {
      return googleMapsLoadPromise;
    }

    googleMapsLoadPromise = new Promise((resolve, reject) => {
      // Check if script tag already exists
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );

      if (existingScript) {
        // Script exists, wait for it to load
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Add timeout to prevent infinite waiting
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.google?.maps?.places) {
            reject(new Error("Google Maps script loading timeout"));
          }
        }, 10000); // 10 second timeout

        return;
      }

      // Create and load the script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Wait a bit for the API to be fully ready
        setTimeout(() => {
          if (window.google?.maps?.places) {
            resolve();
          } else {
            reject(new Error("Google Maps API not available after load"));
          }
        }, 100);
      };

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
      // Load the script first
      await this.loadGoogleMapsScript();

      // Verify Google Maps is available
      if (!window.google?.maps?.places) {
        throw new Error("Google Maps not loaded properly");
      }

      // Initialize services only if not already initialized
      if (!this.autocompleteService) {
        this.autocompleteService =
          new window.google.maps.places.AutocompleteService();
      }

      if (!this.placesService) {
        // Create a dummy div for PlacesService (it requires a DOM element)
        const attributionContainer = document.createElement("div");
        this.placesService = new window.google.maps.places.PlacesService(
          attributionContainer
        );
      }

      if (!this.geocoder) {
        this.geocoder = new window.google.maps.Geocoder();
      }
    } catch (error) {
      console.error("Failed to initialize Google Maps:", error);
      throw new Error("Location search is currently unavailable.");
    }
  }

  async searchPlaces(query: string): Promise<PlacePrediction[]> {
    // Ensure initialized
    if (!this.autocompleteService) {
      await this.initialize();
    }

    if (!this.autocompleteService || !query.trim()) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ["geocode", "establishment"],
        componentRestrictions: { country: GOOGLE_PLACES_COUNTRY_RESTRICTION },
      };

      this.autocompleteService!.getPlacePredictions(
        request,
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
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
    // Ensure initialized
    if (!this.placesService) {
      await this.initialize();
    }

    if (!this.placesService) {
      throw new Error("Places service is not initialized.");
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ["geometry.location", "formatted_address", "name"],
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Failed to get place details. Status: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Ensure initialized
    if (!this.geocoder) {
      await this.initialize();
    }

    if (!this.geocoder) {
      throw new Error("Geocoder is not initialized.");
    }

    return new Promise((resolve, reject) => {
      const latlng = { lat, lng };

      this.geocoder!.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const addressComponents = results[0].address_components;
          let route = "";
          let locality = "";
          let political = "";
          let adminLevel1 = "";
          let country = "";

          for (const component of addressComponents) {
            if (component.types.includes("route")) {
              route = component.long_name;
            } else if (component.types.includes("locality")) {
              locality = component.long_name;
            } else if (
              component.types.includes("administrative_area_level_3") &&
              component.types.includes("political")
            ) {
              political = component.long_name;
            } else if (
              component.types.includes("administrative_area_level_1")
            ) {
              adminLevel1 = component.long_name;
            } else if (component.types.includes("country")) {
              country = component.long_name;
            }
          }

          const locationParts = [];
          if (route) locationParts.push(route);
          if (political) locationParts.push(political);
          if (locality) locationParts.push(locality);
          if (!locality && adminLevel1) locationParts.push(adminLevel1);

          const locationName =
            locationParts.length > 0
              ? locationParts.join(", ")
              : country || "Your Location";

          resolve(locationName);
        } else {
          console.error("Geocoder failed:", status);
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  isInitialized(): boolean {
    return this.autocompleteService !== null && this.placesService !== null;
  }

  // Helper method to check if Google Maps is loaded
  isGoogleMapsLoaded(): boolean {
    return window.google?.maps?.places !== undefined;
  }
}
