"use client";
import { MdConstruction } from "react-icons/md";

export const SettlementTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
        <MdConstruction className="w-9 h-9 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Settlements — Coming Soon
      </h3>
      <p className="text-gray-400 text-sm max-w-sm">
        Settlement management is currently in development. You'll be able to
        track and manage all your payouts here very soon.
      </p>
    </div>
  );
};