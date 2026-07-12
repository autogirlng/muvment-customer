"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationWalletInfo } from "@/types/Organization.type";

type Props = {
  // Opens the book-a-vehicle popup (stage 3).
  onBook?: () => void;
  // Reports whether this is a business account and whether all steps are done.
  onStatus?: (status: { isBusiness: boolean; complete: boolean }) => void;
};

const CheckIcon = () => (
  <svg
    className="h-4 w-4 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default function BusinessOnboardingGuide({
  onBook,
  onStatus,
}: Props) {
  const router = useRouter();
  const corp = useCorporateMembership();
  const isBusiness = corp.isOwnerLike;

  const [loading, setLoading] = useState(true);
  const [hasOrg, setHasOrg] = useState(false);
  const [wallet, setWallet] = useState<OrganizationWalletInfo | null>(null);
  // Bookings made on the organization, not the person's private bookings.
  const [orgBookings, setOrgBookings] = useState<number | null>(null);

  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    if (!isBusiness) {
      setLoading(false);
      return;
    }
    if (corp.loading) return;
    let active = true;
    (async () => {
      const org = corp.org;
      setHasOrg(!!org);
      if (org?.id) {
        const [info, booked] = await Promise.all([
          OrganizationService.getWalletInfo(org.id),
          OrganizationService.getOrganizationBookings(org.id, 0, 1),
        ]);
        if (!active) return;
        setWallet(info);
        setOrgBookings(booked.totalItems);
      } else {
        setOrgBookings(0);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isBusiness, corp.loading, corp.org?.id]);

  const walletFunded = !!wallet && Number(wallet.balance) > 0;
  // A private card booking must not tick the corporate step.
  const hasBooking = (orgBookings ?? 0) > 0;
  const allDone = hasOrg && walletFunded && hasBooking;

  // Let the dashboard know whether this is a business account and whether the
  // onboarding is finished, so it can hide the empty trip prompt until then.
  useEffect(() => {
    onStatusRef.current?.({ isBusiness: !!isBusiness, complete: allDone });
  }, [isBusiness, allDone]);

  if (!isBusiness) return null;

  // Wait for org, wallet, and the booking count so the steps render in their
  // final state at once instead of ticking in one by one as each call resolves.
  const dataReady = !loading && orgBookings !== null;

  if (dataReady && allDone) return null;

  if (!dataReady) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-72 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="divide-y divide-gray-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 sm:p-5">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedCount = [hasOrg, walletFunded, hasBooking].filter(
    Boolean,
  ).length;

  const steps = [
    {
      key: "business",
      title: "Complete your business setup",
      body: hasOrg
        ? "Your company details are saved."
        : "Add your company name, RC number, and industry.",
      done: hasOrg,
      locked: false,
      action: hasOrg
        ? null
        : { label: "Set up business", onClick: () => router.push("/business-setup") },
    },
    {
      key: "wallet",
      title: "Fund your wallet",
      body: walletFunded
        ? "Your corporate wallet is funded and ready."
        : "Add money to your wallet to pay for staff trips.",
      done: walletFunded,
      locked: !hasOrg,
      action:
        !hasOrg || walletFunded
          ? null
          : {
              label: "Fund wallet",
              onClick: () => router.push("/dashboard/business/wallet"),
            },
    },
    {
      key: "booking",
      title: "Make your first booking",
      body: hasBooking
        ? "You have made your first booking."
        : "Book a vehicle for yourself or a staff member.",
      done: hasBooking,
      locked: !hasOrg || !walletFunded,
      action:
        hasBooking || !hasOrg || !walletFunded
          ? null
          : {
              label: "Book a vehicle",
              onClick: () => {
                if (onBook) onBook();
                else router.push("/booking/search");
              },
            },
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              Finish setting up your business
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              A few steps to start booking trips for your team.
            </p>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-medium text-[#0673FF]">
            {completedCount} of 3 done
          </span>
        </div>
      </div>

      <ol className="divide-y divide-gray-100">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-start gap-3 p-4 sm:p-5">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step.done
                  ? "bg-[#0673FF] text-white"
                  : step.locked
                    ? "bg-gray-100 text-gray-400"
                    : "border-2 border-[#0673FF] text-[#0673FF]"
              }`}
            >
              {step.done ? <CheckIcon /> : index + 1}
            </div>

            <div className="min-w-0 flex-1 sm:flex sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.locked ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`mt-0.5 text-sm ${
                    step.locked ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {step.body}
                </p>
              </div>

              {step.action && (
                <button
                  type="button"
                  onClick={step.action.onClick}
                  className="mt-3 w-full shrink-0 rounded-lg bg-[#0673FF] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0560d6] sm:mt-0 sm:w-auto"
                >
                  {step.action.label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
