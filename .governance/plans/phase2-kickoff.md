# OIBSIP — Phase 2 Kickoff / Decision Packet

**Date:** 2026-10-28  
**Status:** Human authorized starting Phase 2. **Planning begins now**; authentication implementation and new package installations remain dependent on the following explicit decisions.

## Goal

Deliver secure customer and administrator authentication on the existing Express + MongoDB and React + Vite foundation. Do not implement catalogues, orders, payments or inventory in this phase.

## Approved requirements in scope

| ID | Acceptance outcome |
|---|---|
| R-08 | Registration sends an email verification link; unverified account cannot log in; expired/reused link fails. |
| R-09 | Login uses JWT authentication; missing, invalid or expired token receives 401 at protected endpoints. |
| R-10 | Forgot-password link changes password only once; expiry/reuse rejected; old password stops working. |
| R-16 | A separate admin login route; no public admin registration; customer credentials cannot use the admin login. |
| R-17 | Public registration role cannot be elevated to admin, including a malicious `role` request field. |
| R-24, R-25, R-29 | Input validation, hashed passwords/tokens, role-based authorization, and expiring/single-use verification and reset tokens. |

## Explicit decisions required before implementation

These are **existing Task 0.3 proposals, not approved ADRs**. Recommended starting choices:

**OD-10 — Session/JWT/CSRF**
- Signed JWT (2-hour expiry) carried in an `HttpOnly`, `SameSite=Lax` cookie; `Secure` in production.
- No refresh token in initial Phase 2 implementation; reauthenticate after expiry.
- Enforce validated request origin + JSON content type and signed double-submit CSRF token on state-changing authenticated routes; use same-origin Vite proxy for development.
- Token payload carries `sub`, `role`, `tokenVersion`; verify against current DB user; password reset increments token version.

**OD-11 — Admin bootstrap**
- Provide an explicitly invoked, idempotent server-side CLI to create the first admin using private environment values. Never permit registration to set the admin role; no hardcoded admin password or first-user-becomes-admin shortcut.

**OD-12 — Email and token handling**
- Nodemailer over SMTP settings sourced from environment variables; Ethereal for development and stub/fake transport in automated tests.
- Verification tokens generated with cryptographic randomness, stored only as SHA-256 hashes, expire after 24 hours, single use.
- Password reset tokens stored only as SHA-256 hashes, expire after 1 hour, single use.
- Email links lead to the client; consume tokens through POST to avoid link-preview scanners consuming them.
- Generic forgot-password responses to prevent account enumeration.

**OD-18 — Exact Phase 2 dependencies**
- Obtain a minimal, exact-version proposal for `jsonwebtoken` (or an approved equivalent), `bcrypt`, `nodemailer` and any genuinely required cookie, CSRF or rate-limit libraries.
- Verify registry availability, security/audit posture and compatibility with Node 24/Express 5 before human approval and `npm install`.
- Keep Phase 3–5 dependencies out of this tranche.

## Proposed implementation order (after approvals)

1. `User` and hashed `AuthToken` schema with indexes, env/config validation and mail transport abstraction.
2. Registration, verification, resend, customer login, admin login, logout, `GET /auth/me`.
3. Forgot/reset-password with single-use/expiry and invalidation of prior tokens/sessions.
4. JWT authentication, strict role checks and CSRF protections.
5. React registration/verification/login/reset pages and separate admin login page; minimal UI, no admin dashboard.
6. Unit/integration security tests (negative paths, role escalation, token expiry/reuse, unauthorized routes, CSRF, rate limiting), plus React build and updated evidence.

## Execution rules

- ChatGPT/user handle decision records, exact file copies, and routine terminal commands manually where practical; use Kiro for significant application coding and integration.
- Before any write, inspect the handoff and writer claim; one writer/working tree only.
- No unapproved packages, Git writes, push, merges, admin/dashboard/payment/order features.
- Phase 2 exit will require the approved quality gates and an independent verification route.

## Immediate next action

Have the human explicitly approve or amend OD-10, OD-11 and OD-12, then approve the exact dependency versions after a compact proposed list. That makes the implementation packet ready for Kiro without repeated planning work.
