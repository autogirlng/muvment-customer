import DashboardLayoutClient from "@/components/pagesComponent/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | Muvment by Autogirl",
    template: "%s | Muvment Dashboard",
  },
  description: "Manage your vehicle bookings, trips, and account settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
