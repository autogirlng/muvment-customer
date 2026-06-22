// Microsoft Clarity helpers.
// Clarity custom events do not carry properties, so contextual data is attached
// as session tags via "set", which can then be used to filter and segment
// recordings in the Clarity dashboard. "identify" uses Clarity's documented
// signature (custom id, session id, page id, friendly name).
type ClarityFn = (...args: any[]) => void;

const getClarity = (): ClarityFn | null => {
  if (typeof window === "undefined") return null;
  const c = (window as any).clarity;
  return typeof c === "function" ? c : null;
};

export const claritySet = (key: string, value: string | number | boolean) => {
  const clarity = getClarity();
  if (!clarity) return;
  clarity("set", key, String(value));
};

export const clarityEvent = (name: string, tags?: Record<string, any>) => {
  const clarity = getClarity();
  if (!clarity) return;
  clarity("event", name);
  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      if (value !== undefined && value !== null && typeof value !== "object") {
        clarity("set", key, String(value));
      }
    });
  }
};

export const clarityIdentify = (userId: string, friendlyName?: string) => {
  const clarity = getClarity();
  if (!clarity || !userId) return;
  clarity("identify", userId, undefined, undefined, friendlyName);
};
