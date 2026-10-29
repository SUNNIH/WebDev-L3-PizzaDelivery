# Task 0.2: Requirements Baseline (Consolidated)

> **CURRENT STATUS — 2026-10-28:** This is the human-approved **Phase 0 requirements baseline** (Phase 0 gate approved 2026-10-27); the project has subsequently entered **Phase 1 foundation implementation** under later human direction. `npm install` completed using Node.js 24, but the actual manifests require reconciliation with the approved OD-18 tranche, and Express/Zod require a narrowly scoped compatibility/security amendment. The **Phase 1 exit gate is not approved**. Later human-approved ODs are **OD-01, OD-09 (Phase 1 transaction test harness only), OD-14, OD-15, OD-18 (original tranche; amendment pending), OD-20, OD-22, OD-23, OD-26, OD-27, OD-28, OD-29 (snapshot validation pending), and OD-30**. OD-02 is withdrawn; OD-21 and later-phase decisions remain open as applicable; no draft ADR is accepted. **For current OD statuses/deadlines use `Task_0.6_ADRs_and_Open_Decisions.md` §1; for package approval use `PHASE1_APPROVALS_RECORD.md`; for the live task use `.governance/handoffs/latest.md`.** Historical Phase 0 stop instructions below are not a reversal of subsequent explicit human authorization.


**Project:** OIBSIP Pizza Delivery (Web Development & Design, Level 3, Task 1)
**Document origin:** Phase 0 requirements planning; **current project phase:** Phase 1 foundation (in progress, exit gate not approved).
**Document status:** Consolidated Phase 0 requirements baseline, with a limited 2026-10-28 decision-status synchronization. R-01–R-38 requirements, phase assignments and acceptance criteria are preserved.
**Approval status:** Human-approved planning deliverable; later decisions are recorded separately in Task 0.6 and the Phase 1 approvals record. This document does not itself confer new approvals.
**Original Task 0.2 approval scope:** its earlier approval did not approve Task 0.3 recommendations or authorize implementation **at that time**. The Phase 0 gate was approved on 2026-10-27; the human subsequently directed Phase 1 foundation work. Phase 1 exit has not been approved.

No accepted ADRs exist in the project sources, and none are asserted here.

---

## 0. Authority and Precedence

1. Official OIBSIP requirements (Source B) govern the mandatory application checklist and repository naming.
2. Explicit user approvals and later clarifications (Source C) govern the development workflow.
3. This baseline governs requirement IDs, sources, statuses, phases and acceptance criteria. Approving it does not approve any Task 0.3 recommendation.
4. Source packet lineage: **A** = original project handoff, **B** = official guide excerpts (user-provided), **C** = later user decisions.

**Status legend**

| Code | Meaning |
|---|---|
| OFF | Official guide (Source B) |
| APP | Explicitly human-approved (A§8 policy, Source C) |
| HND | Stated in the original handoff (A) but not a formally accepted ADR |
| PROV | Provisional |
| UNR | Unresolved |

---

## 1. Requirements Traceability Matrix

Phases follow the roadmap in A§7 as renumbered by Source C (seven phases, 0 to 6). Acceptance criteria (AC) are testable and concise.

