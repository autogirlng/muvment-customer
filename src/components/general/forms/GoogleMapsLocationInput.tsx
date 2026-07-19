import { useState, useRef, useEffect } from "react";
import cn from "classnames";
import { GOOGLE_PLACES_COUNTRY_RESTRICTION } from "@/context/Constarain";

// --- HOOK ---
export function useGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey) return;

    // Already loaded
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    // Prevent adding multiple scripts
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
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

// --- COMPONENT ---

interface GoogleMapsLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
  coordinates: (type: string, value: { lat: number; lng: number } | null) => void;
  onRegion?: (type: string, region: { state: string; city: string }) => void;
  type: string;
  className?: string; // Added for extra flexibility
  error?: string; // Added to match your SelectInput pattern
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const GoogleMapsLocationInput: React.FC<
  GoogleMapsLocationInputProps
> = ({
  value,
  onChange,
  placeholder = "Enter location",
  disabled,
  coordinates,
  onRegion,
  type,
  className,
  error,
}) => {
  const apiLoaded = useGoogleMaps(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  );
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionMadeRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const currentValueRef = useRef(value);
  const [selectionError, setSelectionError] = useState("");

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // Initialize once API is ready
  useEffect(() => {
    if (apiLoaded && !autocompleteServiceRef.current && window.google) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      const dummyDiv = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        dummyDiv
      );
    }
  }, [apiLoaded]);

  // Handle input changes and fetch predictions
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    onChange(inputValue);
    hasInteractedRef.current = true;
    selectionMadeRef.current = false;
    setSelectionError("");
    // Typing invalidates any previously selected place, so drop the stale
    // coordinates until a new suggestion is chosen.
    coordinates(type, null);
    if (onRegion) onRegion(type, { state: "", city: "" });

    if (!apiLoaded) {
      console.warn("Google Maps API not loaded");
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length > 0) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        fetchPredictions(inputValue);
      }, 300);
    } else {
      setPredictions([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  };

  const fetchPredictions = (input: string) => {
    if (!autocompleteServiceRef.current) {
      setIsLoading(false);
      return;
    }

    const request = {
      input,
      componentRestrictions: { country: GOOGLE_PLACES_COUNTRY_RESTRICTION },
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
          // Don't hide dropdown immediately if we want to show "No results"
          setShowDropdown(true);
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
      fields: [
        "name",
        "formatted_address",
        "geometry",
        "address_components",
        "types",
      ],
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        place
      ) {
        // Reject selections too broad to price a trip from, for example a city,
        // state, or country ("Lagos", "Lagos State", "Nigeria"). These are the
        // entries that get priced as central and later disputed.
        const placeTypes = place.types || [];
        const broadTypes = [
          "locality",
          "administrative_area_level_1",
          "administrative_area_level_2",
          "country",
          "political",
          "colloquial_area",
        ];
        const preciseTypes = [
          "street_address",
          "premise",
          "subpremise",
          "establishment",
          "point_of_interest",
          "route",
          "intersection",
          "plus_code",
        ];
        const hasPrecise = placeTypes.some((t) => preciseTypes.includes(t));
        const isBroad =
          !hasPrecise && placeTypes.some((t) => broadTypes.includes(t));

        if (isBroad) {
          coordinates(type, null);
          selectionMadeRef.current = false;
          setSelectionError(
            "That address is too general. Please pick your exact street or landmark.",
          );
          setShowDropdown(false);
          setPredictions([]);
          return;
        }

        const latitude = place.geometry?.location?.lat() || 0;
        const longitude = place.geometry?.location?.lng() || 0;
        coordinates(type, { lat: latitude, lng: longitude });

        if (onRegion) {
          const comps = place.address_components || [];
          const pick = (t: string) =>
            comps.find((c) => c.types.includes(t))?.long_name || "";
          const state = pick("administrative_area_level_1");
          const city =
            pick("administrative_area_level_2") ||
            pick("locality") ||
            pick("sublocality") ||
            "";
          onRegion(type, { state, city });
        }

        const selectedAddress =
          prediction.description || place.formatted_address || place.name || "";

        onChange(selectedAddress);
        selectionMadeRef.current = true;
        setSelectionError("");
        setShowDropdown(false);
        setPredictions([]);
      }
    });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    // Give the async getDetails call time to finish before deciding the user
    // left without choosing a suggestion, so a valid pick is not wrongly flagged.
    setTimeout(() => {
      if (
        hasInteractedRef.current &&
        !selectionMadeRef.current &&
        currentValueRef.current.trim()
      ) {
        // Do not overwrite a more specific message (for example the too-general
        // location message) that was already set during selection.
        setSelectionError((prev) =>
          prev ? prev : "Please pick your address from the suggestions list.",
        );
      }
    }, 700);
  };

  const handleClear = () => {
    onChange("");
    coordinates(type, null);
    if (onRegion) onRegion(type, { state: "", city: "" });
    selectionMadeRef.current = false;
    hasInteractedRef.current = false;
    setSelectionError("");
    setPredictions([]);
    setShowDropdown(false);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full flex flex-col gap-1.5", className)}>
      <div className="relative group">
        {/* Map Pin Icon inside Input */}

        <input
          type="text"
          ref={inputRef}
          name="pickupLocation"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "w-full rounded-[12px] pl-4 pr-10 text-sm h-[45px] outline-none transition-all duration-200 ease-in-out",
            "disabled:bg-[#e4e7ec] disabled:text-grey-400 disabled:cursor-not-allowed disabled:border-grey-300",
            error || selectionError
              ? "border border-error-500 focus:ring-2 focus:ring-error-500/20"
              : "bg-white text-grey-900 border border-[#e4e7ec] hover:border-primary-500"
          )}
        />

        {/* Clear button */}
        {!disabled && !isLoading && value && (
          <button
            type="button"
            aria-label="Clear location"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-grey-400 hover:bg-grey-100 hover:text-grey-600 transition-colors"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        )}

        {/* Loading Spinner in Input (optional, shows when typing) */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-primary-500"
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
          </div>
        )}
      </div>

      {/* DROPDOWN RESULTS */}
      {showDropdown && (
        <div className="absolute top-[62px] left-0 right-0 z-[999] w-full bg-white border border-[#e4e7ec] rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {predictions.length > 0 ? (
            <ul className="py-1.5">
              {predictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  className="px-3 py-2.5 mx-1.5 rounded-lg hover:bg-grey-50 cursor-pointer transition-colors group"
                  onMouseDown={() => handlePlaceSelect(prediction)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="h-4 w-4 text-grey-400 group-hover:text-primary-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-grey-900 truncate">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-grey-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && (
              <div className="px-4 py-4 text-sm text-grey-500 text-center">
                No locations found
              </div>
            )
          )}
        </div>
      )}

      {(selectionError || error) && (
        <p className="text-red-500 text-xs mt-1">{selectionError || error}</p>
      )}
    </div>
  );
};
