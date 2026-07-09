"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { OrganizationWalletInfo } from "@/types/Organization.type";
import { naira } from "@/utils/corporateAllowance";
import FundWalletModal from "@/components/Dashboard/FundWalletModal";

// Shown at the top of the Payment page for a business owner: the company wallet
// balance, a Fund button that opens the bank-transfer details, and a link into the
// full wallet transactions page. Only an admin can read the balance, so this renders
// for owners only; staff manage their allowance from the dashboard company card.
export default function WalletSummaryCard() {
  const router = useRouter();
  const corp = useCorporateMembership();
  const [wallet, setWallet] = useState<OrganizationWalletInfo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);

  const orgId = corp.org?.id ?? null;

  useEffect(() => {
    if (corp.loading || !corp.isOwnerLike || !orgId) return;
    let active = true;
    (async () => {
      const info = await OrganizationService.getWalletInfo(orgId);
      if (!active) return;
      setWallet(info);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [corp.loading, corp.isOwnerLike, orgId]);

  if (corp.loading || !corp.isOwnerLike || !orgId || !loaded) return null;

  return (
    <>
      <div className="flex-1 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Company wallet balance</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {naira(wallet?.balance ?? 0)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setFundOpen(true)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#0673ff" }}
            >
              Fund wallet
            </button>
            <button
              onClick={() => router.push("/dashboard/business/wallet")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View wallet transactions
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <FundWalletModal
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        wallet={wallet}
      />
    </>
  );
}
