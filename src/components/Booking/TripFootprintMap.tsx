"use client";
import { useEffect, useRef } from "react";
import { useGoogleMaps } from "../general/forms/GoogleMapsLocationInput";

export type TripMapPoint = {
  lat: number;
  lng: number;
  label: string;
  kind: "pickup" | "dropoff" | "area";
  isOutskirt?: boolean;
};

const COLORS = {
  pickup: "#0673ff",
  dropoff: "#101928",
  area: "#16a34a",
  outskirt: "#d97706",
};

// A simple circular pin as an SVG data URL, colored per point kind.
const pinIcon = (color: string, text: string) =>
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/>
      <circle cx="17" cy="16" r="11" fill="#ffffff"/>
      <text x="17" y="21" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="${color}">${text}</text>
    </svg>`,
  );

const badge = (p: TripMapPoint) => {
  if (p.kind === "pickup") return "A";
  if (p.kind === "dropoff") return "B";
  return p.isOutskirt ? "!" : "•";
};

const colorFor = (p: TripMapPoint) => {
  if (p.kind === "pickup") return COLORS.pickup;
  if (p.kind === "dropoff") return COLORS.dropoff;
  return p.isOutskirt ? COLORS.outskirt : COLORS.area;
};

export const TripFootprintMap = ({
  points,
  height = 220,
}: {
  points: TripMapPoint[];
  height?: number;
}) => {
  const apiLoaded = useGoogleMaps(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  );
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const valid = points.filter(
    (p) => typeof p.lat === "number" && typeof p.lng === "number" && p.lat && p.lng,
  );

  useEffect(() => {
    if (!apiLoaded || !mapDivRef.current || !window.google) return;
    if (valid.length === 0) return;

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: valid[0].lat, lng: valid[0].lng },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    }

    // Clear old markers before redrawing.
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    valid.forEach((p) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current!,
        title: p.label,
        icon: {
          url: pinIcon(colorFor(p), badge(p)),
          scaledSize: new window.google.maps.Size(30, 39),
          anchor: new window.google.maps.Point(15, 39),
        },
      });
      markersRef.current.push(marker);
      bounds.extend({ lat: p.lat, lng: p.lng });
    });

    if (valid.length === 1) {
      mapRef.current.setCenter({ lat: valid[0].lat, lng: valid[0].lng });
      mapRef.current.setZoom(14);
    } else {
      mapRef.current.fitBounds(bounds, 48);
    }
  }, [apiLoaded, valid]);

  if (valid.length === 0) return null;

  const hasOutskirt = valid.some((p) => p.kind === "area" && p.isOutskirt);

  return (
    <div className="space-y-2">
      <div
        ref={mapDivRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border border-gray-200"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS.pickup }}
          />
          Pickup
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS.dropoff }}
          />
          Drop-off
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS.area }}
          />
          Area of use
        </span>
        {hasOutskirt && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS.outskirt }}
            />
            Outskirt (extra charge)
          </span>
        )}
      </div>
      {hasOutskirt && (
        <p className="text-[11px] leading-snug text-amber-700">
          One or more of your areas is an outskirt location, which attracts an
          extra charge. Please confirm this is correct before you pay.
        </p>
      )}
    </div>
  );
};
