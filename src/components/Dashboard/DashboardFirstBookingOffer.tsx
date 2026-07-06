"use client";

import React from "react";
import { FiTag } from "react-icons/fi";

interface DashboardFirstBookingOfferProps {
  onBook: () => void;
}

const DashboardFirstBookingOffer: React.FC<DashboardFirstBookingOfferProps> = ({
  onBook,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#0673ff] to-[#0560d6] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
          <FiTag className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-bold">Your first booking is 10% off</p>
          <p className="text-sm text-white/85">
            10% off your first ride, up to ₦10,000, applied automatically at
            checkout.
          </p>
        </div>
      </div>
      <button
        onClick={onBook}
        className="flex-shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0673ff] transition-colors hover:bg-[#eaf2ff]"
      >
        Book now
      </button>
    </div>
  );
};

export default DashboardFirstBookingOffer;
