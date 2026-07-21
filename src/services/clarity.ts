// Microsoft Clarity helpers.
// Clarity custom events do not carry properties, so contextual data is attached
// as session tags via "set", which can then be used to filter and segment
// recordings in the Clarity dashboard. "identify" uses Clarity's documented
// signature (custom id, session id, page id, friendly name).
//
// Clarity's script can be slow to initialise, and in some in-app browsers it
// loads late or intermittently. Calls made before it is ready used to be
// dropped silently, which under-counted events and made the funnel look worse
// than reality. Calls are now queued and flushed once Clarity is available, so
// an event fired on a fast navigation or in a slow browser is not lost.
type ClarityFn = (...args: any[]) => void;

const getClarity = (): ClarityFn | null => {
  if (typeof window === "undefined") return null;
  const c = (window as any).clarity;
  return typeof c === "function" ? c : null;
};

// Pending calls waiting for Clarity to load. Bounded so it can never grow
// without limit if Clarity never initialises.
const MAX_QUEUE = 50;
let queue: any[][] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let waited = 0;
const MAX_WAIT_MS = 20000;
const POLL_MS = 500;

const runFlush = () => {
  const clarity = getClarity();
  if (clarity) {
    const pending = queue;
    queue = [];
    pending.forEach((args) => {
      try {
        clarity(...args);
      } catch {
        // ignore a single bad call
      }
    });
    stopPolling();
    return;
  }
  waited += POLL_MS;
  if (waited >= MAX_WAIT_MS) {
    // Give up so we do not poll forever; drop what could not be sent.
    queue = [];
    stopPolling();
  }
};

const startPolling = () => {
  if (flushTimer || typeof window === "undefined") return;
  waited = 0;
  flushTimer = setInterval(runFlush, POLL_MS);
};

const stopPolling = () => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};

// Send to Clarity now if ready, otherwise queue for when it loads.
const call = (...args: any[]) => {
  const clarity = getClarity();
  if (clarity) {
    try {
      clarity(...args);
    } catch {
      // ignore
    }
    return;
  }
  if (typeof window === "undefined") return;
  if (queue.length < MAX_QUEUE) queue.push(args);
  startPolling();
};

export const claritySet = (key: string, value: string | number | boolean) => {
  call("set", key, String(value));
};

export const clarityEvent = (name: string, tags?: Record<string, any>) => {
  call("event", name);
  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      if (value !== undefined && value !== null && typeof value !== "object") {
        call("set", key, String(value));
      }
    });
  }
};

export const clarityIdentify = (userId: string, friendlyName?: string) => {
  if (!userId) return;
  call("identify", userId, undefined, undefined, friendlyName);
};
