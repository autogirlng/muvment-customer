import { useCallback } from "react";
import { useRouter } from "next/navigation";

const COUNT_KEY = "muvment:navCount";

// Returns a back handler that only calls router.back() when there is a real
// in-app page to return to. On a direct entry (deep link, ad, shared link, or
// an in-app browser opened straight to this page) the browser has nothing to go
// back to, so router.back() either does nothing or throws the user out of the
// app. In that case this routes to a sensible fallback instead.
export function useSafeBack() {
  const router = useRouter();

  return useCallback(
    (fallback: string = "/") => {
      let canGoBack = false;
      try {
        const count = parseInt(
          sessionStorage.getItem(COUNT_KEY) || "0",
          10,
        );
        canGoBack = count > 1;
      } catch {
        canGoBack = false;
      }

      if (canGoBack) {
        router.back();
      } else {
        router.push(fallback);
      }
    },
    [router],
  );
}
