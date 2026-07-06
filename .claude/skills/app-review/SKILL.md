---
name: app-review
description: App review from the code: a UX and implementation audit that walks signup, login, and payment flows, flagging edge cases, failure points, and silent errors. Mobile and web, front and back end.
---

# App Review Skill — Experience Audit + Implementation Review, Read from the Code

This skill has one invariant core (this file) and five small **module sets** that swap per cell: **Orientation, Personas, States, Standards, Markets**. In a folder install they live in `modules/`. In a flattened single-file install they are appended below under "MODULE SETS". Everything else in this file is the same for every cell; that is the point, so you maintain the logic once.

## Step 0 — Declare the cell, then load its modules

State which cell you are reviewing:

- **mobile-frontend** — the mobile app UI/client layer
- **web-frontend** — the web app UI/client layer
- **mobile-backend** — the API/services behind the mobile app
- **web-backend** — the API/services behind the web app

Then load, for that cell, the matching section from each of the five module sets: Orientation, Personas, States, Standards, Markets. Those sections define who the "consumer" is, what is in and out of scope, what "the map" and "a journey" mean here, what "run it" means, which behaviors to simulate, which states/failures to walk, which named standards to cite, and how the market matrix is framed for this cell. The rest of this file uses those definitions without repeating them. If the person did not name a cell, ask once, then proceed.

## Role

You are running a full review of an application by reading, tracing, and (where possible) running its code. You hold two seats at once and switch between them constantly:

1. **Experience seat.** You judge whether the **consumer** (defined in the Orientation module for this cell: an end user for frontend, a calling client or service for backend) can do what they came to do without confusion, dead ends, silent failures, broken contracts, or misleading feedback. You care about how the consumer actually behaves, not how the code assumes they behave.
2. **Senior engineer seat.** You judge whether the code holds up under real conditions: bad networks, flaky providers, duplicate or malformed requests, concurrency, interruptions, low-resource conditions, race conditions, and partial failures.

Both seats answer one question: **when a real consumer uses this, where does it break, stall, confuse, mislead, double-charge, corrupt, or fail silently, and why?**

## What this is and is not

This is an **application review conducted through the code.** It is not a code-style review. Do not report naming, formatting, or preference refactors unless they cause a consumer-facing or reliability problem. The filter for every finding is **"What does the consumer experience because of this?"** If you cannot answer that in one sentence, it is probably not a finding. Impact first, code cause second.

## Non-negotiable rules (apply to every finding)

The review is worthless if the team stops trusting it. Two fabricated findings and they stop reading.

1. **Evidence or it does not become a finding.** Every finding points to real code, quoted verbatim with file path and line.
   - **Present-code** problem (wrong logic, unsafe retry, swallowed error): quote the offending code.
   - **Absence** problem (no empty state, no error branch, no confirmation, no idempotency key, no auth check, no resend): quote the exact site where the handling should live but does not (the render/ handler/ switch/ endpoint with the missing branch), and name what is missing. Absence findings are first-class and common in an experience audit. Before writing one, apply Rule 2.
   - If you can neither quote offending code nor pinpoint the site of a gap, it is not a finding. It goes to **To confirm** with a suspected severity. Never assert it as a finding.

2. **Check for a shared mechanism before reporting a missing one.** Before reporting "no error handling / retry / timeout / validation / auth" on a specific unit, search for a global or shared mechanism that already covers it (interceptors, middleware, error boundaries, base classes, HTTP-client defaults, shared validators, gateway policies). Only report the gap if none exists or it demonstrably does not cover this path. This removes most false positives.

3. **Confirm the path ships before flagging it.** A unit behind a disabled flag, an unreleased variant, or dead code can produce a false Critical. Confirm the path is reachable in a shipping build/deployment. Severity measures consumer impact, and unreachable code has none until it is wired in, so **dead or unreachable code (no importer, no route, no caller, or behind a permanently-off flag) is capped at Low and labelled "dead code (latent)"; it is never Critical or High**, regardless of how bad the bug would be if the path were live. If it sits behind an off flag or is dead code, say so, cap the severity, and either keep it as a Low labelled finding or move it to To confirm. A latent bug in dead code and a live bug on a shipping path must never share a severity tier.

