import CheckoutClientPage from "@/components/pagesComponent/CheckoutClientPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Muvment by Autogirl",
  description: "Complete your vehicle rental booking securely.",
  robots: {
    index: false, // Don't index
    follow: false, // Don't follow links
  },
};

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}
