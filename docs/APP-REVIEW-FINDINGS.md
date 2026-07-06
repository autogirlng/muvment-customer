# Muvment Customer Web — App Review Findings (cell: web-frontend)

Target: **staging** (`https://api-muvment.up.railway.app`) — confirmed; prod URL not read by any code. Verification: all findings **Traced from code** (no browser automation available this session). Reconciled from 5 parallel domain reviewers.

Counts: **3 High**, **15 Medium**, **17 Low** (35 total). Money core (payment-return trust) is sound. No Critical grounded in code (one Medium escalates to Critical only if the backend trusts a client-supplied amount — see F-013).

---

## Cross-cutting (X-series)

### X1 — [Medium] No request timeout on any API call
appClient.ts axios call sets no `timeout`. A hung request never resolves; buttons stuck in "Signing in…/Verifying/Starting payment…", global `withLoading` overlay can hang forever, in-flight locks never release. Affects every flow.
- Code: `src/controllers/connnector/appClient.ts:44-50`, `106-112`, `167-173`
- Fix: set a sane `timeout` (e.g. 20–30s) on the axios instance and surface a retry on timeout.

### X2 — [High] No session refresh; expired-session "logged-in illusion"
`AuthService.refreshToken()` (auth.ts:303) and `AuthContext.setTokens()` (AuthContext.tsx:146) exist but have **zero callers** (dead code). appClient does not refresh or force logout on 401 — it only returns an "Unauthorized" message. The access-token cookie is pinned to 7 days regardless of the server token's real lifetime, and the dashboard guard only checks cookie presence, so once the server token expires the user still sees the dashboard while every API call silently 401s (generic errors / empty states).
- Code: `src/controllers/connnector/appClient.ts:69-73`; `src/context/AuthContext.tsx:90-102,146`; `src/components/pagesComponent/DashboardLayout.tsx:133-155`
- Fix: add a 401 interceptor that attempts `refreshToken()` once then retries; on failure, `logout()` + redirect with a "session expired" message.

### X3 — [High] Client-side SQL-injection regex blocks legitimate input
`validateDataInput()` rejects any field containing `'`, `;`, `--`, `/* */`, or matching `OR ... =`. It runs on **`AuthController`** (all auth POSTs: signup/login/verify/forgot/reset) and **`updateData*`/`updateMapper`/`updateKycRequirementMapping`** (PUT bodies). Effect: names like **`O'Brien`** and passwords containing `'`/`;`/`--` are rejected client-side with a confusing "metacharacters that are restricted" error → cannot register/login/reset. On reset-password this directly collides with the form's own rule that *requires* a special character.
- Scope note (reconciled): does **NOT** run on `createData`/`patch` paths (validation is commented out), so contact/blog-comment/newsletter/create-org/KYC/change-password/edit-profile/reviews are **not** affected — earlier concern there does not hold.
- Code: `src/controllers/connnector/app.callers.ts:473-508` (regex), `:517-518` (AuthController), `:319` (updateData); collision at `src/app/auth/reset-password/page.tsx:61`
- Fix: remove `validateDataInput` from auth/update bodies; rely on server parameterized queries. (Same as the already-commented-out `createData` path.)

### X4 — [Medium] Auth tokens in JS-readable cookies, `secure` only in production
Tokens set via `js-cookie` (not httpOnly, `secure` gated on `NODE_ENV==="production"`, `sameSite=strict`). Any XSS (see F-003) can read the session token. Standard limitation of client-set auth, but worth hardening.
- Code: `src/context/AuthContext.tsx:95-119`; `src/controllers/auth/auth.ts:76-80`
- Fix: prefer httpOnly cookies issued by the backend / a Next route handler; at minimum keep `secure` on for all non-local origins.

---

## High

