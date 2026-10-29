# OIBSIP — Live Decision Register

**Status date:** 2026-10-28  
**Project:** `OIBSIP/WebDev-L3-PizzaDelivery/`  
**Current phase:** Phase 1 — foundation implementation **IN PROGRESS**; Phase 1 **exit gate NOT APPROVED**  
**Owner of decisions:** Human project owner. Agents may record evidence and propose changes, but may not approve their own decisions, ADRs, dependency substitutions or phase gates.

> **Purpose:** This is the short, current status register for agents. It records later human decisions that supersede *historical status statements* in Phase 0 documents. It is **not** an independent source of new authorizations. Read the exact decision terms in `Task_0.6_ADRs_and_Open_Decisions.md`, the scope and phase gates in `Task_0.7_Development_Phase_Gates.md`, and the original exact dependency approval in `PHASE1_APPROVALS_RECORD.md`. Where evidence or approval is unclear, stop and escalate; never infer a decision from a `package.json`, lockfile, agent report or older handoff.

## 1. Current status of every OD

| ID | Current status | Decision / boundary |
|---|---|---|
| OD-01 | **APPROVED**, 2026-10-28 | Folder exactly `WebDev-L3-PizzaDelivery` directly under repo `OIBSIP`. |
| OD-02 | **WITHDRAWN** | Earlier blanket stack-additions approval withdrawn; R-07 remains a documented handoff requirement, not a blanket package approval. |
| OD-03 | **OPEN** | Socket.IO vs polling mechanism; decide before Phase 5. |
| OD-04 | **OPEN** | Inventory reservation/deduction model; decide before Phase 3 schema work. |
| OD-05 | **OPEN** | Razorpay confirmation, callback/webhook, lock handling and recovery; Phase 4. |
| OD-06 | **OPEN** | Order state machine, including guarded `expired → received`; Phase 4. |
| OD-07 | **OPEN** | Pricing, seed catalogue and ingredient-option values; Phase 3. |
| OD-08 | **OPEN** | Whether predefined varieties are orderable; Phase 3. |
| OD-09 | **PARTIALLY APPROVED**, 2026-10-28 | **Phase 1 test harness only:** `MongoMemoryReplSet` with `wiredTiger` and tests demonstrating successful transaction commit and clean rollback. **Full inventory atomicity / reserve–commit–release design remains OPEN.** |
| OD-10 | **OPEN** | JWT/session and CSRF design; Phase 2. |
| OD-11 | **OPEN** | Initial admin provisioning; Phase 2. |
| OD-12 | **OPEN** | Email provider, dev/test strategy and token policy; Phase 2. |
| OD-13 | **OPEN** | Low-stock field policy before Phase 3, notifications/schedule before Phase 5. |
| OD-14 | **APPROVED**, 2026-10-28 | Local-only governance backup: manual private ZIP with SHA-256 manifest; after governance-changing sessions and at gate approval. **Never include `.env` or secrets.** |
| OD-15 | **APPROVED**, 2026-10-28 | Root `AGENTS.md` plus `client/`, `server/`, `tests/AGENTS.md`; explicit task-packet `Load:` references; shims only if tested necessary. |
| OD-16 | **OPEN** | Stock units per pizza; Phase 3. |
| OD-17 | **OPEN** | Order shape and delivery address/cancellation assumptions; Phase 3. |
| OD-18 | **ORIGINAL P1 TRANCHE APPROVED; CORRECTIVE AMENDMENT PENDING**, 2026-10-28 | **Exact** original direct-dependency versions are in `PHASE1_APPROVALS_RECORD.md` §2, superseding old caret-based proposals. Express `5.0.2` caused npm `ETARGET`; approved Zod 3.x line has a reported High advisory. No substitute version has yet been approved. Later-phase dependency tranches are unapproved. |
| OD-19 | **OPEN** | Currency, minor-unit storage and field naming; Phase 3. |
| OD-20 | **APPROVED**, 2026-10-28 | Task 0.4 local governance: authority precedence, C0–C3 changes, 8-step workflow, dependency rule, load map and phase gates. |
| OD-21 | **OPEN** | Five-agent ignored-file instruction access. Kiro scratch-tested **ELIGIBLE**; other agents not established as eligible. This is **not a blocker to work assigned to eligible Kiro**; separate verification eligibility still applies. |
| OD-22 | **APPROVED**, 2026-10-28 | One project README; `screenshots/`; ignore `.vscode/` and `.idea/`; agent-specific tool-folder ignores stay commented pending testing. |
| OD-23 | **APPROVED**, 2026-10-28 | Single shared working tree, one writer at a time. Handoff fields include `Active writer:` and `Working tree at handoff:`. |
| OD-24 | **PROPOSED / UNRESOLVED** | Gateway-lock fencing / ambiguous gateway request recovery; decide before Phase 4. No design approved. |
| OD-25 | **PROPOSED / UNRESOLVED** | Minimum vegetable selection; decide before Phase 3. No rule approved. |
| OD-26 | **APPROVED**, 2026-10-27 | Nine quality standards Q1–Q9, including tested security, README/screenshots, no unresolved high/critical security findings at final acceptance and governance evidence. |
| OD-27 | **APPROVED**, 2026-10-28 | One working branch `main` unless human changes it; **commit/push only on explicit authorization**; remote `OIBSIP` due by Phase 1 exit; no unauthorized branch switch, reset, stash or destructive cleanup. |
| OD-28 | **APPROVED**, 2026-10-28 | Server coverage ≥75% lines/≥65% branches; high-risk ≥90%/≥80%; client builder ≥60% in its phase; real-time p95 ≤2s locally in its phase. Defect severity definitions as in Task 0.7. |
| OD-29 | **APPROVED, EMPIRICAL VALIDATION PENDING**, 2026-10-28 | Gate states, SN1–SN6 snapshot, restricted N/A, independent verification and eligibility rules; **snapshot commands must be validated in Phase 1**. Only the human approves gates. |
| OD-30 | **APPROVED**, 2026-10-28 | Node.js 24 LTS, npm, MongoDB 8.0.x; npm workspaces `client` and `server`, one `package-lock.json` in the project folder; `tests/` is not a workspace; local replica set and transaction-capable memory replica set for tests. |

