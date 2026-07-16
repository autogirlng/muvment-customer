"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import {
  computeAllowance,
  naira,
  LIMIT_RESET_NOTE,
} from "@/utils/corporateAllowance";

export default function StaffCompanyCard() {
  // Keyed off the membership role, not userType: someone invited who already had an
  // account is ORG_STAFF while their userType stays CUSTOMER.
  const { loading, org, isStaff } = useCorporateMembership();

  if (!loading && !isStaff) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-3 w-56 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  // A suspended or removed member no longer comes back from the API, so there is
  // nothing to show and the corporate options disappear with it.
  if (!org || !isStaff) return null;

  const allowance = computeAllowance(org.mySpendingLimit, org.myAmountSpent);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900">
            {org.name}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            You can book trips with the company wallet.
          </p>
        </div>
        <span className="w-fit shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Staff
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        {!allowance.hasLimit ? (
          <>
            <p className="text-sm font-medium text-gray-900">
              No monthly spending limit
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              You have spent {naira(allowance.spent)} this month.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-gray-500">Remaining this month</p>
              <p
                className={`text-lg font-bold ${
                  allowance.exhausted ? "text-red-500" : "text-gray-900"
                }`}
              >
                {naira(allowance.remaining)}
              </p>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${
                  allowance.exhausted ? "bg-red-400" : "bg-[#0673FF]"
                }`}
                style={{ width: `${allowance.percentUsed ?? 0}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {naira(allowance.spent)} spent of {naira(allowance.limit)}.{" "}
              {LIMIT_RESET_NOTE}
            </p>

            {allowance.exhausted && (
              <div className="mt-2">
                <p className="text-xs text-red-500">
                  {allowance.limit === 0
                    ? "Your administrator has not allocated you any spend."
                    : "You have used your allowance. It resets next month, or your administrator can raise it."}
                </p>
                {org.businessEmail && (
                  <a
                    href={`mailto:${org.businessEmail}`}
                    className="mt-1 inline-block text-xs font-medium text-[#0673FF] hover:underline"
                  >
                    Contact {org.businessEmail}
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Link
        href="/booking/search"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: "#0673FF" }}
      >
        Book with company wallet
        <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
