# Task 0.3: System Architecture Design (Consolidated)

> **CURRENT ARCHITECTURE STATUS — 2026-10-28:** This is the **human-approved Phase 0 architecture planning deliverable**, not an accepted architectural ADR. The Phase 0 exit gate was approved on 2026-10-27. The human has subsequently directed **Phase 1 foundation implementation**; `npm install` succeeded with Node.js 24, but the actual dependency manifests require reconciliation with the human-approved OD-18 exact-version tranche, and Express/Zod require a **separate, narrow compatibility/security amendment**. **Phase 1 exit is NOT approved.** Human-approved ODs: OD-01, OD-09 (**Phase 1 test harness only; full inventory atomicity remains open**), OD-14, OD-15, OD-18 (**original P1 tranche; corrective amendment pending**), OD-20, OD-22, OD-23, OD-26, OD-27, OD-28, OD-29 (**snapshot commands need empirical verification**) and OD-30. OD-02 is withdrawn; OD-21 and later-phase design choices remain open as applicable. No draft ADR is accepted. For authoritative current decisions use `Task_0.6_ADRs_and_Open_Decisions.md` §1, for approved dependencies use `PHASE1_APPROVALS_RECORD.md`, and for the active work assignment use `.governance/handoffs/latest.md`. Historical Phase 0 restrictions within this document do not reverse later explicit human authorization.

**Project:** OIBSIP Pizza Delivery  
**Document origin:** Phase 0 architecture planning; **current project phase:** Phase 1 foundation (in progress, gate not approved).  
**Document status:** Consolidated Task 0.3 architecture with limited 2026-10-28 approval/status synchronization. Technical recommendations, architecture boundaries, API proposals, and future-phase design risks are **preserved as proposals**.  
**Approval status:** Human-approved as a planning deliverable; **no draft ADR accepted**. OD-09 approval covers only the P1 replica-set test harness, not Phase 4 inventory design.

`<project>/` refers to the approved folder name `WebDev-L3-PizzaDelivery` (OD-01). Requirement IDs (R-xx) refer to `Task_0.2_Requirements_Baseline.md`. This document is a **design reference**, not a statement of which source files or features have already been implemented. Actual repository and test state must be read from the live project and current handoff.

---

## 1. Architecture Overview

**Style:** a modular monolith. One Express process serves the REST API, Socket.IO and cron jobs. MongoDB via Mongoose. The client is a Vite SPA.

```
┌─────────────────────────── client (React+Vite+Tailwind) ───────────────────────────┐
│ pages(customer, admin) · components · auth context · api/ (fetch wrapper) · socket/ │
└───────────────┬───────────────────────────────────────────────┬────────────────────┘
          HTTPS REST /api/v1  (cookie JWT + CSRF header)   WebSocket (Socket.IO)
┌───────────────▼───────────────────────────────────────────────▼────────────────────┐
│ server (Node+Express)                                                               │
│  middleware: helmet·cors·rateLimit·auth·csrf·authorize(role)·validate·errorHandler  │
│  routes → controllers → services ─────────────────────────────┐                     │
│    auth · catalogue · pricing · inventory · orders ·          │ domain events       │
│    payments · checkout(orchestrator) · admin                  ▼ (EventEmitter)      │
│  realtime (Socket.IO: rooms user:<id>, admin) ◄───────────────┘                     │
│  jobs (node-cron): lowStockAlert · reservationSweeper                               │
│  integrations: razorpay.js · mailer.js (Nodemailer)                                 │
│  models (Mongoose)                                                                  │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                   MongoDB (replica set)
```

**Dependency rules (acyclic, enforced in review)**
- Routes call controllers, controllers call services, services call models and integrations. Controllers never touch models.
- `inventory` and `pricing` depend only on models.
- `orders` depends only on models and owns order state transitions.
- `payments` depends only on `integrations/razorpay`. It verifies signatures and talks to the gateway.
- `checkout` is the only module allowed to coordinate `pricing`, `inventory`, `orders` and `payments`. This removes the Orders↔Payments cycle noted in Task 0.2.
- `realtime` and `notifications` listen to domain events and are never imported by services.
- `confirmCapturedPayment()` (section 5.4) is the single confirmation path used by verify, sweeper and the optional webhook.

**Proposed layout (PROV, aligned with A§6):** `WebDev-L3-PizzaDelivery/` contains: workspace root `package.json` and `package-lock.json` (OD-30, approved 2026-10-28); `client/src/{api,auth,components,pages,pages/admin,socket}` with `client/package.json`; `server/src/{config,models,routes,controllers,services,middleware,jobs,realtime,integrations,utils}` plus `server/scripts/{seed,createAdmin}` with `server/package.json`; `tests/{unit,integration,helpers}` as project-level.

