import CreateBookingPageClient from "@/components/pagesComponent/CreateBookingPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Ride | Muvment by Autogirl",
  description: "Complete your vehicle rental booking with Muvment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CreateBookingPageClient />;
}
