# OIBSIP — Governance Index

**As of:** 2026-10-28  
**Repository:** `OIBSIP`  
**Project directory:** `OIBSIP/WebDev-L3-PizzaDelivery/`  
**Governance directory:** `WebDev-L3-PizzaDelivery/.governance/` (**local-only; ignored by Git**)  
**Current phase:** **Phase 1 — foundation IN PROGRESS**  
**Current task state:** **Dependency correction BLOCKED pending a human-approved OD-18 amendment**  
**Phase 1 exit gate:** **NOT APPROVED**  
**Last governance backup:** **UNVERIFIED — enter date and SHA-256 manifest location after performing the OD-14 backup**  
**Active writer / actual Git state:** **UNVERIFIED — consult `handoffs/latest.md` and inspect the live working tree before changes**

> **Purpose:** Navigation and status only. This file does **not** approve dependencies, change OD statuses, authorize additional scope, or approve a gate. Historical Phase 0 notices such as “no Phase 1 implementation authorized” have been superseded by the user's later direction to begin Phase 1 foundation work. The original requirements and architectural decisions retain their separate approval rules. For an unresolved conflict, stop and request a human decision.

## 1. Read first — active sources of truth

| File (relative to `.governance/`) | Use it for | Status |
|---|---|---|
| `decisions.md` | **Live OD status register**, approved/open boundaries, ADR state | Current; human-imported |
| `PHASE1_APPROVALS_RECORD.md` | **Original exact OD-18 dependency approval**, install/audit findings and **pending corrective amendment** | Current; human-imported |
| `handoffs/latest.md` | **Live** writer claim, work-in-progress, Git/test state and next authorized task | Must check actual file and reconcile any newer state |
| `Task_0.2_Requirements_Baseline.md` | R-01–R-38; official and handoff requirements, acceptance criteria | Approved baseline, status synchronized |
| `Task_0.3_System_Architecture.md` | Modular-monolith design and phase boundaries | Planning document approved; architectural **recommendations are not accepted ADRs** |
| `Task_0.4_Multi_Agent_Governance.md` | Authority order, C0–C3 change classes, 8-step workflow, instruction loading and handoffs | Governance rules; current status synchronized |
| `Task_0.5_Repository_and_Git_Governance.md` | Shared working tree, single-writer protocol, Git/ignore/lockfile rules and V-checks | Governance rules; current status synchronized |
| `Task_0.6_ADRs_and_Open_Decisions.md` | Full OD reasoning, dependencies and proposed ADRs | Current decision references; see `decisions.md` for quick status |
| `Task_0.7_Development_Phase_Gates.md` | Phase 1 acceptance/tests, OD-28 metrics, OD-29 gate/snapshot procedure | Phase 1 gate **not approved** |
| `Task_0.8_Final_Planning_Review.md` | Phase 0 closeout and subsequent approval reconciliation | Historical Phase 0 gate approved |
| `phases.md` | Live phase/task/gate record **if present** | **Presence and contents not verified**; never infer a gate from this index |
| `tasks/T-*.md` | Explicitly authorized implementation task packets **if present** | Task-specific authority; never infer approval from filename alone |
| `reports/` | Execution evidence and independent-verification reports **if present** | Evidence, never approval |

**Historical, not current execution instructions:** `KIRO_HANDOFF.md` (documentation-only transfer), `SYNCHRONIZATION_REPORT.md` and `FINAL_CORRECTIONS_REPORT.md`. Retain as history, but **do not obey their old stop-after-Phase-0-task wording in place of later approvals**.

## 2. Current approved boundaries (summary, not a replacement for `decisions.md`)