**Phase placement (no roadmap change)**

| Phase | Architecture elements introduced |
|---|---|
| 1 | Config and env validation, DB connection (replica-set capable), app skeleton, error format, log redaction, test harness |
| 2 | User, AuthToken, mailer, JWT/cookie and CSRF middleware, admin bootstrap script, admin login endpoint (R-16 auth) |
| 3 | Ingredient and Pizza models, seed script, read-only catalogue endpoints, **inventory core models**, pricing and quote |
| 4 | Order, checkout, reserve/commit/release operations, Razorpay, idempotency, sweeper |
| 5 | Admin inventory and order endpoints and UI, Socket.IO, low-stock cron (R-18, R-20 to R-23) |
| 6 | Security review, documentation, screenshots |

**Current implementation boundary (Phase 1):** Only the foundation items in the Phase 1 row are authorized now: Express server skeleton/health response, runtime configuration and Zod environment validation, safe logging/security middleware, MongoDB connection and transaction-capable test harness, minimal React/Vite/Tailwind setup, smoke/commit/rollback tests, evidence and governance controls. **Do not build** auth, User/Admin, Ingredient/Pizza, Order, checkout/payment, stock operations, Socket.IO or cron before their corresponding phases and decisions. Later rows are planned architecture, not current implementation authorization.

---

## 2. MongoDB Schemas

Five collections. Fields not listed are Mongoose defaults (`_id`, timestamps).

**Money (OD-19, proposed):** amounts are stored as integers in minor units. The `*Paise` field names below are provisional shorthand; a neutral `*Minor` naming is an acceptable alternative. Currency is a single server config constant, never client-supplied, and is stored on each Order. See section 9.

**User:** `name`, `email` (unique, lowercase), `passwordHash` (bcrypt), `role` (`customer`|`admin`, default `customer`, never accepted from client input), `isVerified`, `tokenVersion` (int; bumped on password reset to invalidate old JWTs).

**AuthToken:** `userId` (index), `type` (`verify`|`reset`), `tokenHash` (SHA-256, unique), `expiresAt` (TTL index), `usedAt`.

**Ingredient:** `category` (`base`|`sauce`|`cheese`|`vegetable`), `name`, `pricePaise`, `stock` (on-hand), `reserved` (held for unpaid orders), `threshold`, `isActive`, `lowStockNotified` (bool). Unique `(category, name)`. Invariant `0 ≤ reserved ≤ stock`. Available = `stock − reserved`.

**Pizza (predefined variety):** `name` (unique), `description`, `imageUrl?`, `recipe {base, sauce, cheese: ObjectId, vegetables: [ObjectId]}`, `isActive`.

**Order**
- `userId`
- `lines[] {pizzaId?, recipe{base, sauce, cheese, vegetables[]}, snapshot{names, unitPricePaise}, quantity}`
- `totalPaise`, `currency`
- `status`: `pending_payment` → `received` → `in_kitchen` → `sent_to_delivery`; `pending_payment` → `expired`; plus the guarded edge `expired → received` (late-payment recovery only; needs approval under OD-06)
- `statusHistory[] {status, at}`, `expiredAt`
- `reservation {state: held|committed|released, expiresAt, lines[{ingredientId, qty}]}`
- `payment {razorpayOrderId, razorpayPaymentId, status: pending_gateway|created|paid|paid_after_expiry, paidAt, gatewayLockUntil, lateRecovered, reconciledAt}`
- `idempotencyKey`, `requestHash` (SHA-256 of canonical validated lines: resolved ids and quantities, no prices)

**Indexes:** unique `(userId, idempotencyKey)`; unique sparse `payment.razorpayOrderId` and `payment.razorpayPaymentId`; `(status, reservation.expiresAt)` and `(status, payment.status, expiredAt)` for the sweeper; `(userId, createdAt)`.

**Relationships:** User 1—N Order. AuthToken N—1 User. Pizza references Ingredient. Orders reference ingredients by id for stock and keep **snapshots** of names and prices for history. Reservation is embedded in Order so order and reservation state change in one atomic document update.

---

## 3. Authentication, JWT, Email, Recovery, CSRF

