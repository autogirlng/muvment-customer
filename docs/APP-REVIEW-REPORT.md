# Muvment Customer Web — Application Review Report

An experience-and-implementation audit of the Muvment customer web frontend, conducted by reading and tracing the code. Every user flow was enumerated, verified, and given a verdict; each finding points to real code with a file and line.

| | |
|---|---|
| **Cell reviewed** | web-frontend (Next.js 15 App Router, React 19) |
| **Scope** | Whole codebase — every flow |
| **Backend target** | Staging `https://api-muvment.up.railway.app` (confirmed; production untouched) |
| **Method** | Traced from code (browser automation was unavailable this session) |
| **Review style** | 5 parallel domain reviewers, reconciled to one finding per root cause |
| **Date** | 2026-07-01 |

**Companion files:** `review-map.md` (architecture reference) · `review-flows.md` (register table) · `APP-REVIEW-FINDINGS.md` (findings only). This report is the complete standalone read.

---

## Table of contents

1. Executive summary
2. How this review was run
3. Environment & safety gate
4. Architecture & global mechanisms
5. Flow register (all 61 flows with verdicts)
6. Per-flow detail (what was checked)
7. Findings — full detail (cross-cutting, High, Medium, Low)
8. Items to confirm with the backend
9. Pending work & recommended next steps
10. Appendix: severity rubric & verdict definitions

---

## 1. Executive summary

**Coverage.** 61 flows in scope. **56 reviewed**, **4 pending** (read-only catalogue browse/search — FL-25/26/27/28), **1 dropped** (FL-60, a duplicate). The review is **not 100% complete** until the 4 browse flows are walked; everything material — auth, money, dashboard, reviews, public — is done.

**Findings: 3 High · 15 Medium · 17 Low (35 total).** No Critical is grounded in code. One Medium (F-013) becomes **Critical only if the backend trusts a client-supplied amount** — flagged for backend confirmation.

**Verdicts across reviewed flows:** OK 24 · OK-with-caveats 21 · Issues 11.

**The money core is sound.** The payment-return path cannot be spoofed: `booking/success` and the booking-confirmation page decide "paid" **exclusively from the server's `bookingStatus`**, never from a URL or `reference` parameter, and the confirmation page polls for the webhook-versus-redirect race. There is no client-side payment "verify" trust anywhere in the code.

**The three High-severity issues to act on:**

| ID | Issue | Why it matters |
|----|-------|----------------|
| **X2** | No session refresh; expired-session "logged-in illusion" | The token cookie lives 7 days regardless of the server token's real expiry, and nothing refreshes or logs out on 401 — so a user keeps seeing the dashboard while every action silently fails. |
| **X3** | Client-side SQL-injection regex blocks legitimate input | Names like `O'Brien` and many strong passwords are rejected on signup/login/reset with a confusing "metacharacters" error — a hard lockout. |
| **F-002** | Create-organization & Submit-KYC show success even when the POST fails | The user sees an error toast *and* a green success screen, then is redirected, believing something was created when it wasn't. |

**Recommended fix order:** X2 → X3 → F-002 → F-013 (confirm amount handling) → F-015/F-012/F-014 (payment/booking button guards).

---

## 2. How this review was run

1. **Context & mechanisms** — read the HTTP client, auth/session, route protection, providers, and shared error handling to establish what is global (so absence findings are only reported where no shared mechanism covers them).
2. **Enumerate every flow** — swept `src/app/**/page.tsx` (57 route pages), then the controller/service endpoint layer, then UI entry points. 61 flows.
3. **Verify the inventory (3 sweeps)** — re-derived the flow list by route table, then by service layer, then by UI entry points; two consecutive sweeps added nothing new.
4. **Parallel review** — five reviewers took one domain each (auth, booking+money, dashboard, public/marketing, reviews/tracking), each tracing references before judging and quoting code as evidence.
5. **Reconcile** — merged separately-discovered instances of the same root cause into one canonical finding (e.g. the "success on failure" pattern, the "errors render as empty state" pattern).
6. **Self-verify** — re-read the code behind every High before finalizing.

**Verification tags.** Every finding is **Traced from code** — a headless-browser/Playwright tool was not available in this session, so no interactive JS walk was performed. The dev server (`localhost:3000`) and staging API were confirmed reachable (HTTP 200) via read-only checks. Enabling a Playwright MCP would let a follow-up pass exercise flows live and upgrade tags to "Ran it".

---

## 3. Environment & safety gate

Before any judgment about mutating flows, the review confirmed where the app points.

- `.env.local` → **`NEXT_PUBLIC_API_URL = https://api-muvment.up.railway.app`** — the staging environment, as intended.
- `NEXT_PROD_API_URL` (`…-prod…`) exists in the env file **but is read by no code**. Verified across `src`: the only consumers of an API URL are `appClient.ts:5` and `sitemap.ts:5`, both using `NEXT_PUBLIC_API_URL`. The app therefore **cannot accidentally hit production**.
- Dev server and staging API both returned HTTP 200.

