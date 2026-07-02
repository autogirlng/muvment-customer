"use client";
import dynamic from "next/dynamic";
import BookingInterface from "@/components/HomeComponent/BookingInterface";
import { Navbar } from "@/components/Navbar";
import React, { useEffect } from "react";
import { getBookingOption, getDefaultBookingTypeId } from "@/context/Constarain";
import { useState } from "react";
import { BookingOption } from "@/types/booking";
import { ServicePricingShowcaseList } from "@/components/HomeComponent/Servicepricingshowcaselist";
import NewUserBanner from "@/components/HomeComponent/NewUserBanner";
import PartnerSpotlight from "@/components/HomeComponent/PartnerSpotlight";

const BeninRepublicTravel = dynamic(
  () => import("@/components/HomeComponent/BeninRepublicTravel"),
);
const TopRateing = dynamic(
  () => import("@/components/HomeComponent/TopRating"),
);
const Delivery = dynamic(() => import("@/components/HomeComponent/Delivering"));
const ExploreCities = dynamic(
  () => import("@/components/HomeComponent/ExploreCities"),
);
const VehicleCategories = dynamic(
  () => import("@/components/HomeComponent/VechileCategories"),
);
const Steps = dynamic(() => import("@/components/HomeComponent/Steps"));
const Testimonials = dynamic(
  () => import("@/components/HomeComponent/Testimonials"),
);
const FAQ = dynamic(() => import("@/components/HomeComponent/FAQ"));
const ClosingCTA = dynamic(
  () => import("@/components/HomeComponent/ClosingCTA"),
);
const Footer = dynamic(() => import("@/components/HomeComponent/Footer"));
const HourlyPromoBar = dynamic(
  () => import("@/components/HomeComponent/HourlyPromoBar"),
  { ssr: false },
);
const SignupPromoModal = dynamic(
  () => import("@/components/HomeComponent/SignupPromoModal"),
  { ssr: false },
);

export default function HomePage() {
  const [bookingTypeID, setBookingTypeID] = useState<string | undefined>(
    undefined,
  );
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);

  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
    const defaultId = await getDefaultBookingTypeId();
    if (defaultId) {
      setBookingTypeID(defaultId);
    }
  };

  useEffect(() => {
    getBookingOptions();
  }, []);

  return (
    <div>
      <Navbar showAnnouncementBar={true} homeHero={true} />
      <BookingInterface />
      <NewUserBanner />
      <div className="ag-reveal">
        <ServicePricingShowcaseList />
      </div>
      <div className="ag-reveal">
        <TopRateing bookingId={bookingTypeID} />
      </div>
      <div className="ag-reveal">
        <Steps />
      </div>
      <div className="ag-reveal">
        <BeninRepublicTravel />
      </div>
      <div className="ag-reveal">
        <Delivery bookingOptions={bookingOptions} />
      </div>
      <div className="ag-reveal">
        <ExploreCities bookingTypeId={bookingTypeID} />
      </div>
      <div className="ag-reveal">
        <VehicleCategories />
      </div>
      <div className="ag-reveal">
        <Testimonials />
      </div>
      <div className="ag-reveal">
        <PartnerSpotlight />
      </div>
      <div className="ag-reveal">
        <FAQ />
      </div>
      <div className="ag-reveal">
        <ClosingCTA />
      </div>
      <Footer bookingTypeID={bookingTypeID} />
      <HourlyPromoBar />
      <SignupPromoModal />
    </div>
  );
}
