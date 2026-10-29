# Tests Workspace — AGENTS.md

**Scope:** `tests/` only. **Parent authority:** `../AGENTS.md`.
**Status:** Phase 1 foundation in progress; Phase 1 exit gate NOT approved.

## Required instruction loading

Before working, explicitly read:
1. `../AGENTS.md` (root rules and authority precedence).
2. `.governance/index.md`, `.governance/decisions.md`, and `.governance/handoffs/latest.md` (paths relative to project root).
3. The currently authorized task packet and its `Load:` references.
4. This `tests/AGENTS.md`; consult `server/AGENTS.md` or `client/AGENTS.md` when testing those modules.

Report which instructions were actually loaded. If a required file, approval, or task packet is missing or conflicts with another, stop and escalate. Historical handoffs are not current authorization.

## Scope and change authority

- Implement and run tests, test helpers, fixtures and harness configuration **within the authorized task**.
- No permanent agent roles. Respect the single-writer claim in the live handoff; preserve uncommitted work.
- Do not alter production code, API contracts, schemas, security designs, approved package versions, or test strategy without the applicable human authorization.
- Do not add dependencies, run `npm audit fix --force`, or approve install scripts without review and human approval.
- No unapproved commits, pushes, branch switches, destructive Git operations or phase-gate approvals.

## Phase 1 test scope — OD-09 and OD-30

- Use Vitest and Supertest for applicable smoke / HTTP tests and environment validation.
- Use `MongoMemoryReplSet` with a MongoDB **8.0.34** test binary and `wiredTiger` transaction-capable storage engine.
- Verify **both transaction commit and rollback** with explicit assertions that aborted changes are not persisted.
- Verify health endpoint, invalid or missing env rejection, rejection of non-test Razorpay keys, and log redaction, as applicable to implemented Phase 1 code.
- Test only Phase 1 foundation functionality. Do **not** implement or test as completed future-phase auth, orders, payments, pizza, inventory models, admin, cron or real-time features.
- The final dependency versions are governed by the live OD-18 approval/amendment, **not** by a copied version list here. The Express and Zod corrections require a recorded decision.

## Approved quality targets — OD-28

- Server coverage: **at least 75% lines and 65% branches**.
- High-risk paths, when implemented: **at least 90% lines and 80% branches**.
- Client pizza-builder coverage: **at least 60%**, when that feature is introduced in its later phase.
- Do not substitute the superseded 80% unit / 70% integration / 100% critical-path thresholds.
- Do not count tests of unimplemented later-phase features toward Phase 1 acceptance.

## Verification and reporting

Record the commands run, pass/fail counts, coverage evidence, limitations, files changed, and any security or dependency blockers in the task report. Update the current handoff within authorized reporting scope. Passing tests never self-approves a phase gate; independent verification and human approval remain required.