- **Registration:** role forced to `customer`; any client-supplied `role` is rejected by strict validation (R-17). bcrypt cost 12. Verification token from `crypto.randomBytes(32)`; only its SHA-256 hash is stored; 24h expiry; single use (R-29).
- **Verification link:** opens a client route; the client POSTs the token. No state change on GET, so email scanners cannot consume tokens.
- **Login:** requires `isVerified`. Errors are generic `401`; `403 EMAIL_NOT_VERIFIED` only after the correct password.
- **JWT (OD-10):** one signed token `{sub, role, tokenVersion}`, 2h expiry, no refresh token, carried in an httpOnly cookie, same-origin via the Vite proxy. Auth middleware loads the user and rejects the token if `tokenVersion` differs.
- **Admin (R-16):** `POST /auth/admin/login` accepts only `role=admin` and returns a generic `401` otherwise. Customer login rejects admin accounts. The client has a distinct `/admin/login` route. Admin APIs sit behind `authorize('admin')`.
- **Password recovery:** `forgot-password` always returns `200` (no enumeration). Reset token expires in 1h, is single use and hashed. Using it bumps `tokenVersion` and invalidates other outstanding reset tokens.
- **Email (OD-12):** Nodemailer with SMTP config from env. Ethereal or log transport in dev; stub transport in tests.

### 3.1 CSRF protection for cookie-based JWT (recommendation under OD-10)

Layered design:
1. **Cookie:** `httpOnly; SameSite=Lax; Secure` in production. `Strict` is an optional tightening.
2. **JSON-only:** every state-changing route requires `Content-Type: application/json`, otherwise `415`.
3. **Origin check:** on POST/PUT/PATCH/DELETE, `Origin` (or `Referer` fallback) must match the `CLIENT_ORIGIN` allowlist, otherwise `403 CSRF_INVALID`. Pre-auth routes (register, login, forgot and reset password) use checks 2 and 3 only, which also covers login CSRF.
4. **Signed double-submit token** on all authenticated state-changing routes, including logout and payment verify.
   - Token is `random + HMAC(secret, random|sub)`, set in a non-httpOnly `csrf` cookie at login, rotated on login, cleared on logout, re-issued by `GET /auth/me` if missing.
   - Client echoes it in `X-CSRF-Token`. Server checks header equals cookie and the HMAC is valid for the session user, using timing-safe comparison.
   - The HMAC binding closes subdomain cookie injection.
5. **CORS:** explicit origin allowlist with `credentials: true`, no wildcard.
6. **Socket.IO:** handshake validates `Origin` against the allowlist before accepting the cookie, blocking cross-site WebSocket hijacking.
7. All GET routes are side-effect free; email links open client routes that POST.

No new packages are needed (Node `crypto`).

---

## 4. Catalogue, Customization, Pricing

- Catalogue reads are available to authenticated customers: ingredients grouped by category with an `inStock` boolean (exact stock is not exposed).
- **Line shape:** `{pizzaId, quantity}` (preset) or `{recipe, quantity}` (custom). The server resolves both to an ingredient set.
- **Validation:** exactly one base, one sauce and one cheese, all active and in the correct category; vegetables as a de-duplicated array. Whether at least one vegetable is required is **unresolved (R-12)** and is not enforced.
- **Price** = Σ lines × quantity × (base + sauce + cheese + Σ vegetables) using current `pricePaise` values. The client never sends prices (R-26). All amounts are integers.
- `POST /orders/quote` returns the breakdown for the order summary (R-13). `POST /orders` recomputes the price independently.

---

## 5. Orders, Inventory, Reservation, Payments

### 5.1 Inventory semantics (OD-04, OD-16)
`reserve` increments `reserved` through a conditional update (`stock − reserved ≥ qty`). `commit` decrements `stock` and `reserved`. `release` decrements `reserved`. Per-ingredient quantity is 1 × pizza quantity (OD-16). Reservation TTL (recommended 15 min) is tunable.

### 5.2 Create order with idempotency (R-19, R-26 to R-28)

1. Authenticate, apply CSRF checks, validate. `Idempotency-Key` is **required** (16–64 characters, `[A-Za-z0-9_-]`), otherwise `422`.
2. Look up `(userId, key)`. Same `requestHash` → replay (step 7). Different hash → `409 IDEMPOTENCY_KEY_CONFLICT`, no state change.
3. If not found, price the lines and aggregate ingredient demand. In **one transaction**, conditionally reserve all ingredients (any shortfall aborts everything → `409 OUT_OF_STOCK` with item names) and insert the Order (`pending_payment`, `payment.status=pending_gateway`, reservation `held`, `expiresAt = now + TTL`).
   - **Concurrent duplicates:** the unique index lets one insert win. The loser's transaction aborts on a duplicate-key or transient conflict, so its reservations roll back. The loser repeats step 2 with bounded retry. If the winner is still not visible, return `409 REQUEST_IN_PROGRESS` with `Retry-After`. Double reservation is impossible because reserve and insert share a transaction.
