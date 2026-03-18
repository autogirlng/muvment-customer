"use client";
import { useState } from "react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { MdBusiness, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { createData } from "@/controllers/connnector/app.callers";
import { Navbar } from "../Navbar";

export const ORGANIZATION_SIZE = [
  { label: "1-10 employees", value: "1-10" },
  { label: "11-50 employees", value: "11-50" },
  { label: "51-200 employees", value: "51-200" },
  { label: "201-500 employees", value: "201-500" },
  { label: "501-1,000 employees", value: "501-1000" },
  { label: "1,001-5,000 employees", value: "1001-5000" },
  { label: "5,000+ employees", value: "5000+" },
];

export const SubmitKYCPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    cacNumber: "",
    officeAddress: "",
    additionalAddress: "",
    organizationSize: "",
    servicesRendered: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const organizationId = searchParams.get("organizationId");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (
      !form.cacNumber ||
      !form.officeAddress ||
      !form.servicesRendered ||
      !form.organizationSize
    ) {
      setError("Fill all non-optional fields");
      return;
    }

    try {
      setLoading(true);
      await createData(`/api/v1/organizations/${organizationId}/kyc`, form);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to submit your kyc. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!organizationId) {
    return notFound();
  }

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
              KYC Submitted!
            </h2>
            <p className="text-gray-500 text-sm">
              Your KYC is currently under review. Redirecting to settings...
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
              <h1 className="text-xl font-bold text-gray-900">Submit KYC</h1>
              <p className="text-sm text-gray-400">
                This sets up your organisation information on our platform.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CAC Number
            </label>
            <input
              type="text"
              name="cacNumber"
              value={form.cacNumber}
              onChange={handleChange}
              placeholder="1234567"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-1.5">
              Office Address
            </label>
            <input
              type="text"
              name="officeAddress"
              value={form.officeAddress}
              onChange={handleChange}
              placeholder="No 6 off Muvment street, Lagos"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-1.5">
              Additional Address (optional)
            </label>
            <input
              type="text"
              name="additionalAddress"
              value={form.additionalAddress}
              onChange={handleChange}
              placeholder="No 7 off Muvment street, Lagos"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-1.5">
              Services Rendered
            </label>
            <input
              type="text"
              name="servicesRendered"
              value={form.servicesRendered}
              onChange={handleChange}
              placeholder="Mobility"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-1.5">
              Organization Size
            </label>
            <select
              name="organizationSize"
              value={form.organizationSize}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="">Select your organization size</option>
              {ORGANIZATION_SIZE.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 mt-3 text-sm bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white mt-3 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </div>
      </div>
    </div>
  );
};
