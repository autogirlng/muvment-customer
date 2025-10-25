import Dashboard from "@/components/Dashboard/MainDashboard";
import { Navbar } from "@/components/Navbar";
import React from "react";

function page() {
  return (
    <div>
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default page;
