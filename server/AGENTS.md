# Server Workspace — AGENTS.md

**Scope:** `server/` only. **Parent:** `../AGENTS.md` (project root).
**Current state:** Phase 1 foundation in progress; Phase 1 exit gate **NOT APPROVED**.

## Instruction loading and precedence

1. Read `../AGENTS.md` and this file; echo the actual files loaded.
2. Read `.governance/index.md`, `.governance/decisions.md`, and `.governance/handoffs/latest.md` from the project root.
3. Read the **authorized task packet** and its explicit `Load:` references. For server API contracts, consult Task 0.3 §7; for phase requirements, Task 0.7; for dependency status, the updated `PHASE1_APPROVALS_RECORD.md` and recorded OD-18 amendments.
4. Check Git status, the current writer claim, approved change class (C0–C3), and open decisions before editing. Stop for conflicting or missing approval. Earlier handoffs, old package manifests and agent reports cannot override later human decisions.

## Phase 1 — authorized server foundation only

- Create a minimal Express app and a testable `GET /health` route; keep error responses consistent with the approved API contract.
- Implement environment loading/validation with Zod **after an approved, secure OD-18 version correction**; fail safely for missing/invalid configuration and non-test Razorpay credentials.
- Configure Helmet, allowlist-based CORS, safe error handling and logs that redact credentials, tokens and other secrets.
- Add a MongoDB 8.0.x replica-set-capable Mongoose connection, with clean startup/shutdown and testability.
- Write or support the Phase 1 smoke, validation, security/log and database test cases. In `tests/`, use `MongoMemoryReplSet` with `wiredTiger` and verified transaction **commit and rollback** behavior (OD-09 Phase 1 only).
- Keep real credentials in ignored local environment files. `.env.example` must contain placeholders only; never echo `.env` contents.

**Not authorized in Phase 1:** customer/admin authentication; User, Ingredient, Pizza or Order models; business routes; pricing/checkout; stock reservation; payments/Razorpay SDK; mail integration; Socket.IO; cron. A proposed future architecture does not authorize its early implementation.

## Dependencies and security — mandatory stop rules

- OD-18's **original exact-version** specification is documented in `.governance/PHASE1_APPROVALS_RECORD.md`; approved amendments, when recorded, govern subsequent installs.
- Original Express `5.0.2` failed with `ETARGET`; original Zod `3.25.0` falls under the reported `zod <4.6.6` High advisory. **Replacement versions have not been approved merely by npm install succeeding.**
- Do not use the superseded caret-based package proposals or silently pin substitutes. Do not add or upgrade packages, edit manifests/lockfiles for a version correction, run `npm audit fix --force`, or approve install scripts without the required human decision.
- Do not treat development-only audit findings as resolved without recorded review. Escalate any unresolved High/Critical vulnerability relevant to the gate.

## Change authority and boundaries

- **C1:** implement/refactor within an already authorized server task without crossing contracts or changing schemas.
- **C2/C3:** new or changed API contract, schema, security design, dependency approval or open OD requires the applicable explicit human authorization. Do not unilaterally approve an OD/ADR or a phase gate.
- Do not edit `client/`, governance decision records, module instructions or another module's tests without corresponding task permission; coordinate cross-module changes through the single-writer handoff.
- Preserve uncommitted work. Never commit/push, switch branches, stash or run destructive Git commands without authorization (OD-23/27).

## Verification and handoff

Run tests required by the task packet; report files changed, commands/results, acceptance-criteria evidence, pending issues and unverified items. Apply OD-28 coverage targets from Task 0.7 (server **75% lines / 65% branches**; high-risk code, when present, **90% / 80%**). Update `.governance/handoffs/latest.md` within authorized reporting scope and release the writer claim. Passing tests never self-approves Phase 1 (OD-29).