**Conclusion:** staging is the confirmed target; writes and sandbox payments against it would be safe. No production URL is reachable from the running code.

---

## 4. Architecture & global mechanisms

**Stack.** Next.js 15.5.7 (App Router, Turbopack), React 19, TanStack Query, Formik + Yup, Zustand, axios, js-cookie, react-toastify, Google Maps, Paystack/Monnify checkout, Microsoft Clarity + Google Analytics + LiveChat.

**HTTP client — `src/controllers/connnector/appClient.ts`.** An axios wrapper. Bearer token comes from the cookie `muvment_access_token`. It returns a tuple `[data, message]`; **errors are not thrown** — they are returned as `{ err, status }`, so every caller must inspect the result. **No request timeout is set** (see X1). **No 401 refresh or forced logout** — a 401 only produces an "Unauthorized" message (see X2).

**Callers layer — `app.callers.ts`.** Wraps the client with `createData / updateData / patch* / delete*`; a global blocking loading overlay (`LoadingManager` / `withLoading`); a client-side SQL-injection regex `validateDataInput` (see X3) applied on the `AuthController` and `updateData*` paths only (it is commented out on `createData`); and `NetworkService.checkConnection()`, which hard-redirects to `/Network-checker` whenever `navigator.onLine` is false.

**Auth & session — `context/AuthContext.tsx` + `controllers/auth/auth.ts`.** Cookies: `muvment_access_token`, `muvment_refresh_token`, `muvment_user`, `muvment_remember`. `secure` is set only in production; `sameSite=strict`; cookies are written client-side, so they are **JS-readable, not httpOnly** (see X4). `AuthService.refreshToken()` and `AuthContext.setTokens()` are implemented but have **zero callers** (dead code).

**Route protection.** There is **no Next.js `middleware.ts`**. `/dashboard/*` is guarded only by a client-side effect in `components/pagesComponent/DashboardLayout.tsx` that runs after hydration.

**Feature flags / remote config.** None. The Paystack/Monnify choice is a runtime UI toggle; both gateways are live.

**External boundaries.** Checkout redirects the browser to the gateway (`window.location.href = authorizationUrl`) and returns to the app; the app decides state from the server on return. Google Maps powers location input; Clarity/GA/LiveChat handle analytics and support.

---

## 5. Flow register

Status: Reviewed / Pending / Out-of-scope. Verdict: OK / OK-with-caveats / Issues. All entries are reachable in a shipping build unless noted.

