"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiUserX,
  FiUserCheck,
  FiTrash2,
  FiX,
  FiEdit2,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import {
  OrganizationMember,
  OrganizationInvite,
} from "@/types/Organization.type";
import {
  computeAllowance,
  naira,
  LIMIT_RESET_NOTE,
} from "@/utils/corporateAllowance";

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const displayName = (m: OrganizationMember) =>
  [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.email;

// The admin (owner) is always treated as active regardless of the flag.
const isActiveMember = (m: OrganizationMember) =>
  m.role === "ORG_ADMIN" || m.isActive;

type Tab = "members" | "invited";
type StatusFilter = "all" | "active" | "suspended";

export default function BusinessTeamPage() {
  const { user, isLoading } = useAuth();
  const corp = useCorporateMembership();
  const router = useRouter();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [noOrg, setNoOrg] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("members");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);

  const handleCancelInvite = async (inv: OrganizationInvite) => {
    if (!orgId || inviteBusyId) return;
    if (!window.confirm(`Cancel the invite to ${inv.email}?`)) return;
    setInviteBusyId(inv.inviteId);
    const ok = await OrganizationService.cancelInvite(orgId, inv.inviteId);
    if (ok) {
      toast.success("Invite cancelled.");
      await load(orgId);
    } else {
      toast.error("Could not cancel the invite.");
    }
    setInviteBusyId(null);
  };

  const handleResendInvite = async (inv: OrganizationInvite) => {
    if (!orgId || inviteBusyId) return;
    setInviteBusyId(inv.inviteId);
    const ok = await OrganizationService.resendInvite(orgId, inv.inviteId);
    setInviteBusyId(null);
    if (ok) {
      toast.success(`Invite re-sent to ${inv.email}.`);
    } else {
      toast.error("Could not resend the invite.");
    }
  };

  const load = useCallback(async (id: string) => {
    const [memberList, inviteList] = await Promise.all([
      OrganizationService.getMembers(id),
      OrganizationService.getPendingInvites(id),
    ]);
    setMembers(Array.isArray(memberList) ? memberList : []);
    setInvites(Array.isArray(inviteList) ? inviteList : []);
  }, []);

  useEffect(() => {
    if (isLoading || corp.loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!corp.loading && !corp.isOwnerLike) {
      router.replace("/dashboard");
      return;
    }
    let active = true;
    (async () => {
      const orgs = await OrganizationService.getMyOrganizations();
      if (!active) return;
      const org = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;
      if (!org?.id) {
        setNoOrg(true);
        setLoading(false);
        return;
      }
      setOrgId(org.id);
      await load(org.id);
      if (!active) return;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isLoading, corp.loading, corp.isOwnerLike, user, router, load]);

  const counts = useMemo(() => {
    let activeCount = 0;
    let suspendedCount = 0;
    for (const m of members) {
      if (isActiveMember(m)) activeCount += 1;
      else suspendedCount += 1;
    }
    return {
      total: members.length,
      active: activeCount,
      suspended: suspendedCount,
      invited: invites.length,
    };
  }, [members, invites]);

  const filteredMembers = useMemo(() => {
    if (statusFilter === "active") return members.filter(isActiveMember);
    if (statusFilter === "suspended")
      return members.filter((m) => !isActiveMember(m));
    return members;
  }, [members, statusFilter]);

  const handleInvite = async () => {
    setInviteError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setInviteError("Enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (trimmed === user?.email?.toLowerCase()) {
      setInviteError("You cannot invite yourself.");
      return;
    }
    const rawLimit = limit.trim();
    let parsedLimit: number | undefined;
    if (rawLimit) {
      const n = Number(rawLimit.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(n) || n < 0) {
        setInviteError("Enter a valid spending limit, or leave it blank.");
        return;
      }
      parsedLimit = n;
    }
    if (!orgId) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setInviteError("You appear to be offline. Check your connection.");
      return;
    }
    setInviting(true);
    const res = await OrganizationService.inviteStaff(orgId, trimmed, parsedLimit);
    setInviting(false);
    if (res.error) {
      setInviteError(res.message || "Could not send the invite. Try again.");
      return;
    }
    toast.success("Invitation sent.");
    setInviteOpen(false);
    setEmail("");
    setLimit("");
    await load(orgId);
  };

  const closeInvite = () => {
    setInviteOpen(false);
    setEmail("");
    setLimit("");
    setInviteError("");
  };

  const handleSuspend = async (m: OrganizationMember) => {
    if (!orgId || busyId) return;
    setBusyId(m.userId);
    const ok = await OrganizationService.toggleStaffSuspension(orgId, m.userId);
    if (ok) {
      toast.success(m.isActive ? "Member suspended." : "Member reactivated.");
      await load(orgId);
    } else {
      toast.error("Could not update the member.");
    }
    setBusyId(null);
  };

  const handleRemove = async (m: OrganizationMember) => {
    if (!orgId || busyId) return;
    if (!window.confirm(`Remove ${m.email} from the team?`)) return;
    setBusyId(m.userId);
    const ok = await OrganizationService.removeStaff(orgId, m.userId);
    if (ok) {
      toast.success("Member removed.");
      if (editingLimitId === m.userId) setEditingLimitId(null);
      await load(orgId);
    } else {
      toast.error("Could not remove the member.");
    }
    setBusyId(null);
  };

  const handleChangeRole = async (m: OrganizationMember) => {
    if (!orgId || busyId) return;
    const promote = m.role !== "ORG_ADMIN";
    const message = promote
      ? `Make ${m.email} an admin? They will be able to manage the team and the wallet, and their spending limit is removed.`
      : `Make ${m.email} a staff member? They will lose access to the wallet and team management.`;
    if (!window.confirm(message)) return;

    setBusyId(m.userId);
    const res = await OrganizationService.changeMemberRole(
      orgId,
      m.userId,
      promote ? "ORG_ADMIN" : "ORG_STAFF",
    );
    setBusyId(null);
    if (res.error) {
      toast.error(res.message || "Could not change the role.");
      return;
    }
    toast.success(promote ? "Member promoted to admin." : "Admin moved to staff.");
    if (editingLimitId === m.userId) setEditingLimitId(null);
    await load(orgId);
  };

  const startEditLimit = (m: OrganizationMember) => {
    setEditingLimitId(m.userId);
    setLimitInput(m.spendingLimit != null ? String(m.spendingLimit) : "");
  };

  const saveLimit = async (m: OrganizationMember) => {
    if (!orgId) return;
    const raw = limitInput.trim();
    const value: number | null = raw
      ? Number(raw.replace(/[^\d.]/g, ""))
      : null;
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      toast.error("Enter a valid amount, or clear it for no limit.");
      return;
    }
    setSavingLimit(true);
    const ok = await OrganizationService.updateStaffLimit(orgId, m.userId, value);
    setSavingLimit(false);
    if (ok) {
      toast.success(value === null ? "Limit removed." : "Spending limit updated.");
      setEditingLimitId(null);
      await load(orgId);
    } else {
      toast.error("Could not update the limit.");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0673FF] border-t-transparent" />
      </div>
    );
  }

  if (noOrg) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your business first
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create your business account before inviting your team.
          </p>
          <button
            onClick={() => router.push("/business-setup")}
            className="mt-4 rounded-xl bg-[#0673FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0560d6]"
          >
            Set up business
          </button>
        </div>
      </div>
    );
  }

  const filterChips: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.total },
    { key: "active", label: "Active", count: counts.active },
    { key: "suspended", label: "Suspended", count: counts.suspended },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Team</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Invite people to book with your corporate wallet and set their limits.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0673FF] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#0560d6]"
        >
          <FiPlus className="h-4 w-4" /> Invite member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(
          [
            { key: "members", label: "Members", count: counts.total },
            { key: "invited", label: "Invited", count: counts.invited },
          ] as { key: Tab; label: string; count: number }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-[#0673FF] text-[#0673FF]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                tab === t.key
                  ? "bg-[#EAF2FF] text-[#0673FF]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "members" ? (
        <>
          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-2">
            {filterChips.map((c) => (
              <button
                key={c.key}
                onClick={() => setStatusFilter(c.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === c.key
                    ? "border-[#0673FF] bg-[#EAF2FF] text-[#0673FF]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {filteredMembers.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                {members.length === 0
                  ? "No team members yet. Invite someone to get started."
                  : "No members match this filter."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Monthly limit</th>
                      <th className="px-4 py-3 font-medium">Spent</th>
                      <th className="px-4 py-3 font-medium">Remaining</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMembers.map((m) => {
                      const isAdmin = m.role === "ORG_ADMIN";
                      const myId =
                        (user as any)?.id ?? (user as any)?.userId ?? null;
                      const isSelf =
                        (!!myId && m.userId === myId) ||
                        (!!user?.email &&
                          m.email?.toLowerCase() === user.email.toLowerCase());
                      const active = isActiveMember(m);
                      const allowance = computeAllowance(
                        m.spendingLimit,
                        m.amountSpent,
                      );
                      const hasLimit = allowance.hasLimit;
                      const remaining = allowance.remaining;
                      const editing = editingLimitId === m.userId;
                      return (
                        <tr key={m.memberId} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-sm font-semibold text-[#0673FF]">
                                {(m.firstName?.[0] || m.email[0] || "?").toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-gray-900">
                                  {displayName(m)}
                                  {isSelf && (
                                    <span className="ml-1 text-xs text-gray-400">
                                      (you)
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-xs text-gray-400">
                                  {m.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                isAdmin
                                  ? "bg-[#EAF2FF] text-[#0673FF]"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isAdmin ? "Admin" : "Staff"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {isAdmin ? (
                              <span className="text-gray-400">—</span>
                            ) : editing ? (
                              <div className="flex items-center gap-1.5">
                                <div className="relative">
                                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                    ₦
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    value={limitInput}
                                    onChange={(e) => setLimitInput(e.target.value)}
                                    placeholder="No limit"
                                    className="w-28 rounded-lg border border-gray-300 py-1.5 pl-5 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0673FF]"
                                  />
                                </div>
                                <button
                                  onClick={() => saveLimit(m)}
                                  disabled={savingLimit}
                                  className="rounded-lg bg-[#0673FF] px-2 py-1.5 text-xs font-medium text-white hover:bg-[#0560d6] disabled:opacity-60"
                                >
                                  {savingLimit ? "…" : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingLimitId(null)}
                                  className="rounded-lg px-1.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : hasLimit ? (
                              naira(m.spendingLimit)
                            ) : (
                              <span className="text-gray-400">No limit</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {isAdmin ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              naira(m.amountSpent)
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {isAdmin || remaining == null ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <span
                                className={
                                  allowance.exhausted
                                    ? "font-medium text-red-500"
                                    : ""
                                }
                              >
                                {naira(remaining)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                active
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  active ? "bg-green-500" : "bg-red-400"
                                }`}
                              />
                              {active ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(m.joinedAt)}
                          </td>
                          <td className="px-4 py-3">
                            {isSelf ? (
                              <div className="text-right text-xs text-gray-300">
                                —
                              </div>
                            ) : isAdmin ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleChangeRole(m)}
                                  disabled={busyId === m.userId}
                                  title="Move to staff"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <FiUser className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleChangeRole(m)}
                                  disabled={busyId === m.userId}
                                  title="Make admin"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-[#EAF2FF] hover:text-[#0673FF] disabled:opacity-50"
                                >
                                  <FiShield className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => startEditLimit(m)}
                                  disabled={busyId === m.userId}
                                  title="Edit spending limit"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleSuspend(m)}
                                  disabled={busyId === m.userId}
                                  title={m.isActive ? "Suspend" : "Reactivate"}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  {m.isActive ? (
                                    <FiUserX className="h-4 w-4" />
                                  ) : (
                                    <FiUserCheck className="h-4 w-4 text-green-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRemove(m)}
                                  disabled={busyId === m.userId}
                                  title="Remove"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="px-1 text-xs text-gray-400">{LIMIT_RESET_NOTE}</p>
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {invites.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No pending invites. Invited people who have not joined yet appear
              here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {invites.map((inv) => (
                <li
                  key={inv.inviteId}
                  className="flex items-center gap-3 p-4 sm:px-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                    <FiMail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {inv.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {inv.spendingLimit != null
                        ? `Monthly limit ${naira(inv.spendingLimit)}`
                        : "No limit"}{" "}
                      · Invited {formatDate(inv.invitedAt)}
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 sm:inline">
                    Pending
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleResendInvite(inv)}
                      disabled={inviteBusyId === inv.inviteId}
                      title="Resend invite"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={`h-4 w-4 ${
                          inviteBusyId === inv.inviteId ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleCancelInvite(inv)}
                      disabled={inviteBusyId === inv.inviteId}
                      title="Cancel invite"
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Invite a team member
              </h2>
              <button
                onClick={closeInvite}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              They will get an email to join. If they already have a Muvment
              account, they are added straight away.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setInviteError("");
                  }}
                  placeholder="teammate@company.com"
                  maxLength={150}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0673FF] ${
                    inviteError ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Monthly spending limit{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0673FF]"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Cap how much this person can spend each month. Leave blank for no
                  limit.
                </p>
              </div>
              {inviteError && (
                <p className="text-sm text-red-500">{inviteError}</p>
              )}
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="w-full rounded-xl bg-[#0673FF] py-3 text-sm font-semibold text-white hover:bg-[#0560d6] disabled:opacity-60"
              >
                {inviting ? "Sending..." : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
