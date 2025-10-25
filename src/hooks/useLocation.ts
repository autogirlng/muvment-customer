"use client";

import { LocationData } from "@/types/HeroSectionTypes";
import { useState, useEffect } from "react";

export const useLocation = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Reverse geocoding to get location name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response.ok) {
              const data = await response.json();
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              setLocationData({
                location:
                  data.city ||
                  data.locality ||
                  data.principalSubdivision ||
                  "Unknown Location",
                time: currentTime,
              });
            } else {
              setError("Unable to fetch location details");
            }
          } catch (err) {
            setError("Error fetching location information");
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          setError("Location access denied");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    };

    getLocation();
  }, []);

  return { locationData, isLoading, error };
};