| ID | Flow | Route / entry | Status | Verdict — findings |
|----|------|---------------|--------|--------------------|
| FL-01 | Register / signup | /auth/register | Reviewed | Issues — X3, F-008 |
| FL-02 | Account verification (OTP) | /auth/account-verification | Reviewed | OK-caveats — F-007 |
| FL-03 | Resend verification OTP | account-verification | Reviewed | OK-caveats — F-011 |
| FL-04 | Login | /auth/login | Reviewed | OK-caveats — X3, F-009 |
| FL-05 | Forgot password | /auth/forgot-password | Reviewed | OK-caveats — F-010 |
| FL-06 | Reset password (OTP) | /auth/reset-password | Reviewed | Issues — X3, F-007 |
| FL-07 | Logout | AuthContext.logout | Reviewed | OK |
| FL-08 | Session load + persistence | AuthContext | Reviewed | Issues — X2, X4 |
| FL-09 | Dashboard route guard | DashboardLayout | Reviewed | Issues — F-006, X2 |
| FL-10 | Home / landing | / | Reviewed | OK |
| FL-11 | Explore | /explore | Reviewed | OK |
| FL-12 | About us | /about-us | Reviewed | OK-caveats — F-021 |
| FL-13 | Impact | /impact | Reviewed | OK |
| FL-14 | Contact us | /contact-us | Reviewed | OK-caveats — F-004 |
| FL-15 | FAQ | /faq | Reviewed | OK |
| FL-16 | Blog list | /blog | Reviewed | OK-caveats — F-021 |
| FL-17 | Blog detail (comment/like/view) | /blog/[id] | Reviewed | Issues — F-003, F-031, F-032 |
| FL-18 | Partner with us | /partner-with-us | Reviewed | OK |
| FL-19 | Partnership list | /partnership | Reviewed | OK |
| FL-20 | Partnership detail | /partnership/[slug] | Reviewed | OK-caveats — F-033 |
| FL-21 | Privacy policy | /policy/privacy-policy | Reviewed | OK |
| FL-22 | Terms & conditions | /policy/terms-conditions | Reviewed | OK |
| FL-23 | Newsletter subscribe | Footer / newsletterService | Reviewed | OK |
| FL-24 | Network-checker (offline) | /Network-checker | Reviewed | Issues — F-004 |
| FL-25 | Booking landing | /booking | **Pending** | browse — deferred |
| FL-26 | Booking explore | /booking/explore | **Pending** | browse — deferred |
| FL-27 | Booking search | /booking/search | **Pending** | browse — deferred |
| FL-28 | Browse vehicles by state | /booking/states/[stateId] | **Pending** | browse — deferred |
| FL-29 | Vehicle detail | /booking/details/[id] | Reviewed | OK-caveats |
| FL-30 | Vehicle reviews list | /booking/details/[id]/reviews | Reviewed | OK-caveats — F-021, F-025, F-026, F-027 |
| FL-31 | Create booking | /booking/create/[id] | Reviewed | Issues — F-012, F-013 |
| FL-32 | Price calculate / quote | bookingService | Reviewed | OK-caveats — X3, F-013 |
| FL-33 | Special pricing | /booking/[id]/special-pricing | Reviewed | OK-caveats |
| FL-34 | Special checkout | /booking/[id]/special-checkout | Reviewed | Issues — F-014, F-012 |
| FL-35 | Booking invoice | /booking/invoice/[id] | Reviewed | OK |
| FL-36 | Booking details / confirmation | /payment/[id] | Reviewed | OK |
| FL-37 | Pending payment | /pending_payment/[bookingId] | Reviewed | Issues — F-015 |
| FL-38 | Payment options (init) — MONEY | PaymentOptionsModal | Reviewed | OK |
| FL-39 | Payment return / success | /booking/success | Reviewed | OK-caveats — F-016, F-017 |
| FL-40 | Dashboard home / metrics | /dashboard | Reviewed | OK-caveats — F-021 |
| FL-41 | My bookings list | /dashboard/my-booking | Reviewed | OK-caveats |
| FL-42 | My booking detail | /dashboard/my-booking/[id] | Reviewed | OK |
| FL-43 | Dashboard booking detail | /dashboard/booking/[id] | Reviewed | OK |
| FL-44 | Trip segment detail | /dashboard/booking/[id]/trip/[segmentId] | Reviewed | OK |
| FL-45 | My trips | /dashboard/my-trips | Reviewed | OK-caveats — F-021 |
| FL-46 | Favourites list | /dashboard/favourites | Reviewed | Issues — F-022, F-030 |
| FL-47 | Favourite / unfavourite | favouriteService | Reviewed | OK-caveats — F-028 |
| FL-48 | Notifications | /dashboard/notification | Reviewed | Issues — F-018 |
| FL-49 | Payment history + receipt | /dashboard/payment | Reviewed | Issues — F-015, F-020 |
| FL-50 | Settings | /dashboard/settings | Reviewed | OK |
| FL-51 | Edit profile | /dashboard/settings/edit-profile | Reviewed | OK |
| FL-52 | Change password | users/change-password | Reviewed | OK |
| FL-53 | Refer a friend | /dashboard/refer-a-friend | Reviewed | OK-caveats — F-019 |
| FL-54 | Integrations list | /dashboard/integrations | Reviewed | OK |
| FL-55 | Create organization | /dashboard/integrations/create-organization | Reviewed | Issues — F-002 |
| FL-56 | Submit KYC | /dashboard/integrations/submit-kyc | Reviewed | Issues — F-002 |
| FL-57 | Leave a review (authed + anon) | /review/[id] | Reviewed | Issues — F-023, F-024, F-025 |
| FL-58 | Track booking (public) | /track-booking | Reviewed | OK-caveats — F-029 |
| FL-59 | Track trip segment | /track-booking/[bookingId]/trip/[segmentId] | Reviewed | OK |
| FL-60 | (duplicate placeholder) | — | Out-of-scope | duplicate of FL-30 |
| FL-61 | Sitemap (SSR) | /sitemap.ts | Reviewed | OK |

Inventory verified by 3 sweeps. Review was parallel and reconciled. Only dynamic catalogue browse/search (FL-25–28) remains Pending.

---

## 6. Per-flow detail (what was checked)

