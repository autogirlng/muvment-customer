"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { Organization } from "@/types/Organization.type";

const REG_LABEL: Record<string, string> = {
  RC: "RC (Limited company)",
  BN: "BN (Business name)",
  OTHER: "Other",
};

export default function BusinessProfileTab() {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const orgs = await OrganizationService.getMyOrganizations();
      if (!active) return;
      setOrg(Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-gray-900">
          No business account yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Set up your business to see its profile here.
        </p>
        <button
          onClick={() => router.push("/business-setup")}
          className="mt-4 rounded-xl bg-[#0673FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0560d6]"
        >
          Set up business
        </button>
      </div>
    );
  }

  const rows: { label: string; value?: string }[] = [
    { label: "Business name", value: org.name },
    {
      label: "Registration type",
      value: org.registrationType
        ? REG_LABEL[org.registrationType] || org.registrationType
        : undefined,
    },
    { label: "Registration number", value: org.rcNumber },
    { label: "Industry", value: org.industry },
    { label: "Company size", value: org.companySize },
    { label: "Business email", value: org.businessEmail },
    { label: "Business phone", value: org.businessPhone },
    { label: "Website", value: org.website },
    { label: "Address", value: org.address },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Business profile</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          The details you provided when setting up your business.
        </p>
      </div>
      <dl className="divide-y divide-gray-100">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <dt className="text-sm text-gray-500">{r.label}</dt>
            <dd className="text-sm font-medium text-gray-900 sm:text-right">
              {r.value && r.value.trim() ? r.value : "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
