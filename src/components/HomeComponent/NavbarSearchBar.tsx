"use client";
import { Suspense } from "react";
import { BookingSearchBar } from "./BookingInterface";

export const NavbarSearchBar = () => (
  <Suspense fallback={null}>
    <BookingSearchBar />
  </Suspense>
);
