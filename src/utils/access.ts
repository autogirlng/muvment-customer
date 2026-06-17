// Whether a user may see and use the corporate API integration area.
// Granted per user by an admin via the apiKeyEnabled flag on the user record.
export const hasIntegrationAccess = (
  user: { apiKeyEnabled?: boolean; [key: string]: any } | null | undefined,
): boolean => Boolean(user?.apiKeyEnabled === true);
