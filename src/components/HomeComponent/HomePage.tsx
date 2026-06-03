"use client";
import dynamic from "next/dynamic";
import BookingInterface from "@/components/HomeComponent/BookingInterface";
import { Navbar } from "@/components/Navbar";
import React, { useEffect } from "react";
import { getBookingOption } from "@/context/Constarain";
import { useState } from "react";
import { BookingOption } from "@/types/booking";
import { ServicePricingShowcaseList } from "@/components/HomeComponent/Servicepricingshowcaselist";

const BeninRepublicTravel = dynamic(
  () => import("@/components/HomeComponent/BeninRepublicTravel"),
);
const TopRateing = dynamic(
  () => import("@/components/HomeComponent/TopRating"),
);
const Delivery = dynamic(() => import("@/components/HomeComponent/Delivering"));
const PremiumCarRental = dynamic(
  () => import("@/components/HomeComponent/PremiumCarRentals"),
);
const ExploreCities = dynamic(
  () => import("@/components/HomeComponent/ExploreCities"),
);
const VehicleCategories = dynamic(
  () => import("@/components/HomeComponent/VechileCategories"),
);
const FindNewListings = dynamic(
  () => import("@/components/HomeComponent/FindNewListing"),
);
const Steps = dynamic(() => import("@/components/HomeComponent/Steps"));
const FAQ = dynamic(() => import("@/components/HomeComponent/FAQ"));
const Footer = dynamic(() => import("@/components/HomeComponent/Footer"));

export default function HomePage() {
  const [bookingTypeID, setBookingTypeID] = useState<string | undefined>(
    undefined,
  );
  const [_, setBookingOptions] = useState<BookingOption[]>([]);

  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
    if (data.dropdownOptions?.length > 0) {
      setBookingTypeID(data.dropdownOptions[0].value);
    }
  };

  useEffect(() => {
    getBookingOptions();
  }, []);

  return (
    <div>
      <Navbar showAnnouncementBar={true} />
      <BookingInterface />
      <ServicePricingShowcaseList />
      <BeninRepublicTravel />
      <TopRateing bookingId={bookingTypeID} />
      <Delivery />
      <PremiumCarRental />
      <ExploreCities bookingTypeId={bookingTypeID} />
      <VehicleCategories />
      <FindNewListings />
      <Steps />
      <FAQ />
      <Footer bookingTypeID={bookingTypeID} />
    </div>
  );
}
