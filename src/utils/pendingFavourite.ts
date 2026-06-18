// Remembers a vehicle a signed-out user tried to favourite, so it can be added
// automatically once they finish signing up or logging in.

const KEY = "muvment:pendingFavourite";
const MAX_AGE = 30 * 60 * 1000; // 30 minutes

export const FAVOURITES_CHANGED_EVENT = "muvment:favourites-changed";

export function setPendingFavourite(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ id, ts: Date.now() }));
  } catch {
    // storage unavailable; ignore
  }
}

export function getPendingFavourite(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; ts?: number };
    if (!parsed?.id || typeof parsed.ts !== "number") {
      window.localStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - parsed.ts > MAX_AGE) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return parsed.id;
  } catch {
    return null;
  }
}

export function clearPendingFavourite(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
