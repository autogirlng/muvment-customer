export const isProduction = (): boolean =>
  process.env.NEXT_PUBLIC_ENVIRONMENT === "PRODUCTION";
