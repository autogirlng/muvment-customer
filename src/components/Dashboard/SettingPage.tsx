"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MdBusiness, MdApi, MdAccountBalance, MdAdd } from "react-icons/md";
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
  myAmountSpent?:string
  organizationName?:string
  organizationId?:string

}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "settlements", label: "Settlements", icon: MdAccountBalance },
  { key: "api", label: "API Configuration", icon: MdApi },
];

export const SettingsPage = () => {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && organizations.length === 0) {
    return (
    <div className="">
        <Navbar/>
          <div className="h-[70vh]  flex items-center justify-center px-4">
        <div className="  w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdBusiness className="w-9 h-9 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Corporate Account Yet
          </h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            You don't have a corporate account linked to your profile. Create
            one to access API keys, settlements, and more.
          </p>
          <button
            onClick={() =>
              router.push("/dashboard/settings/create-organization")
            }
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            <MdAdd className="w-4 h-4" />
            Create Corporate Account
          </button>
        </div>
      </div>
    </div>
    );
  }

  return (
   <div className="">
    <Navbar/>
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage your corporate account, API keys, and payment preferences.
          </p>
        </div>
        {organizations.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation
            </label>
            <select
              value={selectedOrg?.id}
              onChange={(e) => {
                const org = organizations.find((o) => o.id === e.target.value);
                setSelectedOrg(org || null);
              }}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MdBusiness className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {selectedOrg.organizationName}
              </p>
              <p className="text-xs text-gray-400">
                {selectedOrg.industry}
              </p>
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
   </div>
  );
};