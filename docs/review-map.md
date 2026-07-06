# Muvment Customer Web — Review Map (cell: web-frontend)

Stack: Next.js 15.5.7 (App Router, Turbopack), React 19, TanStack Query, Formik+Yup, Zustand, axios, js-cookie, react-toastify, Google Maps, Paystack/Monnify checkout.
API base: `NEXT_PUBLIC_API_URL` = `https://api-muvment.up.railway.app` (STAGING — confirmed safe to mutate). Prod URL `NEXT_PROD_API_URL` exists in env but is **not read by any code** (verified: only `NEXT_PUBLIC_API_URL` is referenced in `appClient.ts`, `sitemap.ts`).

## Global mechanisms (Rule 2 inventory)
- **HTTP client**: `src/controllers/connnector/appClient.ts` — axios wrapper. Token from cookie `muvment_access_token`. Returns tuple `[data, message]`; errors are NOT thrown, returned as `{err, status}`. **No timeout set** (hang risk). **No 401→refresh→retry**; 401 just yields an "Unauthorized" message.
- **Callers layer**: `src/controllers/connnector/app.callers.ts` — createData/updateData/patch/delete wrappers; `withLoading` global blocking overlay; client-side `validateDataInput` SQL-injection regex on many PUT/Auth bodies; `NetworkService.checkConnection()` hard-redirects to `/Network-checker` when `navigator.onLine` is false.
- **React Query hooks**: `src/controllers/connnector/apiHooks.ts`.
- **Auth/session**: `src/context/AuthContext.tsx` + `src/controllers/auth/auth.ts`. Cookies: `muvment_access_token`, `muvment_refresh_token`, `muvment_user`, `muvment_remember`. `secure` only in production; `sameSite=strict`. Tokens set client-side (JS-readable, not httpOnly). `AuthService.refreshToken()` and `AuthContext.setTokens()` exist but have **no callers** — no silent refresh.
- **Route protection**: no Next middleware. Dashboard guard is client-only in `components/pagesComponent/DashboardLayout.tsx`.
- **Network banner**: `components/Network/NetworkService.ts`.
- **Analytics/PII**: `services/analytics.ts` (GA), `services/clarity.ts` (Microsoft Clarity) — identify with user id + name/email.

## Flags / remote config (Rule 3)
- None found (no feature-flag system). Payment gateway choice (Paystack/Monnify) is a runtime UI toggle, both live.

## Providers
- Paystack + Monnify (checkout via backend `initialize`/`initiate` → `authorization_url` → `window.location.href` redirect). External boundary.
- Google Maps (location autocomplete, geocoding).
- Microsoft Clarity, Google Analytics, LiveChat.

## Route → primary component/controller map
See `review-flows.md` for the numbered register. Route pages under `src/app/**/page.tsx`; heavy logic lives in `src/components/**` client components and `src/controllers/**` services.

## Verification method for this run
- Browser automation (Playwright): **NOT available** in this session. Interactive JS flows are Traced from code.
- Read-only curl checks against localhost:3000 (SSR HTML) and staging API used where they add signal (tagged `Ran it (curl)`).
- All mutating flows: Traced from code (per safety gate + no browser).