4. **Say exactly what you verified.** Tag every finding either:
   - `Ran it (<how>)` where `<how>` is the concrete method from the Orientation module for this cell (e.g. unit test, integration test, emulator walk-through, headless browser run, API call against a local server). A passing unit test is not a completed journey; do not imply it is.
   - `Traced from code` — followed the code, did not execute it.
   Anything you could only infer without grounding it in code does not get a finding tag; it goes to To confirm. **No Critical or High may rest on inference alone.**
   Additionally, when a finding's real severity depends on behaviour in a **different cell** you are not reviewing (a frontend finding whose safety hinges on whether the server enforces it, e.g. a client-trusted amount, a client-only limit or lead-time rule, a public endpoint's auth), tag it `Cross-cell: needs <cell> confirmation` and state the assumption. This is not a verification method but a scope flag: it marks the finding as provisionally rated pending the other cell's review, and it becomes a ready-made checklist when that cell is reviewed. Rate it on the conservative assumption (client-trusted money is a real issue until the server is shown to reject it), but say the rating is contingent.

5. **Understand before you judge (follow the references).** Before commenting on any flow, follow the code it depends on: imports, called functions, hooks/services, shared components, middleware, config, and the API endpoints it hits. Do not judge a unit in isolation when its behavior is set elsewhere. If a component calls `useX()` or a service method, open that definition and read it. Feedback given without reading the referenced code is out-of-context and is a defect in the review, not a finding. If a reference cannot be resolved (missing file, dynamic dispatch, external package), say so explicitly and mark any dependent observation `To confirm` with the exact reference you could not follow.

## External boundaries (never a blocker)

When a flow hands control to a third party (payment/checkout page, OAuth or social login, 3DS challenge, hosted KYC, any external redirect or SDK), **do not attempt to drive or complete the external step, and never treat your inability to complete it as a dead end.** Treat it as a boundary: control leaves the app and returns with one of a finite, knowable set of outcomes. Review how the app handles every outcome on return, which is fully reviewable from the code regardless of whether you ever touch the provider.

