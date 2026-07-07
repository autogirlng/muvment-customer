"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdBusiness, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { createData } from "@/controllers/connnector/app.callers";

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

export const CreateOrganizationPage = ({
  redirectTo = "/dashboard/integrations",
}: {
  redirectTo?: string;
} = {}) => {
  const router = useRouter();

  const getStashedName = (): string => {
    if (typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem("muvment_pending_org");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return typeof parsed?.name === "string" ? parsed.name : "";
    } catch {
      return "";
    }
  };

  const [form, setForm] = useState({
    name: getStashedName(),
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
      try {
        localStorage.removeItem("muvment_pending_org");
      } catch {
        // ignore
      }
      setTimeout(() => {
        router.push(redirectTo);
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <MdCheckCircle className="h-9 w-9 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Organisation created
          </h2>
          <p className="text-sm text-gray-500">
            Your corporate account is ready. Next, submit your KYC so our team can
            review it. Redirecting to settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <MdArrowBack className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3 mb-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F1FF]">
              <MdBusiness className="h-6 w-6 text-[#0673ff]" />
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0673ff] focus:border-transparent transition"
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0673ff] focus:border-transparent transition"
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0673ff] focus:border-transparent transition bg-white"
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
              className="mt-2 w-full rounded-xl bg-[#0673ff] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a55c4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Organisation"}
            </button>
          </div>
        </div>
      </div>
  );
};