4. **Claim the gateway call** (outside the transaction): a conditional update on `payment.status=pending_gateway` and null/expired `gatewayLockUntil` sets the lock to now + 30s. Only the claimant calls Razorpay (`amount`, `currency`, `receipt=orderId`). If lookup by receipt is supported (unverified), the claimant first adopts an existing gateway order.
5. **Success:** set `razorpayOrderId` only if still null; set `payment.status=created`. A losing duplicate gateway order is an unpaid orphan; verification uses only the stored id (5.3).
6. **Failure**
   - Definitive rejection (non-retryable 4xx): release the reservation, expire the order, return `502`.
   - **Ambiguous** failure (timeout, network error, 5xx): keep the reservation and `pending_gateway`, return `502 PAYMENT_UPSTREAM_ERROR` with `Retry-After`. A same-key retry resumes at step 4. If it never completes, the sweeper expires the order after the TTL.
7. **Replay response by current state:** `pending_gateway` → resume step 4; `created` → return stored checkout parameters; `received` or later → order without payment parameters; `expired` → expired order (a new attempt needs a new key).

The client generates one key per checkout attempt and reuses it until success or expiry. Different keys with the same payload deliberately create separate orders. A crash between steps 3 and 4 leaves a held reservation that the sweeper resolves.

### 5.3 Verify payment (R-14, R-27)

`POST /payments/verify` does not trust client-supplied identifiers.
1. Authenticate, apply CSRF checks, validate `{orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature}`.
2. Load the order by `{_id, userId}`. Non-owner → `404`. No stored `payment.razorpayOrderId` → `409 ORDER_NOT_PAYABLE`.
3. Client `razorpay_order_id` must equal the stored value, else `400 PAYMENT_MISMATCH`.
4. Compute HMAC-SHA256 over `<stored razorpayOrderId>|<razorpay_payment_id>`; compare timing-safely, checking length first. Mismatch → `400 INVALID_SIGNATURE`.
5. **Replay check:** already paid with the same payment id → same `200`. Paid with a different payment id → `409 PAYMENT_ALREADY_RECORDED`, no state change, security log entry.
6. **Server-side gateway fetch** must confirm: `order_id` equals the stored id; `amount` equals `order.totalPaise`; `currency` equals `order.currency`; `status` equals `captured`. Any mismatch → `400 PAYMENT_MISMATCH`, no state change, security log. `authorized`/`created` → `409 PAYMENT_NOT_CAPTURED` (retryable, `details.gatewayStatus`), order stays pending for the sweeper. Fetch error → `502`, no state change.
7. Call `confirmCapturedPayment()`.

**Ownership model:** a payment is bound to our order by the authenticated order owner, the stored Razorpay order id matching the gateway's `order_id`, and a unique index on `payment.razorpayPaymentId` (one payment cannot confirm two orders).

### 5.4 Confirmation and late-payment recovery

`confirmCapturedPayment(order, validatedGatewayPayment)` runs in a transaction and branches on the order's **state**, not the clock:

| Order state at confirmation | Action |
|---|---|
| `pending_payment`, reservation `held` (even past `expiresAt`) | Commit stock, set `received`. Expiry never blocks a genuinely captured payment. |
| `expired`, reservation `released` (late payment) | Re-run the conditional reserve for all lines. If it succeeds, set `received` with `payment.lateRecovered=true`. If stock is short, leave `expired` and set `payment.status=paid_after_expiry` (flagged for manual refund). |
| Already paid, same payment id | No-op success. |

`expired → received` is reachable only through this function and not through any admin endpoint. Automated refunds are out of scope. Flagged orders are listed via `GET /admin/orders?needsRefund=true`. After commit, emit domain event `order.paid`.

### 5.5 Reconciliation job (`reservationSweeper`, every minute, in-process lock)

- **A. Expiry sweep.** For `pending_payment` orders past `expiresAt`, list gateway payments for the stored order id.
  - Captured → `confirmCapturedPayment`.
  - In-flight (`created`/`authorized`) → extend `expiresAt` up to a bounded maximum.
  - No payment → expire and release in one conditional transaction.
  - No gateway order and no live creation lock → expire and release directly.
  - **If gateway status cannot be determined, nothing is released**; retry next cycle.
- **B. Late-payment window.** For `expired` orders with `payment.status=created`, check the gateway for a bounded window after `expiredAt` (default 24h, tunable), then set `payment.reconciledAt`. A payment captured after the window closes is a **residual risk**, closable only by the optional webhook (OD-05) or dashboard review.
- **C. Invariant audit (alert only).** With a snapshot read, recompute expected `reserved` per ingredient from orders whose reservation is `held`; compare with `Ingredient.reserved` and `0 ≤ reserved ≤ stock`. Drift is logged as `RESERVATION_DRIFT`. No auto-repair without approval.
- **D. Startup catch-up.** Stages A and B run once at boot to cover downtime.

All transitions are conditional updates, so the sweeper and verify endpoint race safely and exactly one commits.

**Client-side payment failure:** the reservation is not released on a client report, because the user may retry the same gateway order. Expiry handles it.

