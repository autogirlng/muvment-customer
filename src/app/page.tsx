"use client";
import BookingInterface from "@/components/HomeComponent/BookingInterface";
import ExploreCities from "@/components/HomeComponent/ExploreCities";
import FAQ from "@/components/HomeComponent/FAQ";
import FindNewListings from "@/components/HomeComponent/FindNewListing";
import Footer from "@/components/HomeComponent/Footer";
import PremiumCarRental from "@/components/HomeComponent/PremiumCarRentals";
import Steps from "@/components/HomeComponent/Steps";
import TopRateing from "@/components/HomeComponent/TopRating";
import VehicleCategories from "@/components/HomeComponent/VechileCategories";
import { Navbar } from "@/components/Navbar";
import React, { useEffect } from "react";
import { getBookingOption } from "@/context/Constarain";
import { useState } from "react";
import { BookingOption } from "@/types/booking";
import { ServicePricingShowcaseList } from "@/components/HomeComponent/Servicepricingshowcaselist";
function page() {
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
      <TopRateing bookingId={bookingTypeID} />
      <PremiumCarRental />
      <ExploreCities bookingTypeId={bookingTypeID} />
      <VehicleCategories />
      <FindNewListings />
      <Steps />
      <FAQ />
      {/* <SaveBigRentals /> */}
      {/* <RideSection /> */}
      {/* <TopVehiclesSection />*/}
      <Footer bookingTypeID={bookingTypeID} />
    </div>
  );
}

export default page;
