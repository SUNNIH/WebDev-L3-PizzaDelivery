# Task 0.6: ADRs and Open Decisions (Consolidated)

> **CURRENT DECISION STATUS — 2026-10-28:** Phase 0 (Tasks 0.2–0.8) and its exit gate were human-approved on 2026-10-27. Phase 1 **foundation implementation has subsequently been directed and dependency installation attempted/completed**, but the **Phase 1 exit gate is NOT approved**. Human-approved OD statuses below supersede older Phase 0 proposals; no draft ADR is accepted. This file updates the decision register only. It does not retroactively authorize changed package versions, security exceptions, Git commits, or later-phase features. The `PHASE1_APPROVALS_RECORD.md` updated for 2026-10-28 supplies the approved original OD-18 versions and identifies an **unapproved security/compatibility amendment** for Express and Zod.

**Project:** OIBSIP Pizza Delivery
**Document lineage:** Task 0.6 is a Phase 0 planning deliverable; **current project phase:** Phase 1 foundation (in progress, gate not approved).
**Document status:** Original consolidated Task 0.6 decision analysis, updated on 2026-10-28 to reflect subsequent explicit human decisions. Historical analysis is retained where marked.
**Task 0.7 (Development Phase Gates):** subsequently human-approved on 2026-10-27.

The **alternatives and technical recommendations** in this document remain proposals unless an individual OD is expressly listed as approved. **Approved decisions:** OD-01, OD-09 (**Phase 1 test harness only**), OD-14, OD-15, OD-18 (**original Phase 1 dependency tranche; amendment pending**), OD-20, OD-22, OD-23, OD-26, OD-27, OD-28, OD-29 (**subject to empirical snapshot validation**), and OD-30. **Withdrawn:** OD-02. **Open:** OD-03–08, OD-09 full inventory atomicity, OD-10–13, OD-16–17, OD-19, OD-21. **Proposed and unresolved:** OD-24 and OD-25. No draft ADR D1–D5 is accepted. The approved project folder is `WebDev-L3-PizzaDelivery`. Requirements reference `Task_0.2_Requirements_Baseline.md`; architecture `Task_0.3_System_Architecture.md`; multi-agent governance `Task_0.4_Multi_Agent_Governance.md`; Git policy `Task_0.5_Repository_and_Git_Governance.md`.

## 0. Approval Statuses

| Task | Deliverable | Status |
|---|---|---|
| 0.2 | Requirements baseline | Human-approved planning deliverable |
| 0.3 | System architecture | Human-approved planning deliverable. Its recommendations are not accepted ADRs; individual ODs have later decisions in §1 |
| 0.4 | Multi-agent governance | Human-approved planning deliverable |
| 0.5 | Repository and Git governance | Human-approved planning deliverable |
| 0.6 | This document | Human-approved planning deliverable |
| 0.7 | Development phase gates | Human-approved planning deliverable, 2026-10-27 |
| 0.8 | Final planning review and Phase 0 gate | Human-approved, 2026-10-27 |

**Approval of a planning deliverable by itself closes no OD and accepts no ADR.** The later human approvals listed above **did** decide the identified ODs, and those decisions govern their corresponding scope. In particular, the original OD-18 tranche is approved but its required Express/Zod changes have **not** been approved; OD-09 authorizes only the Phase 1 transaction test harness; OD-29 still requires empirical validation of snapshot commands. Phase 1 implementation is under way, but its gate has not been approved.

**Constraints carried from the confirmed setup:** Claude, Codex, Cursor, Antigravity and Kiro work locally on the same computer in **one shared physical project directory**. There are no separate agent repositories, clones, worktrees or synchronization workflows. Only one agent modifies project files at a time, and each checks `git status` and the latest handoff first. Existing uncommitted work is preserved. AGENTS.md and governance files stay local-only. Cross-IDE instruction visibility remains subject to verification (OD-21).

---

## 1. Consolidated Decision Register (current status as of 2026-10-28)

Decided entries are labelled **APPROVED** and carry their approved scope, even if the originally proposed alternatives remain in the row for traceability. Undecided entries remain **OPEN**; OD-24 and OD-25 remain **PROPOSED**; OD-02 is **WITHDRAWN**. The "Decide by" column records the timing for **unresolved** parts of a decision, not a new approval. Sections 2–8 preserve original analytical context, updated where necessary to avoid contradictory instructions.

