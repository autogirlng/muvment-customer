import { Metadata } from "next";
import { generatePageMetadata } from "@/helpers/metadata";
import BookingDetailsClient from "@/components/pagesComponent/BookingDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  return generatePageMetadata({
    title: `Booking Confirmation - #${bookingId}`,
    description: "View your vehicle booking confirmation and trip details.",
    url: `/payment/${bookingId}`,
  });
}

export default async function Page() {
  return <BookingDetailsClient />;
}