### F-002 — [High] Create-organization & Submit-KYC show the success screen even when the POST fails
`createData` never throws on HTTP error (it returns `{error:true,data:null}` and toasts the error), so `await createData(...)` is followed by an unconditional `setSuccess(true)`; the `catch` is unreachable for API failures. On a rejected submit (duplicate RC, invalid CAC, 5xx, expired session) the user sees a red error toast **and** the green "Organisation created / KYC submitted" screen, then is auto-redirected — believing they succeeded when nothing was created.
- Flow: FL-55, FL-56 | Absence: yes (no `.error`/`.data` check before success)
- Code: `src/components/settingsComponent/CreateOrganization.tsx:113-127`; `src/components/settingsComponent/SubmitKYC.tsx:82-100`; root cause `src/controllers/connnector/app.callers.ts:204-211`, `src/controllers/connnector/appClient.ts:52-78`
- Fix: `const res = await createData(...); if (!res || res.error || !res.data) { setError(res?.message); return; } setSuccess(true);` (mirror `ProfileService.changePassword`).

*(X2 and X3 are the other two Highs — see X-series above.)*

---

## Medium

### F-003 — [Medium, Cross-cell: needs web-backend confirmation] Blog detail renders CMS HTML without sanitization
`parse(post.content)` via `html-react-parser` with a `replace` callback that only rewrites img/table/headings; all other markup passes through. `html-react-parser` won't execute injected `<script>`, but `javascript:` hrefs and some attribute vectors survive. Real XSS risk **iff** post content is attacker-influenceable and not sanitized server-side (blog authoring is typically admin-only, which lowers likelihood).
- Flow: FL-17 | Code: `src/components/blogComponent/Blogdetailsclient.tsx:146,374`
- Fix: DOMPurify the content before `parse`, or confirm+document backend sanitization on write. Scheme-check `img`/`a` URLs.

### F-004 — [Medium] Offline false-positive hard-redirect + Network-checker logs user out / dead-ends
`NetworkService.checkConnection()` hard-redirects to `/Network-checker` via `window.location.href` whenever `navigator.onLine` is false (unreliable signal) — losing in-progress form state. The Network-checker "Try Again" then, even when back online, calls `logout()` and pushes `/auth/login` instead of returning the user to their page. No `online` event listener → no auto-recovery.
- Flow: FL-24 (+ any flow) | Code: `src/components/Network/NetworkService.ts:4-6`; `src/app/Network-checker/page.tsx:16-23`
- Fix: add an `online` listener that auto-returns; on retry `router.back()` to a stored origin without logging out; stop hard-redirecting on a single `navigator.onLine` blip.

### F-006 — [Medium] Dashboard route guard is client-only; no Next middleware
No `middleware.ts`. `/dashboard/*` is gated only by a post-hydration React effect, so there is no edge/server access control and (with X2) an expired-but-unexpired cookie renders the dashboard shell before calls 401.
- Flow: FL-09 | Absence: yes | Code: `src/components/pagesComponent/DashboardLayout.tsx:133-155`
- Fix: add `middleware.ts` matching `/dashboard/:path*`; keep the client effect as UX fallback.

### F-007 — [Medium] Wrong vs expired OTP indistinguishable; no resend on reset-password
Both show the same generic "incorrect or expired"; reset-password has **no** resend affordance at all, so an expired reset OTP forces a full restart from forgot-password.
- Flow: FL-02, FL-06 | Absence: yes | Code: `src/app/auth/account-verification/page.tsx:50-54`; `src/app/auth/reset-password/page.tsx:84-87`
- Fix: surface the backend's specific reason and add a "Resend code" control on reset-password.

### F-008 — [Medium] Register mutates module-level `INITIAL_VALUES` (shared state)
`INITIAL_VALUES.referralCode = ReferalCode` mutates a shared constant; a later form reset re-seeds from the mutated constant, leaking a stale referral code into a subsequent signup in the same session.
- Flow: FL-01 | Code: `src/app/auth/register/page.tsx:76,154,203`
- Fix: keep `INITIAL_VALUES` immutable; derive referral from `searchParams` into state.

### F-012 — [Medium] Create-booking "Confirm & pay" has a narrow double-create window
`processPayment` guards with `if (isProcessing) return;` but the disable is state-driven via a `useEffect` that only runs after `setIsProcessing(true)` re-renders; a second synchronous click reads stale `isProcessing===false` and can fire two bookings/inits.
- Flow: FL-31 (also FL-34) | Absence: no synchronous `useRef` lock | Code: `src/components/Booking/CreateBooking/CostBreakdown.tsx:243-244,458-504`
- Fix: `const inFlight = useRef(false)` set/cleared synchronously at function entry.

