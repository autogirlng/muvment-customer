"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "../Navbar";
import MuvmentHero from "../AboutUsComponent/MuvmentHero";
import FeaturedLogos from "../AboutUsComponent/FeaturedLogos ";
import MissionVision from "../AboutUsComponent/MissionVision";
import OurStory from "../AboutUsComponent/OurStory";
import OurValues from "../AboutUsComponent/OurValues";
import LeadershipTeam from "../AboutUsComponent/LeadershipTeam";
import PartnersNetwork from "../AboutUsComponent/PartnersNetwork";
import Testimonials from "../AboutUsComponent/Testimonials";
import Recognition from "../AboutUsComponent/Recognition";
import ImpactAndCTA from "../AboutUsComponent/ImpactAndCTA";
import Footer from "../HomeComponent/Footer";
import { getBookingOption } from "@/context/Constarain";
import { BookingOption } from "@/types/booking";

function AboutUsClient() {
  const [bookingType, setBookingType] = useState<string | undefined>("");
  const [_, setBookingOptions] = useState<BookingOption[]>([]);

  useEffect(() => {
    const getBookingOptions = async () => {
      const data = await getBookingOption();
      if (data.dropdownOptions?.length > 0) {
        setBookingType(data.dropdownOptions[0].value);
      }
    };

    getBookingOptions();
  }, []);
  return (
    <div>
      <Navbar />
      <MuvmentHero />
      <FeaturedLogos />
      <MissionVision />
      <OurStory />
      <OurValues />
      <LeadershipTeam />
      <PartnersNetwork />
      <Testimonials />
      <Recognition />
      <ImpactAndCTA bookingTypeID={bookingType} />
      <Footer bookingTypeID={bookingType} />
    </div>
  );
}

export default AboutUsClient;
