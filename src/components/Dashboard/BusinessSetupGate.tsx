"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiBriefcase, FiCreditCard } from "react-icons/fi";

// Rendered in place of a business page's content when the business setup is not yet
// finished, so a business owner lands on the page (not bounced to the dashboard) and
// is guided to the exact step that is still outstanding.
export default function BusinessSetupGate({
  hasOrg,
  title,
  message,
}: {
  hasOrg: boolean;
  title?: string;
  message?: string;
}) {
  const router = useRouter();

  const step1Done = hasOrg;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F1FF]">
          {step1Done ? (
            <FiCreditCard className="h-6 w-6 text-[#0673ff]" />
          ) : (
            <FiBriefcase className="h-6 w-6 text-[#0673ff]" />
          )}
        </div>

        <h1 className="text-lg font-semibold text-gray-900">
          {title || "Finish setting up your business"}
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          {message ||
            "This is a business feature. Complete your business setup to start using it."}
        </p>

        <div className="mt-6 space-y-2 text-left">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step1Done
                  ? "bg-green-100 text-green-600"
                  : "bg-[#0673ff] text-white"
              }`}
            >
              {step1Done ? "\u2713" : "1"}
            </span>
            <span className="text-sm text-gray-700">Create your business</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step1Done ? "bg-[#0673ff] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </span>
            <span className="text-sm text-gray-700">Fund your wallet</span>
          </div>
        </div>

        <button
          onClick={() =>
            router.push(step1Done ? "/dashboard/payment" : "/business-setup")
          }
          className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "#0673ff" }}
        >
          {step1Done ? "Fund your wallet" : "Set up business"}
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
