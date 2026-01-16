import { useState, useEffect, useRef } from "react";

const DEFAULT_LOCATION = {
  name: "Lagos, Nigeria",
  lat: 6.5244,
  lng: 3.3792,
};

type LocationStatus = "idle" | "detecting" | "granted" | "denied" | "default";

interface LocationState {
  status: LocationStatus;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  error: string | null;
}

export const useLocationDetection = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
    location: DEFAULT_LOCATION,
    isDefault: true,
    error: null,
  });

  const hasAttemptedRef = useRef(false);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      if (!window.google?.maps) {
        throw new Error("Google Maps not loaded");
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      return new Promise((resolve) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
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
            resolve("Your Location");
          }
        });
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Your Location";
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "denied",
        location: DEFAULT_LOCATION,
        isDefault: true,
        error: "Geolocation not supported",
      });
      return;
    }

    setLocationState((prev) => ({
      ...prev,
      status: "detecting",
      error: null,
    }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const locationName = await reverseGeocode(latitude, longitude);

      setLocationState({
        status: "granted",
        location: {
          name: locationName,
          lat: latitude,
          lng: longitude,
        },
        isDefault: false,
        error: null,
      });

      // Store in sessionStorage to remember across page navigations
      sessionStorage.setItem(
        "userLocation",
        JSON.stringify({
          name: locationName,
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
        })
      );
    } catch (error: any) {
      console.error("Location error:", error);

      setLocationState({
        status: "denied",
        location: DEFAULT_LOCATION,
        isDefault: true,
        error:
          error.message === "User denied Geolocation"
            ? "Location access denied"
            : "Could not detect location",
      });
    }
  };

  const checkStoredLocation = () => {
    try {
      const stored = sessionStorage.getItem("userLocation");
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        // Use stored location if less than 30 minutes old
        if (age < 30 * 60 * 1000) {
          setLocationState({
            status: "granted",
            location: {
              name: parsed.name,
              lat: parsed.lat,
              lng: parsed.lng,
            },
            isDefault: false,
            error: null,
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Error reading stored location:", error);
    }
    return false;
  };

  useEffect(() => {
    if (!hasAttemptedRef.current) {
      hasAttemptedRef.current = true;

      // First check if we have a stored location
      const hasStored = checkStoredLocation();

      // If no stored location, set to default
      if (!hasStored) {
        setLocationState({
          status: "default",
          location: DEFAULT_LOCATION,
          isDefault: true,
          error: null,
        });
      }
    }
  }, []);

  return {
    ...locationState,
    requestLocation,
    isDetecting: locationState.status === "detecting",
  };
};
