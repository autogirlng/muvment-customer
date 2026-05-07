"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdBusiness, MdApi, MdAccountBalance } from "react-icons/md";
import { getTableData } from "@/controllers/connnector/app.callers";
import { SettlementTab } from "../partnerwithUs/Settlementtab";
import { ApiConfigurationTab } from "../settingsComponent/Apiconfigurationtab";
import { Navbar } from "../Navbar";

type Tab = "settlements" | "api" | "limits";

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

export const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("api");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getTableData("/api/v1/organizations/my-organizations");
        const orgs: Organization[] = res?.data.data;
        setOrganizations(orgs);
        if (orgs.length > 0) setSelectedOrg(orgs[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0066FF] border-t-transparent" />
      </div>
    );
  }

  if (!loading && organizations.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F6F8]">
        <Navbar />
        <div className="relative flex flex-1 flex-col">
          <button
            type="button"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-900/10 bg-[#FFD447] text-[15px] font-black leading-none text-gray-900 shadow-sm md:right-10 md:top-8"
            title="Information"
            aria-label="Information"
          >
            i
          </button>

          <div className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-14 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-10">
            {/* Left: copy + CTA — centered within this column */}
            <div className="flex flex-col items-center text-center lg:max-w-xl lg:justify-self-center">
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
                No Corporate Account Yet
              </h1>
              <p className="mt-5 max-w-[26rem] text-[15px] leading-[1.65] text-gray-500 sm:text-base">
                You don&apos;t have a corporate account linked to your profile.
                Create one to access API keys, settlements, and more.
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/settings/create-organization")
                }
                className="mt-9 inline-flex items-center justify-center rounded-full bg-[#0066FF] px-10 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#0052CC] active:scale-[0.99]"
              >
                + Create Corporate Account
              </button>
            </div>

            {/* Right: illustration (swap PNG at public/images/corporate-empty-state.png if you export from design) */}
            <div className="relative flex w-full justify-center">
              <div className="relative w-full max-w-[min(100%,420px)] lg:max-w-[460px]">
                <Image
                  src="/images/corporate-empty-state.svg"
                  alt=""
                  width={440}
                  height={400}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <MdBusiness className="h-5 w-5 text-[#0066FF]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedOrg.organizationName}
              </p>
              <p className="text-xs text-gray-400">{selectedOrg.industry}</p>
            </div>
          </div>
        )}
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
                      ? "border-[#0066FF] text-[#0066FF]"
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
              <ApiConfigurationTab orgId={selectedOrg.organizationId as string} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