### 5.6 Open risk: gateway creation lock expiry (UNRESOLVED)

The gateway-creation lock (now + 30s) may expire before the external Razorpay request finishes. Fencing or lock ownership, and recovery for ambiguous gateway requests, are **not designed** in the reviewed text and must be resolved before Phase 4 implementation (OD-05, OD-09). Known partial mitigations in the current design: `razorpayOrderId` is set only if still null, and verification uses only the stored id. A consequence to evaluate: a payment made against a gateway order that was not stored would not be matched by verification. No fix is proposed or assumed here.

---

## 6. Admin, Socket.IO, Scheduled Alerts

- **Order status** moves forward only (`received → in_kitchen → sent_to_delivery`) via a conditional update on the expected previous status. Anything else → `409 INVALID_TRANSITION`.
- **Socket.IO (OD-03):** handshake authenticates with the same cookie JWT and validates `Origin`. Rooms `user:<id>` and `admin`. Server→client events `order:status {orderId, status, updatedAt}` and `order:new {orderId}` (admin room). Emission happens after commit.
- **Client resilience:** on load and reconnect the client refetches its orders to reconcile missed events (R-15, R-23). Polling is the fallback if the socket fails.
- **Low-stock alert (R-21, OD-13):** node-cron schedule from env (default hourly). Selects active ingredients with `stock − reserved < threshold` and `lowStockNotified = false`, sends **one digest email** to `ADMIN_ALERT_EMAIL`, then sets `lowStockNotified = true`. **Proposed clarification (OD-13 remains open):** reset notification eligibility when *any* change to availability (`stock − reserved`), including reservation release, takes the item back above threshold. A subsequent fall may then alert again. Define a pragmatic retry / duplicate-digest policy before Phase 5; sending email and setting a DB flag are not atomically coupled.
- **Manual stock update (R-20):** `PATCH` sets an absolute `stock`; rejected if `stock < reserved` or negative. Admin `PATCH` rejects non-integer or negative prices.

---

## 7. API Contracts

Base `/api/v1`. Errors use `{error:{code, message, details?}}`. All state-changing routes require JSON content type, an allowed `Origin`, and (when authenticated) `X-CSRF-Token`.

| Method & path | Auth | Request → Response |
|---|---|---|
| POST /auth/register | none | {name,email,password} → 201 generic |
| POST /auth/verify-email | none | {token} → 200 / 400 |
| POST /auth/resend-verification | none | {email} → 200 generic |
| POST /auth/login | none | {email,password} → 200 {user}, sets cookies / 401 / 403 |
| POST /auth/admin/login | none | same; admin only |
| POST /auth/logout · GET /auth/me | user | → 204 · {user} (re-issues csrf cookie if missing) |
| POST /auth/forgot-password | none | {email} → 200 generic |
| POST /auth/reset-password | none | {token,password} → 200 / 400 |
| GET /ingredients · GET /pizzas | customer | → catalogue with `inStock` |
| POST /orders/quote | customer | {lines[]} → {lines[],totalPaise} |
| POST /orders | customer + required `Idempotency-Key` | {lines[]} → 201 {order, payment{razorpayOrderId,amountPaise,currency,keyId}} / 409 / 422 / 502 (replay shape depends on state, 5.2) |
| GET /orders · GET /orders/:id | customer | own only; others → 404 |
| POST /payments/verify | customer | {orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature} → 200 {order} / 400 / 409 / 502 |
| GET /admin/ingredients | admin | full stock, reserved, threshold |
| PATCH /admin/ingredients/:id | admin | {stock?,threshold?,pricePaise?,isActive?} → 200 / 422 |
| GET /admin/orders | admin | ?status&page&needsRefund → all orders |
| PATCH /admin/orders/:id/status | admin | {status} → 200 / 409 |

`POST /payments/webhook` (raw body, `X-Razorpay-Signature`, dedupe by event id) is **not** in the base contract; it is optional hardening under OD-05.

