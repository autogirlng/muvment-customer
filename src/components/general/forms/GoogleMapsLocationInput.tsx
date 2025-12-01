

// import { useEffect, useState } from "react";

export function useGoogleMaps(apiKey: string) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Already loaded
        if (window.google?.maps?.places) {
            setLoaded(true);
            return;
        }

        // Prevent adding multiple scripts
        if (document.getElementById("google-maps-script")) {
            const checkReady = () => {
                if (window.google?.maps?.places) setLoaded(true);
            };
            const interval = setInterval(checkReady, 300);
            return () => clearInterval(interval);
        }

        // Inject script
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => setLoaded(true);
        script.onerror = () => setLoaded(false);
        document.head.appendChild(script);
    }, [apiKey]);

    return loaded;
}


// import { useGoogleMaps } from "../Explore/hooks/useGoogleMaps";
import { useState, useRef, useEffect } from "react";
import cn from "classnames";

interface GoogleMapsLocationInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled: boolean;
    coordinates: (type: string, value: { lat: number, lng: number }) => void
    type: string;
}


interface PlacePrediction {
    place_id: string;
    description: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
}
export const GoogleMapsLocationInput: React.FC<GoogleMapsLocationInputProps> = ({
    value,
    onChange,
    placeholder = "Enter location",
    disabled,
    coordinates,
    type
}) => {
    const apiLoaded = useGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);

    // Initialize once API is ready
    useEffect(() => {
        if (apiLoaded && !autocompleteServiceRef.current) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            const dummyDiv = document.createElement("div");
            placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        }
    }, [apiLoaded]);

    // Handle input changes and fetch predictions
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        onChange(inputValue);

        if (!apiLoaded) {
            console.error("Google Maps API not loaded");
            return;
        }

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (inputValue.length > 0) {
            setIsLoading(true);
            // Debounce the API call
            debounceRef.current = setTimeout(() => {
                fetchPredictions(inputValue);
            }, 300);
        } else {
            setPredictions([]);
            setShowDropdown(false);
        }
    };

    const fetchPredictions = (input: string) => {
        if (!autocompleteServiceRef.current) {
            console.error("Autocomplete service not initialized");
            setIsLoading(false);
            return;
        }

        const request = {
            input,
            componentRestrictions: { country: "ng" },
            types: ["establishment", "geocode"],
        };

        autocompleteServiceRef.current.getPlacePredictions(
            request,
            (results, status) => {
                setIsLoading(false);
                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK &&
                    results
                ) {
                    setPredictions(results);
                    setShowDropdown(true);
                } else {
                    setPredictions([]);
                    setShowDropdown(false);
                }
            }
        );
    };

    const handlePlaceSelect = (prediction: PlacePrediction) => {
        if (!placesServiceRef.current) {
            console.error("Places service not initialized");
            return;
        }

        const request = {
            placeId: prediction.place_id,
            fields: ["name", "formatted_address", "geometry"],
        };

        placesServiceRef.current.getDetails(request, (place, status) => {
            if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place
            ) {
                const latitude = place.geometry?.location?.lat() || 0
                const longitude = place.geometry?.location?.lng() || 0
                coordinates(type, { lat: latitude, lng: longitude })
                const selectedAddress =
                    place.name || place.formatted_address || prediction.description;
                onChange(
                    selectedAddress
                );
                setShowDropdown(false);
                setPredictions([]);
            }
        });
    };

    const handleBlur = () => {
        // Delay hiding dropdown to allow for selection
        setTimeout(() => {
            setShowDropdown(false);
        }, 200);
    };

    return (
        <div className="relative w-full">

            <input
                type="text"
                name="pickupLocation"
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={cn("w-full rounded-[12px] p-4 text-left text-sm h-[32px] outline-none bg-white text-grey-900 border border-[#e4e7ec] disabled:bg-grey-100 disabled:text-grey-400 disabled:border-grey-300")}
                autoComplete="off"
                disabled={disabled}
            />


            {showDropdown && (
                <div className="absolute z-50 w-full mt-3 bg-white border border-[#98A2B3] rounded-[18px]  shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                            <div className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Searching...
                            </div>
                        </div>
                    ) : predictions.length > 0 ? (
                        predictions.map((prediction) => (
                            <div
                                key={prediction.place_id}
                                className="px-4 py-3 hover:bg-[#f3f4f6] cursor-pointer"
                                onMouseDown={() => handlePlaceSelect(prediction)} // Use onMouseDown to prevent the input's onBlur from firing first
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <svg
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            ></path>
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {prediction.structured_formatting.main_text}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {prediction.structured_formatting.secondary_text}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                            No locations found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
