"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// A large share of traffic arrives inside the Instagram or Facebook in-app
// browser, where some web features are blocked and checkout is less reliable.
// To avoid friction for casual browsing, this only appears on the booking and
// checkout pages, the exact moment where the in-app browser causes real
// problems (the form and the payment redirect). On Android it can open Chrome
// directly; on iOS, where apps block that, it offers copy-link plus a short
// instruction. It appears once per session and is easy to dismiss.

// Pages where the in-app browser genuinely hurts reliability.
const isSensitivePath = (path: string): boolean =>
  path.includes("/booking/create") ||
  path.includes("/special-checkout") ||
  path.includes("/special-pricing");

const isInAppBrowser = (ua: string): boolean => {
  const s = ua.toLowerCase();
  return (
    s.includes("instagram") ||
    s.includes("fban") ||
    s.includes("fbav") ||
    s.includes("fb_iab") ||
    s.includes("line/") ||
    s.includes("tiktok") ||
    s.includes("musical_ly")
  );
};

const isIOS = (ua: string): boolean => /iphone|ipad|ipod/i.test(ua);

export const InAppBrowserNotice = () => {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const forced =
      typeof window !== "undefined" &&
      window.location.search.includes("forceInApp=1");
    const dismissed = sessionStorage.getItem("inAppNoticeDismissed");
    const onSensitivePage = isSensitivePath(pathname || "") || forced;
    if ((isInAppBrowser(ua) || forced) && onSensitivePage && !dismissed) {
      setShow(true);
      setIos(isIOS(ua));
    }
  }, [pathname]);

  const dismiss = () => {
    try {
      sessionStorage.setItem("inAppNoticeDismissed", "1");
    } catch {}
    setShow(false);
  };

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "muvment.ng";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  // Android: an intent link hands the current URL to Chrome.
  const androidIntent = () => {
    if (typeof window === "undefined") return "#";
    const withoutScheme = currentUrl.replace(/^https?:\/\//, "");
    return `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/40"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[1001]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />

              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF2FF]">
                  <svg
                    className="h-6 w-6 text-[#0673ff]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#101928]">
                    Open in your browser
                  </h3>
                  <p className="mt-1 text-[13px] leading-snug text-gray-500">
                    To make sure your booking and payment go through smoothly,
                    open this page in {ios ? "Safari" : "Chrome"}.
                  </p>
                </div>
              </div>

              {ios ? (
                <>
                  <button
                    onClick={copyLink}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0673ff] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0560d6]"
                  >
                    {copied ? "Link copied" : "Copy link"}
                  </button>
                  <p className="mt-3 text-center text-[12px] leading-snug text-gray-500">
                    {copied
                      ? "Now open Safari and paste the link in the address bar."
                      : "Then open Safari and paste the link, or tap the ••• menu above and choose \"Open in Safari\"."}
                  </p>
                </>
              ) : (
                <>
                  <a
                    href={androidIntent()}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0673ff] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0560d6]"
                  >
                    Open in Chrome
                  </a>
                  <button
                    onClick={copyLink}
                    className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-[14px] font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {copied ? "Link copied" : "Copy link instead"}
                  </button>
                </>
              )}

              <button
                onClick={dismiss}
                className="mt-4 w-full text-center text-[13px] font-medium text-gray-400"
              >
                Continue here anyway
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
