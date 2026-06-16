import type { Metadata } from "next";
import BookingDetail from "@/components/Dashboard/BookingDetail";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false, follow: false },
};

export default function DashboardBookingDetailPage() {
  return <BookingDetail />;
}
