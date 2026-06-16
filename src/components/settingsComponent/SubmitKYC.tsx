"use client";
import { useState, Suspense } from "react";
import {
  notFound,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { MdBusiness, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { createData } from "@/controllers/connnector/app.callers";

export const ORGANIZATION_SIZE = [
  { label: "1-10 employees", value: "1-10" },
  { label: "11-50 employees", value: "11-50" },
  { label: "51-200 employees", value: "51-200" },
  { label: "201-500 employees", value: "201-500" },
  { label: "501-1,000 employees", value: "501-1000" },
  { label: "1,001-5,000 employees", value: "1001-5000" },
  { label: "5,000+ employees", value: "5000+" },
];

const SubmitKYCPageContent = () => {
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
        router.push("/dashboard/integrations");
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <MdCheckCircle className="h-9 w-9 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            KYC submitted
          </h2>
          <p className="text-sm text-gray-500">
            Your application is now under review. Redirecting to settings...
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
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          <MdArrowBack className="h-4 w-4" /> Back
        </button>

        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F1FF]">
            <MdBusiness className="h-6 w-6 text-[#0673ff]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Submit KYC</h1>
            <p className="text-sm text-gray-400">
              This sets up your organisation information on our platform.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            CAC Number
          </label>
          <input
            type="text"
            name="cacNumber"
            value={form.cacNumber}
            onChange={handleChange}
            placeholder="1234567"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
          />
        </div>

        <div>
          <label className="mb-1.5 mt-3 block text-sm font-medium text-gray-700">
            Office Address
          </label>
          <input
            type="text"
            name="officeAddress"
            value={form.officeAddress}
            onChange={handleChange}
            placeholder="No 6 off Muvment street, Lagos"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
          />
        </div>
        <div>
          <label className="mb-1.5 mt-3 block text-sm font-medium text-gray-700">
            Additional Address (optional)
          </label>
          <input
            type="text"
            name="additionalAddress"
            value={form.additionalAddress}
            onChange={handleChange}
            placeholder="No 7 off Muvment street, Lagos"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
          />
        </div>

        <div>
          <label className="mb-1.5 mt-3 block text-sm font-medium text-gray-700">
            Services Rendered
          </label>
          <input
            type="text"
            name="servicesRendered"
            value={form.servicesRendered}
            onChange={handleChange}
            placeholder="Mobility"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
          />
        </div>

        <div>
          <label className="mb-1.5 mt-3 block text-sm font-medium text-gray-700">
            Organization Size
          </label>
          <select
            name="organizationSize"
            value={form.organizationSize}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
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
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-[#0673ff] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a55c4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </div>
    </div>
  );
};

export const SubmitKYCPage = () => (
  <Suspense fallback={null}>
    <SubmitKYCPageContent />
  </Suspense>
);