### Auth & session (FL-01–09)
- **FL-01 Register — Issues.** Happy path, validation, and double-submit (synchronous `isLoading` gate) are sound. X3 rejects names/passwords containing `'` `;` `--`. `INITIAL_VALUES` is mutated as shared module state (F-008). Signup omits `referralCode` when empty, so the regex's "required field" branch is not tripped there.
- **FL-02 Verify OTP — OK-caveats.** Double-submit safe; paste and `one-time-code` autofill handled; 60s resend throttle. Wrong vs expired OTP are indistinguishable (F-007).
- **FL-03 Resend OTP — OK-caveats.** In-flight guard + client timer; throttle is client-only and resettable by refresh (F-011).
- **FL-04 Login — OK-caveats.** Double-submit safe; always routes to `/dashboard` (no open-redirect via query param). X3 can block valid passwords. Service-layer `storeAuthData` reads the wrong nesting depth but is masked by the page writing cookies correctly (F-009).
- **FL-05 Forgot password — OK-caveats.** Works; relays the backend message verbatim → possible email enumeration (F-010).
- **FL-06 Reset password — Issues.** The strong-password checklist *requires* a special character, several of which X3 then rejects — a "valid per the checklist" password is refused at submit; there is no resend control for an expired reset OTP (F-007).
- **FL-07 Logout — OK.** Clears cookies, localStorage, and booking sessionStorage, then redirects to login.
- **FL-08 Session load / persistence — Issues.** 7-day cookie regardless of server token expiry; no expiry validation (X2); tokens JS-readable (X4).
- **FL-09 Dashboard guard — Issues.** Client-only, no middleware (F-006); combined with X2, an expired session still renders the dashboard shell before calls 401.

### Public / marketing (FL-10–24, FL-61)
- **FL-10 Home, FL-13 Impact, FL-21 Privacy, FL-22 Terms — OK.** Static shells.
- **FL-11 Explore, FL-16 Blog list, FL-19 Partnership list — OK(-caveats).** Skeletons, empty states, pagination/infinite-scroll present; some fetch errors surface as an empty state (F-021).
- **FL-12 About us — OK-caveats.** A booking-type fetch whose error is silently swallowed (cosmetic — F-021).
- **FL-14 Contact us — OK-caveats.** Real form → `/api/v1/contact-form`; validation, double-submit guard, and success screen present. Exposed to the offline-redirect risk (F-004).
- **FL-15 FAQ — OK.** Static data + search with an empty state.
- **FL-17 Blog detail — Issues.** Unsanitized CMS HTML via `html-react-parser` (F-003); like state not seeded → repeat likes / no unlike (F-031); a dead login modal wired to the wrong auth storage (F-032).
- **FL-18 Partner with us — OK.** Marketing only; CTA routes to contact-us; `!user` gated.
- **FL-20 Partnership detail — OK-caveats.** "Try again" uses an empty `href=""` (F-033).
- **FL-23 Newsletter — OK.** Footer and signup both use `NewsletterService.subscribe` with validation and feedback.
- **FL-24 Network-checker — Issues.** No auto-reconnect listener; "Try Again" force-logs-out and dumps the user at `/auth/login` (F-004).
- **FL-61 Sitemap — OK.** SSR try/catch returns static routes on API failure, with per-response content-type guards. Robust.

### Booking + money (FL-29–39, FL-32) — Tier 1
- **FL-29 Vehicle detail — OK-caveats.** Entry to the create flow; the price shown here is display-only, the real price is server-calculated.
- **FL-31 Create booking — Issues.** Narrow double-create window (F-012); the client sends `discountAmount` (F-013). Booking is otherwise anchored to the server `calculationId`.
- **FL-32 Price calculate / quote — OK-caveats.** `calculationId` is the price contract; a stale quote returns 409 and clears the estimate id (good). The `updateData` re-estimate path runs X3, which could reject location strings containing `--`/`;`/`'`.
- **FL-33 Special pricing — OK-caveats.** Writes trips/estimate to sessionStorage for display; the booking references `servicePricingId` server-side.
- **FL-34 Special checkout — Issues.** Reuses a stale `existingBookingId` cookie after edits (F-014); double-submit window (F-012). The "for others" path intentionally lands on success in PENDING without payment.
- **FL-35 Booking invoice — OK.** Status strictly from the server; bank-transfer details from the server; no client "paid" trust.
- **FL-36 Booking details / confirmation — OK.** Status from the server; polls 5×/4s for the webhook race; `completePayment` guarded; the `reference` query param is display-only.
- **FL-37 Pending payment — Issues.** `proceedToPayment` has no in-flight guard, no try/catch, dereferences `data.authorizationUrl`, and can send an empty gateway (F-015).
- **FL-38 Payment options modal — OK.** A `processing` guard prevents re-entry; errors reset state.
- **FL-39 Payment return / success — OK-caveats.** **Does not trust any query param for "paid"** — it re-fetches the booking and gates on `bookingStatus === CONFIRMED`. Caveats: no poll for the webhook race here (F-016); the Clarity `payment_succeeded` event re-fires on reload (F-017).

**External-boundary outcome walk (Paystack/Monnify).** success → CONFIRMED → success UI; declined/cancelled/abandoned → stays PENDING/FAILED with a pay CTA; never-returns → recoverable via invoice or track-booking; webhook-vs-redirect race → the confirmation page polls, the success page needs a manual refresh (F-016). There is no path that shows "paid" on a failed payment.

