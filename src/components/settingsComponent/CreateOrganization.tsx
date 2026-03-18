"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdBusiness, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { createData } from "@/controllers/connnector/app.callers";
import { Navbar } from "../Navbar";

export const INDUSTRIES = [
  "Technology",
  "Software & SaaS",
  "Telecommunications",
  "Cybersecurity",
  "Artificial Intelligence & Data",
  "E-Commerce & Marketplaces",

  "Finance & Banking",
  "Insurance",
  "Fintech",
  "Investment & Asset Management",
  "Microfinance & Cooperatives",

  "Healthcare & Hospitals",
  "Pharmaceuticals",
  "Medical Devices & Equipment",
  "Wellness & Fitness",

  "Oil & Gas",
  "Renewable Energy & Solar",
  "Utilities & Power",
  "Environmental Services",
  "Mining & Metals",

  "Real Estate & Property",
  "Construction & Engineering",
  "Architecture & Interior Design",
  "Facilities Management",

  "Retail & Consumer Goods",
  "Fashion & Apparel",
  "Food & Beverage",
  "Supermarkets & FMCG",
  "Luxury Goods",

  "Hospitality & Hotels",
  "Tourism & Travel",
  "Airlines & Aviation",
  "Car Rental & Fleet Management",
  "Events & Entertainment",

  "Manufacturing & Production",
  "Automotive",
  "Chemicals & Plastics",
  "Textiles & Garments",
  "Printing & Packaging",

  "Logistics & Supply Chain",
  "Freight & Shipping",
  "Warehousing & Distribution",
  "Last-Mile Delivery",

  "Education & Training",
  "Higher Education",
  "EdTech",
  "Research & Development",

  "Media & Broadcasting",
  "Advertising & Marketing",
  "Publishing",
  "Film, TV & Production",
  "Music & Entertainment",

  "Legal Services",
  "Consulting & Advisory",
  "Accounting & Auditing",
  "Human Resources & Staffing",
  "Public Relations",

  "Agriculture & Farming",
  "Agritech",
  "Food Processing",
  "Fisheries & Aquaculture",

  "Government & Public Sector",
  "Non-profit & NGO",
  "International Development",
  "Religious Organisations",

  "Other",
];

export const CreateOrganizationPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    rcNumber: "",
    industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.rcNumber || !form.industry) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      await createData("/api/v1/organizations", form);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.message || "Failed to create organization. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="">
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <MdCheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Organisation Created!
            </h2>
            <p className="text-gray-500 text-sm">
              Your corporate account is ready. Redirecting to settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-lg w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <MdArrowBack className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <MdBusiness className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Corporate Account
              </h1>
              <p className="text-sm text-gray-400">
                This sets up your organisation on our platform.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organisation Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Acme Corp Ltd"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                RC Number
              </label>
              <input
                type="text"
                name="rcNumber"
                value={form.rcNumber}
                onChange={handleChange}
                placeholder="RC1234567"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Industry
              </label>
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating..." : "Create Organisation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
