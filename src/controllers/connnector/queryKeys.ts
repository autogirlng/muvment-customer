/**
 * Every cached query key in one place.
 *
 * Keys are declared here rather than written inline so a mutation on one screen
 * can reliably invalidate a list on another. Getting a key subtly wrong is the
 * usual cause of a deleted row reappearing, or a newly invited member not
 * showing until a hard refresh, and that is impossible to spot by reading a
 * single file.
 *
 * The query client is configured to keep data indefinitely and not refetch on
 * mount, so revisiting a page costs nothing. That places the responsibility on
 * whoever changes data: after a create, update or delete, update or invalidate
 * the affected key here.
 */
export const queryKeys = {
  notifications: ["notifications"] as const,
  favourites: ["favourites"] as const,
  profile: ["profile"] as const,

  myBookings: ["my-bookings"] as const,
  myTrips: ["my-trips"] as const,

  team: (organizationId?: string) => ["team", organizationId ?? "none"] as const,
  teamInvites: (organizationId?: string) =>
    ["team-invites", organizationId ?? "none"] as const,
  organization: ["organization"] as const,
  // Deliberately not nested under team: the balance does not change when a
  // member is suspended or removed, so it should not be refetched by those.
  orgWallet: (organizationId?: string) =>
    ["org-wallet", organizationId ?? "none"] as const,
} as const;