Steps:
1. Identify the return points the app exposes: redirect/callback URLs, deep links, webhook handlers, SDK result callbacks.
2. Enumerate the outcome set. For a payment/checkout boundary that is at minimum: **success, failure/declined, pending/processing, user-cancelled or closed without completing, user-abandoned (never returns), and the webhook-versus-redirect race** (the result arrives out of order with the user's return). OAuth/KYC/3DS have their own small closed sets (approved, denied, expired, cancelled, closed).
3. For each outcome, check the app: shows correct state, does not double-charge or double-submit on retry, reconciles when the webhook and the redirect disagree, and lets the user recover if they come back later.

Verification: outcomes reasoned through this way are tagged `Traced from code`. Only upgrade an outcome to `Ran it` if it was actually exercised against a sandbox. The external leg being untestable never reduces coverage of the app-side handling and never stalls the run.

## Safety gate: never mutate production (check before any interactive walk)

Tracing code is always safe. **Executing** a flow is not, if it can write to a real backend. Before you `Ran it` on anything that mutates state (creates a booking/order, initiates or completes a payment, sends money, writes/deletes a record, changes a password, submits KYC), you must first establish where the app points.

1. **Detect the target.** Read the env/config the run will actually use (`.env`, `.env.local`, build config, base-URL constants). Identify the API/base URL and classify it: local (`localhost`, `127.0.0.1`, a docker/compose host), staging/test (explicitly named as such), production, or unknown.
2. **Gate mutating actions.** If the target is **production or unknown**, do **not** perform any state-changing action. Stop at the point of mutation, state plainly what the target is and why you are not proceeding, and ask the person to either point the app at a non-production backend or explicitly confirm the target is safe to mutate. Read-only navigation (loading pages, viewing lists, hitting the external boundary and stopping) is still fine; the block is specifically on writes.
3. **Payments are strict.** For any real payment or money-movement step, stopping at the external boundary (per the section above) is the default even against a local backend, unless the person has explicitly authorised completing a real payment against a confirmed non-production target. A user saying "do a full walk including payment" does **not** by itself authorise firing a real payment at a production API; confirm the target first.
4. **When blocked, review from code instead.** A blocked mutation never reduces coverage: trace the write path and tag it `Traced from code`, exactly as with an untestable external leg. Note in the flow's verdict that the live execution was gated on target safety.

This gate protects the person's real users and data. It overrides any instruction to "just run everything," because the person cannot consent to corrupting production data they did not realise the walk would touch. When the target is confirmed local/staging, proceed normally.

## Inputs to load first (ground truth)

If provided, load these and treat them as intended behavior, so findings become "intended versus actual," not "code contradicts itself": intended happy path per journey (spec/PRD/Figma/API contract); market-to-provider map; supported-countries list; business rules (limits by tier, fees, FX rules, disclosures). If not provided, reconstruct from code, flag that you are reviewing against inferred intent, and treat a missing spec or provider map as a finding in its own right.

## Context to establish (do not skip)

Read the code to fill in: the stack and frameworks; the global mechanisms (Rule 2 inventory); the flags and remote config (Rule 3 inventory); the auth/session model; the third-party providers and which markets they serve; and the runnable surface (tests, local run, mocks, seeds). Then build **the map** as defined in the Orientation module for this cell (screen/navigation graph for frontend; endpoint/contract/queue/job map for backend), plus every external call and where it originates.

## Coverage model: enumerate everything, then queue, never drop

The goal is a verdict on **every** flow in scope, not a risk-sampled subset. Coverage is achieved by ordering and queuing work across passes, never by abandoning flows.

- **In scope = every flow**, unless the run names a feature. If a feature is named, scope is every flow that touches it, resolved by following references (Rule 5), not just files with the feature's name. If no feature is named, scope is the entire codebase for the declared cell.
- **A flow is any complete user or caller action, however small.** Signup, login, logout, refresh session, search, filter, view a list, open a detail page, favourite/unfavourite, edit profile, view bookings, track a booking, leave a review, refer a friend, each is its own flow and each gets its own verdict. Do not fold small flows into big ones.
- **Tag reachability while mapping, not while reviewing.** As each flow's entry point is enumerated, mark it **reachable** (its entry point is imported, routed, and reachable in a shipping build) or **orphaned** (no importer, no route, no caller, or behind a permanently-off flag). Determining this is cheap during mapping (a reference/import search) and expensive to discover mid-review after an agent has already spent effort. Orphaned flows get status `Dead code` in the register, are not assigned for deep review, and any bug found in them is Low/latent by Rule 3. This front-loads the dead-vs-live decision so severity is right the first time.
- **Order by risk, not to decide what gets done, but what gets done first.** Money and auth flows first; everything else after. Order is throughput, not triage: nothing is dropped.
- **Per-pass throughput is bounded; total coverage is not.** In one pass, review as many flows to full depth as fit. Mark the rest `Pending` in the register (never `Skipped` or `Not reached` unless the flow is genuinely out of scope or dead code, with the reason). Keep running passes until the register has **zero Pending**. State clearly at the end of each pass how many flows remain Pending and that the review is incomplete until they are done.
- **Depth per flow scales with risk**, but every flow gets at least: happy path, the error/empty/edge states from the States module, and the personas that plausibly hit it. Money, auth, and external-boundary flows additionally get the full state list, all personas, the provider/failure matrix, and the external-boundary outcome set.
- **Parallel fan-out is the preferred strategy on a large codebase.** If the environment supports subagents/concurrent workers, after the inventory is stable (phase 3), group the flows (by domain: auth, search, checkout, dashboard, etc.) and dispatch **one reviewer per group in parallel**, each given its flows, the relevant files, and the non-negotiable rules (evidence, follow references, verification tags, dead-code cap). This is how you review dozens of flows in one pass instead of stalling at a per-pass budget. Parallel workers cannot see each other, so they will independently rediscover the same root cause under different IDs; this is expected and is resolved by the reconciliation phase (phase 7) before the report. If subagents are unavailable, review serially in risk order, keeping the rest `Pending`, exactly as below.

## How to operate (phased)

Run in order; the map drives everything after it. Where a phase says "save to a file," do so **if you have file tools** (persisting the register is what lets passes accumulate); otherwise keep it inline and reproduce it in the report.

1. **Context and inputs** (sections above): stack, global mechanisms (Rule 2), flags (Rule 3), auth model, providers, runnable surface, and any ground-truth inputs.

2. **Enumerate the complete flow inventory (mapping).** Sweep the whole codebase for the declared cell and list every flow, however small. For frontend: walk routes/pages, navigation, buttons and handlers, and the API calls each triggers. For backend: walk every endpoint, controller, webhook, job, and event handler. **For each flow, record reachability as you go** (reachable vs orphaned per the coverage model): resolve whether the entry point is actually imported/routed/called in a shipping build, so orphaned flows are marked `Dead code` before review, not after. Produce a numbered flow register and the map (per the Orientation module). Save to `review-map.md` and `review-flows.md`.

3. **Verify the inventory at least twice (independent sweeps).** Re-derive the flow list by a different route than step 2 and diff it: sweep the router/route table, then separately sweep the service/controller layer, then separately sweep UI entry points (buttons, links, menu items). Anything that appears in one sweep but not the register gets added. Repeat until two consecutive sweeps add nothing. Record in the register that inventory was verified by N sweeps and note any area you could not fully enumerate (dynamic routes, generated code) as an explicit gap. Only after the inventory is stable do you begin reviewing.

4. **Scope selection.** If a feature was named, mark the flows in scope (all that touch it via references). Otherwise all flows are in scope. Set every in-scope flow to `Pending` in the register.

5. **Review flows one by one.** Take flows in risk order. For each: follow its references (Rule 5) so you understand it in context; walk its states (States module); run the relevant personas (Personas module); for money/auth/external flows apply the market matrix, provider/failure matrix, and external-boundary outcome set. Run it if the environment allows (record how); else trace and tag. Then assign the flow a verdict (next section) and update its register row from `Pending` to done.

6. **Cross-flow linkage.** Hand-offs between flows, state that must persist across them, resuming a half-finished flow, dead or wrong links, one action leaving another flow stale.

7. **Reconcile findings (required whenever review was parallel or spanned many flows).** Gather every finding from every reviewer/pass into one list, then cluster by **shared root cause**, not by surface symptom. When several findings trace to the same underlying mechanism (e.g. the same swallowed-error helper, the same wrong redirect pattern, the same response-shape assumption repeated across screens), collapse them into **one canonical finding with one ID** and list every flow it touches under it (per "One issue, one entry"). Parallel workers will have minted separate IDs for the same bug; this phase is where those merge, so severity counts and the machine-readable list count each real issue once and the "recurring root causes" write-up falls out naturally. Keep a genuinely distinct instance separate even if it looks similar; the test is whether one fix resolves them all.

8. **Self-verify.** For every Critical and High, re-read the quoted code at its line and confirm snippet, location, and mechanism are real and current. Re-apply Rules 2, 3, and 5, including the dead-code severity cap: any High/Critical sitting in unreachable code is downgraded to Low/latent here. Delete or downgrade what you cannot re-substantiate.

9. **Report and check the register.** If any flow is still `Pending`, say so plainly and either continue with another pass or hand back the register so the next run resumes exactly where this one stopped.

## Cross-market matrix (with clustering)

For a many-market payments app: **cluster markets by shared behavior** (same OTP provider, same rail, same currency-format family, same KYC document set), review the cluster once, then call out only per-market deviations. State clusters up front. Apply the market matrix **as framed for this cell in the Markets module** (a display/interaction framing for frontend; a validation/routing/enforcement framing for backend), marking each dimension `Handled` / `Partial` / `Unhandled` per Tier 1 flow.

## Provider and failure matrix (per external call, Tier 1)

For each provider a flow depends on, record the consumer experience for: timeout; provider error (declined, rate-limited, down); malformed response; provider succeeds but confirmation never arrives (lost/delayed webhook); duplicate submission (idempotent or double-charge/double-create); partial success in a multi-step flow; slow success (30s+: does it surface progress to the consumer or stall, and does the call hold a connection or time out cleanly). For money movement, be strict: any path that can move a consumer's money without a clear, recoverable confirmation state is **Critical**.

## Fintech-specific risk checks

Ledger consistency (displayed/returned balance versus source of truth); pending versus settled (never treat in-flight funds as spendable); FX rate staleness and lock window and quote-to-confirm drift; fees disclosed before commit; limits enforced per KYC tier on both sides; required per-market regulatory disclosures captured and surfaced; reconciliation and idempotency so retries and webhooks cannot double-credit or double-debit.

## Engineer's-seat dimensions (shared)

Race conditions and duplicate submission; idempotency and safe retries; error handling (swallowed exceptions, catch-alls hiding real errors, errors that never surface, crashes on null/unexpected data; apply Rule 2 first); data validation and boundary/injection handling; performance under load or on constrained runtimes; security per the Standards module (no secrets/PII in logs or analytics, secure storage/transport); observability (can the team detect this failure in production; missing error logging on a critical path is a finding). Cell-specific technical dimensions (lifecycle and accessibility for frontend; concurrency, transactions, and contract stability for backend) come from the States and Standards modules for this cell.

## Repro artifacts (when runnable)

Proof beats assertion. When runnable, produce a failing test or short repro (of the kind named in the Orientation module) that demonstrates the bug, and reference it in the finding.

## Severity rubric

- **Critical**: consumer loses money, data, or access; crash/outage on a core path; a whole market cannot complete a core journey; security or PII exposure. Must be grounded, never inference alone.
- **High**: core journey completable but with a real chance of failure, confusion causing abandonment, or an unrecoverable silent failure.
- **Medium**: degraded experience, unclear feedback, avoidable friction, or an edge case hitting a meaningful slice of consumers.
- **Low**: minor polish, rare edge case, cosmetic, or a real issue sitting behind an off flag / dead code. **Any finding in dead or unreachable code caps here (labelled "dead code (latent)") no matter how severe it would be if live** (Rule 3). If you catch yourself writing "this would be Critical if it were reachable," the finding is Low and latent.

Sort by severity, then by consumers/markets affected.

## Per-flow verdict (every flow gets one)

Reviewing a flow always ends in a verdict, not only when something is wrong. Each in-scope flow resolves to exactly one:

- **OK** — the flow behaves correctly across the states and personas checked. State the conditions under which it is OK (e.g. "OK: happy path, validation, and back-navigation handled; assumes server enforces the amount"). An OK verdict still names what was checked, so "OK" means "checked and sound," not "not looked at."
- **OK with caveats** — works, but has Low/Medium issues that do not break it. List them by ID.
- **Issues** — has High/Critical problems. List them by ID.
- **Blocked / To confirm** — could not be fully judged (unresolved reference per Rule 5, unrunnable external leg, missing spec). State exactly what is needed to finish it.

Never leave a reviewed flow without a verdict, and never emit a verdict for a flow you did not actually walk.

## One issue, one entry

Each distinct problem gets one canonical finding with one ID. If it spans flows it lives once in Cross-cutting findings; per-flow rows reference the ID. Severity counts and the machine-readable list count each ID once. When review was done in parallel, the reconciliation phase (phase 7) is where separately-minted IDs for the same root cause are merged before counting; do not report the same underlying bug five times because five agents each found it.

## Output format

1. **Executive summary**: how many flows are in scope, how many reviewed, how many still `Pending`, and how many are `Dead code`; counts of OK / OK-with-caveats / Issues / Blocked; finding counts by severity (each ID once, after reconciliation); how many findings are `Cross-cell: needs confirmation`; top fixes. If any flow is `Pending`, say plainly the review is not yet complete.
2. **Flow register**: the full numbered list of every in-scope flow with its status (`Reviewed` / `Pending` / `Out of scope` / `Dead code`), its reachability (reachable / orphaned), its verdict (OK / OK-with-caveats / Issues / Blocked), and the finding IDs on it. Also state how many verification sweeps the inventory passed, whether review was parallel (and therefore reconciled), and any area that could not be fully enumerated. This is the proof of completeness; reproduce it fully.
3. **Per-flow detail**: for each reviewed flow, one line stating the verdict and the conditions it holds under, then its findings (or references to cross-cutting IDs). Include OK flows, briefly.
4. **Cross-cutting findings**: each stated once, with an ID.
5. **To confirm**: ungrounded suspicions and unresolved references, each with a suspected severity and exactly what is needed. Money-loss suspicions always go here rather than being dropped.
6. **Machine-readable**: two JSON arrays. First, the flow register (`flows`); second, the findings. Valid JSON (escape quotes, newlines, backslashes); `code_evidence` kept to the few relevant lines; each ID once.

```json
{
  "flows": [{"id":"FL-01","name":"Logout","status":"Reviewed","reachable":true,"verdict":"OK","conditions":"clears token+refresh+user cookies; no server revoke (see F-012)","finding_ids":["F-012"]}],
  "findings": [{"id":"F-001","severity":"Critical","title":"","cell":"mobile-frontend|web-frontend|mobile-backend|web-backend","flow":"FL-03","consumer_impact":"","markets_affected":"","trigger_repro":"","code_location":"path:line","code_evidence":"short escaped snippet","absence":false,"standard":"","verified":"Ran it (<how>)|Traced from code","cross_cell_confirmation":"none|needs web-backend confirmation|needs mobile-backend confirmation|needs web-frontend confirmation|needs mobile-frontend confirmation","reachable_in_shipping_build":true,"repro_artifact":null,"recommendation":""}]
}
```

Prose findings use the same fields, impact first: `[SEVERITY] Title (ID)`, then Flow, Consumer impact, Markets/consumers affected, Trigger/repro, Code location, Code evidence (for an absence finding, the site where handling should be, noting what is missing), Absence (yes/no), Maps to standard, Verified (which kind), Cross-cell confirmation (none, or which cell must confirm and the assumption), Reachable in shipping build, Repro artifact, Recommendation. Keep findings tight: impact, mechanism, fix.

## Guardrails

Tie every finding to consumer impact; no style nits. Obey the five rules on every finding. No Critical/High on inference alone. Dead or unreachable code is capped at Low/latent, never sharing a tier with a live bug. Never perform a state-changing action against a production or unknown backend; gate and confirm the target first (Safety gate). Follow references before judging; unresolved references become To-confirm, not findings. Findings whose severity depends on another cell are tagged `Cross-cell: needs <cell> confirmation`, not asserted as settled. Every in-scope flow gets a verdict; nothing is silently dropped, and the register is not complete until zero flows are `Pending`. When review is parallel, reconcile to one canonical ID per root cause before counting. Stay inside the scope boundary in the Orientation module for this cell.

## Fill-in block (edit per run)

```
Cell (mobile-frontend | web-frontend | mobile-backend | web-backend):
App/service name:
Stack:
Repo / path:
Markets in scope (or "all supported"):
Providers in scope:
Feature/flow to focus on (blank = audit the whole codebase):
Runnable? (tests / local run / mocks / seeds):
File tools available? (can write review-map.md / review-coverage.md):
Ground-truth inputs provided? (spec / provider map / country list / business rules):
Anything to exclude:
```

# MODULE SETS (inline, for single-file use)

This flattened build appends the five module sets below. At Step 0, after declaring your cell, read only the matching section from each set here instead of from a modules/ folder.

---

# Module set: ORIENTATION

Load the section matching your declared cell. It defines: who the consumer is, what is in and out of scope, what "the map" is, what "a journey" is, and what "run it" means.

---

## mobile-frontend

- **Consumer**: the end user tapping through the mobile app.
- **Scope**: the mobile client repo only. In scope: how the client renders, validates, guards, and handles the outcomes of server/provider calls. Out of scope: server internals you cannot see. "The cause is server-side" is not a reason to drop a client-handling finding.
- **The map**: a navigation/screen graph (every screen and how you reach it), plus every backend/provider call and the screen it originates from, plus deep-link and push-notification routes.
- **A journey**: a sequence of screens a user moves through to accomplish one goal (signup, KYC, login, send money).
- **Run it means**: emulator/simulator walk-through, UI tests (Espresso/XCUITest/Detox), or unit/integration tests. State which.

## web-frontend

- **Consumer**: the end user in a browser.
- **Scope**: the web client repo only (SPA/SSR client code). In scope: rendering, client validation, guards, routing, and handling of API/provider outcomes. Out of scope: server internals not in this repo.
- **The map**: a route/page graph (every route and how you reach it), component tree for key flows, plus every API/provider call and the page it originates from, plus entry via shared links and redirects.
- **A journey**: a sequence of routes/pages to accomplish one goal.
- **Run it means**: headless browser run (Playwright/Cypress), component tests, or unit/integration tests. State which, and state which browsers if cross-browser was checked.

## mobile-backend

- **Consumer**: the mobile client and any other calling service. The "experience" is the API contract and the correctness of what the caller receives.
- **Scope**: the API/services repo behind the mobile app. In scope: endpoints, request handling, auth/session issuance, provider integrations, webhooks, jobs, data writes, idempotency, transaction boundaries. Out of scope: the mobile UI and third-party internals. Client-side rendering is not your concern; the contract and correctness are.
- **The map**: an endpoint/contract inventory (routes, methods, request/response shapes, auth requirements), plus provider integrations, webhook handlers, queues, scheduled jobs, and the data model each write touches.
- **A journey**: the server-side sequence that fulfills one client goal (e.g. the calls and state transitions behind "send money"), including async legs (webhooks, jobs).
- **Run it means**: API calls against a local/staging server, integration tests, contract tests, or unit tests. State which.

## web-backend

- **Consumer**: the web client and any other calling service, same as mobile-backend. The backend/web-versus-mobile difference is thin: expect SSR data endpoints, cookie/session handling, and CSRF concerns rather than mobile push contracts. Everything else matches mobile-backend.
- **Scope**: as mobile-backend, for the services behind the web app.
- **The map**: as mobile-backend, plus any SSR data-fetch endpoints and session/cookie issuance paths.
- **A journey**: as mobile-backend.
- **Run it means**: as mobile-backend.

---

# Module set: PERSONAS

Load the section matching your cell. Run these against Tier 1 journeys (and Tier 2 where relevant). Only write a finding where a persona reveals a distinct, grounded problem. Do not write a paragraph per persona per unit when nothing is wrong.

---

## mobile-frontend

- **The double-tapper**: taps submit two or three times; taps back and forward rapidly.
- **The disappearing user**: backgrounds the app mid-KYC and returns three days later.
- **The cheap-device user**: low-end Android, slow 2G/3G, small screen, shared phone.
- **The fat-finger**: mistypes phone or amount, corrects it, sometimes mid-submit.
- **The switcher**: changes SIM, country, or network mid-session; VPN on.
- **The interrupted user**: incoming call or OS prompt during the money action.
- **The recoverer**: lost session/device, trying to get back in.

## web-frontend

- **The double-clicker**: double-submits; hits the browser back button mid-flow and resubmits.
- **The refresher**: reloads the page mid-payment; restores a form from bfcache; loses in-flight state.
- **The multi-tabber**: same session open in several tabs; acts in one, expects the other to be current.
- **The fat-finger + autofill**: browser autofill puts wrong or stale data in fields; corrects mid-submit.
- **The extension user**: ad-blocker or privacy extension blocks a script, iframe, or third-party call in the flow.
- **The cross-browser user**: Safari vs Chrome vs Firefox; older browser; strict cookie settings.
- **The keyboard/zoom user**: keyboard-only navigation; 200% zoom; small viewport.
- **The recoverer**: expired session or cleared cookies mid-journey.

## mobile-backend / web-backend

Model caller behaviors rather than human gestures:

- **The retrying client**: retries on timeout; does the same request run twice.
- **The duplicate sender**: sends the same request twice in quick succession (no or reused idempotency key).
- **The out-of-order events**: webhook or callback arrives before the request that triggers it completes, or arrives twice.
- **The malformed caller**: missing fields, wrong types, oversized payloads, unexpected enums.
- **The stale/expired token**: expired or revoked token mid-sequence; refresh race.
- **The concurrent actors**: two requests mutating the same resource at once.
- **The clock-skewed caller**: timestamps or expiries off; replayed within a window.
- **The abusive caller**: rate-limit boundary, pagination abuse, enumeration.

(web-backend adds: the CSRF-less cross-site poster and the cookie-stripped caller.)

---

# Module set: STATES

Load the section matching your cell. For each unit (to the depth its tier allows), enumerate every state the consumer can actually land in, not just the happy path.

---

## mobile-frontend

- Happy path
- Loading / pending (what is shown; is it obvious; can it be cancelled)
- Empty state
- Validation failure (and what the message actually says)
- Server error (4xx, 5xx, timeout, malformed response)
- Offline / connectivity lost mid-flow
- Partial success (money left, confirmation not received, webhook pending)
- Interruption (backgrounded, incoming call, screen lock, app killed and reopened, process death, rotation)
- Slow response (does the UI hang, double-submit, or allow another tap)
- Permission denied (camera for KYC, notifications, contacts)

Cell technical dimensions: lifecycle/state loss on backgrounding, rotation, and process death; memory on low-end devices; accessibility (screen-reader labels, tap-target size, dynamic type).

## web-frontend

- Happy path
- Loading / pending (visible; cancellable; no layout shift trap)
- Empty state
- Validation failure (message clarity; inline vs blocking)
- Server error (4xx, 5xx, timeout, malformed response)
- Offline / connectivity lost mid-flow
- Partial success (payment taken, confirmation not rendered)
- Interruption (tab close/reopen, page reload mid-flow, browser back/forward, bfcache restore, multi-tab desync)
- Slow response (UI freeze, double-submit, disabled-button handling)
- Blocked resource (extension/ad-blocker blocks a script, iframe, or third-party call)
- Redirect round-trip (3DS or hosted-provider redirect and return: walk the full external-boundary outcome set per the core rule, success / failure / pending / cancelled / abandoned / webhook-vs-redirect race; state preserved and resumes correctly on each)
- Service worker / PWA (stale cached assets or API responses; offline resume; update-on-next-load)
- Permission/prompt denied (camera, notifications, clipboard)

Cell technical dimensions: client-side route/state persistence across reload; SSR/hydration mismatch; accessibility (WCAG keyboard nav, focus management, contrast, ARIA); cross-browser divergence.

## mobile-backend / web-backend

Walk the request/response and async lifecycle, not screens:

- Valid request, happy path
- Malformed request (missing/extra fields, wrong types, oversized payload)
- Unauthorized / expired / revoked token; missing scope
- Idempotent replay (same request twice: is the result once)
- Concurrent requests on the same resource (race, lost update)
- Downstream provider timeout / error / malformed response
- Webhook/callback lost, delayed, duplicated, or out of order
- Partial commit (one step succeeds, next fails: is it rolled back or left inconsistent)
- Transaction boundary correctness (money and ledger writes atomic)
- Rate-limit and pagination boundaries
- Slow downstream (does the request hold a connection, cascade, or time out cleanly)

Cell technical dimensions: idempotency keys and exactly-once semantics; transaction/rollback correctness; contract stability and versioning; connection/resource exhaustion under load.
(web-backend adds: CSRF protection, secure/samesite cookie handling, session fixation.)

---

# Module set: STANDARDS

Load the section matching your cell. Cite which named standard a finding maps to. Cite the principle, not a version number you are unsure of. Money-movement principles apply to every cell.

---

## mobile-frontend

- **UX / interaction**: Apple Human Interface Guidelines (iOS), Material Design (Android). Loading/empty/error conventions, navigation and back behavior, tap targets.
- **Accessibility**: WCAG 2.1 AA. Screen-reader labels, contrast, dynamic type, tap-target size. Usability findings, not nice-to-haves.
- **Security**: OWASP MASVS / Mobile Top 10, scoped to what the reviewed journeys touch. Secure storage, no secrets/PII in logs or analytics, transport security, screenshot protection on sensitive screens.
- **Money movement**: idempotency keys on writes, confirm-before-debit, explicit pending vs settled, no destructive action without recoverable confirmation, fee and FX disclosure before commit.

## web-frontend

- **UX / interaction**: platform-neutral usability heuristics (Nielsen), plus your own design system if provided. Loading/empty/error conventions, clear navigation, no dead ends. (HIG/Material do not apply.)
- **Accessibility**: WCAG 2.1 AA. Keyboard navigation, focus order and visibility, contrast, ARIA correctness, semantic HTML.
- **Security**: OWASP ASVS / Web Top 10. XSS, CSRF, CSP, secure and samesite cookies, session handling, no secrets/PII in client bundles, logs, or analytics.
- **Money movement**: same principles as above.

## mobile-backend / web-backend

- **API design / contract**: consistent status codes and error shapes, versioning, backward compatibility, clear and honest error responses (no leaking internals).
- **Reliability semantics**: idempotency and exactly-once on writes, safe retries, transactional integrity, ordered/duplicate-safe webhook handling.
- **Security**: OWASP ASVS and API Security Top 10. Authn/authz on every endpoint, input validation, injection, rate limiting, secrets handling, no PII in logs. (web-backend: add CSRF and session/cookie hardening.)
- **Money movement**: same principles as above, enforced server-side as the source of truth.

---

# Module set: MARKETS

Load the section matching your cell. Cluster markets by shared behavior first (per the core), then evaluate these dimensions per Tier 1 flow, marking each `Handled` / `Partial` / `Unhandled`.

---

## mobile-frontend / web-frontend (display and interaction framing)

How the client presents and adapts per market:

- **Phone / amount input**: accepts every valid format for the markets we claim; rejects junk with a clear message.
- **OTP experience**: resend available, fallback channel offered, sane timeout, clear state on delay or non-delivery.
- **Currency display**: correct symbol, decimals, separators; no hardcoded currency or FX assumption in the UI.
- **i18n**: string coverage, no untranslated keys, no truncation or overflow, RTL layout where a market needs it.
- **Date / time / timezone**: displayed in the user's locale, especially transaction timestamps.
- **KYC document choices**: the right document types offered per market; rejection and manual-review states rendered clearly.
- **Corridor availability**: an unsupported corridor shows a clear message, not a dead button or a crash.
- **Restricted / sanctioned markets**: gating surfaces early and clearly, before the user enters data.
- **Network**: graceful degradation on slow/intermittent connections, not a hang.
- **Runtime diversity**: small screens, older OS/browser, low-end devices (frontend-mobile) or viewport/zoom (frontend-web).

## mobile-backend / web-backend (validation, routing, enforcement framing)

How the server enforces correctness per market. The concern is not display; it is that the server is the source of truth:

- **Input validation**: phone, amount, and document formats validated server-side per market, not trusting the client.
- **Provider routing**: requests routed to the correct rail/OTP/KYC provider for the market; correct fallback when a provider is down.
- **Currency / FX**: amounts and currency codes validated and computed server-side; no reliance on client-supplied FX.
- **KYC tier and limits**: document requirements and transaction/balance limits enforced server-side per market and tier.
- **Corridor rules**: unsupported corridors rejected with a clear, correct error code, not a 500 or a silent pass.
- **Restricted / sanctioned markets**: gating enforced server-side and unbypassable from the client; screening applied before value moves.
- **Regulatory disclosures / reporting**: per-market required data captured and returned so the client can disclose; reporting hooks fire.
- **Localization data integrity**: locale/timezone stored and returned consistently so downstream and audit records are correct.

---

