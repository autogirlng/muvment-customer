"use client"
import React from "react";
import { Navbar } from "@/components/Navbar";
import { Reviews } from "../Reviews";



const VehicleReviewsClient: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {


    return (
        <>
            {/* Fixed Navbar */}
            <div className="fixed top-0">
                <Navbar />
            </div>

            <div className="mx-auto p-6 
                pt-20 md:pt-24 lg:pt-28 flex flex-col min-h-screen">
                <h2 className="text-lg text-gray-800 pb-1"> Reviews </h2>
                <Reviews vehicleId={vehicleId} pageType="review" />

            </div>

        </>
    );
};

export default VehicleReviewsClient;
