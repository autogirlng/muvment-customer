// Corporate spending allowances reset on the 1st of each month (the backend runs
// a scheduled job that zeroes each member's amount spent). Everything that shows a
// limit should say so, and should agree on how the numbers are derived.

export const LIMIT_RESET_NOTE = "Limits reset on the 1st of each month.";

export type Allowance = {
  /** false means uncapped: the member can spend up to the wallet balance. */
  hasLimit: boolean;
  limit: number | null;
  spent: number;
  /** null when uncapped. Never negative. */
  remaining: number | null;
  /** 0-100, null when uncapped. */
  percentUsed: number | null;
  /** Capped and nothing left. */
  exhausted: boolean;
};

const toNumber = (value: unknown): number => {
  // BigDecimal can serialize as a string, and bad input should not produce NaN.
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : 0;
};

export const computeAllowance = (
  limit?: number | string | null,
  spent?: number | string | null,
): Allowance => {
  const spentValue = Math.max(0, toNumber(spent));

  // Only null/undefined means uncapped. Zero is a real limit: spend nothing.
  if (limit == null || limit === "") {
    return {
      hasLimit: false,
      limit: null,
      spent: spentValue,
      remaining: null,
      percentUsed: null,
      exhausted: false,
    };
  }

  const limitValue = Math.max(0, toNumber(limit));
  const remaining = Math.max(0, limitValue - spentValue);
  const percentUsed =
    limitValue === 0 ? 100 : Math.min(100, (spentValue / limitValue) * 100);

  return {
    hasLimit: true,
    limit: limitValue,
    spent: spentValue,
    remaining,
    percentUsed,
    exhausted: remaining <= 0,
  };
};

export const naira = (value?: number | string | null): string =>
  `₦${toNumber(value).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/**
 * What a member can actually spend on one booking: the smaller of their remaining
 * monthly allowance and the wallet balance. Either may be unknown (staff cannot
 * read the wallet balance), in which case it does not constrain the answer.
 */
export const spendableAmount = (
  remaining: number | null,
  walletBalance: number | null,
): number | null => {
  if (remaining == null && walletBalance == null) return null;
  if (remaining == null) return walletBalance;
  if (walletBalance == null) return remaining;
  return Math.min(remaining, walletBalance);
};
