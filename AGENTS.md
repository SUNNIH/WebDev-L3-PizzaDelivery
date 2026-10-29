# OIBSIP Pizza Delivery — Root AGENTS.md

**Scope:** `OIBSIP/WebDev-L3-PizzaDelivery/`. **Status:** Phase 1 foundation in progress; exit gate **NOT APPROVED**. Ignored/local-only.

## Authority and assignments

Precedence: (1) official OIBSIP requirements; (2) explicit human decisions/accepted ADRs; (3) approved Task 0.2 requirements; (4) Task 0.3 unaccepted recommendations; (5) agent plans/reports. No ADR is accepted. Resolve conflicts by stopping and reporting `CONFLICT: <A> vs <B> | affects: <IDs> | needs: human decision`.

Agents are **interchangeable**, not permanently assigned. Only Kiro is confirmed `ELIGIBLE`; others require their own tests. Only the human approves ODs, ADRs, dependency amendments and phase gates.

## Required preflight and workflow

1. Launch from `WebDev-L3-PizzaDelivery/`; Git root is parent `OIBSIP/`. Read `.governance/index.md`, `decisions.md`, `handoffs/latest.md`, authorized task packet and its `Load:` references. Echo loaded filenames.
2. Run `git status --short --branch`; inspect handoff writer claim and tree state (OD-23). Stop for another writer or unexplained changes. Preserve uncommitted work; only the human clears stale claims.
3. Read scoped `client/`, `server/` or `tests/AGENTS.md`. Use Task 0.3 §7 for API, Task 0.5 for Git, Task 0.7 for gates; OD-18 record and Task 0.6 for dependencies.
4. Check scope, C0–C3 class, ODs and dependency approvals first. Work only within authorization; test, record AC→evidence, update handoff, release claim, stop.

## Approval classes (OD-20)

- **C0:** Routine report/handoff and non-behavior notes within a task; never change decision or gate status.
- **C1:** Single-module work with no API/schema changes, within authorized scope.
- **C2:** Cross-module, API contract or schema changes: human-approved scope required.
- **C3:** High-risk auth, payments, orders/inventory; open ODs; dependency approvals; **all** `AGENTS.md`, Task 0.2–0.8, `decisions.md`, ADRs, `index.md` load map, or `phases.md` gate status: explicit human approval required.

## Current Phase 1 scope

**Allowed:** Express/`GET /health`; env validation, `.env.example`, Helmet/CORS, redacted logs; MongoDB replica-set connection; React/Vite/Tailwind shell; Vitest/Supertest smoke/env/log tests; `MongoMemoryReplSet` WiredTiger commit/rollback tests; Git/workspace evidence.

**Outside P1:** auth, email, domain models, pricing, inventory operations, Razorpay, Socket.IO and cron. OD-09 approves only the transaction test harness.

## Dependency and security stop rules

The **exact-version original OD-18 tranche** is in `PHASE1_APPROVALS_RECORD.md`, replacing obsolete caret-based proposals. Express `5.0.2` failed with `ETARGET`; the approved Zod 3.x line has a reported High advisory. **OD-18 amendment pending.** Install success or manifests do not approve substitutions. No unapproved package/version changes, unreviewed scripts or `npm audit fix --force`.

Do not read or echo live `.env` secrets, log passwords/tokens or commit credentials. `AGENTS.md` and `.governance/` stay local-only and ignored; source and required deliverables stay trackable.

## Git, environment, tests and gates

- **OD-27:** One `main` branch; commits/pushes only when specifically authorized. No clones/worktrees, unauthorized branch switches, stash, destructive reset/clean/restore, or `git add .` / `git add -A`. `OIBSIP` remote due by Phase 1 exit.
- **OD-30:** Node 24 LTS; npm workspaces `client` and `server`; one authoritative project-level `package-lock.json`; `tests/` is not a workspace.
- **OD-28:** Use actual approved coverage/severity thresholds from Task 0.7; no invented thresholds.
- **OD-29:** Validate SN1–SN6 empirically. Gate needs an eligible independent verifier or human-recorded waiver/attestation; tests never approve gates.
- **OD-14:** Private ZIP + SHA-256 governance backup after governance-changing sessions and gate approval; **exclude `.env` and secrets**.

**Dynamic writer status belongs in `handoffs/latest.md`, not this file.**