### F-013 — [Medium → Critical if backend trusts it; Cross-cell: needs web-backend confirmation] Client sends `discountAmount` in create-booking payload
Booking should be priced solely off the server's `calculationId`; the client also sends `discountAmount`. If the backend trusts the body value rather than recomputing from `calculationId`, a tampered request lowers the charged total.
- Flow: FL-31/FL-32 | Code: `src/components/Booking/CreateBooking/CostBreakdown.tsx:291,318,336`
- Fix: stop sending `discountAmount`; confirm backend ignores client amounts and derives price from `calculationId`.

### F-014 — [Medium] Special-checkout reuses a stale `existingBookingId` cookie after edits
`handleBookNow` reuses `servicePricingBookingId` (1-day cookie) without checking it still matches the currently displayed trips/price; editing the trip after a first booking pays the **old** bookingId while the UI shows the **new** estimate.
- Flow: FL-34 | Absence: yes (no invalidation on trip/estimate change) | Code: `src/app/booking/[id]/special-checkout/page.tsx:183-186,469,486-493`
- Fix: clear `servicePricingBookingId` whenever trips/estimate change, or store a trip signature and rebuild on drift.

### F-015 — [Medium] Payment-initiation buttons lack in-flight guard, error handling, and null-check
Two locations call `initiatePayment` with no `try/catch`, no disabled/loading state, and dereference `booking.data.authorizationUrl` without a null check; on failure nothing shows and a null `data` throws. Pending-payment also defaults `paymentGateway` to `""` so a first click can send an empty provider.
- Flow: FL-37, FL-49 | Absence: yes | Code: `src/app/pending_payment/[bookingId]/page.tsx:49,82-92,379-392`; `src/app/dashboard/payment/page.tsx:230-240`
- Fix: add processing lock + disabled state, try/catch with toast, null-check the response, require a gateway.

### F-018 — [Medium] Notifications have no "mark as read" — only delete
Unread styling is rendered but no handler ever sets read; the only way to clear the unread state is to delete (losing the content). The `updateDataNotification` plumbing exists but has zero consumers (dead code).
- Flow: FL-48 | Absence: yes | Code: `src/app/dashboard/notification/page.tsx:317-327`; `src/controllers/notification/notificationService.ts:24-82`; dead: `src/controllers/connnector/app.callers.ts:333`
- Fix: wire mark-as-read (plumbing already exists) on click, or remove the unread affordance.

### F-022 — [Medium] Un-favouriting on the Favourites list doesn't remove the card
`VehicleCard.handleLike` only flips its own local state and never notifies the list, which holds its own `vehicles` array with no change listener/callback — the un-favourited card stays until reload, looking like a failed action.
- Flow: FL-46/FL-47 | Absence: yes | Code: `src/components/pagesComponent/FavouritesClientPage.tsx:172-175`; `src/components/Booking/VehicleCard.tsx:128-161`
- Fix: dispatch a "favourites changed" event the list listens for (or pass a callback) and filter the removed id.

### F-023 — [Medium, Cross-cell: needs web-backend confirmation] Already-reviewed guard is client-only and racy
`checkIfUserHasReviewed` gates the form but swallows all errors as `false` (→ shows the form), and `handleSubmitReview` doesn't re-check before POST. Two tabs / a slow check let a user submit duplicate reviews; dedup depends entirely on the backend.
- Flow: FL-57 | Code: `src/app/review/[id]/page.tsx:60-69,95-125`; `src/controllers/booking/bookingService.ts:335-350`
- Fix: rely on backend uniqueness, surface a specific "already reviewed" message, don't treat a failed check as "no review".

### F-031 — [Medium] Blog like state never seeded → repeat likes, no unlike after reload
On load `liked=false`/`likeId=null` with no "has-liked" fetch; a user who already liked sees "Like", can like again (count inflates), and can never unlike (no `likeId`).
- Flow: FL-17 | Absence: yes | Code: `src/components/blogComponent/Blogdetailsclient.tsx:233-262`
- Fix: seed like state on mount; rely on server idempotency.

