"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import TripDetailContent from "@/components/Dashboard/TripDetailContent";

export default function PublicTripDetail(): React.ReactElement {
  const params = useParams();
  const bookingId = (params?.bookingId as string) || "";
  const segmentId = (params?.segmentId as string) || "";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 sm:pt-24">
        <TripDetailContent
          bookingId={bookingId}
          segmentId={segmentId}
          links={{
            rootLabel: "Track booking",
            rootHref: bookingId
              ? `/track-booking?bookingId=${bookingId}`
              : "/track-booking",
            bookingHref: (id) => `/track-booking?bookingId=${id}`,
            tripHref: (id, seg) => `/track-booking/${id}/trip/${seg}`,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