### Dashboard (FL-40–56)
- **FL-40 Dashboard home — OK-caveats.** Skeletons and empty states; metrics silently show 0 on a load failure (F-021).
- **FL-41 My bookings — OK-caveats.** Loading/error/empty + infinite scroll; segment grouping is per-loaded-page (a cosmetic double row across a page boundary).
- **FL-42/43/44 Booking & trip detail — OK.** Loading, error, invoice fallback, and copy-with-catch all present.
- **FL-45 My trips — OK-caveats.** A load error leaves an empty state as if the user has no trips (F-021).
- **FL-46 Favourites list — Issues.** Loading/error/empty are good; un-favouriting doesn't remove the card (F-022); a duplicate unused component exists (F-030).
- **FL-47 Favourite / unfavourite — OK-caveats.** Good unauthenticated handling (login prompt + pending-favourite replay); no double-click guard and errors swallowed (F-028).
- **FL-48 Notifications — Issues.** Delete and delete-all with confirm modals; **no mark-as-read** (F-018).
- **FL-49 Payment history + receipt — Issues.** `makePayment` unguarded (F-015); a dead unescaped-HTML receipt generator (F-020); the live receipt download uses a server PDF with a toast on error.
- **FL-50 Settings — OK.** Tabs, loading, and profile error+retry.
- **FL-51 Edit profile — OK.** Validation, double-submit guarded, image type/size checks; X3 not triggered (PATCH path).
- **FL-52 Change password — OK.** Confirms match, minimum length, double-submit guarded, correct `.error` handling. (Does not invalidate other sessions — a backend concern.)
- **FL-53 Refer a friend — OK-caveats.** Generate and copy have no error handling; copy shows "Copied!" even if the write fails (F-019).
- **FL-54 Integrations list — OK.** Loading/error/empty onboarding + KYC status pills.
- **FL-55 Create organization / FL-56 Submit KYC — Issues.** Show a success screen even when the POST fails (F-002); KYC is a plain text form (no file upload).

### Reviews / tracking (FL-30, FL-57, FL-58, FL-59)
- **FL-30 Reviews list — OK-caveats.** Skeleton + empty state; no error state, so a fetch failure looks like "no reviews" (F-021); a wrong-case `/Booking/...` link (F-026); pagination off-by-one (F-027).
- **FL-57 Leave a review — Issues.** The already-reviewed guard is client-only and racy (F-023); an empty optional comment sends a fabricated `recommend` value (F-024); errors collapse to a generic string (F-025). X3 does **not** affect review text (createData path).
- **FL-58 Track booking — OK-caveats.** UUID/invoice fallback with not-found and error states; possible enumeration of PII on a public endpoint (F-029).
- **FL-59 Track trip segment — OK.** Missing-params and not-found/error handled; clean.

---

## 7. Findings — full detail

Each finding: impact → mechanism → code location → fix. All **Traced from code**. Absence findings quote the site where handling should live.

### Cross-cutting (X-series)

**X1 — [Medium] No request timeout on any API call.**
The axios call sets no `timeout`, so a hung request never resolves: buttons stay in "Signing in…/Starting payment…", the global overlay can hang, and in-flight locks never release. Affects every flow.
*Code:* `appClient.ts:44-50, 106-112, 167-173`.
*Fix:* set a 20–30s timeout on the axios instance and surface a retry on timeout.

**X2 — [High] No session refresh; expired-session "logged-in illusion".**
`AuthService.refreshToken()` (`auth.ts:303`) and `AuthContext.setTokens()` (`AuthContext.tsx:146`) have zero callers. On 401 the client only returns an "Unauthorized" message (`appClient.ts:69-73`); the token cookie is pinned to 7 days regardless of the server token's real lifetime, and the dashboard guard checks only cookie presence — so once the server token expires the user still sees the dashboard while every call silently 401s.
*Fix:* add a 401 interceptor that attempts `refreshToken()` once then retries; on failure, `logout()` and redirect with a "session expired" message.

**X3 — [High] Client-side SQL-injection regex blocks legitimate input.**
`validateDataInput` (`app.callers.ts:473-508`) rejects any field containing `'`, `;`, `--`, `/* */`, or matching `OR ... =`. It runs on `AuthController` (all auth POSTs — line 517-518) and `updateData*` (line 319). Effect: names like `O'Brien` and many strong passwords are rejected client-side with a confusing "metacharacters that are restricted" error, blocking signup/login/reset; on reset-password it collides with the form's own required-special-character rule (`reset-password/page.tsx:61`). It does **not** run on `createData`/`patch`, so contact/comment/newsletter/KYC/change-password/edit-profile/reviews are unaffected.
*Fix:* remove `validateDataInput` from auth and update bodies; rely on server-side parameterized queries (as already done — commented out — on `createData`).

