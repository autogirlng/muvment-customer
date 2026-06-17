"use client";

import React from "react";
import { useParams } from "next/navigation";
import TripDetailContent from "@/components/Dashboard/TripDetailContent";

export default function TripDetail(): React.ReactElement {
  const params = useParams();
  const bookingId = (params?.id as string) || "";
  const segmentId = (params?.segmentId as string) || "";

  return (
    <TripDetailContent
      bookingId={bookingId}
      segmentId={segmentId}
      links={{
        rootLabel: "My bookings",
        rootHref: "/dashboard/my-booking",
        bookingHref: (id) => `/dashboard/booking/${id}`,
        tripHref: (id, seg) => `/dashboard/booking/${id}/trip/${seg}`,
      }}
    />
  );
}