---

## Low

- **F-009** [Low] `AuthService.storeAuthData` reads token at wrong nesting (`data.accessToken` vs `data.data.accessToken`); masked because the login page writes cookies correctly. `src/controllers/auth/auth.ts:194-200`.
- **F-010** [Low] Forgot-password relays backend message verbatim → possible email enumeration. `src/app/auth/forgot-password/page.tsx:40-44`.
- **F-011** [Low] Resend-OTP 60s throttle is client-only (cleared on refresh); rely on server rate limiting. `src/app/auth/account-verification/page.tsx:67-85`.
- **F-016** [Low] Success page does not poll for the webhook-vs-redirect race (confirmation page does, 5×/4s); may show PENDING + "Pay now" until manual refresh. `src/app/booking/success/page.tsx:146-227`.
- **F-017** [Low] `clarityEvent("payment_succeeded")` re-fires on every reload (GA purchase is de-duped, Clarity isn't). `src/app/booking/success/page.tsx:154-159`.
- **F-019** [Low] Refer-a-friend: `generateReferralCode` has no error handling; clipboard copies show "Copied!" even if the write rejects. `src/app/dashboard/refer-a-friend/page.tsx:240-255`.
- **F-020** [Low, dead code] `ReceiptGenerator` builds receipt HTML with unescaped payment fields; never imported (live download uses server PDF). `src/controllers/booking/paymentService.ts:125-455`.
- **F-021** [Low] Load failures render as the empty state (no error/retry) on several read pages: my-trips, dashboard metrics, reviews list, blog list, about-us. e.g. `src/app/dashboard/my-trips/page.tsx:64-68`, `src/components/Reviews/index.tsx:25-37`.
- **F-024** [Low] Empty (optional) review comment is sent as fabricated `recommend: "No additional comments"`. `src/app/review/[id]/page.tsx:104-111`.
- **F-025** [Low] Review (and other) submit errors collapsed to one generic string; backend reason (e.g. "already reviewed") never surfaced. `src/app/review/[id]/page.tsx:119-124`.
- **F-026** [Low] "See all reviews" link uses wrong-case `/Booking/...`; 404 risk on case-sensitive routing. `src/components/Reviews/index.tsx:137`.
- **F-027** [Low] Reviews pagination `goToNextPage` clamps to `pages` not `pages-1` (off-by-one → empty extra fetch). `src/components/Reviews/index.tsx:41-43`.
- **F-028** [Low] Favourite toggle: heart not disabled while in-flight (double-click race) and errors swallowed by empty catch. `src/components/Booking/VehicleCard.tsx:128-161`.
- **F-029** [Low, Cross-cell: needs web-backend confirmation] Track-booking hits unauthenticated `/api/v1/public/bookings/{id|invoice}` and renders booker PII; enumeration risk if ids/invoices are guessable. `src/components/pagesComponent/TrackBookingClient.tsx:100-137`.
- **F-030** [Low, dead code] Duplicate favourites component `FavouritesVehiclesClient.tsx` (byte-identical, unused). Delete to avoid drift.
- **F-032** [Low] Blog comment "log in" prompt is a no-op: `showLoginModal` is set but never rendered, and auth is read from the wrong storage (`localStorage.auth_token` vs cookie). `src/components/blogComponent/Blogdetailsclient.tsx:149-156,232`.
- **F-033** [Low] Partnership-detail "Try again" uses empty `href=""` (relies on browser reload behavior). `src/app/partnership/[slug]/page.tsx:67-72`.

---

## To confirm (need another cell or more info)
- **F-013** backend: is `discountAmount` recomputed from `calculationId` and the body value ignored? (Critical if trusted.)
- **F-023** backend: does `/api/v1/rating-review` reject duplicate reviews per booking?
- **F-029** backend: are invoice numbers / booking UUIDs high-entropy, and does the public payload omit PII?
- **F-003** backend: is blog `content` sanitized on write, and who can author posts?

## Pending (next pass)
FL-25 booking landing, FL-26 booking/explore, FL-27 booking/search, FL-28 browse-by-state — read-only catalogue browse/search, not yet walked.
