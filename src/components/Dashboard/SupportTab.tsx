"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiBookOpen,
  FiInfo,
  FiFileText,
  FiShield,
  FiHelpCircle,
  FiChevronRight,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const CONTACTS = [
  {
    icon: FiMail,
    label: "Email",
    value: "info@muvment.ng",
    href: "mailto:info@muvment.ng",
    note: "We reply within a day",
    external: false,
    copyValue: "info@muvment.ng",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: "+234 816 747 4165",
    href: "tel:+2348167474165",
    note: "Mon to Sat, 8am to 6pm",
    external: false,
    copyValue: "+2348167474165",
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/2349030235285",
    note: "Fastest way to reach us",
    external: true,
    copyValue: "",
  },
];

const RESOURCES = [
  {
    icon: FiHelpCircle,
    label: "FAQ",
    desc: "Answers to common questions",
    href: "/faq",
  },
  { icon: FiBookOpen, label: "Blog", desc: "Tips, updates, and stories", href: "/blog" },
  { icon: FiInfo, label: "About Muvment", desc: "Who we are", href: "/about-us" },
  {
    icon: FiFileText,
    label: "Terms of Service",
    desc: "Our terms of use",
    href: "/policy/terms-conditions",
  },
  {
    icon: FiShield,
    label: "Privacy Policy",
    desc: "How we handle your data",
    href: "/policy/privacy-policy",
  },
];

const SupportTab = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-bold text-gray-900">Get in touch</h3>
        <p className="mt-1 text-sm text-gray-500">
          Reach our team directly through any of these.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CONTACTS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#0673ff] hover:shadow"
              >
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F1FF]">
                    <Icon className="h-5 w-5 text-[#0673ff]" />
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {c.label}
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-900">{c.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{c.note}</p>
                </a>

                {c.copyValue && (
                  <button
                    type="button"
                    onClick={() => handleCopy(c.label, c.copyValue)}
                    aria-label={`Copy ${c.label.toLowerCase()}`}
                    className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    {copied === c.label ? (
                      <>
                        <FiCheck className="h-3.5 w-3.5 text-[#0673ff]" /> Copied
                      </>
                    ) : (
                      <>
                        <FiCopy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900">Resources</h3>
        <p className="mt-1 text-sm text-gray-500">Learn more about Muvment.</p>
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.label}
                href={r.href}
                className="flex items-center gap-4 px-4 py-4 transition hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{r.label}</p>
                  <p className="text-sm text-gray-500">{r.desc}</p>
                </div>
                <FiChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SupportTab;