**X4 — [Medium] Auth tokens in JS-readable cookies; `secure` only in production.**
Tokens are set via js-cookie, not httpOnly, with `secure` gated on `NODE_ENV==="production"` (`AuthContext.tsx:95-119`, `auth.ts:76-80`). Any XSS (see F-003) can read the session token.
*Fix:* prefer backend-issued httpOnly cookies; at minimum keep `secure` on for all non-local origins.

### High

**F-002 — [High] Create-organization & Submit-KYC show success even when the POST fails.**
`createData` never throws on an HTTP error — it returns `{error:true, data:null}` and toasts the message — so `await createData(...)` is followed by an unconditional `setSuccess(true)` and the `catch` block is unreachable for API failures. On a rejected submit (duplicate registration number, invalid CAC, 5xx, expired session) the user sees a red error toast *and* the green "Organisation created / KYC submitted" screen, then is auto-redirected — believing they succeeded when nothing was created.
*Flows:* FL-55, FL-56. *Absence:* yes — no check of the resolved result before `setSuccess(true)`.
*Code:* `settingsComponent/CreateOrganization.tsx:113-127`; `settingsComponent/SubmitKYC.tsx:82-100`; root cause `app.callers.ts:204-211`, `appClient.ts:52-78`.
*Fix:* `const res = await createData(...); if (!res || res.error || !res.data) { setError(res?.message); return; } setSuccess(true);` — mirror the pattern `ProfileService.changePassword` already uses.

*(X2 and X3 above are the other two High findings.)*

### Medium

**F-003 — [Medium · needs backend confirmation] Blog detail renders CMS HTML unsanitized.**
`parse(post.content)` via `html-react-parser`, whose callback only rewrites img/table/headings; all other markup passes through. `html-react-parser` won't execute injected `<script>`, but `javascript:` hrefs and some attribute vectors survive. Real XSS if post content is attacker-influenceable and not sanitized server-side (blog authoring is typically admin-only, which lowers the likelihood).
*Flow:* FL-17. *Code:* `blogComponent/Blogdetailsclient.tsx:146, 374`.
*Fix:* DOMPurify the content before `parse`; scheme-check `img`/`a` URLs; confirm and document backend sanitization on write.

**F-004 — [Medium] Offline false-positive redirect + Network-checker logout dead-end.**
`NetworkService.checkConnection()` hard-redirects to `/Network-checker` via `window.location.href` on any `navigator.onLine === false` blip (unreliable signal), losing in-progress form state. The "Try Again" button then — even when back online — calls `logout()` and pushes `/auth/login` rather than returning the user to their page. There is no `online` event listener for auto-recovery.
*Flow:* FL-24 (and any flow mid-request). *Code:* `Network/NetworkService.ts:4-6`; `Network-checker/page.tsx:16-23`.
*Fix:* add an `online` listener that auto-returns; on retry `router.back()` to a stored origin without logging out; stop hard-redirecting on a single blip.

**F-006 — [Medium] Dashboard route guard is client-only; no middleware.**
No `middleware.ts`, so `/dashboard/*` has no edge/server access control — protection depends entirely on a post-hydration React effect. Combined with X2, an expired-but-unexpired cookie renders the dashboard shell.
*Flow:* FL-09. *Absence:* yes. *Code:* `pagesComponent/DashboardLayout.tsx:133-155`.
*Fix:* add `middleware.ts` matching `/dashboard/:path*` that checks the cookie; keep the client effect as a UX fallback.

**F-007 — [Medium] Wrong vs expired OTP indistinguishable; no resend on reset-password.**
Both show the same generic "incorrect or expired", and reset-password has no resend control at all — an expired reset OTP forces a full restart from forgot-password.
*Flows:* FL-02, FL-06. *Absence:* yes. *Code:* `account-verification/page.tsx:50-54`; `reset-password/page.tsx:84-87`.
*Fix:* surface the backend's specific reason and add a "Resend code" control on reset-password.

**F-008 — [Medium] Register mutates module-level `INITIAL_VALUES` (shared state).**
`INITIAL_VALUES.referralCode = ReferalCode` mutates a shared constant; a later form reset re-seeds from the mutated constant, leaking a stale referral code into a subsequent signup in the same session.
*Flow:* FL-01. *Code:* `auth/register/page.tsx:76, 154, 203`.
*Fix:* keep `INITIAL_VALUES` immutable; derive the referral from `searchParams` into component state.

**F-012 — [Medium] Create-booking "Confirm & pay" has a narrow double-create window.**
`processPayment` guards with `if (isProcessing) return;`, but the button disable is state-driven via a `useEffect` that only runs after `setIsProcessing(true)` re-renders; a second synchronous click reads the stale `isProcessing === false` and can fire two bookings / two payment inits.
*Flows:* FL-31, FL-34. *Absence:* no synchronous lock. *Code:* `CreateBooking/CostBreakdown.tsx:243-244, 458-504`.
*Fix:* add `const inFlight = useRef(false)` set/cleared synchronously at function entry.

