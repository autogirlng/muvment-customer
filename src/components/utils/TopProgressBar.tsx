"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// A thin top bar that starts when an internal link is clicked and completes
// when the route changes, so a click feels acknowledged. Never covers content.
export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const finish = () => {
      if (!startedRef.current) return;
      startedRef.current = false;
      clearTimers();
      setWidth(100);
      timers.current.push(setTimeout(() => setVisible(false), 200));
      timers.current.push(setTimeout(() => setWidth(0), 450));
    };
    const start = () => {
      startedRef.current = true;
      clearTimers();
      setVisible(true);
      setWidth(8);
      timers.current.push(setTimeout(() => setWidth(45), 120));
      timers.current.push(setTimeout(() => setWidth(70), 350));
      timers.current.push(setTimeout(() => setWidth(85), 800));
      timers.current.push(setTimeout(finish, 8000));
    };
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      start();
    };
    const onNavStart = () => start();
    const onPopState = () => start();

    // Catch programmatic navigations (router.push / router.replace and <Link>),
    // which all go through the History API. Only trigger on a real pathname
    // change so same-page query updates (e.g. applying filters) don't flash it.
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    const wrap =
      (orig: History["pushState"]): History["pushState"] =>
      function (this: History, ...args: Parameters<History["pushState"]>) {
        const prevPath = window.location.pathname;
        orig.apply(this, args);
        // React calls these from inside an insertion effect during navigation,
        // which forbids scheduling state updates. Defer so start() runs after
        // that phase, and skip if a click already kicked it off.
        if (window.location.pathname !== prevPath && !startedRef.current) {
          queueMicrotask(() => start());
        }
      };
    window.history.pushState = wrap(origPush);
    window.history.replaceState = wrap(origReplace);

    document.addEventListener("click", onClick, true);
    window.addEventListener("app:navstart", onNavStart);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("app:navstart", onNavStart);
      window.removeEventListener("popstate", onPopState);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      clearTimers();
    };
  }, []);

  // Complete once the route actually changes.
  useEffect(() => {
    if (!startedRef.current) return;
    startedRef.current = false;
    clearTimers();
    setWidth(100);
    const t1 = setTimeout(() => setVisible(false), 200);
    const t2 = setTimeout(() => setWidth(0), 450);
    timers.current.push(t1, t2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-[#0673FF]"
        style={{ width: `${width}%`, transition: "width 250ms ease" }}
      />
    </div>
  );
}
