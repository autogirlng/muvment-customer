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
import React from "react";

function page() {
  return (
    <div>
      <Navbar />
      <BookingInterface />
      <PremiumCarRental />
      <TopRateing />
      <ExploreCities />
      <VehicleCategories />
      <FindNewListings />
      <Steps />
      <FAQ />
      {/* <SaveBigRentals /> */}
      {/* <RideSection /> */}
      {/* <TopVehiclesSection />
      
      <FAQ /> */}
      <Footer />
    </div>
  );
}

export default page;
