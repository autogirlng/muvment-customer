import { Suspense } from "react";
import TrackBookingClient from "@/components/pagesComponent/TrackBookingClient";
import Footer from "@/components/HomeComponent/Footer";
import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Track Your Booking",
  description:
    "Track your Muvment booking status and trip details with your booking reference. No account needed.",
  keywords: [
    "track booking",
    "Muvment booking status",
    "car rental tracking Nigeria",
    "booking reference",
  ],
  url: "/track-booking",
});

export default function TrackBookingPage() {
  return (
    <Suspense fallback={<Footer />}>
      <TrackBookingClient />
    </Suspense>
  );
}
