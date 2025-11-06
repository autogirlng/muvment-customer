// components/VehicleCard.tsx
import React from "react";
import { FaCar, FaDoorOpen } from "react-icons/fa";

export interface VehicleCardProps {
  model: string;
  year: number;
  price: number;
  type: string;
  currency?: string;
  period?: string;
  onOpenDoor?: () => void;
}

const PublicVehicleCard: React.FC<VehicleCardProps> = ({
  model,
  year,
  price,
  type,
  currency = "NGN",
  period = "day",
  onOpenDoor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      {/* Vehicle Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {model} {year}
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {currency} {price.toLocaleString()}/{period}
          </p>
        </div>
        <div className="text-gray-400">
          <FaCar size={24} />
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="mb-6">
        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          {type}
        </span>
      </div>

      {/* Open Door Button */}
      <button
        onClick={onOpenDoor}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
      >
        <FaDoorOpen />
        Open Front Door
      </button>
    </div>
  );
};

export default PublicVehicleCard;
