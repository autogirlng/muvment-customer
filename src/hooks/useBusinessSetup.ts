"use client";

import { useEffect, useState } from "react";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";

// One source of truth for how far a business account has gotten through setup.
// Step 1 is creating the business (hasOrg), step 2 is funding the wallet
// (walletFunded). setupComplete is true once both are done, and is always true for a
// personal (non-business) account, since those have nothing to set up.
export type BusinessSetup = {
  loading: boolean;
  isBusiness: boolean;
  hasOrg: boolean;
  walletFunded: boolean;
  setupComplete: boolean;
  orgId: string | null;
};

export function useBusinessSetup(): BusinessSetup {
  const corp = useCorporateMembership();
  const orgId = corp.org?.id ?? null;
  const [walletFunded, setWalletFunded] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (corp.loading) return;
    // Only a business owner with an org can (or needs to) have a funded wallet.
    if (!corp.isOwnerLike || !orgId) {
      setChecked(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const info = await OrganizationService.getWalletInfo(orgId);
        if (!active) return;
        setWalletFunded(!!info && Number(info.balance) > 0);
      } catch {
        if (active) setWalletFunded(false);
      } finally {
        if (active) setChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [corp.loading, corp.isOwnerLike, orgId]);

  const isBusiness = corp.isOwnerLike;
  const hasOrg = !!orgId;
  const loading = corp.loading || (isBusiness && !checked);
  const setupComplete = !isBusiness || (hasOrg && walletFunded);

  return { loading, isBusiness, hasOrg, walletFunded, setupComplete, orgId };
}
