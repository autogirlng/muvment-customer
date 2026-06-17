import type { Metadata } from "next";
import PublicTripDetail from "@/components/pagesComponent/PublicTripDetail";

export const metadata: Metadata = {
  title: "Trip details",
  robots: { index: false, follow: false },
};

export default function TrackTripPage() {
  return <PublicTripDetail />;
}