**F-013 — [Medium → Critical if the backend trusts it · needs backend confirmation] Client sends `discountAmount` in the create-booking payload.**
Booking should be priced solely from the server's `calculationId`; the client also sends `discountAmount`. If the backend trusts the body value rather than recomputing, a tampered request lowers the charged total.
*Flows:* FL-31, FL-32. *Code:* `CreateBooking/CostBreakdown.tsx:291, 318, 336`.
*Fix:* stop sending `discountAmount`; confirm the backend derives price from `calculationId` and ignores client amounts.

**F-014 — [Medium] Special-checkout reuses a stale `existingBookingId` cookie after edits.**
`handleBookNow` reuses `servicePricingBookingId` (a 1-day cookie) without checking it still matches the currently displayed trips/price; editing the trip after a first booking pays the *old* bookingId while the UI shows the *new* estimate.
*Flow:* FL-34. *Absence:* yes — no invalidation on trip/estimate change. *Code:* `booking/[id]/special-checkout/page.tsx:183-186, 469, 486-493`.
*Fix:* clear `servicePricingBookingId` whenever trips/estimate change, or store a trip signature and rebuild on drift.

**F-015 — [Medium] Payment-initiation buttons lack an in-flight guard, error handling, and a null-check.**
Two locations call `initiatePayment` with no try/catch, no disabled/loading state, and dereference `booking.data.authorizationUrl` without a null check; on failure nothing shows and a null `data` throws. Pending-payment also defaults `paymentGateway` to `""`, so a first click can send an empty provider.
*Flows:* FL-37, FL-49. *Absence:* yes. *Code:* `pending_payment/[bookingId]/page.tsx:49, 82-92, 379-392`; `dashboard/payment/page.tsx:230-240`.
*Fix:* add a processing lock + disabled state, a try/catch with a toast, a null-check on the response, and require a gateway selection.

**F-018 — [Medium] Notifications have no "mark as read" (delete only).**
Unread styling is rendered but no handler ever sets read; the only way to clear the unread state is to delete the notification (losing its content). The `updateDataNotification` plumbing exists but has zero consumers (dead code).
*Flow:* FL-48. *Absence:* yes. *Code:* `dashboard/notification/page.tsx:317-327`; `notification/notificationService.ts:24-82`; dead plumbing at `app.callers.ts:333`.
*Fix:* wire a mark-as-read action (the plumbing already exists) on click, or remove the unread affordance.

**F-022 — [Medium] Un-favouriting on the Favourites list doesn't remove the card.**
`VehicleCard.handleLike` only flips its own local state and never notifies the list, which holds its own `vehicles` array with no change listener or callback — the un-favourited card stays until reload, looking like a failed action.
*Flows:* FL-46, FL-47. *Absence:* yes. *Code:* `pagesComponent/FavouritesClientPage.tsx:172-175`; `Booking/VehicleCard.tsx:128-161`.
*Fix:* dispatch a "favourites changed" event the list listens for (or pass a callback) and filter the removed id.

**F-023 — [Medium · needs backend confirmation] Already-reviewed guard is client-only and racy.**
`checkIfUserHasReviewed` gates the form but swallows all errors as "not reviewed" (→ shows the form), and `handleSubmitReview` doesn't re-check before POST. Two tabs or a slow check let a user submit duplicate reviews; dedup depends entirely on the backend.
*Flow:* FL-57. *Code:* `review/[id]/page.tsx:60-69, 95-125`; `bookingService.ts:335-350`.
*Fix:* rely on backend uniqueness, surface a specific "already reviewed" message, and don't treat a failed check as "no review".

**F-031 — [Medium] Blog like state never seeded → repeat likes, no unlike after reload.**
On load `liked=false` / `likeId=null` with no "has-liked" fetch; a user who already liked sees "Like", can like again (count inflates), and can never unlike (no `likeId`).
*Flow:* FL-17. *Absence:* yes. *Code:* `blogComponent/Blogdetailsclient.tsx:233-262`.
*Fix:* seed like state on mount from the user's existing like; rely on server idempotency.

### Low