**Error codes:** `VALIDATION_ERROR` 422, `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `OUT_OF_STOCK` 409, `INVALID_TRANSITION` 409, `INVALID_SIGNATURE` 400, `RATE_LIMITED` 429, `PAYMENT_UPSTREAM_ERROR` 502, `ORDER_NOT_PAYABLE` 409, `PAYMENT_MISMATCH` 400, `PAYMENT_NOT_CAPTURED` 409, `PAYMENT_ALREADY_RECORDED` 409, `IDEMPOTENCY_KEY_CONFLICT` 409, `REQUEST_IN_PROGRESS` 409, `CSRF_INVALID` 403, `UNSUPPORTED_MEDIA_TYPE` 415.

---

## 8. Security Controls

| Control | Mechanism | Req |
|---|---|---|
| Input validation | Strict schemas per endpoint, unknown keys rejected (also blocks NoSQL operator injection) | R-24 |
| Passwords and tokens | bcrypt cost 12; reset/verify tokens hashed, expiring, single use | R-25, R-29 |
| AuthZ | `authenticate` then `authorize(role)`; ownership checks inside order queries | R-16, R-25 |
| CSRF | Layered mechanism in 3.1 | R-25 |
| Pricing and payment | Server-side totals; HMAC on stored order id; gateway fetch checks amount, currency, status, order id; idempotent transitions | R-26, R-27 |
| Concurrency | Transactions plus conditional updates; DB unique indexes | R-28 |
| Transport and headers | helmet; CORS allowlist; cookie `httpOnly; SameSite=Lax; Secure` in prod | R-25 |
| Abuse | Rate limits on auth and payment routes | R-24 |
| Secrets and logs | Env validation at boot; `.env.example`; redaction of tokens, passwords, payment fields; startup refusal if the Razorpay key is not a test key; security log entries for payment mismatches | R-30, R-06 |
| Errors | No stack traces in production responses | R-30 |

---

## 9. Currency and Money Representation (OD-19, PROPOSED)

Sources A, B and C name no currency. INR/paise was an architectural assumption and is **not an approved requirement**.

| Alternative | Assessment |
|---|---|
| **INR, integer minor units (paise)** | Recommended. Matches Razorpay's India-centric test mode; avoids float errors |
| Decimal or float amounts | Rejected: rounding risk |
| Multi-currency | Rejected: unnecessary complexity; other currencies may need account enablement (unverified) |

Pending approval: field naming (`*Paise` vs `*Minor`) is provisional; currency is a server constant stored per Order; gateway checks use stored order values.

---

## 10. Testing Strategy (Vitest + Supertest)

**Phase scope:** The table records planned tests across Phases 1–6; it does **not** require their application features in Phase 1. Phase 1 requires a minimal smoke-test suite plus MongoMemoryReplSet/WiredTiger transaction commit and rollback tests, environment validation and log-redaction evidence. OD-09's approval authorizes that **test harness only**. Full reservation/payment/concurrency tests follow the separately approved later-phase designs.

| Layer | Coverage | Req |
|---|---|---|
| Unit | Pricing (integers only; fractional/negative price rejected; client currency/amount ignored), token generation and hashing, state machine, signature function | R-26, R-29 |
| Integration (in-memory **replica-set** MongoDB) | Auth flows incl. expired and reused tokens, role-escalation attempt, authorization matrix (route × role), own-orders-only | R-08 to R-10, R-17, R-25 |
| CSRF | Authenticated POST without token → 403; wrong token, token bound to another user, or header/cookie mismatch rejected; missing or foreign `Origin` rejected; form-encoded and `text/plain` bodies → 415; preflight from disallowed origin returns no allow headers; route-table audit fails if any non-GET route lacks CSRF middleware; socket handshake with foreign `Origin` rejected; cookie attributes asserted; token rotated on login and cleared on logout; client API wrapper attaches `X-CSRF-Token` | R-25 |
| Concurrency | N parallel orders against stock K → exactly K succeed, stock never negative (subject to later approval of OD-04 and the full OD-09 strategy) | R-28 |
| Idempotency | N parallel identical requests → one order, one reservation, `reserved` incremented once; same key with different payload → 409, no state change; missing/malformed key → 422; keys user-scoped; crash after transaction before gateway call → same-key retry completes with one stored gateway id; gateway timeout then racing retry → one id stored; definitive rejection releases stock; ambiguous failure keeps hold and sweeper later expires; replay shape correct in each state | R-27, R-28 |
| Payment verification | Signature valid for client-supplied foreign order id but not stored one rejected; other user's order → 404; wrong amount/currency/`order_id` rejected with no state change; `authorized` → 409 and order stays pending; same payment id on a second order rejected by unique index; valid replay commits stock once; gateway fetch failure causes no state change | R-14, R-27 |
| Recovery | Captured payment after `expiresAt` but before sweeper is confirmed, not released; sweeper confirms captured payment instead of releasing; in-flight payment extends hold; no payment → released and expired with stock restored; late capture with stock → revived, committed once; late capture without stock → `paid_after_expiry`, stock untouched, appears in refund filter; verify and sweeper race commits exactly once; gateway error in sweeper causes no release; boot catch-up handles orders expired during downtime; sweeper run twice is idempotent; audit detects injected drift with no false positive under concurrent reserves; orders past late window no longer polled | R-27, R-28 |
| Realtime | `socket.io-client` receives the status event; unauthorized sockets rejected | R-15, R-23 |
| Jobs | Job functions called directly (no timers): low-stock sends once, re-arms after restock | R-21 |
| Client | Minimal component tests for builder and summary | R-12, R-13 |

In later-phase gateway tests, the gateway is mocked, with a real HMAC computed in the test. **OD-28 subsequently approved** the quality targets: server ≥75% lines/65% branches; high-risk ≥90%/80%; Phase 3 client builder ≥60%; Phase 5 local real-time p95 ≤2s. These metrics apply to the relevant phase when its functionality exists; no future-phase feature is authorized here.

---

## 11. Decision Status Register

**This table covers the architecture-related OD-01–OD-19 only.** Human-approved within this table: OD-01; **OD-09 (P1 test harness only)**; OD-14; OD-15; and **OD-18 (original Phase 1 tranche; security/compatibility amendment pending)**. OD-02 is withdrawn. Later governance approvals **OD-20, OD-22, OD-23, OD-26–OD-30** are recorded in the authoritative `Task_0.6_ADRs_and_Open_Decisions.md` §1 rather than duplicated here. OD-21 is open. **No architectural ADR is accepted.** Where the historical "Needed by" column differs from Task 0.6 §1, the latter governs decision deadlines.

| OD | Decision | Alternatives | Recommendation (REC) | Main risk | Status | Needed by |
|---|---|---|---|---|---|---|
| 01 | Folder name and path | `WebDev-Task1-PizzaDelivery` · `WebDev-L3-PizzaDelivery` | **Human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`** | n/a | **Approved** | 1 |
| 02 | Stack additions approval | n/a | n/a | n/a | **Withdrawn** (R-07 stays HND) | n/a |
| 03 | Real-time | Socket.IO · polling | Socket.IO plus refetch-on-reconnect; handshake Origin check | Handshake auth; single-instance assumption | Open | 5 |
| 04 | Inventory workflow | Deduct on payment · deduct at order + restore · reserve → commit/release | Reserve/commit/release, 15 min TTL (tunable), late re-reserve and invariant audit | Sweeper correctness | Open | 4 |
| 05 | Payment confirmation | Callback only · webhook only · both | Callback verify + sweeper reconciliation; webhook optional; sub-question: auto-capture (recommended) vs server-initiated capture; post-expiry window | Tab closed after pay (mitigated by reconciliation); capture after late window; **gateway lock expiry (5.6)** | Open | 4 |
| 06 | Order state machine | Add `cancelled`, `payment_failed` | Five states plus guarded `expired → received` edge and payment sub-statuses (`pending_gateway`, `created`, `paid`, `paid_after_expiry`); **edge and sub-statuses need explicit approval** | Customer-facing wording of `pending_payment` | Open | 4 |
| 07 | Pricing and seed data | Per-ingredient · base price + add-ons | Per-ingredient price, summed; seed counts/prices for cheese and vegetables undefined (5 bases, 5 sauces official) | Seed assumptions; depends on OD-19 | Open | 3 |
| 08 | Varieties | Display-only · orderable presets | Orderable recipes, seeded only | Admin management of presets out of scope | Open | 3 |
| 09 | Atomicity | Transactions · conditional updates + compensation | **Approved for Phase 1 only:** `MongoMemoryReplSet` with WiredTiger, tests for transaction commit and rollback. **Proposed for Phase 4:** inventory transactions, retries and error handling; gateway lock fencing unresolved (§5.6). | Local setup friction; future inventory design still open | **P1 harness approved; full design open** | 1 (harness) / before Phase 4 |
| 10 | JWT / session / CSRF | httpOnly cookie · Bearer in storage | Cookie, same-origin via Vite proxy, with the layered CSRF design (3.1); **CSRF mechanism needs explicit approval** | Cross-origin deployment needs rework | Open | 2 |
| 11 | Admin bootstrap | Seed script from env · manual DB insert · first-registered-is-admin | Idempotent script from env; first-user-admin rejected (violates R-17) | Credentials in env | Open | 2 |
| 12 | Email | Provider choice | SMTP via env; Ethereal in dev; stub in tests; TTLs 24h and 1h | Real delivery unverified locally | Open | 2 |
| 13 | Low-stock threshold | Per-category · per-item | Per-item `threshold`, admin can set a category to the guide's example; one digest email, re-armed on restock | Alert noise if thresholds unset | Open | 5 |
| 14 | Backup/restore of local-only governance files | Manual ZIP · private Git mirror | **Approved:** private manual ZIP backup of `AGENTS.md` and `.governance/` with SHA-256 manifest; end of governance-changing sessions and at gate approvals; no secrets. | Loss of local-only files | **Approved** | Decided |
| 15 | Per-agent AGENTS.md compatibility and hierarchy | One source of truth · tool-specific shims | **Approved strategy:** root kernel, scoped `client/`, `server/`, `tests/` AGENTS.md, explicit packet `Load:` lines; shims only on demonstrated need. OD-21 still open; Kiro scratch test eligible. | Instruction access differs by agent | **Approved (strategy)** | Decided |
| 16 | Stock per pizza | Weighted amounts | 1 unit per selected ingredient per pizza × quantity | Unrealistic but simple | Open | 3 |
| 17 | Order shape | Single pizza · cart | Multi-line with quantity; no delivery address; no customer cancellation | Scope creep if added | Open | 3 |
| 18 | Supporting packages (not in A§2) | Individual phase tranches · hand-rolled | **Approved original Phase 1 exact-version tranche** in `PHASE1_APPROVALS_RECORD.md`; **Express 5.0.2 ETARGET**, Zod 3.x High security finding, and installed-version drift require an **explicit corrective amendment**. No later-phase package tranche approved. | Uninstallable/unsafe package, version drift | **Original P1 tranche approved; amendment pending** | P1 correction before further dependency changes; later tranches before relevant phase |
| 19 | Currency and money representation | INR minor units · decimal/float · multi-currency | INR integer minor units (section 9); **needs explicit approval** | Naming churn if rejected | Open (proposed) | before 3 |

