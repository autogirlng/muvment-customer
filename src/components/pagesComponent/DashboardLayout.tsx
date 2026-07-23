"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { hasIntegrationAccess } from "@/utils/access";
import { useCorporateMembership } from "@/hooks/useCorporateMembership";
import { BookingSearchModalForm } from "@/components/HomeComponent/BookingInterface";
import ScreenLoader from "@/components/utils/ScreenLoader";
import {
  FiGrid,
  FiCalendar,
  FiNavigation,
  FiMapPin,
  FiHeart,
  FiCreditCard,
  FiUsers,
  FiFileText,
  FiClock,
  FiGift,
  FiBell,
  FiBriefcase,
  FiLink,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiMoreHorizontal,
  FiX,
} from "react-icons/fi";

const BRAND = "#0673ff";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
};

const ITEMS = {
  dashboard: { label: "Dashboard", href: "/dashboard", icon: FiGrid, exact: true },
  myBookings: { label: "My bookings", href: "/dashboard/my-booking", icon: FiCalendar },
  myTrips: { label: "My trips", href: "/dashboard/my-trips", icon: FiNavigation },
  favourites: { label: "Favourites", href: "/dashboard/favourites", icon: FiHeart },
  companyBookings: { label: "Company bookings", href: "/dashboard/business/bookings", icon: FiFileText },
  payment: { label: "Payment", href: "/dashboard/payment", icon: FiCreditCard },
  approvals: { label: "Approvals", href: "/dashboard/business/approvals", icon: FiClock },
  team: { label: "Team", href: "/dashboard/business/team", icon: FiUsers },
  refer: { label: "Refer a friend", href: "/dashboard/refer-a-friend", icon: FiGift },
  notifications: { label: "Notifications", href: "/dashboard/notification", icon: FiBell },
  integrations: { label: "Integrations", href: "/dashboard/integrations", icon: FiLink },
  settings: { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
} satisfies Record<string, NavItem>;

type NavSection = { heading?: string; items: NavItem[] };

// Groups the nav into what is for the person, what is for the business, and the rest,
// so the sidebar reads clearly and business entries only appear for business accounts.
function buildNavSections(flags: {
  isBusiness: boolean;
  isBusinessUser: boolean;
  canIntegrate: boolean;
}): NavSection[] {
  const { isBusiness, isBusinessUser, canIntegrate } = flags;

  const personal: NavItem[] = [
    ITEMS.dashboard,
    ITEMS.myBookings,
    ITEMS.myTrips,
    ITEMS.favourites,
  ];

  const business: NavItem[] = [];
  if (isBusiness) {
    business.push(ITEMS.companyBookings, ITEMS.payment, ITEMS.approvals, ITEMS.team);
  } else if (isBusinessUser) {
    // Staff: their bookings show under My bookings, so there is no separate Company
    // bookings entry. Payment stays with their personal items.
    personal.push(ITEMS.payment);
  } else {
    personal.push(ITEMS.payment, ITEMS.refer);
  }

  const other: NavItem[] = [ITEMS.notifications];
  if (canIntegrate) other.push(ITEMS.integrations);
  other.push(ITEMS.settings);

  const sections: NavSection[] = [{ items: personal }];
  if (business.length) sections.push({ heading: "Business", items: business });
  sections.push({ heading: "Account", items: other });
  return sections;
}

// Secondary destinations shown in the mobile "More" sheet.
const MORE_ITEMS: NavItem[] = [
  { label: "My trips", href: "/dashboard/my-trips", icon: FiNavigation },
  { label: "Company bookings", href: "/dashboard/business/bookings", icon: FiFileText },
  { label: "Approvals", href: "/dashboard/business/approvals", icon: FiClock },
  { label: "Team", href: "/dashboard/business/team", icon: FiUsers },
  { label: "Favourites", href: "/dashboard/favourites", icon: FiHeart },
  { label: "Refer a friend", href: "/dashboard/refer-a-friend", icon: FiGift },
  { label: "Integrations", href: "/dashboard/integrations", icon: FiLink },
  { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/my-booking": "My bookings",
  "/dashboard/booking": "Booking details",
  "/dashboard/favourites": "Favourites",
  "/dashboard/payment": "Payment",
  "/dashboard/business/wallet": "Wallet",
  "/dashboard/business/bookings": "Company bookings",
  "/dashboard/business/approvals": "Approvals",
  "/dashboard/business/team": "Team",
  "/dashboard/refer-a-friend": "Refer a friend",
  "/dashboard/notification": "Notifications",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/edit-profile": "Edit profile",
  "/dashboard/integrations": "Integrations",
  "/dashboard/integrations/create-organization": "Create organization",
  "/dashboard/integrations/submit-kyc": "Submit KYC",
};

const titleFor = (pathname: string) => {
  if (TITLES[pathname]) return TITLES[pathname];
  const hit = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k));
  return hit ? TITLES[hit] : "Dashboard";
};

const pathActive = (pathname: string, href: string, exact?: boolean) =>
  exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