**ADR status:** ADR-D1 through ADR-D5 remain **DRAFT, NOT ACCEPTED**. No accepted ADR is established by this register.

## 2. Phase 1 authorization and current evidence

- **Phase 0:** seven planning documents and the Phase 0 gate approved 2026-10-27.
- **Phase 1:** human directed Kiro to proceed with **foundation implementation**. Dependency installation has occurred; this is **not** proof that implementation, tests or the exit gate have completed.
- **Runtime, user-reported:** Node.js `v24.22.2`; npm `11.19.1`; `npm install` succeeded with 363 added packages. These runtime facts meet the Node 24 selection but **do not** prove dependency-tranche conformity.
- **Security, user-reported:** `npm audit` found 8 findings overall; `npm audit --omit=dev` found one **High production Zod finding**. Installed versions include `mongodb-memory-server@10.4.3` rather than approved `11.3.0` and older Vitest/Vite packages.
- **Current blocker:** a **narrow human-approved amendment to OD-18** addressing unavailable Express `5.0.2`, vulnerable Zod 3.x and any necessary compatible exact versions. Require a reviewed proposal before changing manifests/lockfile or reinstalling. **Do not** run `npm audit fix --force` or approve installation scripts without review.
- **Not yet verified:** exact local Git status, active writer, latest manifest diffs, project code/test progress, pending installation scripts, Phase 1 exit evidence, `OIBSIP` remote, SN1–SN6 validity, independent verification.

## 3. Binding operating boundaries

1. **Instruction hierarchy:** official requirements → explicit human decisions / accepted ADRs → approved Task 0.2 baseline → unaccepted architecture recommendations → agent plans/reports. A later human decision supersedes an earlier proposal on the same matter. Report unresolved conflicts instead of silently choosing.
2. **Scope:** Phase 1 permits only Express foundation (`GET /health`), env validation, security headers/CORS, safe logs, MongoDB replica-set connectivity, basic React/Vite/Tailwind scaffolding, and test harness with smoke, env, log-redaction, commit/rollback tests. **No auth, Pizza/Ingredient/Order/Admin models, payment, Socket.IO or cron implementation yet.**
3. **Shared directory:** one writer at a time; inspect Git status and `.governance/handoffs/latest.md` before changing files; preserve uncommitted work; do not create clones/worktrees.
4. **File policy:** `AGENTS.md` and `.governance/` are local-only and ignored, not committed; `.env` remains secret; tracked source and mandatory deliverables follow Task 0.5.
5. **Phase gates:** only the human sets `APPROVED`; a second eligible verifier or a human-recorded waiver under OD-29 is needed for the Phase 1 gate. Kiro is recorded eligible, but do not assume Codex or other agents have passed.
6. **Governance changes:** modifying this register, another authority-changing file, or a package approval is C3 and requires explicit human authorization. Reports and the live handoff may be routinely updated only within existing authorization; they cannot silently change approvals.

## 4. Authoritative references

- `Task_0.2_Requirements_Baseline.md` — R-01–R-38 and acceptance criteria.
- `Task_0.3_System_Architecture.md` — **unaccepted recommendations** and phase-boundary design.
- `Task_0.4_Multi_Agent_Governance.md` — authority, workflow, C0–C3 rules and handoff fields.
- `Task_0.5_Repository_and_Git_Governance.md` — one-working-tree rules, Git restrictions and ignore verification.
- `Task_0.6_ADRs_and_Open_Decisions.md` — **full decision reasoning, dependencies and current OD status**.
- `Task_0.7_Development_Phase_Gates.md` — gates, evidence and phase criteria.
- `Task_0.8_Final_Planning_Review.md` — historical Phase 0 approval plus later status synchronization.
- `PHASE1_APPROVALS_RECORD.md` — **original exact OD-18 package approval and still-pending corrective amendment**.
- `handoffs/latest.md` — **current** assignment, writer claim and real working-tree/test state (must be verified from disk; don't rely on the old `KIRO_HANDOFF.md`).

**Change log — 2026-10-28:** Created this live status index from the user's previously approved decisions and updated Phase 0 / Phase 1 records. **No new OD, ADR, dependency correction or phase gate is approved by this document.**


## Phase 2 Authentication Approvals — 2026-10-28

Approved by: Project Owner
Status: APPROVED

### OD-10 — Authentication Architecture
- JWT authentication with 2-hour token expiry.
- Secure HttpOnly authentication cookies.
- CSRF protection for authenticated state-changing requests.
- Status: APPROVED.

### OD-11 — Administrator Authentication
- Separate administrator login.
- Private CLI-based administrator provisioning.
- No public administrator registration.
- Customers cannot assign themselves administrator privileges.
- Status: APPROVED.

### OD-12 — Email Verification and Password Recovery
- Nodemailer with SMTP.
- Ethereal email testing in development/test environments.
- Cryptographically secure, SHA-256-hashed, single-use tokens.
- Email verification tokens expire after 24 hours.
- Password-reset tokens expire after 1 hour.
- Status: APPROVED.

Decision date: 2026-10-28
Implementation authorized: Phase 2 authentication backend.