import type { Metadata } from "next";
import TripDetail from "@/components/Dashboard/TripDetail";

export const metadata: Metadata = {
  title: "Trip details",
  robots: { index: false, follow: false },
};

export default function DashboardTripDetailPage() {
  return <TripDetail />;
}
