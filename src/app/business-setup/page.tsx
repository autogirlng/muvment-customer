"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { clearCorporateMembershipCache } from "@/hooks/useCorporateMembership";
import { INDUSTRIES } from "@/components/settingsComponent/CreateOrganization";
import { createData } from "@/controllers/connnector/app.callers";

const REGISTRATION_TYPES = [
  { value: "RC", label: "RC", hint: "Limited company" },
  { value: "BN", label: "BN", hint: "Business name" },
  { value: "OTHER", label: "Other", hint: "" },
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const readStashedName = (): string => {
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

type Form = {
  name: string;
  registrationType: string;
  rcNumber: string;
  industry: string;
  businessEmail: string;
  businessPhone: string;
  companySize: string;
  website: string;
  address: string;
};

export default function BusinessSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState<Form>(() => ({
    name: readStashedName(),
    registrationType: "RC",
    rcNumber: "",
    industry: "",
    businessEmail: "",
    businessPhone: "",
    companySize: "",
    website: "",
    address: "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // 66 industries is far too many for a native select, so this is a searchable
  // dropdown with a contained, scrollable list.
  const [industryOpen, setIndustryOpen] = useState(false);
  const [industryQuery, setIndustryQuery] = useState("");
  const industryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!industryOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        industryRef.current &&
        !industryRef.current.contains(e.target as Node)
      ) {
        setIndustryOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndustryOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [industryOpen]);

  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase();
    if (!q) return INDUSTRIES;
    return INDUSTRIES.filter((i) => i.toLowerCase().includes(q));
  }, [industryQuery]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.userType !== "ORGANIZATION_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    let active = true;
    (async () => {
      const orgs = await OrganizationService.getMyOrganizations();
      if (!active) return;
      if (Array.isArray(orgs) && orgs.length > 0) {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [isLoading, user, router]);

  const set = (key: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  // Bring the name field into view when the server rejects a duplicate name.
  useEffect(() => {
    if (errors.name && /already exists/i.test(errors.name)) {
      nameRef.current?.focus();
    }
  }, [errors.name]);

  const regNumberLabel = useMemo(() => {
    if (form.registrationType === "BN") return "BN number";
    if (form.registrationType === "OTHER") return "Registration number";
    return "RC number";
  }, [form.registrationType]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Business name is required";
    if (!form.rcNumber.trim()) e.rcNumber = "Registration number is required";
    if (!form.industry) e.industry = "Select an industry";
    if (!form.businessEmail.trim()) {
      e.businessEmail = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail.trim())) {
      e.businessEmail = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validate()) return;
    try {
      setLoading(true);
      const res: any = await createData(
        "/api/v1/organizations",
        {
          name: form.name.trim(),
          registrationType: form.registrationType,
          rcNumber: form.rcNumber.trim(),
          industry: form.industry,
          businessEmail: form.businessEmail.trim().toLowerCase(),
          businessPhone: form.businessPhone.trim() || undefined,
          companySize: form.companySize || undefined,
          website: form.website.trim() || undefined,
          address: form.address.trim() || undefined,
        },
        { silent: true },
      );

      // createData does not throw on a handled error (e.g. duplicate name);
      // it returns { error: true, message }. Branch on that.
      if (res?.error || res?.data?.error) {
        const message =
          res?.message ||
          res?.data?.message ||
          "Could not create your business account. Try again.";
        if (/already exists|in use|duplicate/i.test(message)) {
          setErrors((prev) => ({
            ...prev,
            name: "A business with this name already exists. Try another name.",
          }));
        } else {
          setSubmitError(message);
        }
        return;
      }

      try {
        localStorage.removeItem("muvment_pending_org");
      } catch {
        // ignore
      }
      // The membership cache predates this organization; drop it so the dashboard
      // guide and nav see it immediately.
      clearCorporateMembershipCache();
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch (err: any) {
      const message =
        err?.message || "Could not create your business account. Try again.";
      if (/already exists|in use|duplicate/i.test(message)) {
        setErrors((prev) => ({
          ...prev,
          name: "A business with this name already exists. Try another name.",
        }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <MdCheckCircle className="h-9 w-9 text-green-500" />
          </div>
          <h2 className="mb-1 text-xl font-bold text-gray-900">
            Your business account is ready
          </h2>
          <p className="text-sm text-gray-500">
            Next, fund your wallet from the dashboard to start booking for your
            team.
          </p>
        </div>
      </div>
    );
  }

  const inputClass = (key: keyof Form) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#0673FF] focus:border-transparent ${
      errors[key] ? "border-red-400" : "border-gray-300"
    }`;

  const Label = ({
    children,
    optional,
  }: {
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <label className="mb-1.5 block text-sm font-medium text-gray-800">
      {children}
      {optional && (
        <span className="ml-1 font-normal text-gray-400">(optional)</span>
      )}
    </label>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </p>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-xl px-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
        >
          <MdArrowBack className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Set up your business
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tell us about your company so you can book and manage trips for your
            team. You can update these later in settings.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Company */}
          <SectionLabel>Company</SectionLabel>
          <div className="space-y-5">
            <div>
              <Label>Business name</Label>
              <input
                ref={nameRef}
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Acme Logistics Ltd"
                maxLength={120}
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Industry</Label>
                <div className="relative" ref={industryRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIndustryOpen((o) => !o);
                      setIndustryQuery("");
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={industryOpen}
                    className={`${inputClass("industry")} flex items-center justify-between bg-white text-left`}
                  >
                    <span
                      className={`truncate ${form.industry ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {form.industry || "Select industry"}
                    </span>
                    <svg
                      className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${industryOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {industryOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                      <div className="border-b border-gray-100 p-2">
                        <input
                          autoFocus
                          type="text"
                          value={industryQuery}
                          onChange={(e) => setIndustryQuery(e.target.value)}
                          placeholder="Search industry"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0673FF]"
                        />
                      </div>
                      <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
                        {filteredIndustries.length === 0 ? (
                          <li className="px-3 py-3 text-sm text-gray-400">
                            No industry matches that search.
                          </li>
                        ) : (
                          filteredIndustries.map((ind) => (
                            <li key={ind}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={form.industry === ind}
                                onClick={() => {
                                  set("industry", ind);
                                  setIndustryOpen(false);
                                }}
                                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                                  form.industry === ind
                                    ? "bg-[#EAF2FF] font-medium text-[#0673FF]"
                                    : "text-gray-700"
                                }`}
                              >
                                {ind}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
                )}
              </div>
              <div>
                <Label optional>Company size</Label>
                <select
                  value={form.companySize}
                  onChange={(e) => set("companySize", e.target.value)}
                  className={`${inputClass("companySize")} bg-white`}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="my-7 h-px bg-gray-100" />
          <SectionLabel>Registration</SectionLabel>
          <div className="space-y-5">
            <div>
              <Label>Registration type</Label>
              <select
                value={form.registrationType}
                onChange={(e) => set("registrationType", e.target.value)}
                className={`${inputClass("registrationType")} bg-white`}
              >
                {REGISTRATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.hint ? `${t.label} (${t.hint})` : t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>{regNumberLabel}</Label>
              <input
                type="text"
                value={form.rcNumber}
                onChange={(e) => set("rcNumber", e.target.value)}
                placeholder="e.g. 1234567"
                maxLength={30}
                className={inputClass("rcNumber")}
              />
              {errors.rcNumber ? (
                <p className="mt-1 text-sm text-red-500">{errors.rcNumber}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">
                  Your CAC registration number.
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="my-7 h-px bg-gray-100" />
          <SectionLabel>Contact</SectionLabel>
          <div className="space-y-5">
            <div>
              <Label>Business email</Label>
              <input
                type="email"
                value={form.businessEmail}
                onChange={(e) => set("businessEmail", e.target.value)}
                placeholder="accounts@acme.com"
                maxLength={150}
                className={inputClass("businessEmail")}
              />
              {errors.businessEmail ? (
                <p className="mt-1 text-sm text-red-500">
                  {errors.businessEmail}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">
                  Where we send invoices and account updates.
                </p>
              )}
            </div>

            <div>
              <Label optional>Business phone</Label>
              <input
                type="tel"
                value={form.businessPhone}
                onChange={(e) => set("businessPhone", e.target.value)}
                placeholder="+234 800 000 0000"
                maxLength={30}
                className={inputClass("businessPhone")}
              />
            </div>

            <div>
              <Label optional>Website</Label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://acme.com"
                maxLength={200}
                className={inputClass("website")}
              />
            </div>

            <div>
              <Label optional>Business address</Label>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, city, state"
                rows={2}
                maxLength={300}
                className={`${inputClass("address")} resize-none`}
              />
            </div>
          </div>

          {submitError && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-[#0673FF] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating your account..." : "Create business account"}
          </button>
        </div>
      </div>
    </div>
  );
}
