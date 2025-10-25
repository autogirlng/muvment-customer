import BookingInterface from "@/components/HomeComponent/BookingInterface";
import FAQ from "@/components/HomeComponent/FAQ";
import Footer from "@/components/HomeComponent/Footer";
import PremiumCarRental from "@/components/HomeComponent/PremiumCarRentals";
import RideSection from "@/components/HomeComponent/RideSelection";
import Steps from "@/components/HomeComponent/Steps";
import TopVehiclesSection from "@/components/HomeComponent/TopVech";
import { Navbar } from "@/components/Navbar";
import React from "react";

function page() {
  return (
    <div>
      <Navbar />
      <BookingInterface />
      <PremiumCarRental />
      <RideSection />
      <TopVehiclesSection />
      <Steps />
      <FAQ />
      <Footer />
    </div>
  );
}

export default page;
