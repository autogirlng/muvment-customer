"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import { Organization } from "@/types/Organization.type";

// The backend authorizes on the membership role, never on userType. userType is a
// signup artifact: someone who already had an account when they were invited keeps
// userType CUSTOMER while being a real ORG_STAFF member. So corporate features must
// key off membership, not userType.
//
// Cached per user for the session so every dashboard page does not refetch.
let cache: { userId: string; orgs: Organization[] } | null = null;
let inflight: Promise<Organization[]> | null = null;

const fetchOrgs = (userId: string): Promise<Organization[]> => {
  if (cache && cache.userId === userId) return Promise.resolve(cache.orgs);
  if (!inflight) {
    inflight = OrganizationService.getMyOrganizations()
      .then((orgs) => {
        const list = Array.isArray(orgs) ? orgs : [];
        cache = { userId, orgs: list };
        return list;
      })
      .catch(() => [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/** Call after joining, leaving, or changing an organization. */
export const clearCorporateMembershipCache = () => {
  cache = null;
};

export type CorporateMembership = {
  loading: boolean;
  /** The caller's organization, or null when they belong to none. */
  org: Organization | null;
  role: "ORG_ADMIN" | "ORG_STAFF" | null;
  isMember: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  /** Owner of a business account, even before the organization is created. */
  isOwnerLike: boolean;
  refresh: () => Promise<void>;
};

export function useCorporateMembership(): CorporateMembership {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // The login response calls it userId; /users/me calls it id. AuthContext normalizes
  // this, but fall back anyway so a missing id can never silently disable every
  // corporate feature. The key only scopes the cache.
  const userId =
    (user as any)?.id ?? (user as any)?.userId ?? user?.email ?? "";

  const [orgs, setOrgs] = useState<Organization[] | null>(
    cache && cache.userId === userId ? cache.orgs : null,
  );
  const [loading, setLoading] = useState(orgs === null);

  const load = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setOrgs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await fetchOrgs(userId || "current");
    setOrgs(list);
    setLoading(false);
  }, [authLoading, isAuthenticated, userId]);

  useEffect(() => {
    let active = true;
    (async () => {
      // While auth is still hydrating from cookies on a hard refresh, isAuthenticated
      // is briefly false before the user loads. Stay in the loading state instead of
      // reporting "no membership", which would make gated pages (like the wallet)
      // redirect the user away before their organization has a chance to load.
      if (authLoading) {
        if (active) setLoading(true);
        return;
      }
      if (!isAuthenticated) {
        if (active) {
          setOrgs([]);
          setLoading(false);
        }
        return;
      }
      const list = await fetchOrgs(userId || "current");
      if (!active) return;
      setOrgs(list);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, userId]);

  const refresh = useCallback(async () => {
    clearCorporateMembershipCache();
    await load();
  }, [load]);

  const org = orgs && orgs.length > 0 ? orgs[0] : null;
  const role = (org?.myRole as "ORG_ADMIN" | "ORG_STAFF" | undefined) ?? null;

  return {
    loading,
    org,
    role,
    isMember: !!org,
    isAdmin: role === "ORG_ADMIN",
    isStaff: role === "ORG_STAFF",
    // When the user has a membership, their role in the org decides. userType is only a
    // fallback for a would-be owner who has not created an org yet, so a staff member
    // whose account userType happens to be ORGANIZATION_ADMIN is not treated as an owner.
    isOwnerLike:
      role != null
        ? role === "ORG_ADMIN"
        : user?.userType === "ORGANIZATION_ADMIN",
    refresh,
  };
}