OD-16 to OD-18 originated in the Task 0.2 gaps, not new official requirements. **OD-14/15 are now approved governance decisions** (they do not approve architecture). The current Phase 1 **dependency correction** is a real blocker until a human-approved OD-18 amendment names the replacement versions. Open later-phase architecture decisions remain deferred according to Task 0.6 §1.

**Explicitly awaiting human approval:** the `expired → received` edge (OD-06), the CSRF mechanism (OD-10), OD-19.

**Unresolved risk to close before Phase 4:** gateway creation lock expiry, fencing/ownership and ambiguous-request recovery (§5.6; OD-05, **full-design portion of** OD-09 and proposed OD-24). The P1 transaction-harness approval does not close these risks.

---

## 12. Not Verified (confirm in Phase 4 or earlier)

- Razorpay payment-fetch fields and capture behavior in test mode.
- Order lookup by receipt.
- Whether a gateway order can be closed.
- MongoDB duplicate-key and transient-error behavior under concurrent transactional inserts.
- Atlas / replica-set local setup.
- TTL, extension, late-window, sweeper frequency and cron values (all untuned).
- Latency figure for R-15/R-23.

---

## 13. Consolidation Notes (superseded wording removed)

| Original item | Resolution |
|---|---|
| §5 "Create order" and "Expiry and recovery" | Replaced by 5.2 to 5.5 |
| §5 "Confirm payment" (client-supplied order id in HMAC) | Replaced by 5.3 |
| Order `payment.status` (three values: `created`, `paid`, `paid_after_expiry`) | Replaced by four values incl. `pending_gateway` |
| JWT/CSRF text in §3 and §8 | Replaced by 3 and 3.1 |
| §7 error-code list | Extended with new codes |
| "Five states" in OD-06 | Now five states plus the guarded edge, pending approval |
| INR/paise as a fixed design fact | Now proposed OD-19 |
| Original §12 handoff | Replaced by section 14 |

