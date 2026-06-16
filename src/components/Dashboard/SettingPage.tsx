"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MdBusiness,
  MdApi,
  MdAccountBalance,
  MdAccessTime,
  MdAssignment,
  MdErrorOutline,
} from "react-icons/md";
import { getTableData } from "@/controllers/connnector/app.callers";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { OrganizationKYCStatus } from "@/types/Organization.type";
import { SettlementTab } from "../partnerwithUs/Settlementtab";
import { ApiConfigurationTab } from "../settingsComponent/Apiconfigurationtab";

type Tab = "settlements" | "api";

interface Organization {
  id: string;
  name: string;
  industry: string;
  rcNumber?: string;
  myAmountSpent?: string;
  organizationName?: string;
  organizationId?: string;
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "settlements", label: "Settlements", icon: MdAccountBalance },
  { key: "api", label: "API Configuration", icon: MdApi },
];

const STATUS_PILL: Record<string, { label: string; classes: string }> = {
  NOT_SUBMITTED: { label: "Not submitted", classes: "bg-gray-100 text-gray-600" },
  UNDER_REVIEW: { label: "Under review", classes: "bg-blue-50 text-blue-700" },
  APPROVED: { label: "Approved", classes: "bg-green-50 text-green-700" },
  REJECTED: { label: "Not approved", classes: "bg-rose-50 text-rose-700" },
};

const NoticeCard = ({
  icon: Icon,
  tone,
  title,
  body,
  action,
}: {
  icon: React.ElementType;
  tone: "blue" | "amber" | "rose";
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) => {
  const toneMap = {
    blue: "bg-[#E7F1FF] text-[#0673ff]",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${toneMap[tone]}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        {body}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0673ff] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("api");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [kycStatus, setKycStatus] = useState<OrganizationKYCStatus | null>(null);
  const [kycLoading, setKycLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getTableData("/api/v1/organizations/my-organizations");
      if (!res || res.error || !res.data) {
        setError(true);
        return;
      }
      const orgs: Organization[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setOrganizations(orgs);
      if (orgs.length > 0) setSelectedOrg(orgs[0]);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  useEffect(() => {
    const orgId = selectedOrg?.organizationId;
    if (!orgId) {
      setKycStatus(null);
      return;
    }
    setKycLoading(true);
    OrganizationService.getMyOrganizationsKYC(orgId)
      .then((data) =>
        setKycStatus(
          data?.[0]?.data?.status ?? OrganizationKYCStatus.NOT_SUBMITTED,
        ),
      )
      .catch(() => setKycStatus(OrganizationKYCStatus.NOT_SUBMITTED))
      .finally(() => setKycLoading(false));
  }, [selectedOrg]);

  const goToSubmitKyc = () =>
    router.push(
      `/dashboard/integrations/submit-kyc?organizationId=${selectedOrg?.organizationId}`,
    );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0673ff] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-gray-900">
            We couldn&apos;t load your integration account
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Something went wrong while fetching your details. Please try again.
          </p>
          <button
            type="button"
            onClick={fetchOrgs}
            className="mt-5 rounded-full bg-[#0673ff] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    const steps = [
      {
        n: "01",
        t: "Create your account",
        d: "Tell us your business name, RC number, and industry.",
      },
      {
        n: "02",
        t: "Verify your business",
        d: "Submit your KYC: CAC number, office address, and what you do.",
      },
      {
        n: "03",
        t: "Get approved, then build",
        d: "We review every application. Once approved, your keys and settlements unlock here.",
      },
    ];

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0673ff_0%,#0a55c4_100%)] px-6 py-10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  <MdApi className="h-4 w-4" /> Muvment for business
                </span>
                <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
                  Put Muvment inside your product
                </h1>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
                  Book and manage vehicles by API, or run a corporate fleet.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    router.push("/dashboard/integrations/create-organization")
                  }
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-[#0673ff] shadow-lg shadow-black/10 transition hover:bg-gray-50 active:scale-[0.99]"
                >
                  Create corporate account
                </button>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#08183a]/80 p-5 font-mono text-[13px] leading-relaxed shadow-2xl">
                <div className="mb-3 flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                </div>
                <p className="text-emerald-300">
                  POST <span className="text-white/90">/v1/bookings</span>
                </p>
                <p className="break-all text-white/45">
                  Authorization: Bearer mv_live_••••
                </p>
                <p className="mt-1 text-white/80">
                  {`{ "vehicleId": "veh_8f2", "pickup": "Lagos" }`}
                </p>
                <p className="mt-2 text-sky-300">{`→ 201 Created`}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              How it works
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <span className="font-mono text-sm font-semibold text-[#0673ff]">
                    {s.n}
                  </span>
                  <p className="mt-2 font-semibold text-gray-900">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {s.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pill = kycStatus ? STATUS_PILL[kycStatus] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Manage your corporate account, API keys, and payment preferences.
          </p>
        </div>

        {organizations.length > 1 && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Organisation
            </label>
            <select
              value={selectedOrg?.id}
              onChange={(e) => {
                const org = organizations.find((o) => o.id === e.target.value);
                setSelectedOrg(org || null);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0673ff]"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedOrg && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FF]">
              <MdBusiness className="h-5 w-5 text-[#0673ff]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {selectedOrg.organizationName || selectedOrg.name}
              </p>
              <p className="text-xs text-gray-400">{selectedOrg.industry}</p>
            </div>
            {pill && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${pill.classes}`}
              >
                {pill.label}
              </span>
            )}
          </div>
        )}

        {kycLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0673ff] border-t-transparent" />
          </div>
        ) : kycStatus === OrganizationKYCStatus.APPROVED ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 -mb-px sm:flex-initial sm:justify-start sm:px-5 ${
                      activeTab === tab.key
                        ? "border-[#0673ff] text-[#0673ff]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {activeTab === "settlements" && <SettlementTab />}
              {activeTab === "api" && selectedOrg && (
                <ApiConfigurationTab
                  orgId={selectedOrg.organizationId as string}
                />
              )}
            </div>
          </div>
        ) : kycStatus === OrganizationKYCStatus.UNDER_REVIEW ? (
          <NoticeCard
            icon={MdAccessTime}
            tone="blue"
            title="Application under review"
            body="Thanks, your business details are in. Our team is reviewing your application. Once an admin approves it, your API keys and settlement settings will unlock here."
          />
        ) : kycStatus === OrganizationKYCStatus.REJECTED ? (
          <NoticeCard
            icon={MdErrorOutline}
            tone="rose"
            title="Application not approved"
            body="Your application was not approved. Please review your business details and submit again, or contact support if you think this is a mistake."
            action={{ label: "Resubmit details", onClick: goToSubmitKyc }}
          />
        ) : (
          <NoticeCard
            icon={MdAssignment}
            tone="amber"
            title="One more step"
            body="Your corporate account is created. Submit your business details so our team can review and approve your access. API keys are issued only after approval."
            action={{ label: "Submit KYC", onClick: goToSubmitKyc }}
          />
        )}
      </div>
    </div>
  );
};
