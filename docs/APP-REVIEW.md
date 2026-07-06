# Muvment Customer Web — Full App Review

**Cell:** web-frontend · **Repo:** `muvment-customer` (Next.js 15 App Router, React 19, TypeScript)
**Branch reviewed:** `feat/min-3h-lead-start-time` · **Date:** 2026-07-01

---

## How to read this document

1. **[Executive summary](#1-executive-summary)** — the scoreboard and the one-paragraph verdict.
2. **[Fix-first list](#2-fix-first-priority-list)** — the exact bugs to fix, in order, with file:line.
3. **[Recurring root causes](#3-recurring-root-causes)** — patterns that cause many bugs; fix once, help everywhere.
4. **[Security notes](#4-security-notes)** — flagged separately from correctness.
5. **[Full flow-by-flow detail](#5-flow-by-flow-detail)** — all 34 flows, each with a verdict and every finding (severity, `file:line`, what's wrong, why it matters, how to reproduce). **This is the working reference** when you sit down to fix.
6. **[Method & limitations](#6-method--limitations)** — how the review was done and what it did *not* cover.

**Severity:** `High` = breaks the flow or corrupts data/money · `Med` = degrades or misbehaves in a real scenario · `Low` = cosmetic/edge/maintainability.
**Verdict:** ✅ Pass · 🟡 Pass with issues · ❌ Broken.
**Every finding is code-traced** (no interactive browser run yet — see [§6](#6-method--limitations)). A handful were independently re-verified and are marked *(confirmed)*.

---

## 1. Executive summary

34 end-to-end user flows were enumerated (verified with three independent passes) and each was reviewed against its code path.

| Verdict | Count | Flows |
|---|---|---|
| ✅ Pass | 3 | F3 Account verify, F4 Forgot password, F22 Track booking |
| 🟡 Pass w/ issues | 26 | F1 F2 F5 F7 F9 F10 F11 F13 F14 F16 F18 F19 F20 F21 F23 F24 F25 F26 F27 F28 F29 F30 F31 F32 F33 F34 |
| ❌ Broken | 5 | **F6 Session/refresh, F8 Search+filters, F12 Vehicle-reviews link, F15 Standard checkout, F17 Pending payment** |

**Bottom line:** the app is broadly functional, but **the two most important money paths — the standard checkout (F15) and pending-payment (F17) — are broken at the final redirect step**, and **sessions silently die on token expiry (F6)**. These three should be fixed before anything else. A cluster of "pass with issues" flows share the same handful of root causes (see [§3](#3-recurring-root-causes)), so fixing those patterns clears many findings at once.

---

## 2. Fix-first priority list

### 🔴 P0 — Money path broken (fix immediately)

**1. F15 Standard checkout — external gateway redirect uses `router.push()`**
`src/components/Booking/CreateBooking/CostBreakdown.tsx:443`
The primary booking path redirects to the Paystack/Monnify URL via Next App-Router `router.push(authUrl)`, which is intended for **internal** routes, not external absolute URLs. The booking is already **created** and the price estimate cleared (lines 358, 399) *before* the redirect runs — so if the navigation doesn't leave the site, the user is left with a **real, unpaid booking and no way to reach the payment page**. Every other payment site in the codebase uses `window.location.href` (`PaymentOptionsModal.tsx:70`, `booking/success/page.tsx:282`, `special-checkout/page.tsx:359`, `TrackBookingClient.tsx:212`). *(confirmed)*
**Fix:** `window.location.href = authUrl;`

**2. F17 Pending payment — same `router.push` bug + wrong Paystack field**
`src/app/pending_payment/[bookingId]/page.tsx:82-92`
Uses `router.push(booking.data)` for the external URL **and**, for Paystack, pushes the `data` **object** instead of `.paymentUrl`/`.authorizationUrl` (the Monnify branch reads the field correctly). Re-payment from this screen cannot leave the site.
**Fix:** read the URL string field, then `window.location.href = url;`

### 🟠 P1 — Broken flows / session

**3. F6 Token refresh is dead code → sessions die on expiry**
`src/controllers/auth/auth.ts:303-342` + `src/context/AuthContext.tsx:146-167`
`refreshToken()` and `setTokens()` exist but have **zero callers** (no axios interceptor, no 401 handler, no timer). When the access token expires the guard just logs the user out — even though a valid 7-day refresh-token cookie is present.
**Fix:** add an axios response interceptor on 401 → call `refreshToken` → `setTokens` → retry; or a refresh timer.

**4. F8 Vehicle search — filter/URL desync on reload**
`src/components/pagesComponent/ExploreVehiclesClient.tsx:496-501` vs `src/app/booking/search/page.tsx:106-113`
The client writes the vehicle-type filter to the URL as `vehicleTypeId`, but the server page reads it as `params.category`. On hard reload / deep-link with an active Vehicle Type filter, the initial (SSR) results ignore the filter and don't match the visible chips. (Also `src/hooks/useFilters.ts` + `src/hooks/filterConfig.ts` are dead/divergent copies with a different state shape.)
**Fix:** align the URL param key the client writes with the key the server reads.

**5. F12 "See all reviews" link 404s**
`src/components/Reviews/index.tsx:137`
Links to `/Booking/details/${vehicleId}/reviews` (capital **B**). Next.js routes are case-sensitive and the real route is lowercase `/booking/...` → hard 404.
**Fix:** lowercase the path. (Also fix `goToNextPage` off-by-one at `Reviews/index.tsx:41-43` — it can advance one page past the last.)

**6. Banned users → `/access-denied` (404)**
`src/components/pagesComponent/DashboardLayout.tsx:140-147`
Banned/inactive users are redirected to `/access-denied`, which **has no route** → 404. *(confirmed — no `src/app/access-denied` exists)*
**Fix:** create the route, or redirect to an existing page with a message.

### 🟠 P1 — Integrity bugs (High-severity, inside "pass-with-issues" flows)

**7. F31 `revokeApiKey` never detects failure → two live API keys**
`src/controllers/organization/Organization.service.ts:99-124`
`deleteData` returns `{error:true}` instead of throwing, so `revokeApiKey`'s try/catch never fires and `regenerateApiKey` mints a **new** key while the old one may still be active.
**Fix:** check the returned `.error` before proceeding to generate.

**8. F24 My bookings — client grouping vs server pagination → duplicate rows**
`src/app/dashboard/my-booking/page.tsx:311-333, 83-101`
The list groups segments into one row per `bookingId` on the client, but pagination fetches raw **segments** (page size 10). A multi-segment booking whose segments straddle a page boundary renders as **two separate rows**, and the "N bookings" footer never matches the visible count.
**Fix:** paginate by booking, or accumulate all segments before grouping.

**9. F33 Blog — auth gate is dead + like/unlike broken**
`src/components/blogComponent/Blogdetailsclient.tsx:149-156` reads `localStorage["auth_token"]`, but the app stores auth in the cookie `muvment_access_token` → `isLoggedIn` is **always false**, and `showLoginModal` is set but **never rendered**. Separately, `src/controllers/BlogService/blogService.ts:147-157` `likePost` reads `envelope.id` (undefined) → **unlike never fires** and repeated clicks inflate the like count.
**Fix:** use `useAuth()` from `AuthContext`; read the id at `response.data.data.id`.

---

## 3. Recurring root causes

Fixing these patterns resolves many findings across different flows:

- **`router.push` vs `window.location.href` for external URLs.** Causes F15 and F17 to break. Audit every payment/gateway redirect: external absolute URLs must use `window.location.href` (or `<a>`), never Next's `router.push`.
- **Swallowed API errors read as success.** `handleApiResponse` / `createData` / `deleteData` / `patchWithoutParams` return `{error:true, data:null}` on failure instead of throwing. Many callers only check truthiness/`!response` and treat a failed call as success. Affects F21 (favourite "Added" toast on failure), F29 (referral code generate), F30 (profile-picture upload), F31 (revoke key), F33, and newsletter. **Standardize:** every mutation checks `.error` and shows a user-visible error.
- **Fragile response-shape parsing.** Deep access like `bookingData[0].data`, `data.data[0].data`, and long `a || b || c` fallback chains appear throughout payment/success/invoice/org flows. A single backend envelope change breaks many screens and surfaces as a generic "not found." Prefer one documented parse per endpoint with a guard.
- **Client-side pagination capped at `size:1000`** with no indicator. Dashboard metrics, my-trips, and payment "total spent" silently undercount for heavy users.
- **Dead / duplicate code carrying latent bugs.** `Booking/SearchBar.tsx`, `hooks/useFilters.ts` + `filterConfig.ts`, `controllers/booking/favouritevehicleservice.ts`, `PaymentService.downloadReceipt` + `ReceiptGenerator`, `ProfileService.switchToHost`, a duplicate `Booking/Servicepricingcard.tsx`, and `Booking/ReviewModel.tsx` are all unused. Some contain real bugs that would bite if ever wired up. Recommend deleting.

---

## 4. Security notes

Flagged separately — these are not "broken flow" bugs but real exposure:

- **Auth tokens in JS-readable cookies + localStorage.** `AuthContext.tsx:100-102,157-162` — tokens are stored in non-`httpOnly` cookies (readable by any script → XSS-exfiltratable) and mirrored to `localStorage`; the `secure` flag is only set in production, so tokens travel over plain HTTP in non-prod.
- **Client-trusted money field.** Checkout POSTs `discountAmount` to `/api/v1/bookings` (`CostBreakdown.tsx:318,336`), a field **not** in the `CreateBookingRequest` type. Confirm the backend ignores it and derives price solely from `calculationId`; otherwise a tampered value could discount an order.
- **3-hour lead-time is client-only.** `TimePicker.tsx` merely greys out slots; there is no submit-time re-check. A stale/edited selection can bypass it. The backend must enforce the rule.

---

## 5. Flow-by-flow detail

> This is the working reference. Each flow: **what it does**, **verdict**, and **every finding** with `file:line`.
> Endpoints are under `NEXT_PUBLIC_API_URL` (remote Railway API). Auth = Bearer from cookie `muvment_access_token`. No `middleware.ts`; dashboard auth is client-side in `DashboardLayout.tsx`.

### AUTH

#### F1 — Register + OTP verify — 🟡
Sign up (email/phone/password + optional referral code) → OTP verify → login. Files: `src/app/auth/register/page.tsx`, `src/components/AuthComponent/OTPInput.tsx`, `src/controllers/auth/auth.ts`.
- **Med** `src/controllers/connnector/app.callers.ts:480-505` — `validateDataInput` rejects any field containing `;`, `--`, `/*`, `*/`, or quote-then-`#`. The password rules count `;` `-` `#` as valid special characters, so a password that passes the on-screen checklist is silently rejected as a "Character validation error." *Repro: sign up with `Aa3;xxxx`.*
- **Med** `src/app/auth/register/page.tsx:202` — `toast.success(response.data.message || …)` throws if the backend returns an empty body; the throw lands in `catch` and shows a **false failure** even though the account was created.
- **Low** `src/app/auth/register/page.tsx:76` — `INITIAL_VALUES.referralCode = ReferalCode` mutates a shared module-level constant with a possibly-`null` value; can leave `referralCode` as `"null"` across renders.

#### F2 — Login — 🟡
Email + password → tokens → `/dashboard`. Files: `src/app/auth/login/page.tsx`, `src/context/AuthContext.tsx`.
- **Med** `src/app/auth/login/page.tsx:82` — the "unverified email" redirect fires only on an **exact string match** (`response.message === "Please verify your email before logging in."`). Any wording/shape drift strands an unverified user on a generic "Login failed" toast with no path to verification.
- **Low** `src/controllers/auth/auth.ts:194-199` — `AuthService.login` also calls `storeAuthData(handledResponse.data.accessToken, …)`, but the real payload is one level deeper (`…data.data.accessToken`), so it writes `undefined` cookies. Harmless only because the page separately calls `AuthContext.login()` correctly.
- **Low** `src/app/auth/login/page.tsx:100-113` — `login(...)` is async but not awaited before `router.push("/dashboard")`. Safe today (cookies set synchronously first) but an ordering hazard.

#### F3 — Account verification (standalone) — ✅
Guards missing `email` param, verifies 6-digit OTP, 60s resend cooldown, routes to login. Clean.
- **Low** `src/app/auth/account-verification/page.tsx:25-30` — missing-email guard runs in `useEffect` after first paint (brief form flash before redirect). Cosmetic.

#### F4 — Forgot password — ✅
Validates email → `forgotPassword` → routes to reset with email param. No findings.

#### F5 — Reset password — 🟡
Email + OTP + new password (6 rules) + confirm → `resetPassword` → login.
- **Med** `src/controllers/connnector/app.callers.ts:480-505` (via `reset-password:83`) — same password-validator collision as F1: a valid new password with `;`/`--`/etc. is rejected.
- **Low** `src/app/auth/reset-password/page.tsx:35` — no guard/redirect if the user lands here without `?email=`; the button stays permanently disabled with no explanation, and there is no resend-OTP affordance on this page.

#### F6 — Session / logout / token refresh — ❌
Cookie load, client guard, logout, and "remember me" work. Refresh is entirely non-functional.
- **High** `src/controllers/auth/auth.ts:303-342` & `src/context/AuthContext.tsx:146-167` — `refreshToken` and `setTokens` are **dead code** (zero callers). Access-token expiry → guard forces logout despite a valid refresh cookie. *Repro: let the access token expire, then make any dashboard call.*
- **High** `src/components/pagesComponent/DashboardLayout.tsx:140-147` — banned/inactive users redirected to `/access-denied`, which **doesn't exist** → 404.
- **Med** `src/context/AuthContext.tsx:59-82` — auth restored purely from cookies with no token validation; partial-cookie states (user cookie cleared but token survives, or vice versa) desync state and still attach a stale bearer token.
- **Low** `DashboardLayout.tsx:133-148` — on unauth it calls `logout()` (which does `window.location.href=...`) **and** `router.replace(...)` — competing double navigation.
- **Security** tokens in JS-readable cookies + localStorage; `secure` only in prod (see [§4](#4-security-notes)).

### DISCOVERY / SEARCH

#### F7 — Home landing + search entry — 🟡
Real search entry is `HomeComponent/BookingInterface.tsx` (within-state/airport/interstate/boat), builds a URL, routes to `/booking/search`.
- **Med** `src/components/Booking/SearchBar.tsx:29-338` — **dead code** (no importers); the real entry is `BookingInterface.tsx`. The dead file has an always-empty category dropdown and hardcoded placeholder ids (`"suv-electric"`, `"12-hours"`) that would submit bogus values if ever mounted.
- **Low** `src/components/HomeComponent/BookingInterface.tsx:1477-1482` — with no start date chosen, search silently defaults `fromDate` to tomorrow and passes it as `startDate`; the results page then treats it as a dated search and can hide available cars.

#### F8 — Vehicle search + filters — ❌
`/booking/search` fetches SSR then hands to `ExploreVehiclesClient` (filters, URL sync, infinite scroll).
- **High** `ExploreVehiclesClient.tsx:496-501` vs `src/app/booking/search/page.tsx:106-113` — client writes vehicle type to the URL as `vehicleTypeId`; the SSR fetch reads `params.category`. On reload/deep-link the Vehicle Type filter is ignored → initial results don't match the chips. *Repro: apply a Vehicle Type filter, copy URL, reload.*
- **High** `src/hooks/useFilters.ts:1-45`, `src/hooks/filterConfig.ts:1-44` — dead/divergent filter logic (different `FilterState` shape, `clearAll` resets differently) not used by the live flow.
- **Med** `ExploreVehiclesClient.tsx:385-388` — a deep link with only `minPrice` (no `maxPrice`) yields `priceRange: undefined` → price filter silently dropped on first client search.
- **Med** `ExploreVehiclesClient.tsx:282-304, 547-565` — the IntersectionObserver effect depends on `filterState`, so every filter change re-creates the observer and can fire an immediate redundant page-1 append after a page-0 replace.
- **Med** `src/app/booking/search/page.tsx:70,99-104` — server and client each resolve `monthlyTypeId` independently via keyword match; if they disagree, SSR and the first client refetch differ on whether to strip dates.

#### F9 — Explore vehicles — 🟡
`/explore` and `/booking/explore` render the same client with near-identical SSR pages.
- **High** `src/app/explore/page.tsx:75` & `src/app/booking/explore/page.tsx:72` — pass `city: params.city || params.location`; sending a full place name (e.g. "Lagos, Nigeria") as `city` returns no results (documented in `vechicle.ts:330-347`). Deep-link with only `location` → empty list where `/booking/search` works.
- **Low** empty-results fallback omits the city/nearby-by-distance recommendation logic that `/booking/search` has → "Other cars in {area}" can show unrelated cars.
- **Low** featured mode renders the filter bar but ignores filters (silent no-op if a stray filter param is present).

#### F10 — Browse by state — 🟡
`/booking/states/[stateId]` → `StateExploreVehiclesClient` (pagination, infinite scroll).
- **Med** `StateExploreVehiclesClient.tsx:69-71` — appended pages are concatenated with **no de-dupe by id** (unlike `ExploreVehiclesClient`), so a repeated vehicle across pages causes duplicate React keys.
- **Low** `StateExploreVehiclesClient.tsx:136` — `totalCount` rendered raw with no "100+" cap (cosmetic inconsistency).

#### F11 — Vehicle details — 🟡
`/booking/details/[id]` resolves slug-or-UUID, renders `notFound()`/error states, seeds itinerary, auto-estimates price, links to `/booking/create/{id}`.
- **Med** `VehicleDetailsClient.tsx:932-935` — checkout relies on `sessionStorage` (`priceEstimateId`, `trips`, `couponCode`) with no guard that the write succeeded before navigation → checkout can load without an estimate (e.g. private mode).
- **Med** `VehicleDetailsClient.tsx:595-609` — a past `startDate` in a stale deep link is seeded without validation → invalid trip rejected downstream instead of at seed.
- **Low** `VehicleDetailsClient.tsx:1848` — "Vehicle type" chip lacks the `|| "N/A"` fallback its siblings have → empty chip when type is null.
- **Low** `src/app/booking/details/[id]/page.tsx:12-30` — a transient 500 on both id+slug lookups renders a hard 404 (no retry/error page).

#### F12 — Vehicle reviews view — ❌
Standalone reviews route + the reviews block on the details page.
- **High** `src/components/Reviews/index.tsx:137` — "See all reviews" links to `/Booking/details/${vehicleId}/reviews` (capital **B**) → case-sensitive **404**. *Repro: vehicle with ≥10 reviews → click "See all reviews".*
- **Med** `src/components/Reviews/index.tsx:41-43` — `goToNextPage` clamps to `Math.min(prev+1, pages)` but the max valid 0-based index is `pages-1`; the arrow can advance one page past the end.
- **Low** `Reviews/index.tsx:28,119` — if reached via a slug URL, the `entity/{id}` call receives a slug and likely returns nothing.

### PARTNER / SERVICE-PRICING

#### F13 — Partner directory + profile — 🟡
Directory list, debounced search, load-more, slug routing, priority/other vehicle split, `partnerId` propagation into checkout — all wired. `partnerId` flows via query string → `sessionStorage.partnerBookingId` → `CostBreakdown` `data.partnerId`.
- **Med** `PartnersDirectory.tsx:145-159` — `loadMore` reads the raw `search` input, not the term the current list was fetched with; typing after results settle paginates a *different* query and appends mismatched partners. Also `res.page`/`res.totalPages` used without fallback.
- **Low** `src/app/partnership/[slug]/page.tsx:67-69` — error "Try again" CTA is `<a href="">` (empty href) → dead retry.
- **Low** `PartnerShip.tsx:76-81,232` — hero `<img>` and map iframe assume `imageUrl`/`latitude`/`longitude` exist; null coords → broken `q=null,null` map.

#### F14 — Service-pricing showcase / special-pricing browse — 🟡
Showcase carousel → slug CTA → `/booking/[id]/special-pricing` → sessionStorage handoff → `/booking/[id]/special-checkout`.
- **Med** `src/controllers/booking/Servicepricingservice .ts:36` — `getServicePricingById` does `allPricing[0].data.find(...)` with **no** optional chaining → throws on an empty showcase (latent; slug variant right below is guarded).
- **Med** `src/components/Booking/Servicepricingcard.tsx:39-47` — a **second, divergent** `ServicePricingCard` routes by ID (`/booking/{id}/special-pricing`) while the live one (`general/Servicepricingcard.tsx:82`) routes by slug; the `Booking/` copy is dead/stale. Delete to avoid wiring the wrong CTA.
- **Low** `src/app/booking/[id]/special-pricing/page.tsx:6-11` — `PageProps.params` types a `yearRangeId` that is always `undefined` (folder is `[id]`).
- **Low** `Servicepricingdetailsclient.tsx:180-185` — trusts stored pricing if `slug` matches, without schema validation.

### BOOKING / CHECKOUT

#### F15 — Standard booking checkout — ❌  *(crown jewel)*
Itinerary → price calculate (POST/PUT `/public/bookings/calculate`) → create booking (POST `/bookings`) → payment init (Paystack `/payments/initialize/{id}` or Monnify `/payments/initiate`) → gateway redirect. The chain is well-structured (reusable `calculationId`, 409 handling, double validation gate, JSON.parse guards, one-shot retry). The redirect breaks it.
- **High** `CostBreakdown.tsx:443` — final gateway redirect uses `router.push(authUrl)` (external URL through App-Router). Booking already created + estimate cleared before the push → failed navigation leaves a real unpaid booking with no recovery. Siblings use `window.location.href`. *(confirmed)*
- **High** `TimePicker.tsx:204-216` + `CostBreakdown.tsx:124-232` — the 3-hour lead-time rule is enforced **only** by greying dropdown slots; **no submit-time re-check** in `estimatePrice`/`processPayment`, and a stale selected time isn't invalidated when the date is changed to today → sub-3h bookings can be submitted.
- **Med** `CostBreakdown.tsx:318,336` — client sends `discountAmount` to POST `/bookings`; not in `CreateBookingRequest` type (client-trusted money — see [§4](#4-security-notes)).
- **Med** `PersonalInformationForm.tsx:22` + `PersonalInformationFormMyself.tsx:103` + `PersistBookingDraft.tsx:19-24` — `whoBookedRide` always inits to `"myself"` and isn't restored from storage; on remount after choosing "Others", the Myself draft merges `isBookingForOthers:false` back into storage → an "Others" booking silently becomes "myself" with an empty phone.
- **Low** `CostBreakdown.tsx:322` — `recipientSecondaryPhoneNumber` prefixed with an unset `secondaryCountryCode` (dead branch today).
- **Low** `CostBreakdown.tsx:291` — `discountAmount` captured at pay time from last-rendered pricing may lag the actual `calculationId`.

#### F16 — Special / service-pricing checkout — 🟡
Pricing → estimate → booking-create → gateway redirect (correctly uses `window.location.href`). Storage-driven with an empty-state guard.
- **Med** `special-checkout/page.tsx:488-493` — a surviving `servicePricingBookingId` cookie (24h) makes `handleBookNow` reuse the old booking and skip `createNewBooking`; if trips/estimate changed meanwhile, the user pays the **old** total while seeing a different on-screen amount. *Repro: start, abandon at gateway, return within 24h, edit trip, pay.*
- **Med** `special-checkout/page.tsx:466-467` — `bookingResponse.data.data.bookingId` assumed with no guard → shape drift redirects to `…?bookingId=undefined`.
- **Med** `special-checkout/page.tsx:503-509` — "for others" path creates a PENDING_PAYMENT booking and routes straight to success without initiating payment (payment-link model), but the booker gets no explicit "unpaid" signal beyond the success page.
- **Low** fragile `||` gateway-URL fallback chain; `Servicepricingservice.ts:36` missing `?.` guard.

#### F17 — Pending payment — ❌
Existing booking awaiting payment → breakdown → proceed to gateway.
- **High** `pending_payment/[bookingId]/page.tsx:82-92` — `router.push(booking.data)` for the external gateway URL (should be `window.location.href`).
- **High** `pending_payment/[bookingId]/page.tsx:84-86` — Paystack branch pushes the `booking.data` **object**, not `.paymentUrl`/`.authorizationUrl` (Monnify branch reads the field correctly).
- **Med** `pending_payment/[bookingId]/page.tsx:49,82-91` — `paymentGateway` inits to `""`; clicking Proceed before selecting hits the Monnify else-branch with `paymentProvider:""`.
- **Med** `pending_payment/[bookingId]/page.tsx:108` — a valid booking lacking `calculationId` renders "Booking not found."
- **Low** `pending_payment/[bookingId]/page.tsx:284` — breakdown shows `basePrice + platformFeeAmount` with no VAT line, so it can appear not to add up to Total.

#### F18 — Payment confirmation / re-pay — 🟡
Most robust status handling: polls up to 5× (20s) to flip pending→confirmed; distinguishes failed/pending/confirmed; uses `window.location.href` for re-pay.
- **Med** `BookingDetailsClient.tsx:560-581` — `completePayment` calls `initiatePayment({ bookingId })` with **no** `paymentProvider` → always Monnify; no Paystack re-pay path.
- **Med** `BookingDetailsClient.tsx:567-570` — URL parsed as `res?.data?.paymentUrl || …`; works for Monnify only; a Paystack-shaped response yields no URL → "Could not start the payment."
- **Low** polling stops after ~20s (no manual "refresh status"); debug `console.log` of booking fields left in.

#### F19 — Booking success — 🟡
Loads by `bookingId`, guards missing id, branches pending vs confirmed, uses `window.location.href` for gateway.
- **Med** `booking/success/page.tsx:127-144` — **no status polling** (unlike F18); a freshly-paid booking lingers as "Amount due" until manual refresh → duplicate-pay risk.
- **Med** `booking/success/page.tsx:151` — `bookingData[0].data` assumes a non-empty array shape; empty/other shape throws → whole page falls into "Booking not found" for a valid id.
- **Low** same brittle `||` gateway-URL parsing as F16.

#### F20 — Invoice checkout — 🟡
Invoice number parsed from path, react-query with 10s `refetchInterval`, renders DVA/bank-transfer details.
- **Med** `InvoiceCheckout.tsx:31` — `invoiceNumber = pathname?.split("/").pop()` **undecoded**; invoice numbers with `/`, trailing slash, or encoded chars → wrong lookup → "Invoice Not Found." Prefer `useParams` + `decodeURIComponent`.
- **Med** `useInvoiceCheckout.ts:17-27` — fallback chain can resolve to a wrapper object that isn't the invoice → blank/"pending" invoice instead of an error.
- **Low** `InvoiceCheckout.tsx:120` — a pending invoice with `hasDva=false` has **no way to pay** from this screen (no online-gateway button here).
- **Low** amounts formatted with 0 decimal places (vs 2 dp elsewhere) — currency-display inconsistency.

#### F21 — Favourites (toggle + pending handler) — 🟡
Heart toggle, guest→login pending-favourite capture, post-login apply via `FAVOURITES_CHANGED_EVENT`. Optimistic UI is gated on the server response.
- **Med** `VehicleCard.tsx:173-181` — the change event only ever sets `favouriteStatus` to **true** (never false); duplicate cards for the same vehicle can disagree after a remove, and a heart can never be cleared cross-component.
- **Med** `PendingFavouriteHandler.tsx:27-30` + `favouriteService.ts:66-98` — post-login add swallows failures; the handler shows "Added to your favourites" even if the add POST 500s.
- **Low** `VehicleCard.tsx:167-171` — initial status effect has `[]` deps and reads `isAuthenticated` from closure; if auth resolves after mount, hearts don't initialize until remount.
- **Low** `favouritevehicleservice.ts:113-126` — `toggleFavourite` (race-safe path) is dead code.

#### F22 — Track booking (public) — ✅
Invoice/UUID dual-resolution with fallback, invalid-reference and missing-segment states handled, segment navigation solid.
- **Low** `TrackBookingClient.tsx:208-221` — Paystack success extraction assumes `res.data.data` is a URL string; if it's an object, `window.location.href` breaks (Monnify branch handles the object).
- **Low** `PublicTripDetail.tsx:23-26` — breadcrumb always re-resolves via `?bookingId=`, dropping the original invoice reference (harmless).

### DASHBOARD (auth-gated)

#### F23 — Dashboard overview + metrics — 🟡
Loads metrics, highlight trip, recent bookings; graceful empty/loading/error.
- **Med** `bookingService.ts:142-146` — `getDashboardMetrics` fetches only `size:1000` segments and derives unique `bookings` from that page → "Total bookings" undercounts vs "Total trips" for >1000 segments.
- **Med** `MainDashboard.tsx:356-358` + `BookingHistoryComponent.tsx:97-99` — two independent count sources for the same number can drift if one of the parallel fetches fails.
- **Low** `bookingService.ts:132-167` — metric errors are swallowed → 0 is indistinguishable from a genuine zero.

#### F24 — My bookings (list/calendar) + detail + trip — 🟡
List pagination/grouping/calendar + detail + trip detail.
- **High** `dashboard/my-booking/page.tsx:311-333, 83-101` — groups by `bookingId` client-side while paginating raw segments (size 10) → multi-segment bookings straddling pages render as duplicate/partial rows; footer count never matches visible rows.
- **Med** `dashboard/my-booking/page.tsx:114-134` — two effects both fire `fetchPage(0,true)` on mount → two initial requests; later-resolving one wins (stale-data race).
- **Med** `Dashboard/BookingDetail.tsx:355-363` — "Review" button shows for **cancelled**/failed bookings (not gated by `checkIfUserHasReviewed`).
- **Med** `Dashboard/BookingDetail.tsx:135-146` — inline booking fetch duplicates the unused `getBookingById` service (can diverge).
- **Low** `BookingDetail.tsx:517-521` — "Booked on" reads `bookedAt`; if the API returns `createdAt` only, shows N/A.

#### F25 — My trips — 🟡
Buckets segments into Today/Upcoming/Past; overlays live status for near-future segments.
- **Med** `dashboard/my-trips/page.tsx:112-117` — trips with a missing/invalid start get `ts=0` → always classified **"Past"**; a new booking awaiting a date is mislabeled.
- **Med** `dashboard/my-trips/page.tsx:76-80` — live status enrichment capped at first 30 future segments → identical trips show different status semantics beyond 30.
- **Low** `my-trips/page.tsx:47-51` — `size:1000` with no pagination; >1000 segments silently dropped.
- **Low** `my-trips/page.tsx:130-132` — undefined `bookingId` → `/dashboard/booking/undefined/trip/...` error state.

#### F26 — Favourites (dashboard) — 🟡
Lists favourited vehicles via `getSingleData("/favourite-vehicle")` with loading/error/empty states.
- **Med** `FavouritesClientPage.tsx:172-174` / `VehicleCard.tsx:146-160` — un-favouriting a card **doesn't remove it** from the list or refetch; the card just flips its own heart. The unsaved car stays listed and the "N saved cars" count is wrong until reload.
- **Low** `favouritevehicleservice.ts:45-127` — the whole `FavouriteVehicleService` is unused; `toggleFavourite` returns `updatedFavouriteIds: []` on remove (would drop the list if wired).

#### F27 — Payment history + receipt download — 🟡
Infinite-scroll payments; receipt download/share via `ApiClient.downloadFile`/`fetchFileBlob` (blob path is **sound**).
- **Med** `payment/page.tsx:108-125` — "Total spent" sums a single `size:1000` page client-side → wrong for >1000 payments.
- **Med** `paymentService.ts:67-108` — `PaymentService.downloadReceipt` is dead **and** broken (reads `apiResponse?.data` which is an array wrapper → never the base64 string). Live path is `getPDFFile`.
- **Low** `payment/page.tsx:100-105` — two effects each `fetchPage(0,true)` on mount → duplicate first request.
- **Low** `paymentService.ts:421-455` — `ReceiptGenerator` is unused dead code.

#### F28 — Notifications — 🟡
Loads all pages, groups by date, single-delete + delete-all (`Promise.allSettled`).
- **Med** `notification/page.tsx:79-91` — delete-all clears the UI unconditionally, ignoring the returned `{success, failed}`; failed deletes reappear on next load with no error shown.
- **Med** `notification/page.tsx` (whole file) — **no mark-as-read action**; `isRead` is only used for styling. The `updateDataNotification`/PUT `?read=` helper exists but is never called here.
- **Low** single-delete failures only `console.error` (no user feedback).

#### F29 — Refer a friend — 🟡
Profile-for-code + paginated `/my-referees`; code generation; share link (`https://muvment.ng?code=`).
- **Med** `refer-a-friend/page.tsx:240-243` — `generateReferralCode` ignores the response; on failure the code stays empty with no error toast (button appears to do nothing).
- **Med** `refer-a-friend/page.tsx:245-255` — clipboard `writeText` isn't awaited/caught; in non-secure contexts `navigator.clipboard` is undefined → uncaught error, yet "Copied!" still shows.
- **Low** `refer-a-friend/page.tsx:271-277` — "Rewarded"/"Earned" stats computed from the loaded page only → under-count with >10 referrals.

#### F30 — Settings — 🟡
Profile GET (array-unwrap), edit form, PATCH `/users/me`, change-password, profile-picture FormData upload (Content-Type left to axios — correct).
- **Med** `profile.service.ts:54-65` + `edit-profile/page.tsx:122-138` — `updateProfilePicture` only checks `if (!response)`; an HTTP error returns `{error:true}` (truthy) so a **failed upload silently appears to succeed**.
- **Low** `edit-profile/page.tsx:194` vs `settings/page.tsx:217` — inconsistent avatar source (`profilePictureUrl` only vs `profilePictureUrl || profilePicture`).
- **Low** `edit-profile/page.tsx:166-190` — after save, the settings page can show stale name/phone until reload (its `profile` state isn't refreshed).
- **Low** `profile.service.ts:67-69` — `switchToHost` is defined but never invoked (dead; "become a host" not wired).

#### F31 — Integrations (organization + KYC + API keys) — 🟡
Fully implemented (create org → submit KYC → status gating → generate/regenerate/revoke keys). Settlement tab is an intentional "Coming Soon."
- **High** `Organization.service.ts:99-124` — `revokeApiKey` never detects failure (`deleteData` returns `{error:true}`), so `regenerateApiKey` mints a new key while the old one may still be active → **two live keys**.
- **Med** `Organization.service.ts:78-97` — `generateApiKey` loses the real server error (null-deref → generic "Failed to generate API key"); `KeyRow` handlers only `console.error` → user sees no error.
- **Med** `Apiconfigurationtab.tsx:309,392,403` — TEST vs LIVE gated by a single deploy-wide `NEXT_PUBLIC_ENVIRONMENT`; users can't hold both keys, and if the var is unset/other the tab renders blank.
- **Med** `SettingPage.tsx:283-291` vs `121,139,350` — org selector keys on `org.id` but downstream calls use `org.organizationId`; multi-org select breaks unless the DTO carries both.
- **Low** `Organization.service.ts:64-76` — `getApiKeys` does a deep, inconsistent `data.data[0].data` unwrap (brittle).
- **Low** `utils/access.ts:5` — `hasIntegrationAccess` is correct (`apiKeyEnabled === true`) but depends on the flag being present in the `muvment_user` cookie.

### REVIEWS

#### F32 — Leave review — 🟡
Auth vs anon endpoint branch, already-reviewed guard, double-submit prevention.
- **Med** `review/[id]/page.tsx:114-117` + `bookingService.ts:315-322` — anon-vs-auth decided by `!user?.firstName`; a logged-in user whose context hasn't hydrated (or has an empty firstName) submits as **anonymous**.
- **Low** `review/[id]/page.tsx:39,207` — dead guard (`!entityType` never true; it defaults to `"Booking"`).
- **Low** `review/[id]/page.tsx:104-111` — reuses free-text `comment` as the `recommend` field (likely wrong semantics).
- **Low** `Booking/ReviewModel.tsx` — standalone modal not imported by the review page; appears unused.

### CONTENT / MARKETING

#### F33 — Blog (list / detail / comments / likes / views) — 🟡
List/search/category/infinite-scroll, detail by slug, comments, likes, view recording.
- **High** `Blogdetailsclient.tsx:149-156,230` — local `useAuth()` reads `localStorage["auth_token"]` (app uses cookie `muvment_access_token`) → `isLoggedIn` **always false**; `showLoginModal` set but never rendered → the comment auth gate is dead.
- **Med** `blogService.ts:147-157` + `Blogdetailsclient.tsx:252-254` — `likePost` reads `envelope.id` (undefined) → `setLikeId(undefined)` → **unlike never fires**; re-clicks re-like (count inflates). Correct field: `response.data.data.id`.
- **Med** `Commentssection.tsx:72-111` — comment submit isn't actually gated by auth (`onClick` fires `onAuthRequired`, but `handleSubmit` doesn't check `isLoggedIn`).
- **Low** `Blogdetailsclient.tsx:238-240` — `recordView` fires with no dedupe; a GET per mount/navigation may inflate views (backend-dependent).

#### F34 — Static/content + newsletter + live chat — 🟡
Contact-us POSTs `/api/v1/contact-form` and newsletter POSTs `/api/v1/newsletter/subscribe` (both wired — not dead forms). Partner-with-us has **no form** (CTAs route to `/contact-us` and login — by design).
- **Med** `newsletterService.ts:15-21` — a 409 duplicate surfaces as a generic error instead of "already subscribed."
- **Med** `ContactUsClient.tsx:139-147` — `createData` runs **without** `silent`, so a backend error triggers a toast inside `createData` **and** the component's own "Something went wrong" → double error toasts.
- **Low** `LiveChat.tsx:48-56` — WhatsApp number (`2348167474165`) differs from the contact-us WhatsApp link (`2349030235285`) — inconsistent support lines.
- **Low** `LiveChat.tsx:181-188` — a fake unread-count badge ("1") always shows when closed.

### Non-flow notes
- `src/app/booking/page.tsx` renders literal `<div>page</div>` — **dead stub** at `/booking` (returns 200 but empty).
- `src/app/Network-checker/page.tsx` — diagnostic page, not a user flow.

---

## 6. Method & limitations

**How it was done**
- Enumerated flows with **three independent sweeps** (by route, by feature domain, by API mutation) and reconciled into 34 canonical end-to-end flows.
- Each flow reviewed by a dedicated deep pass **tracing the actual code path** (form → validation → controller → `ApiClient` → state/cookies → redirect).
- All public pages **HTTP render-checked** (every one returned 200).

**Limitations (important)**
- **No interactive browser walk was performed.** At review time no Playwright/browser automation was available, so **nothing is tagged "Ran it."** Findings are established from code + the `ApiClient`/`handleApiResponse`/`createData` contracts. Runtime-only behaviors — notably whether `router.push` actually fails to navigate to the live gateway, and exact backend response shapes — are **inferred**, not reproduced. Items independently re-verified are marked *(confirmed)*.
- **Backend behavior not verified** (whether it honors `discountAmount`, enforces the 3-hour rule, or is idempotent on blog views) — this is a frontend-only review.
- `.env.local` points at the **live Railway API**, so mutating walks would have hit production-ish data.

**Recommended next pass (with Playwright)**
Re-verify the 5 ❌ flows against the running app, in priority order: **F15** and **F17** (does the gateway redirect actually leave the site?), **F8** (filter/URL reload desync), **F12** (the `/Booking/` 404), **F6** (token-expiry logout + banned→`/access-denied`). Then confirm the fragile response-shape parsers against real backend payloads.

---

*Companion working files (outside the repo, same content in raw form):*
`/private/tmp/claude-501/-Users-ebukaarinze-muvment-customer/app-review-shared/` → `FLOW-REGISTER.md`, `FINDINGS-raw.md`, `REPORT.md`.
</content>