---

## 14. Status and Historical Task 0.4 Handoff

**Current state (2026-10-28):** The Phase 0 planning work and gate were approved; the human subsequently directed Phase 1 **foundation implementation**. Dependency installation completed but the installed manifests remain noncompliant with the original OD-18 exact-version approvals, and a narrow amendment is pending for Express/Zod and any required compatibility adjustments. **Phase 1 exit is not approved.** This architecture is a preserved reference for the later phases, not authority to build them now. The live assignment and working-tree state belong in `.governance/handoffs/latest.md`.

**Historical Task 0.4 handoff (superseded as an active assignment):** The original handoff listed the source packet, Task 0.2 and Task 0.3; called for module-boundary, payment/inventory/CSRF risk and local-first governance work; and instructed planning-only execution. Those were valid historical instructions and are **not current instructions for Phase 1 development**.

**Still awaiting specific architectural decisions:** OD-03–08, OD-10–13, OD-16–17, OD-19, OD-24 (proposed), OD-25 (proposed), and the **full inventory atomicity** portion of OD-09, as applicable by phase under Task 0.6 §1. In particular, the guarded `expired → received` edge (OD-06), layered CSRF mechanism (OD-10), and currency (OD-19) remain unapproved. No draft ADR has been accepted.

**Ongoing constraints:** Official requirements take precedence, one writer edits the shared tree at a time, uncommitted work is preserved, dependencies need explicit human approval, and only the human approves phase gates. Do not infer an accepted ADR or permission for later-phase implementation from a recommendation in this file.