| ID | Requirement | Source / Status | Phase | Acceptance criteria |
|---|---|---|---|---|
| R-01 | Track/task: Web Dev & Design, Level 3, Task 1, Pizza Delivery | B1, C (Task 0.1) / OFF, APP | 0 | README and folder name reference this track and task; matches guide text |
| R-02 | GitHub repo named exactly `OIBSIP` | B6, A§1 / OFF | 1 | Remote repo name equals `OIBSIP` (exact match) |
| R-03 | Folder pattern `OIBSIP/[TrackName]-[Level/Task]-[ProjectName]/` | B6 / OFF (pattern) | 1 | Project folder matches the pattern and sits directly under the repo root |
| R-04 | Exact folder name (candidates: `WebDev-Task1-PizzaDelivery`, `WebDev-L3-PizzaDelivery`) | A§1, C / **APP** (human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`) | 1 | Human-approved name recorded once; all paths and ignore rules use it |
| R-05 | Project folder contains source, README.md, screenshots/output | B6 / OFF | 6 | Project folder contains, and Git tracks, source code, a `README.md` describing the project, and relevant screenshots/output files |
| R-06 | Official stack: React, Node/Express, MongoDB, Razorpay (test mode) | B3 / OFF | 1 (stack baseline); relevant implementation phases through 6 | Phase 1 records the complete official stack and verifies approved foundation dependencies and MongoDB connectivity. Razorpay test integration and its approved dependencies are verified in Phase 4. By Phase 6, the implemented official stack is represented in the project manifests, and Razorpay uses test-mode credentials only. No later-phase SDK is required to be installed at Phase 1 exit. |
| R-07 | Handoff stack additions: Vite, Tailwind, Mongoose, JWT, bcrypt, Nodemailer, node-cron, Socket.IO, Vitest, Supertest | A§2 / HND (documented in handoff; no ADR) | 1 (stack baseline); installation by approved phase tranche | Phase 1 documents all listed additions and installs only the human-approved Phase 1 tranche, with its manifests checked at the Phase 1 gate. JWT, bcrypt and Nodemailer are introduced for Phase 2; node-cron and Socket.IO for Phase 5, subject to approved packages; later phases verify the packages they introduce. By Phase 6 every implemented handoff-stack component is traceable to A§2 in manifests. Dependencies outside A§2 require explicit approval under OD-18; this criterion approves none. |
| R-08 | Registration with email verification | B4, A§3 / OFF | 2 | Unverified user cannot log in; valid link verifies; expired or reused link rejected |
| R-09 | Login with JWT authorisation | B4 / OFF | 2 | Valid credentials return a token; invalid or expired token gets 401 on protected routes |
| R-10 | Forgot-password via emailed link | B4 / OFF | 2 | Reset link changes password once; expired or reused link rejected; old password stops working |
| R-11 | Dashboard shows available pizza varieties | B4 / OFF | 3 | Authenticated dashboard lists all available varieties from the API |
| R-12 | Builder: base (5), sauce (5), cheese, vegetables (multi-select) | B4 / OFF | 3 | Exactly 5 bases and 5 sauces selectable, a cheese type selectable, and vegetables available as multiple select. Whether at least one vegetable is mandatory is unresolved; validation of that point is deferred to the human-approved choice |
| R-13 | Order summary before payment | B4 / OFF | 3 | Summary shows chosen ingredients and total before any payment call |
| R-14 | Razorpay test checkout; "Success" confirms the order | B4 / OFF | 4 | Test "Success" yields a verified-paid order; failure leaves it unpaid |
| R-15 | Real-time status: Received → In Kitchen → Sent to Delivery | B4, A§3 / OFF | 5 | Admin status change appears on the customer dashboard without reload, within a stated latency (figure to be set by the approved architecture) |
| R-16 | Separate admin login, unreachable from user registration | B5 / OFF | 2 (auth), 5 (dashboard) | Phase 2: a separate protected administrator login entry point exists, distinct from customer registration/login; public registration cannot create an admin; non-admin credentials fail at the admin entry point. Phase 5: admin UI is accessible only with valid admin authorization |
| R-17 | Public registration cannot create admins | A§3 / HND | 2 | Registration payload with a role field is ignored or rejected; resulting role is `customer` |
| R-18 | Inventory dashboard (bases, sauces, cheeses, vegetables) | B5 / OFF | 5 | Admin UI shows current stock for all four categories |
| R-19 | Stock auto-decremented per order | B5 / OFF | 4 (needs inventory core from Phase 3/4) | Confirmed order reduces each consumed item by the defined amount; no negative stock |
| R-20 | Manual stock update per item | B5 / OFF | 5 (UI); operation may exist earlier | Admin update persists and shows in the dashboard; customers get 403 |
| R-21 | Low-stock admin email via scheduled job, configurable threshold | B5 / OFF | 5 | Item below threshold triggers one email on schedule; changing the threshold changes behavior |
| R-22 | Order management panel: view all orders, update status | B5 / OFF | 5 | Admin sees all orders and can set a status; customers cannot |
| R-23 | Status change reflected live (polling or WebSockets) | B5 / OFF | 5 | Same as R-15 under the chosen mechanism |
| R-24 | Server-side input validation | A§4 / HND | all | Malformed or missing inputs on each endpoint return 4xx with no state change |
| R-25 | Password hashing; role-based authorization; customers see only own orders | A§4 / HND | 2/4/5 | DB holds no plaintext passwords; customer reading another's order gets 403/404; role routes tested |
| R-26 | Server-side price calculation | A§4 / HND | 3/4 | Tampered client total is ignored; server total equals the computed value |
| R-27 | Server-created Razorpay orders; signature verification; idempotent handling of failures, duplicates and retries | A§4 / HND | 4 | Bad signature rejected; duplicate callback or retry yields one paid state; failure path tested |
| R-28 | Atomic inventory operations; explicit reserve/confirm/release design | A§4 / HND | 4 (models and operations may be built earlier) | Inventory tests follow the approved OD-04/OD-09 strategy: concurrent ordering cannot oversell, stock never goes negative, and all applicable reserve/confirm/deduct/release transitions are tested. Unapproved strategy elements are not assumed |
| R-29 | Expiring, securely stored reset/verification tokens | A§4 / HND | 2 | Tokens expire; stored hashed; single use |
| R-30 | Secrets in env; `.env.example` placeholders; no sensitive logs | A§4 / HND | 1 | No secrets in repo; `.env.example` has placeholders only; log samples show no tokens or passwords |
| R-31 | Tests: authorization, payments, inventory, failures | A§4 / HND | all | Each category has at least one passing automated test per relevant phase |
| R-32 | Local-first governance (AGENTS.md, ADRs, plans, handoffs ignored; source and mandatory deliverables committed) | A§8 / **APP** | 1 | `git status` shows AGENTS.md, ADRs, plans and handoffs ignored; source and deliverables tracked |
| R-33 | Nested README exception (`!/<folder>/README.md`) plus parent re-include check | A§8 / HND (path UNR) | 1 | At the approved path, `git check-ignore --no-index -q -- <folder>/README.md` exits 1 (not ignored). Separately, `git check-ignore --no-index -v` is used to inspect applicable patterns, because a matching negation can make it exit 0; parent-directory exceptions are inspected; `git status` / `git ls-files` confirms the README is trackable/tracked |
| R-34 | Seven phases (0–6); Phase 0 is planning only | C / **APP** | n/a | Roadmap lists phases 0–6; no code or repo changes during Phase 0 |
| R-35 | Phase 6 development scope excludes video, LinkedIn, peer evaluation, external submission coordination | C / **APP** (guide does not waive them) | 6 | Phase 6 task list contains none of these; exclusion is recorded as a workflow scope choice, not a guide waiver |
| R-36 | Agent-independent prompts/handoffs for Claude, Codex, Cursor, Antigravity, Kiro | C / **APP** | all | Handoffs name no agent-specific features and are usable by all five agents |
| R-37 | AGENTS.md hierarchy (root, client, server, tests; feature files later) | A§6 / **APP (OD-15 strategy)**; per-agent access remains subject to testing under OD-21 | 1 | Files exist only as approved; each scoped to its area; none duplicated unnecessarily |
| R-38 | Authority rules and cross-module change protocol | A§5–6 / HND | all | Task reports list files changed, tests run, risks and unverified items; no self-approved gates |

---

## 2. Module Dependency Summary

The original module-dependency analysis is preserved. For current phase-gate scope and approvals, use the updated `Task_0.7_Development_Phase_Gates.md` and Task 0.6; recommendations here do not override later approved decisions.

| Module | Depends on | Depended on by |
|---|---|---|
| Foundation (config, env, DB, test harness) | none | all |
| Email service | Foundation | Auth, Notifications |
| Auth and users (verify, reset, JWT, roles) | Foundation, Email | Catalogue UI, Orders, Payments, Admin |
| Inventory **core** (models, atomic stock operations, threshold data) | Foundation | Builder, Pricing, Orders, Payments, Notifications, Admin UI |
| Inventory **admin interface** (dashboard, manual-update UI) | Auth (admin), Inventory core | none |
| Catalogue and Builder | Inventory core, Auth | Pricing, Orders |
| Pricing (server-side) | Builder, Inventory core | Orders, Payments |
| Orders | Auth, Pricing, Inventory core | Payments, Realtime, Admin |
| Payments (Razorpay) | Orders, Inventory core, Auth | Orders (confirm), Inventory (commit/release) |
| Realtime status | Orders, Auth | Customer dashboard, Admin |
| Notifications (cron) | Inventory core, Email | none |
| Admin dashboard | Auth (admin role), Inventory, Orders, Realtime | none |

The core coupling is **Payments, Orders and Inventory** (R-27, R-28).

**Inventory phasing:** inventory core is needed by Phases 3–4 (builder availability, reservation, decrement). Only the complete administrative interface (R-18, R-20 UI) is Phase 5. The exact phase in which core models first appear is an architecture matter (see Task 0.3), not a roadmap change.

---

## 3. Missing Requirements and Ambiguities

**Conflicts and notes**
1. **Folder path:** three variants appear in the sources, and "[Level/Task]" is ambiguous (L3, Task1, or both). **Human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`** (OD-01).
2. **Stock timing:** the guide says "decremented after each order". The handoff says "deduct or reserve when placed and paid". This is a refinement, but the workflow is undecided (OD-04).
3. **Phase 6:** A§7 includes video and submission. Source C narrows the development scope. The guide still requires those items; they are excluded from this planning workflow, not waived.
4. **Stack additions:** Tailwind, Socket.IO and similar tools are not in the official stack. They are documented in the handoff (A§2) and keep status HND. No ADR exists. (The earlier proposal OD-02 was withdrawn.)

**Original requirements gaps (historical source analysis):**

The points below describe ambiguities in the original source packet, **not necessarily still-open governance decisions**. In particular OD-14 (backup), OD-15 (instruction strategy), and OD-26/OD-28 (quality bar/metrics) were approved later. Other questions remain open as recorded in Task 0.6 §1.
- **Pricing:** no source says where prices live (per ingredient, per variety, base price).
- **Predefined varieties:** orderable or display-only is unstated. Stock consumption would need a recipe mapping, and nothing defines who manages them.
- **Cheese and vegetables:** whether cheese is single-select, and how many cheese and vegetable options exist, is unstated. Whether at least one vegetable is mandatory is unresolved (R-12).
- **Stock per pizza:** units consumed per ingredient are unspecified.
- **Order shape:** cart or multiple pizzas, quantity, delivery address and cancellation are unspecified.
- **Order statuses:** only three are defined. Pending-payment, payment-failed and expired-reservation states are not addressed.
- **Currency:** no source names a currency or money representation.
- **Low-stock alerts:** the threshold may be per item or per category (the guide's example is category-level). Cron schedule, recipient and duplicate-alert suppression are unspecified.
- **Admin provisioning:** how the first admin account is created is unstated.
- **Payment confirmation:** webhook vs client callback is undecided. Webhooks need a public URL in local development.
- **Email:** SMTP/provider choice and local-development strategy are undecided.
- **Agent compatibility:** how each of the five agents consumes AGENTS.md is unverified.
- **Backup:** no backup/restore plan exists for local-only governance files.
- **"Production-grade"** in the official objective has no defined bar for this project.

---

## 4. Decision Status (baseline level)

The table below began as the **Task 0.2 baseline-level decision list** and records subsequent decisions only where this table has a row. It is **not the authoritative live register**: Task 0.6 §1 governs all OD statuses, deadlines and dependencies; `PHASE1_APPROVALS_RECORD.md` governs the approved original Phase 1 dependency tranche and its unresolved amendment. Neither this table nor approval of this baseline accepts any ADR.

| OD | Decision | Status | Needed by |
|---|---|---|---|
| OD-01 | Final folder name and path | **Human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`** | Phase 1 |
| OD-02 | Approval of stack additions (R-07) | **Withdrawn.** R-07 keeps status HND; no ADR claimed | n/a |
| OD-03 | Real-time mechanism: Socket.IO vs polling | Open | Phase 5 |
| OD-04 | Inventory workflow (reserve-then-commit vs deduct-on-payment, with release/expiry) | Open | **Before Phase 3** (schema impact; Task 0.6 §1) |
| OD-05 | Payment confirmation: webhook vs callback vs both, plus idempotency | Open | Phase 4 |
| OD-06 | Order state machine including pre-payment and failure states | Open | Phase 4 |
| OD-07 | Pricing model and data ownership | Open | Phase 3 |
| OD-08 | Predefined varieties: orderable or display-only, and stock mapping | Open | Phase 3 |
| OD-09 | Atomicity mechanism: MongoDB transactions vs atomic conditional updates | **Phase 1 MongoMemoryReplSet commit/rollback harness APPROVED; full inventory atomicity design still Open** | Phase 1 harness; full design before Phase 4 |
| OD-10 | JWT strategy: storage, expiry, refresh, admin auth design | Open | Phase 2 |
| OD-11 | Admin bootstrap method | Open | Phase 2 |
| OD-12 | Email provider, dev/test strategy, token storage and expiry | Open | Phase 2 |
| OD-13 | Low-stock threshold model and cron schedule | Open | Fields before Phase 3; scheduling before Phase 5 |
| OD-14 | Backup and restore of local-only governance files | **Approved** — private ZIP plus SHA-256 manifest | Phase 1 |
| OD-15 | Per-agent AGENTS.md compatibility and file hierarchy | **Approved** — root + client/server/tests, explicit `Load:`; OD-21 access testing remains open overall | Phase 1 |

OD-01, OD-14 and OD-15 are now approved. OD-09 is partially approved only for the Phase 1 test harness. Later-phase unresolved decisions must be made before their applicable phase, at the deadlines in Task 0.6 §1. The complete current status list also includes approved **OD-18 (original tranche), OD-20, OD-22, OD-23 and OD-26–OD-30**. OD-18 still needs an **unapproved Express/Zod correction**. OD-29 requires empirical snapshot validation; OD-21 remains open; OD-24/OD-25 remain proposed and unresolved. None is silently approved by this baseline.

---

## 5. Acceptance Checklist (Task 0.2)

- [x] Source packet read, with Sources A, B and C distinguished.
- [x] Every requirement carries a source, status, phase and acceptance criterion (38 of 38).
- [x] Module dependencies summarized, including the inventory core / admin interface split.
- [x] Ambiguities and conflicts reported, not silently resolved.
- [x] Open decisions listed without inventing ADRs or approvals.
- [x] Final acceptance-criteria replacements applied (R-05, R-12, R-16, R-28, R-33).
- [x] **At the time Task 0.2/Phase 0 was prepared**, no roadmap change, repository action or application code was authorized by this baseline. This historical check does not prohibit separately authorized Phase 1 work.
- [x] Human review and approval of this baseline (recorded as approved in the prior ChatGPT review; no written artifact in project sources).
- [x] Phase 0 gate: subsequently human-approved on 2026-10-27 (not implied by the earlier Task 0.2 approval); independent factual attestations remain pending.

**Not verified:** the guide excerpts are user-provided and not checked against the full official guide. Full submission requirements (video, LinkedIn, peer evaluation, forms) remain outside this workflow by design and are not waived.

---

## 6. Consolidation Notes (superseded wording removed)

| Item | Resolution in this document |
|---|---|
| R-05, R-12, R-16, R-28, R-33 | Final replacement criteria from the Continuity Archive used verbatim in substance |
| R-12 "1+ vegetables" and "incomplete selection blocked" | Superseded: vegetable minimum is unresolved |
| R-33 earlier wording that `git check-ignore -v` exits 1 | Superseded and incorrect: `-q` exit 1 is the test; `-v` is for inspection |
| R-16 single Phase 5 placement | Superseded: auth Phase 2, dashboard Phase 5 |
| R-17 phase "2/5" | Revised to Phase 2 |
| OD-02 | Withdrawn |
| Original Task 0.3 handoff | Superseded: Task 0.3 System Architecture and Task 0.4 Multi-Agent Governance are now human-approved planning deliverables; their historical handoff was accurate when drafted |

---

## 7. Status Handoff

- Task 0.2: complete and human-approved.
- Task 0.3: revised and reviewed; recommendations unapproved (see Task 0.3 document).
- Task 0.4 (Multi-Agent Governance): **human-approved planning deliverable** (subsequent status; historical handoff is complete).
- **Original Task 0.2 constraint:** planning only; no implementation **within Phase 0**. Subsequent human direction authorizes Phase 1 foundation work, subject to approved dependencies and the current task packet. No OD becomes an ADR without explicit human approval; no agent self-approves a phase gate.
- **Current handoff:** Use `.governance/handoffs/latest.md` for active writer, working-tree state and the next authorized task; do not treat this section as a new work assignment.