| OD | Decision and alternatives | REC and rationale | Main risks | Strict prerequisite | Related (approve together) | Decide by |
|---|---|---|---|---|---|---|
| 01 | Folder name: `WebDev-Task1-PizzaDelivery` or `WebDev-L3-PizzaDelivery` | **Human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`**: closest to the official `WebDev-L1-LandingPage` style, and this is Level 3 | n/a | none | none | **Decided** |
| 02 | Stack-additions approval | **Withdrawn.** R-07 keeps status HND | n/a | n/a | n/a | n/a |
| 03 | Real-time: Socket.IO or polling | Socket.IO with refetch-on-reconnect and polling fallback; the local p95 latency target is **already approved under OD-28 (≤2 seconds)**. The mechanism remains open under OD-03 | Handshake auth; single-instance assumption | none | 06, 10 | Before Phase 5 |
| 04 | Inventory: deduct on payment; deduct at order and restore; reserve → commit/release | Reserve/commit/release, 15-minute TTL (tunable). It stops overselling before payment without losing stock on abandoned carts | Sweeper correctness | none | 06, 09, 16 | **Before Phase 3** (the `reserved` field is in the Phase 3 schema) |
| 05 | Payment confirmation: callback, webhook or both; capture policy; late-capture residual | Callback verify plus sweeper reconciliation; webhook optional; auto-capture. You decide whether to accept the residual (capture after the late window) or adopt the webhook | Gateway lock expiry (OD-24); late capture | 24 (for accepting ADR-D2) | 04, 06, 19 | Before Phase 4 |
| 06 | Order state machine, the guarded `expired → received` edge, payment sub-statuses | Five states plus the guarded edge and four payment sub-statuses (`pending_gateway`, `created`, `paid`, `paid_after_expiry`). The edge needs explicit approval | The edge widens what can change an order's state | none | 04, 05, 17 | Before Phase 4 |
| 07 | Pricing model and seed catalogue: per-ingredient or base price plus add-ons | Per-ingredient price, summed (the guide has no size concept). **You supply** option counts, names and prices for cheese and vegetables | Seed assumptions | 19 | 08, 16 | Before Phase 3 |
| 08 | Varieties: display-only or orderable presets | Orderable presets, seeded only. Display-only would leave the dashboard a dead end | Preset management out of scope | none | 07, 16 | Before Phase 3 |
| 09 (**APPROVED — Phase 1 harness only**) | Atomicity: MongoDB transactions or conditional updates with compensation | **Human-approved 2026-10-28 for Phase 1 only:** `MongoMemoryReplSet` with `wiredTiger`; automated transaction **commit and rollback (no state change)** tests. Full reserve/commit/release and inventory atomicity design remains **OPEN** until later phase decision. | Local setup friction; lock fencing is separate (OD-24) | none | 04 | **Phase 1 harness decided**; full design before Phase 4 |
| 10 | Session: httpOnly cookie or Bearer; layered CSRF; 2h token, no refresh | Cookie, same-origin proxy, layered CSRF (explicit approval needed for the CSRF mechanism) | Cross-origin deployment needs rework | none | 03, 12, 18 | Before Phase 2 |
| 11 | Admin bootstrap: env seed script, manual insert, first-user-admin | Idempotent env seed script. First-user-admin violates R-17 | Credentials in env | 10 | none | Before Phase 2 |
| 12 | Email provider and dev/test strategy | SMTP via env; Ethereal in dev; stub in tests; TTLs 24h and 1h | Real delivery unverified locally | none | 10 | Before Phase 2 |
| 13 | Low-stock threshold: per-category or per-item | Per-item, with category bulk-set; one digest email; **proposed** re-arm whenever `stock − reserved` recovers above threshold, whether from restock or reservation release. Define retries and digest de-duplication before implementation; OD-13 stays open | Alert noise, duplicate sends after a crash, or missed second alert after availability recovery | 04 | none | Fields before Phase 3; schedule, recipient and alert re-arming policy before Phase 5 |
| 14 (**APPROVED 2026-10-28**) | Governance backup: private manual ZIP versus separate private Git repo | **Human-approved:** private manual ZIP containing AGENTS.md and `.governance/` with a SHA-256 manifest; at each gate approval and end of governance-changing sessions. Never include `.env`/secrets. | Backups may be missed; verify manifest and private location | none | 15, 23 | **Decided** |
| 15 (**APPROVED 2026-10-28**) | AGENTS.md strategy | **Human-approved:** one source of truth: short root kernel plus `client/`, `server/`, `tests/` instructions; task packets use explicit `Load:`; shims only if eligibility testing justifies them. OD-21 stays open. | Per-agent behavior must be tested | none (strategy approval) | 14, 20, 23 | **Decided** |
| 16 | Stock units per pizza | 1 unit per selected ingredient × quantity | Unrealistic but simple | none | 04, 07, 08 | Before Phase 3 |
| 17 | Order shape | Multi-line with quantity; no delivery address; no customer cancellation. Confirm that omitting an address is acceptable for a "delivery" app | Scope creep | none | 06 | Before Phase 3 |
| 18 (**APPROVED original Phase 1 tranche; amendment pending**) | Supporting packages and versions by approved phase tranche | **Human-approved original exact Phase 1 versions** in `PHASE1_APPROVALS_RECORD.md` (updated 2026-10-28), superseding the older caret-based proposal. **Express 5.0.2 ETARGET and Zod 3.x High advisory mean a further explicit security/compatibility amendment is required before adopting replacements**. Later-phase package tranches are not approved. | Broken installation, vulnerable dependency, cross-version drift | none; each later tranche separately approved | 03, 05, 10 | **Original P1 tranche decided; corrective amendment pending** |
| 19 | Currency: INR integer minor units, decimal, multi-currency | INR integer minor units; field naming `*Paise` or `*Minor` | Naming churn | none | none | Before Phase 3 |
| 20 (**APPROVED 2026-10-28**) | Governance structure (Task 0.4) | **Human-approved:** authority order, C0–C3 classes, eight-step workflow, load map, phase gates and dependency stop rule. | Governance drift or agent self-approval | none | 15, 23 | **Decided** |
| 21 (**OPEN**) | Ignored-file visibility across all five agents | Kiro scratch-tested as ELIGIBLE 2026-10-28; other agents must be tested before they implement or verify. Final five-agent Step C decision remains open. | Hidden instructions in untested agents | 15 (approved strategy), separate scoped tests | 22 | **Not a Phase 1 start blocker for eligible Kiro** |
| 22 | Other mandatory Markdown; screenshots directory name; whether tool-state folders (`.vscode/`, `.idea/`, `.cursor/`, `.kiro/`, `.agents/`) are ignored | **Human-approved 2026-10-28:** one project-level README; `screenshots/`; ignore `.vscode/` and `.idea/`; agent-specific tool-folder lines stay commented until OD-21 testing | n/a | 01 (the README exception line needs the folder name) | 21 | **Decided** |
| 23 (**APPROVED 2026-10-28**) | Shared-directory single-writer protocol, including handoff-template fields | **Human-approved:** one shared working tree, one modifying agent at a time; read Git status + latest handoff; preserve uncommitted changes. Handoff records `Active writer:` and `Working tree at handoff:`. | Stale writer claims | none | 14, 15, 20 | **Decided** |
| 24 (proposed) | Gateway-lock fencing and ambiguous-request recovery | No design exists. Candidates to evaluate: client timeout shorter than the lock TTL plus a fencing token checked on the conditional write; adopt by receipt lookup (unverified API support); sweeper-only reconciliation with no re-create | Duplicate gateway order; payment against an unstored order id | 09 | none | Before Phase 4 implementation |
| 25 (proposed) | Is at least one vegetable mandatory? (R-12) | Human choice; no REC | Wrong validation | none | 07 | Before Phase 3 |
| 26 (**APPROVED 2026-10-27**) | Minimum "production-grade" quality bar for this project. Scope: the acceptance standard for phase approval and final acceptance (see the approved standards below the table) | **Human-approved 2026-10-27.** The approved bar is the nine standards listed under the table. It maps to existing requirements and adds no new application features | Gate criteria that merely restate the standards without evidence, or standards applied without tests existing yet | none | none | **Decided** |
| 27 (**APPROVED 2026-10-28**) | Commit, branch and remote policy | **Human-approved:** work on `main` unless human changes it; commit only with explicit authorization; no unauthorized branch switch/reset/stash/clean. `origin` points to remote named exactly `OIBSIP`, required at **Phase 1 exit** unless human later approves rephasing. | Lost work, missing remote, premature commits | none | 01, 23 | **Decided; remote still subject to exit verification** |
| 28 (**APPROVED 2026-10-28**) | Quality metrics and defect severity | **Human-approved:** server coverage ≥75% lines/65% branches; high-risk ≥90%/80%; Phase 3 client builder ≥60%; Phase 5 real-time p95 ≤2s locally. Critical = data loss/auth bypass/core flow broken; High = failed feature/exploitable weakness; Medium = workaround; Low = cosmetic. | Different metrics apply to different phases | none | 26, 29 | **Decided (apply per phase)** |
| 29 (**APPROVED 2026-10-28; validation pending**) | Gate procedure, snapshots and independent verification | **Human-approved:** gate states `NOT_STARTED → IN_PROGRESS → EVIDENCE_SUBMITTED → VERIFIED → APPROVED` (plus `CHANGES_REQUIRED`); SN1–SN6 state snapshot; eligible independent verifier, restricted N/A rule, human-only gate approval. **Snapshot commands require empirical validation in Phase 1.** | Snapshot correctness, second-agent eligibility | none | 15, 23, 28 | **Decided; validate commands before Phase 1 gate** |
| 30 (**APPROVED 2026-10-28**) | Runtime baseline: Node.js version, package manager, workspace structure, MongoDB setup, test harness | **Human-approved 2026-10-28:** Node.js 24 LTS; npm; MongoDB 8.0.x; npm workspaces (`client`, `server`) with root `package.json` and single `package-lock.json` inside `<folder>/`; `tests/` is a project-level directory (not a workspace); local MongoDB replica set in development; `MongoMemoryReplSet` with transaction-capable storage engine for tests (library subject to OD-18) | Version drift | none | none | **Decided** |

**OD-26 approved minimum quality standards (human-approved 2026-10-27)**

Scope: these govern phase approval and final acceptance for the whole project. They do not approve, close or alter any other OD or draft ADR. Where a standard refers to "approved designs", it means designs the human has actually approved, and no ADR becomes accepted by this decision.

1. Complete all mandatory OIBSIP application features.
2. Test authentication, authorization and password recovery.
3. Test Razorpay verification and payment failure handling.
4. Test inventory deduction, concurrency and recovery.
5. Verify security controls against approved designs.
6. Require passing automated tests for phase approval.
7. Provide README, setup instructions and relevant screenshots.
8. Allow no unresolved critical defects or known high-severity security vulnerabilities at final acceptance.
9. Verify shared-directory multi-agent governance and handoffs.

OD-26 did not itself define metrics or gate procedure. **Subsequent OD-28 and OD-29 human approvals do**; see their rows and the approved `PHASE1_APPROVALS_RECORD.md`. The empirical validity of the OD-29 snapshot commands remains to be established before gate reliance.

**Awaiting explicit approval from Task 0.3 (inside the ODs above):** the guarded `expired → received` edge (OD-06), the CSRF mechanism (OD-10), and the currency decision (OD-19).

**Unresolved risk to close before Phase 4:** gateway creation lock expiry, fencing/ownership and ambiguous-request recovery (proposed OD-24, open OD-05, **full-design portion** of OD-09). The Phase 1 test-harness approval does not resolve this risk.

---

## 2. Dependency Notation

An earlier version mixed two meanings and contained loops (OD-04/09, OD-01/22, OD-15/21, OD-05/24, OD-20/23). The register now uses two columns:

- **Strict prerequisite:** an input that must be decided before this OD can be approved. Strict links form a one-way chain with no loops.
- **Related:** the decisions interact but have no order, so they can be approved in one session.

**Strict chains:** 09 → 24 → 05 (for ADR-D2), 10 → 11, 01 → 22, 15 (Step A) → 21, 19 → 07, 04 → 13.

**Suggested decision sessions (groupings, not approvals)**
- **Git and governance (completed before Phase 1):** OD-01, OD-22, OD-14, OD-15 (strategy), OD-20, OD-23 and OD-27 were subsequently approved. Their implementation/evidence remains subject to normal verification.
- **Auth, before Phase 2:** OD-10 first, then OD-11, 12. OD-03 can be reviewed together.
- **Inventory and catalogue, before Phase 3:** OD-04, the **full** OD-09 design, OD-16, OD-19, OD-17, proposed OD-25, OD-08, then OD-13 (fields) and OD-07 after their prerequisites.
- **Payments, before Phase 4:** OD-24 (needs OD-09), then OD-05 and 06 together.

---

## 3. Prioritized Human Decision Checklist

**P0 (Phase 0 input for Task 0.7)**
- OD-26, the minimum production-grade quality bar: **approved 2026-10-27.** No action remaining.

**P1 (historical prerequisites, now decided; remaining Phase 1 actions)**
1. **Approved:** OD-01 (folder), OD-09 (test harness only), OD-14 (backup), OD-15 (AGENTS strategy), OD-18 (original exact dependency tranche), OD-20 (governance), OD-22 (README and ignore decisions), OD-23 (single writer), OD-26 (quality bar), OD-27 (Git policy), OD-28 (metrics), OD-29 (gate protocol, with snapshot-command verification outstanding), OD-30 (runtime baseline).
2. **Phase 1 authorized work:** the user directed Kiro to continue foundation implementation. `npm install` succeeded with revised older/caret-based packages; **do not treat the installed tree as conforming to OD-18** or the Phase 1 gate as approved.
3. **Immediate blocker:** decide a narrow **OD-18 amendment** for unavailable Express `5.0.2`, the Zod 3.x High advisory, and any other proven incompatibilities; then reconcile manifests/lockfile with explicit human authorization. Do not run `npm audit fix --force` or silently choose replacements.
4. **Verification still required:** Phase 1 tests, log redaction, transaction commit/rollback, Git checks, pending install-script review, OD-29 empirical snapshots and independent gate verification. Remote `OIBSIP` remains due by Phase 1 exit under OD-27.
5. **Do not force a Codex switch merely to continue already-directed Kiro foundation implementation.** Kiro's own eligibility test was recorded; a separate eligible verifier (or human-recorded waiver under OD-29) is required before gate approval. OD-21 remains open.

**P2 (security, payments and inventory; needed before the phase noted)**
1. OD-10 (CSRF approval), OD-11, OD-12: before Phase 2.
2. OD-04, OD-19, proposed OD-25, OD-07, OD-08, OD-16, OD-17, OD-13 fields: before Phase 3.
3. Proposed OD-24, then OD-05 and OD-06 (including the edge): before Phase 4.

**P3 (deferrable)**
1. OD-03 and the OD-13 schedule and recipient: before Phase 5.
2. OD-21 remains open for remaining-agent compatibility testing; Kiro was tested as eligible. It is not a reason to restart Phase 0.

**Historical note:** a separate scoped scratch test was subsequently authorized and completed for Kiro (ELIGIBLE, 2026-10-28). Other agents remain unverified unless separately recorded; OD-21 is open.

---

## 4. Draft ADR Proposals (all DRAFT, NOT ACCEPTED)

Each states only the decision. Detail lives in the Task 0.3 and 0.5 documents. Acceptance is by the human alone, and no approval status may be fabricated.

**ADR-D1: Inventory reservation and atomicity (OD-04, OD-09, OD-16). DRAFT**
- **Proposed:** reserve, commit and release using MongoDB transactions. Each ingredient is 1 unit per pizza × quantity.
- **Alternatives:** deduct on payment; deduct at order and restore; conditional updates with compensation.
- **Consequences:** needs a replica set for local and test; adds the sweeper and an invariant audit.
- **Before acceptance:** TTL and sweeper values to be tuned.

**ADR-D2: Payment confirmation, idempotency and recovery (OD-05, OD-06). DRAFT**
- **Proposed:** callback verify plus sweeper reconciliation, a single `confirmCapturedPayment` path, state-based late-payment recovery, required `Idempotency-Key`.
- **Alternatives:** webhook-only or both; no late recovery.
- **Consequences:** the guarded `expired → received` edge; manual refunds for `paid_after_expiry`.
- **Blocked:** cannot be accepted until OD-24 (lock fencing) is designed. It also needs your decision on the late-capture residual.

**ADR-D3: Session, JWT and CSRF (OD-10). DRAFT**
- **Proposed:** httpOnly cookie JWT, same-origin proxy, layered CSRF (Origin check, JSON-only, signed double-submit token).
- **Alternatives:** Bearer token in storage.
- **Consequences:** cross-origin deployment needs rework; socket Origin check.
- **Before acceptance:** you approve the CSRF mechanism.

**ADR-D4: Currency and money (OD-19). DRAFT**
- **Proposed:** INR as integer minor units, a server constant stored per order.
- **Alternatives:** decimal or float; multi-currency.
- **Before acceptance:** choose the `*Paise` or `*Minor` naming.

**ADR-D5: Local-first governance in one shared directory (OD-15, OD-20, OD-23). DRAFT**
- **Proposed:** ignored AGENTS.md and `.governance/`, one source of truth, single writer, handoff-based claims, explicit `Load:` lines, all five agents in one shared local folder.
- **Alternatives:** committed governance files (a policy exception); per-agent clones (excluded by the confirmed constraint).
- **Consequences:** the human clears stale claims; instruction visibility depends on the OD-21 test.
- **Before acceptance:** earlier OD-14 backup selection and OD-23 handoff amendment are now human-approved, but **ADR-D5 remains DRAFT** and needs separate acceptance.

---

## 5. Conflicts, Missing Decisions and Blockers

**Historical planning conflicts and subsequent dispositions**
1. **Deadlines versus schema:** still relevant for later phases. OD-04, OD-13 (fields) and OD-19 must be settled before the Phase 3 schema. **OD-09's Phase 1 harness portion was approved; its full inventory design remains open.**
2. **Instruction-access timing:** clarified by Task 0.8 §2.1. Kiro was tested in a separate authorized scratch environment before implementation; the in-project echo test is repeated at Phase 1 exit. OD-21 remains open for other agents.
3. **Phase 0 versus scratch-test permission:** the separate Kiro scratch test was later authorized and completed outside OIBSIP. Historical Phase 0 restrictions are not current implementation instructions.
4. **OD-18 dependency batch:** the original precise Phase 1 tranche was later human-approved and recorded in `PHASE1_APPROVALS_RECORD.md`. It names client test libraries. **Express ETARGET and Zod security advisory require an additional human decision; do not revert to the older unnamed caret-based proposal.** Later-phase dependencies need their own tranche approval.
5. **OD-14(b) backup mirror:** not chosen. OD-14 approved **manual private ZIP + SHA-256 manifest** (option a).
6. **No webhook versus A§4:** unchanged. Optional-webhook residual risk still needs human acceptance under open OD-05 before Phase 4.

**Remaining unresolved decisions:** proposed OD-24 (gateway lock) and OD-25 (vegetables), plus the open later-phase ODs identified in §1. **OD-27, OD-28 and OD-29 were subsequently human-approved.** OD-18 needs a *new, scoped* amendment, not reapproval of the old proposal.

**Unresolved risk, still open:** the gateway-creation lock may expire before its external Razorpay request ends. Fencing, lock ownership and recovery for ambiguous gateway requests are not designed, and nothing in this document resolves them (proposed OD-24, open OD-05 and the **full-design portion** of OD-09). It blocks Phase 4 implementation and the acceptance of ADR-D2.

---

## 6. Phase Dependency and Blocker Summary

| Phase | Decisions required before start | Notes |
|---|---|---|
| 0 (before Task 0.7 finalizes gates) | none pending | OD-26 approved 2026-10-27; it supplies the quality bar for gate criteria |
| 1 | **Original start decisions approved:** OD-01, 09 (harness only), 14, 15 (strategy), 18 (original tranche), 20, 22, 23, 27, 28, 29, 30; human directed implementation | **IN PROGRESS; gate NOT APPROVED.** OD-18 Express/Zod amendment, security review, tests, snapshots, remote verification and independent gate evidence still outstanding. OD-21 is not a start blocker |
| 2 | OD-10, 11, 12 | The CSRF approval is the key item |
| 3 | OD-04, 07, 08, 13 (fields), 16, 17, 19, 25 | Schemas fix `reserved`, `threshold` and price fields here |
| 4 | OD-05, 06, **09 (full, still open)**, proposed OD-24 | Verify the unconfirmed Razorpay behavior first (payment fetch fields, receipt lookup, order closing) |
| 5 | OD-03, 13 (schedule, recipient) | |
| 6 | none currently | OD-26 decided in Phase 0; OD-28/29 later approved, subject to phase-specific verification |

---

## 7. Consolidation Notes (superseded content removed)

| Original item | Resolution |
|---|---|
| Task 0.5 listed as "passed technical review, approval pending" | Superseded: Tasks 0.2–0.8 are human-approved planning deliverables; **individual OD approvals are listed in §1** and ADRs remain unaccepted |
| Single "Depends on" column with loops | Replaced by strict-prerequisite and related columns (section 2) |
| OD-26 decided by Phase 6 | Moved to Phase 0, before Task 0.7 finalizes gate criteria |
| OD-26 listed as proposed | Superseded: human-approved 2026-10-27 with the nine standards recorded in section 1 |
| Older statuses for OD-09, OD-14/15/18/20/23/27/28/29 | Superseded by later 2026-10-28 human decisions; approved boundaries recorded in §1 |
| Old `^`-range OD-18 dependency proposal | Superseded by the exact-version original Phase 1 tranche in `PHASE1_APPROVALS_RECORD.md`; Express/Zod correction still requires human approval |
| Historical Phase 0 `no implementation` messages | Phase 1 foundation has since been directed, but its exit gate is still not approved |
| Typos "OIBSIND" and "OD-31 not applicable" | Corrected to "OIBSIP" and "none" |
| Earlier OD deadlines for OD-04, OD-13 and OD-19 | Adjusted to match the Phase 3 schema (section 5) |

---

## 8. Current Phase 1 Status (not a substitute for the live handoff) (as of 2026-10-28)

**Phase 0:** tasks and completion gate human-approved. The original Phase 0 handoff and documentation-only instructions are **historical**.

**Phase 1:** human-directed foundation implementation **IN PROGRESS**, but no successful Phase 1 foundation implementation/tests or approved exit gate is established in this record. Node `v24.22.2`, npm `11.19.1`; user-reported `npm install` added 363 packages and npm audit found 8 vulnerabilities (one High in production dependencies, Zod). Installed versions reflect an older proposal; do not infer compliance with the approved OD-18 specification.

**Current decision blocker:** a **narrow, explicitly human-approved OD-18 security/compatibility amendment** for Express and Zod, followed by corrected manifests, a reproducible lockfile and relevant verification. Phase 1 work must remain foundation-only (no Pizza/Ingredient/Order/Admin models, payment integration, auth, realtime or scheduled alerts).

**Current source of truth:** the approved decisions in this §1, the updated `PHASE1_APPROVALS_RECORD.md` for the exact **original** tranche and observed blockers, official requirements, and later explicit human directions. The earlier `KIRO_HANDOFF.md` is a historical documentation-transfer artifact. The local `.governance/index.md`, `.governance/decisions.md` (if separately maintained) and `.governance/handoffs/latest.md` must be kept consistent and must not be assumed updated merely because this file was replaced.

**Carry forward:** one local shared working tree, one writer; local-only AGENTS.md and `.governance/`; preserve uncommitted changes; no new dependencies/versions or commits without approval; no auto-accepted ADRs; later-phase decisions remain open; human approval required for every gate. Recheck OD-29 snapshots and run independent Phase 1 verification before requesting gate approval.

---

## 9. Governance Update Boundary

This 2026-10-28 revision is a **status synchronization**, not a fresh design decision, an ADR acceptance, a blanket authorization for dependency changes, or a Phase 1 gate approval. Reconcile this record against the actual local Git status and installed manifests before claiming implementation evidence. Human approval of the status synchronization does not fix npm vulnerabilities or replace the need for a specific OD-18 amendment.
