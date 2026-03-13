"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MdRocketLaunch,
  MdKey,
  MdBarChart,
  MdSecurity,
  MdArrowForward,
  MdHandshake,
} from "react-icons/md";

const features = [
  {
    icon: MdRocketLaunch,
    title: "Fast Onboarding",
    description:
      "Get your corporate account set up in minutes. Instantly receive a dedicated virtual account powered by Paystack.",
  },
  {
    icon: MdKey,
    title: "API Access",
    description:
      "Integrate our platform into your systems with secure API keys. Test with sandbox before going live.",
  },
  {
    icon: MdBarChart,
    title: "Analytics & Reporting",
    description:
      "Track bookings, manage settlements, and view real-time payment reports from one dashboard.",
  },
  {
    icon: MdSecurity,
    title: "Enterprise Security",
    description:
      "Role-based access control, encrypted keys, and audit logs ensure your data stays safe.",
  },
];

export const PartnerWithUs = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard/settings/create-organization");
    } else {
      router.push("/auth/login?redirect=/dashboard/settings/create-organization");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MdHandshake className="w-4 h-4" />
            Corporate Partnership
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Power Your Business <br />
            <span className="text-blue-600">with Our Platform</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Join as a corporate partner and unlock API access, dedicated virtual
            accounts, and advanced booking management tools — all in one place.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Corporate Account
            <MdArrowForward className="w-5 h-5" />
          </button>
          {!user && (
            <p className="mt-4 text-sm text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() =>
                  router.push(
                    "/auth/login?redirect=/dashboard/settings/create-organization"
                  )
                }
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in to continue
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Everything you need to scale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA bottom */}
        <div className="mt-14 bg-blue-600 rounded-2xl p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
          <p className="text-blue-100 mb-7 max-w-md mx-auto text-sm">
            Create your corporate account today and start integrating our
            platform into your workflow.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started <MdArrowForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};