| ID | Finding | Code |
|----|---------|------|
| F-009 | `AuthService.storeAuthData` reads token at wrong nesting depth (masked by the login page writing cookies correctly). | `auth.ts:194-200` |
| F-010 | Forgot-password relays the backend message verbatim → possible email enumeration. | `forgot-password/page.tsx:40-44` |
| F-011 | Resend-OTP 60s throttle is client-only (cleared on refresh). | `account-verification/page.tsx:67-85` |
| F-016 | Success page doesn't poll for the webhook-vs-redirect race (the confirmation page does). | `booking/success/page.tsx:146-227` |
| F-017 | Clarity `payment_succeeded` re-fires on every reload (GA purchase is de-duped, Clarity isn't). | `booking/success/page.tsx:154-159` |
| F-019 | Refer-a-friend: no error handling on generate; clipboard copy shows "Copied!" even if the write rejects. | `refer-a-friend/page.tsx:240-255` |
| F-020 | Dead code: `ReceiptGenerator` builds receipt HTML with unescaped payment fields; never imported. | `paymentService.ts:125-455` |
| F-021 | Load failures render as the empty state (no error/retry) on several read pages: my-trips, dashboard metrics, reviews list, blog list, about-us. | e.g. `my-trips/page.tsx:64-68`, `Reviews/index.tsx:25-37` |
| F-024 | Empty optional review comment is sent as a fabricated `recommend: "No additional comments"`. | `review/[id]/page.tsx:104-111` |
| F-025 | Review (and other) submit errors collapse to one generic string; backend reason never surfaced. | `review/[id]/page.tsx:119-124` |
| F-026 | "See all reviews" link uses wrong-case `/Booking/...` (404 risk on case-sensitive routing). | `Reviews/index.tsx:137` |
| F-027 | Reviews pagination `goToNextPage` clamps to `pages` not `pages-1` (off-by-one → empty extra fetch). | `Reviews/index.tsx:41-43` |
| F-028 | Favourite toggle: heart not disabled while in-flight (double-click race); errors swallowed by an empty catch. | `Booking/VehicleCard.tsx:128-161` |
| F-029 | Track-booking renders booker PII from an unauthenticated public endpoint; enumeration risk if ids/invoices are guessable (needs backend confirmation). | `TrackBookingClient.tsx:100-137` |
| F-030 | Dead code: duplicate favourites component `FavouritesVehiclesClient.tsx` (byte-identical, unused). | `pagesComponent/FavouritesVehiclesClient.tsx` |
| F-032 | Blog comment "log in" prompt is a no-op: the modal is never rendered and auth is read from the wrong storage. | `Blogdetailsclient.tsx:149-156, 232` |
| F-033 | Partnership-detail "Try again" uses an empty `href=""`. | `partnership/[slug]/page.tsx:67-72` |

---

## 8. Items to confirm with the backend

These findings' severity depends on server behavior not visible in this repo. Rated conservatively pending confirmation.

- **F-013** — Does the backend recompute `discountAmount` from `calculationId` and ignore the body value? *(Escalates to Critical if the body value is trusted.)*
- **F-023** — Does `/api/v1/rating-review` reject duplicate reviews per booking?
- **F-029** — Are invoice numbers / booking UUIDs high-entropy, and does the public track-booking payload omit PII (phone/email/full name)?
- **F-003** — Is blog `content` sanitized on write, and who is able to author posts?

---

## 9. Pending work & recommended next steps

**Still to review (to reach 100% coverage):** FL-25 booking landing, FL-26 booking/explore, FL-27 booking/search, FL-28 browse-by-state — read-only catalogue browse/search. Everything else is Reviewed.

**Suggested order of work:**
1. Fix the three Highs — **X2** (session refresh), **X3** (drop the client SQL regex), **F-002** (gate success on the API result).
2. Confirm the four backend-dependent items in §8, especially **F-013**.
3. Add in-flight guards + error handling to the money/booking buttons — **F-015, F-012, F-014**.
4. Address the Medium UX gaps — **F-004, F-006, F-007, F-018, F-022, F-031, F-003**.
5. Sweep the Lows (several are one-line fixes: F-026, F-027, F-033; two are dead-code deletions: F-020, F-030).
6. Walk the four Pending browse flows, and — if a Playwright MCP is enabled — re-run the money and auth flows live to upgrade their tags from "Traced from code" to "Ran it".

---

## 10. Appendix — rubric & definitions

**Severity.**
- **Critical** — consumer loses money, data, or access; crash/outage on a core path; a market cannot complete a core journey; security/PII exposure.
- **High** — core journey completable but with a real chance of failure, confusion causing abandonment, or an unrecoverable silent failure.
- **Medium** — degraded experience, unclear feedback, or avoidable friction hitting a meaningful slice of users.
- **Low** — minor polish, rare edge case, cosmetic, or a real issue behind dead/unreachable code (capped here regardless of hypothetical impact).

**Per-flow verdicts.**
- **OK** — behaves correctly across the states and personas checked.
- **OK with caveats** — works, but has Low/Medium issues that don't break it.
- **Issues** — has High/Critical problems.
- **Blocked / Pending** — not yet fully judged (here: the 4 browse flows).

**Verification tags.** *Traced from code* — followed the code, did not execute it (all findings in this report). *Ran it* — exercised against a running app (not used this session; requires browser automation).

*End of report.*