- **Approved:** OD-01, OD-14, OD-15, OD-20, OD-22, OD-23, OD-26, OD-27, OD-28, OD-29 and OD-30; OD-09 **for the Phase 1 MongoDB transaction test harness only**. OD-18's **original exact dependency tranche** was approved; its **corrective amendment remains pending**.
- **Withdrawn:** OD-02. **Open:** OD-21 and other later-phase decisions as listed in `decisions.md`. **No accepted ADRs**; ADR-D1 through ADR-D5 remain drafts.
- **Kiro:** scratch-tested eligible for instruction access. **Other agents' eligibility is not established here**. OD-29 still requires independent gate verification or a human-recorded waiver/attestation where permitted.
- **One writer**, one physical working tree; no unauthorized commits, pushes, branch switches, clones, worktrees, resets, stashes or destructive cleanup.

## 3. Phase 1 — current assignment and blocker

**Authorized foundation scope only:** Express `/health` and error handling; environment validation; CORS, security headers and log redaction; MongoDB 8.0.x replica-set connectivity; minimal React/Vite/Tailwind client; smoke, environment and MongoDB `MongoMemoryReplSet`/`wiredTiger` **commit and rollback** tests; workspace/single-lockfile/Git verification and evidence.

**Not Phase 1 scope:** customer/admin authentication; business models for users, pizza, ingredients or orders; checkout, Razorpay integration, inventory operations, Socket.IO, cron or application features assigned to Phases 2–5.

**User-reported environment:** Node.js `v24.22.2`, npm `11.19.1`; `npm install` added 363 packages. `npm audit` reported 8 findings; `npm audit --omit=dev` reported one High production finding involving Zod. The installed dependency tree does not conform to the later-approved exact OD-18 baseline. `express@5.0.2` failed with `ETARGET`; the Zod 3.x approval requires security review. **No substitute package/version or installation-script approval is implied.**

**Next controlled action:** Read `handoffs/latest.md`; inspect actual manifests and lockfile **read-only**; submit a minimal, compatible, secure exact-version OD-18 amendment proposal. **Stop for human approval before changing packages or rerunning installation.** Once approved, continue only Phase 1 foundation implementation. Never run `npm audit fix --force` as a shortcut.

## 4. Instruction loading — compact map

1. Read **project-root `AGENTS.md`** before work. It is ignored by Git but must be explicitly opened; do not rely on automatic loading.
2. Read this index, `decisions.md`, `handoffs/latest.md` and the active human-authorized task packet (when present). Check the actual Git state and active-writer claim before modifying any file.
3. **Server:** also load `server/AGENTS.md`, Task 0.3 relevant server contracts and the approved task's `Load:` references.
4. **Client:** also load `client/AGENTS.md`, relevant UI/API contracts and the approved task's `Load:` references.
5. **Tests:** also load `tests/AGENTS.md`, Task 0.7 evidence requirements and the approved task's `Load:` references.
6. **Dependencies or governance:** load `PHASE1_APPROVALS_RECORD.md`, `decisions.md`, Task 0.4 §3 and Task 0.5. Any authority-changing governance or OD-18 amendment is **C3** and needs explicit human authorization.
7. Follow the Task 0.4 preflight → intake → load → impact → decision → execute → verify → report/handoff workflow; stop at the assigned task boundary.

## 5. State, records and backup hygiene

- `AGENTS.md`, `.governance/`, secrets and `.env` stay **local-only**; never commit them. Source, manifests, single project-root `package-lock.json`, `README.md` and required screenshots follow the approved Git policy and phase timing.
- Update `handoffs/latest.md` with the **actual** writer claim, Git state, files changed, tests and next authorized task after each session. Do **not** invent a clean tree or completed test results.
- Back up **all `AGENTS.md` files and `.governance/`** to a private ZIP with a SHA-256 manifest after governance-changing sessions and at each approved gate. **Exclude `.env` and secrets.** Record the actual backup date and manifest location above when completed.
- **Gate states and verification** follow OD-29. Snapshot commands SN1–SN6 still need empirical validation. **Only the human** sets the Phase 1 exit gate to `APPROVED`.

**Index creation:** 2026-10-28. Created as the live navigation file after the user's manual governance imports. No local Windows Git state or writer claim was directly inspected, and no new OD, ADR, package replacement or gate is approved by this document.
