import { Metadata } from "next";
import { generatePageMetadata } from "@/helpers/metadata";
import BookingDetailsClient from "@/components/pagesComponent/BookingDetailsClient";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const bookingId = params.id;

  return generatePageMetadata({
    title: `Booking Confirmation - #${bookingId}`,
    description: "View your vehicle booking confirmation and trip details.",
    url: `/booking/${bookingId}`,
  });
}

export default function Page() {
  return <BookingDetailsClient />;
}
