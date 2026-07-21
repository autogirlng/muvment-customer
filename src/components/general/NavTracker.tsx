"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const COUNT_KEY = "muvment:navCount";
const LAST_KEY = "muvment:lastPath";

// Counts how many distinct pages the user has opened within the app this tab
// session. useSafeBack reads this to decide whether router.back() has a real
// in-app page to return to, or whether it would dead-click or leave the site
// (the case on a direct deep link or an in-app browser). Reloads do not bump
// the count because the path has not changed since it was last recorded.
export default function NavTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    try {
      const last = sessionStorage.getItem(LAST_KEY);
      if (last !== pathname) {
        const current = parseInt(
          sessionStorage.getItem(COUNT_KEY) || "0",
          10,
        );
        sessionStorage.setItem(COUNT_KEY, String(current + 1));
        sessionStorage.setItem(LAST_KEY, pathname);
      }
    } catch {
      // sessionStorage may be unavailable (private mode, some webviews). Back
      // navigation still works; it just falls back to a route on direct entry.
    }
  }, [pathname]);

  return null;
}