const BottomTab = ({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) => (
  <Link
    href={href}
    className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
    style={{ color: active ? BRAND : "#6b7280" }}
  >
    <Icon className="h-5 w-5" />
    {label}
  </Link>
);

const DashboardLayoutClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [moreOpen, setMoreOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const open = () => setBookOpen(true);
    window.addEventListener("muvment:open-book", open);
    return () => window.removeEventListener("muvment:open-book", open);
  }, []);

  useEffect(() => {
    if (!bookOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bookOpen]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !accessToken) {
      logout();
      router.replace("/auth/login");
      return;
    }
    if (
      user?.isBanned ||
      user?.status === "banned" ||
      user?.isActive === false
    ) {
      logout();
      router.replace("/access-denied");
    }
  }, [isAuthenticated, isLoading, accessToken, user, router, logout]);

  // Must run before the early returns below: hooks cannot be called conditionally.
  // Membership role is authoritative (userType is stale for invited users who already
  // had an account). isOwnerLike keeps Wallet and Team visible to a business owner who
  // has not created the organization yet.
  const corp = useCorporateMembership();

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "My account";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";
  const moreActive = MORE_ITEMS.some((m) => pathActive(pathname, m.href));
  const canIntegrate = hasIntegrationAccess(user);
  const isBusiness = corp.isOwnerLike;
  // Staff are part of a company too: keep the corporate view free of referrals.
  const isBusinessUser = isBusiness || corp.isMember;

  const logoutNow = () => {
    logout();
    router.replace("/auth/login");
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link
        href="/"
        className="flex items-center gap-2 px-5 h-16 shrink-0 border-b border-gray-100"
      >
        <img src="/images/image.png" alt="Muvment" className="h-7 w-auto" />
      </Link>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {buildNavSections({ isBusiness, isBusinessUser, canIntegrate }).map(
          (section, si) => (
            <div key={section.heading ?? `section-${si}`} className="space-y-1">
              {section.heading && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {section.heading}
                </p>
              )}
              {section.items.map((item) => {
                const active = pathActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? "text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={active ? { backgroundColor: BRAND } : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ),
        )}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <FiLogOut className="h-5 w-5" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30">
        {sidebar}
      </aside>

      {/* Content column */}
      <div className="lg:pl-64 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 flex items-center gap-3 px-4 lg:px-8">
          <Link
            href="/"
            aria-label="Muvment home"
            className="lg:hidden shrink-0"
          >
            <img src="/images/logomark.svg" alt="Muvment" className="h-8 w-8" />
          </Link>
          <h1 className="truncate text-lg font-semibold text-gray-900">
            {titleFor(pathname)}
          </h1>
          {corp.isMember && corp.org?.name && (
            <span className="hidden sm:inline-flex max-w-[200px] items-center gap-1.5 truncate rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-medium text-[#0673ff]">
              <FiBriefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{corp.org.name}</span>
            </span>
          )}
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Notifications: bell on mobile (sidebar handles it on desktop) */}
            <Link
              href="/dashboard/notification"
              aria-label="Notifications"
              className="lg:hidden p-1 text-gray-600 hover:text-gray-900"
            >
              <FiBell className="h-6 w-6" />
            </Link>
            <div className="hidden sm:block text-right leading-tight">
              <p className="max-w-[160px] truncate text-sm font-medium text-gray-900">
                {fullName}
              </p>
              <p className="max-w-[160px] truncate text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND }}
            >
              {initials}
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </div>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white border-t border-gray-100 flex items-stretch justify-around px-2">
        <BottomTab
          href="/dashboard"
          label="Home"
          Icon={FiGrid}
          active={pathActive(pathname, "/dashboard", true)}
        />
        <BottomTab
          href="/dashboard/my-booking"
          label="Bookings"
          Icon={FiCalendar}
          active={pathActive(pathname, "/dashboard/my-booking")}
        />
        <button
          type="button"
          onClick={() => setBookOpen(true)}
          aria-label="Book a vehicle"
          className="flex w-16 items-center justify-center"
        >
          <span
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
            style={{ backgroundColor: BRAND }}
          >
            <FiPlus className="h-6 w-6" />
          </span>
        </button>
        <BottomTab
          href="/dashboard/payment"
          label="Payments"
          Icon={FiCreditCard}
          active={pathActive(pathname, "/dashboard/payment")}
        />
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
          style={{ color: moreActive ? BRAND : "#6b7280" }}
        >
          <FiMoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 pb-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-base font-bold text-gray-900">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {MORE_ITEMS.filter(
                (m) =>
                  (canIntegrate || m.href !== "/dashboard/integrations") &&
                  (isBusiness || m.href !== "/dashboard/business/wallet") &&
                  (isBusiness || m.href !== "/dashboard/business/approvals") &&
                  (isBusiness || m.href !== "/dashboard/business/bookings") &&
                  (isBusiness || m.href !== "/dashboard/business/team") &&
                  (!isBusinessUser || m.href !== "/dashboard/refer-a-friend"),
              ).map((m) => {
                const Icon = m.icon;
                const active = pathActive(pathname, m.href);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 py-3 text-sm font-medium"
                    style={{ color: active ? BRAND : "#374151" }}
                  >
                    <Icon className="h-5 w-5" /> {m.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  setConfirmLogout(true);
                }}
                className="flex w-full items-center gap-3 py-3 text-sm font-medium text-gray-700"
              >
                <FiLogOut className="h-5 w-5" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {bookOpen && (
        <div className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setBookOpen(false)}
          />
          <div className="relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-gray-900">Book a vehicle</h3>
              <button
                type="button"
                onClick={() => setBookOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <Suspense fallback={null}>
                <BookingSearchModalForm />
              </Suspense>
            </div>
          </div>
        </div>
      )}
      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FiLogOut className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Log out?</h3>
            <p className="mt-1 text-sm text-gray-500">
              You will need to sign in again to access your dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={logoutNow}
                className="w-full rounded-full bg-[#0673ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a55c4]"
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="w-full rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayoutClient;
