"use client";

import { useState } from "react";
import { FiCopy, FiCheck, FiX } from "react-icons/fi";
import { OrganizationWalletInfo } from "@/types/Organization.type";

type Props = {
  open: boolean;
  onClose: () => void;
  wallet: OrganizationWalletInfo | null;
};

// Bank transfer details for funding the corporate wallet. A transfer lands via a
// Paystack webhook, so there is nothing to submit here: the person copies the account
// and pays from their bank app, and the balance updates on its own.
export default function FundWalletModal({ open, onClose, wallet }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copy = async () => {
    if (!wallet?.virtualAccountNumber) return;
    try {
      await navigator.clipboard.writeText(wallet.virtualAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fund wallet</h2>
            <p className="mt-1 text-sm text-gray-500">
              Transfer any amount to this account from your bank app. Your balance
              updates automatically, usually within a few minutes.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {wallet?.virtualAccountNumber ? (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Account number</p>
                <p className="text-lg font-bold tracking-wide text-gray-900">
                  {wallet.virtualAccountNumber}
                </p>
              </div>
              <button
                onClick={copy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <FiCheck className="h-4 w-4 text-green-600" /> Copied
                  </>
                ) : (
                  <>
                    <FiCopy className="h-4 w-4" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
              <div>
                <p className="text-xs text-gray-500">Bank</p>
                <p className="text-sm font-medium text-gray-900">
                  {wallet.bankName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account name</p>
                <p className="text-sm font-medium text-gray-900">
                  {wallet.accountName || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            Your funding account is being set up. Check back in a moment for the
            account details.
          </div>
        )}
      </div>
    </div>
  );
}
