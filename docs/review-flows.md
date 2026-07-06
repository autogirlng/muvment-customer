# Muvment Customer Web — Flow Register (cell: web-frontend)

Inventory verified by 3 independent sweeps: (1) route table `src/app/**/page.tsx` (57 pages), (2) controller/service endpoint sweep, (3) UI entry-point sweep. Parallel review by 5 domain workers, then reconciled (phase 7). Browser automation unavailable → all verdicts **Traced from code** (a few read-only curl page-loads noted separately).

Status: Reviewed / Pending / Out-of-scope / Dead code. Verdict: OK / OK-caveats / Issues / Blocked. Finding IDs in the last column.

| ID | Flow | Entry | Status | Verdict / findings |
|----|------|-------|--------|--------------------|
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
| FL-25 | Booking landing | /booking | Pending | browse; deferred to next pass |
| FL-26 | Booking explore | /booking/explore | Pending | browse; deferred to next pass |
| FL-27 | Booking search | /booking/search | Pending | browse; deferred to next pass |
| FL-28 | Browse vehicles by state | /booking/states/[stateId] | Pending | browse; deferred to next pass |
| FL-29 | Vehicle detail | /booking/details/[id] | Reviewed | OK-caveats |
| FL-30 | Vehicle reviews list | /booking/details/[id]/reviews | Reviewed | OK-caveats — F-021, F-025, F-026, F-027 |
| FL-31 | Create booking | /booking/create/[id] | Reviewed | Issues — F-012, F-013 |
| FL-32 | Price calculate/quote | bookingService | Reviewed | OK-caveats — X3, F-013 |
| FL-33 | Special pricing | /booking/[id]/special-pricing | Reviewed | OK-caveats |
| FL-34 | Special checkout | /booking/[id]/special-checkout | Reviewed | Issues — F-014, F-012 |
| FL-35 | Booking invoice | /booking/invoice/[id] | Reviewed | OK |
| FL-36 | Booking details / confirmation | /payment/[id] | Reviewed | OK |
| FL-37 | Pending payment | /pending_payment/[bookingId] | Reviewed | Issues — F-015 |
| FL-38 | Payment options (init) [MONEY] | PaymentOptionsModal | Reviewed | OK |
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
| FL-60 | (dup placeholder) | — | Out-of-scope | duplicate of FL-30 |
| FL-61 | Sitemap (SSR) | /sitemap.ts | Reviewed | OK |

**Coverage:** 56 Reviewed, 4 Pending (FL-25/26/27/28 — read-only catalogue browse/search, deferred), 1 Out-of-scope (FL-60 dup). Review is **not 100% complete** until the 4 browse flows are walked.

## Cross-cutting (X-series) + findings index — see docs/APP-REVIEW-FINDINGS.md
- **X1** No axios request timeout (Medium) — all flows
- **X2** No 401→refresh→retry; refresh/setTokens dead code; 7-day cookie vs server expiry (High) — FL-08/09 + all authed
- **X3** Client SQL-injection regex blocks legit auth input & names (High) — FL-01/04/06, FL-32 (via updateData)
- **X4** JS-readable token cookies, secure only in prod (Medium) — FL-08
- Highs: F-002 (create-org/KYC false success). Mediums: F-003 blog XSS, F-004 offline redirect/logout, F-006 client-only guard, F-007 OTP messaging, F-008 register shared-state, F-012 create-booking double-submit, F-013 client discountAmount (cross-cell; Critical-if-trusted), F-014 stale bookingId cookie, F-015 payment-init unguarded, F-018 no mark-as-read, F-022 unfavourite no refresh, F-023 review dup guard (cross-cell), F-031 blog like not seeded. Lows: F-009,010,011,016,017,019,020,021,024,025,026,027,028,029,030,032,033.
