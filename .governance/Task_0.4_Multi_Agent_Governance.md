# Task 0.4: Multi-Agent Governance (Consolidated)

> **CURRENT CONTROL STATUS — 2026-10-28:** Tasks 0.2–0.8 and the Phase 0 gate were human-approved on 2026-10-27. Subsequently approved: OD-01, OD-09 (**Phase 1 MongoDB test harness only**), OD-14, OD-15, OD-18 (**original Phase 1 dependency tranche; an amendment is pending**), OD-20, OD-22, OD-23, OD-27, OD-28, OD-29, OD-30; OD-26 was approved on 2026-10-27. The human has directed **Phase 1 foundation implementation**. Node.js 24 is active and `npm install` succeeded, but the installed versions and known audit findings have not been reconciled with the exact approved tranche. **The Phase 1 exit gate is NOT APPROVED.** OD-02 is withdrawn; OD-21 and later-phase decisions remain open as applicable; no draft ADR has been accepted. Current decision status is governed by `Task_0.6_ADRs_and_Open_Decisions.md` §1 and dependency scope by `PHASE1_APPROVALS_RECORD.md`. Older Phase 0 stop instructions are historical, not current Phase 1 assignments.

**Project:** OIBSIP Pizza Delivery  
**Origin:** Human-approved Phase 0 governance planning deliverable; **current project phase: Phase 1 foundation**  
**Document status:** Original Task 0.4 governance structure, with subsequent human-approved OD status and handoff clarification synchronized 2026-10-28.  
**Approval status:** The governance structure (OD-20), instruction strategy (OD-15), backup policy (OD-14) and single-writer protocol (OD-23) are approved. **This revision makes no new architectural approval.**

The file originally described a Phase 0 planning-only environment; that history is preserved, but **do not apply historical “no implementation” sentences as current stop instructions**. The approved project folder is `OIBSIP/WebDev-L3-PizzaDelivery/` (OD-01). Requirement IDs (R-xx) refer to `Task_0.2_Requirements_Baseline.md`; architecture sections refer to `Task_0.3_System_Architecture.md`. No live Git state or implementation test result has been independently verified from this document alone.

---

## 1. Governance Structure

```
OIBSIP/                          (git root)
└─ WebDev-L3-PizzaDelivery/      (OD-01 approved) launch every agent session here
   ├─ AGENTS.md                  root kernel, local-only
   ├─ client/ server/ tests/     each gets its own AGENTS.md in Phase 1 (R-37)
   └─ .governance/               local-only
      ├─ index.md                current phase/task, load map, last backup date
      ├─ Task_0.2_Requirements_Baseline.md
      ├─ Task_0.3_System_Architecture.md
      ├─ Task_0.4_Multi_Agent_Governance.md
      ├─ Task_0.5_Repository_and_Git_Governance.md
      ├─ Task_0.6_ADRs_and_Open_Decisions.md
      ├─ Task_0.7_Development_Phase_Gates.md
      ├─ Task_0.8_Final_Planning_Review.md
      ├─ PHASE1_APPROVALS_RECORD.md  # latest approved OD-18 original tranche + known blockers
      ├─ decisions.md            OD register + ADR index (status per OD)
      ├─ adr/                    only after explicit human acceptance
      ├─ phases.md               scope, acceptance criteria, gate status
      ├─ tasks/                  one packet per task
      ├─ handoffs/latest.md      one rolling handoff (older ones archived)
      └─ reports/                implementation reports
```

- **Root AGENTS.md** is a short kernel of about 4 KiB containing: authority order and hard rules, a load map (task type to files), the high-risk zones, and the 8-step workflow.
- **Module AGENTS.md** files (client, server, tests) stay under about 60 lines each. They cover that module's conventions, the contracts it owns (by pointer), its tests and its off-limits areas. They never restate root rules.
- **No feature-level AGENTS.md** until a Phase 4 trigger, such as payments or inventory outgrowing the module file (A§6: no premature files).
- **Reference by ID.** Packets and reports cite R-xx, architecture section numbers and OD ids instead of pasting content. One rolling handoff only.
- **Creation timing:** none of these files was to be created during Phase 0. They belong to the authorized Phase 1 local setup. Confirm their actual presence before relying on them; their appearance in this tree does not prove they exist.
- **Historical files:** `KIRO_HANDOFF.md` (documentation transfer), older Phase 0 reports and ZIPs are reference material, **not** the current assignment. The authoritative live task handoff is `.governance/handoffs/latest.md`.

---

## 2. Authority Precedence and Conflict Handling

1. **Official OIBSIP requirements (Source B)** are mandatory. No ADR, decision, plan or agent output can waive or override them.
2. **Human-approved ADRs and explicit human decisions** govern their own architectural scope. No accepted ADR is established in these records. Until the human accepts one, Task 0.3 recommendations are informational only.
3. **The approved Task 0.2 baseline** governs requirement IDs, phases and acceptance criteria.
4. **Task 0.3 recommendations** (unapproved) are informational only.
5. **Agent-written plans and reports** are never authoritative.

When a lower level seems to conflict with a higher one, or an approved ADR seems to conflict with an official requirement, the agent escalates and does not reconcile:

`CONFLICT: <A says> vs <B says> | affects: <ids> | needs: human decision`

The human resolves it, and the resolution is recorded in `decisions.md`. Only the human changes OD status, ADR acceptance or gate status. Agents may investigate and recommend but must not silently resolve a consequential open decision (A§5).

---

## 3. Change Classes, Governance Edits, Dependencies

| Class | Meaning | Human approval before work |
|---|---|---|
| C0 | Docs or comments with no behavior change, plus routine reporting (below) | No |
| C1 | Single module, no contract or schema change | No (the packet authorizes it) |
| C2 | Crosses modules, or changes a contract or schema | Yes, via the packet |
| C3 | High-risk zone, an open OD, or an authority-changing governance document | Yes, explicit |

**C3 high-risk zones**
- The `checkout` / Orders / Payments / Inventory chain (state machine, reservation, idempotency, verification, recovery; Task 0.3 §5).
- Auth, JWT and CSRF (§3).
- Order and Ingredient schemas (§2).
- API error codes and contracts (§7).
- Authority-changing governance documents: root and module `AGENTS.md`, precedence/conflict rules, `decisions.md`, `adr/`, gate status in `phases.md`, `index.md` load map, and **all seven** planning files `Task_0.2` through `Task_0.8` (Task 0.8 §2.5 extends the original C3 list). A decision-status correction to any of these files is not a routine C0 edit.

**Routine and permitted (C0) within an authorized task**
- Writing the task report.
- Updating `handoffs/latest.md`.
- Updating `index.md` status fields (current task, last backup date).

These routine updates may not change authority, decisions or gate status.

**Dependencies:** a dependency or an approved package-version change may be made only under explicit human approval (task packet, OD-18 tranche or later amendment) and must be recorded in the task report. The later, **exact-version** approved OD-18 tranche in `PHASE1_APPROVALS_RECORD.md` supersedes its older caret-based proposal; its Express/Zod issues require a separate human-approved correction. An `ETARGET`, security advisory or successful `npm install` **never** authorizes an agent to choose replacement versions or run `npm audit fix --force`. Unapproved changes are a stop condition.

---

## 4. Universal Workflow (Review → Execute → Verify → Report → Handoff)

1. **Preflight:** confirm the working directory is `OIBSIP/WebDev-L3-PizzaDelivery/`. List instruction files actually loaded (the "instruction echo"). Read `.governance/index.md`, `.governance/handoffs/latest.md`, and the Git working-tree status. Respect the OD-23 writer claim.
2. **Intake:** read the task packet. If there is no packet or the task is not authorized, stop.
3. **Load:** the root `AGENTS.md`, relevant module `AGENTS.md`, and explicit `Load:` references. For Phase 1 dependencies, read the **current** `PHASE1_APPROVALS_RECORD.md` and Task 0.6 register; do not infer approval from older `KIRO_HANDOFF.md`, `package.json`, prior reports or assistant chat snippets. Explicit reads are required; do not rely on tool auto-loading.
4. **Impact check:** classify the change (section 3). If it touches a zone the packet did not list, stop and request it.
5. **Decision check:** if an open OD is needed, stop and report it. Never resolve it silently.
6. **Execute** within scope only. Add a dependency only if explicitly approved (section 3).
7. **Verify:** run the packet's tests, then map each acceptance criterion to evidence.
8. **Report and handoff:** fill the report, update `.governance/handoffs/latest.md` with writer release and working-tree state, and stop. Never start the next task without its authorization.

Each task has one primary agent. Independent reviews or specialist work are delegated only when useful. Agents are interchangeable and carry no fixed responsibilities (R-36).

---

## 5. Load Map (progressive loading)

| Task touches | Load in addition to root kernel |
|---|---|
| Server code | `server/AGENTS.md`, and the §7 contracts |
| Payments / orders / inventory | the above, plus `tests/AGENTS.md`, Task 0.3 §5, and OD-04/05/06/09/19 |
| Auth | Task 0.3 §3, OD-10/11/12 |
| Client code | `client/AGENTS.md`, and the §7 contracts |
| Realtime / admin | Task 0.3 §6, OD-03/13 |
| Tests only | `tests/AGENTS.md`, and the relevant R-xx |

The change-impact map is a navigation aid, not a replacement for code review (A§6).

---

## 6. Phase Gates

- **Before a phase:** `.governance/phases.md` holds its scope, dependencies, acceptance criteria, required tests and OD blockers. Phase 1 foundation has been directed, but its dependency amendment is pending and its **exit gate remains NOT APPROVED**.
- **Gate evidence pack:** a table of acceptance criterion to evidence (command and result, or file and line), the tests run with counts, files changed, anything unverified, and the open ODs touched.
- **Independent verification (OD-29 approved):** an eligible, different agent or model re-runs tests, spot-checks changes and checks for silent OD resolutions. A second eligible agent is required for the ordinary two-agent gate route; otherwise any permitted human-recorded attestation/waiver follows OD-29. Kiro passed its scratch eligibility test; no other agent is established as eligible in the supplied evidence. SN1–SN6 snapshot commands need empirical validation before their output is trusted.
- **Approval:** only the human sets a gate to APPROVED. Agents never approve their own gates, and passing tests never implies a gate.

---

## 7. Minimal Templates

**Task packet** (`.governance/tasks/T-<phase>.<n>.md`)
```
TASK T-<phase>.<n> <title>            Primary agent: one, any
Authorized by: <human, date>   Phase: <n>   Class: C0|C1|C2|C3
Objective: <1-2 lines>
In scope / Out of scope:
Requirements & AC: <R-ids only>        Architecture refs: <section numbers>
ODs touched: <id: status>   (open OD needed => STOP unless human decided)
Approved dependencies: <none | list with approval reference>
Allowed paths:                         Load: root + <module AGENTS.md> + refs above
Blocked by:                            Tests required: <commands/layers>
Done when (evidence): <AC -> evidence type>
Stop if: conflict | open OD | scope growth | unapproved dependency
```

**Report** (`.governance/reports/T-x.md`)
```
Task / agent / date
Instructions loaded (echo):
Files changed:
Tests run: <command> -> <pass/fail counts>
AC -> evidence:
Dependencies added (with approval reference):
ODs touched: <none resolved by me | awaiting human>
Conflicts found:
Risks / not verified:
Suggested next (not started):
```

**Handoff** (`.governance/handoffs/latest.md`, 40 lines at most)
```
As of: <date, agent>
Task state: done | in progress | blocked
Active writer: <agent name | none>
Working tree at handoff: <branch; staged/unstaged/untracked summary>
Human decisions since last handoff (and where recorded):
Open ODs (ids) / blockers:
Repo state: branch, uncommitted files, last test run
Next authorized task: <id | none, await human>
Carried constraints: <ids only>
```

---

## 8. Local-First File Management and Backup

- **Policy unchanged:** AGENTS.md files and `.governance/` remain ignored by `.gitignore` and are not committed (R-32). Nothing is committed contrary to the policy without asking the human first.
- **Backup set:** every AGENTS.md plus `.governance/`.
- **Triggers:** each gate approval, and the end of any session that changed governance files. `index.md` records the last backup date.
- **OD-14 APPROVED (2026-10-28):** manually create a **private ZIP with a SHA-256 manifest**, retained in a location controlled by the human. Include ignored `AGENTS.md` and `.governance/` material; **never** include `.env`, credentials or other secrets. `index.md` tracks the last backup date. This supersedes the historical, unapproved alternatives. No separate Git mirror is authorized by OD-14.
- **Restore on a new machine or IDE:** restore the ZIP, check file hashes against the manifest, run the instruction-echo test per agent, and confirm `index.md` and the handoff match. Never assume governance was restored correctly without checking.

---

## 9. Compatibility Findings and Risks (Claude, Codex, Cursor, Antigravity, Kiro)

The approach is agent-independent (R-36). It relies on explicit `Load:` lines and a single AGENTS.md source of truth, not on any tool-specific feature.

**Findings**
- **Cursor, Kiro, Antigravity:** treated as supporting nested AGENTS.md, per the human's correction. Independent search evidence supported nested scoping for Cursor only.
- **Claude Code:** treated as reading AGENTS.md directly, per the human's correction. No CLAUDE.md import bridge is assumed.
- **Cursor, gitignore visibility (UNRESOLVED):** Cursor documents that it automatically ignores files listed in `.gitignore`, and blocks ignored files from semantic search, Agent, Tab and @-mentions. Whether a gitignored AGENTS.md or `.governance/` is therefore unreadable or unloaded is unverified. This is the main open risk.
- **Cursor, multi-root:** the root AGENTS.md of each workspace folder is reported to apply globally in multi-root workspaces.
- **Codex:** files are added up to a combined cap (32 KiB by default), and nested directories can add overrides. A GitHub issue reports a shared budget consumed from the root down, so a large root file can drop a nested one. Discovery is startup-based, so a session started from the root can miss nested files.
- **Subsequent scratch result (2026-10-28):** Kiro passed instruction-access tests for root/nested and ignored `AGENTS.md`, explicit reads of ignored `.governance/` and a claim/release cycle, and was recorded **ELIGIBLE**. This evidence is specific to Kiro and the scratch environment; recheck in the project at Phase 1 exit. No other agent is established as `ELIGIBLE` by the supplied evidence. OD-21 remains open until the agreed broader per-agent checks and human decision.
- **Historical unverified findings:** compatibility assertions about Claude, Codex, Cursor and Antigravity remain provisional until those tools are tested. Antigravity sources conflicted on whether `AGENTS.md` or `.agents/rules` is primary and on precedence with `GEMINI.md`.

**Risks and mitigations**

| Risk | Mitigation |
|---|---|
| Ignored files hidden from agents (Cursor documented; others not established as eligible) | Per-agent scratch test **before use** and an in-project instruction echo during Phase 1. Kiro passed scratch testing; that does not prove other agents work. OD-21 remains open |
| Nested files crowded out by size, or missed by launch directory | Launch from `WebDev-L3-PizzaDelivery/`. Packet `Load:` lines still name files explicitly. Keep the whole instruction chain under about 12 KiB |
| Multi-root workspaces leak the root file in Cursor | Use single-root workspaces |
| Tool-specific shim files (for example GEMINI.md, `.agents/rules`, `.kiro/steering`) | Add only if the echo test fails. They must be thin pointers and also local-only (R-36) |
| Kernel versus Project Instructions drift | The kernel holds only what Project Instructions already say. Review both when either changes |

---

## 10. Decision Status (current as of 2026-10-28)

**This section supersedes the historical "no decision approved" status in the original Task 0.4.** Approval of the *planning document* is distinct from approval of individual ODs. The current consolidated register is `Task_0.6_ADRs_and_Open_Decisions.md` §1; the approved dependency baseline and pending amendment are described in `PHASE1_APPROVALS_RECORD.md`.

| OD | Decision | Current status |
|---|---|---|
| **OD-14** | Private governance ZIP backup with SHA-256 manifest and approved triggers | **APPROVED 2026-10-28** |
| **OD-15** | Root and module `AGENTS.md` strategy; explicit `Load:` lines; limited shims | **APPROVED 2026-10-28** (OD-21 stays open) |
| **OD-20** | Task 0.4 governance structure, C0–C3 policy, authority order and 8-step workflow | **APPROVED 2026-10-28** |
| **OD-23** | One physical working tree, one writer at a time; handoff records writer and Git state | **APPROVED 2026-10-28** |
| **OD-21** | Per-agent ignored-file visibility/compatibility | **OPEN**; Kiro scratch-tested and recorded `ELIGIBLE`, others not established |
| **OD-27** | One `main` branch, commits only when authorized, `OIBSIP` remote due Phase 1 exit | **APPROVED 2026-10-28** (detailed Git policy in Task 0.5) |
| **OD-28** | Approved quality metrics and severity definitions | **APPROVED 2026-10-28** (Task 0.7) |
| **OD-29** | Gate procedure, eligibility, independent review, snapshots | **APPROVED 2026-10-28**; snapshot commands awaiting empirical validation |

**Other Phase 1 approvals:** OD-01 (folder), OD-09 (**test harness portion only**), OD-18 (original **exact-version** tranche, **security/compatibility amendment still pending**), OD-22 (deliverables and editor ignore), OD-26 (quality bar), and OD-30 (Node 24/npm/MongoDB workspaces) were separately approved. OD-02 was withdrawn. OD-03–08, OD-10–13, OD-16–17, OD-19 and later-phase OD-24/25 matters remain unresolved, as applicable. No draft ADR is accepted.

**Active project status:** Phase 1 foundation implementation has been directed; `npm install` succeeded on Node.js 24 but its package versions and eight audit findings need review. **Do not approve the Phase 1 gate, unreviewed packages, or later-phase features by implication.**

---

## 11. Consolidation Notes (superseded wording removed)

| Original item | Resolution |
|---|---|
| Original authority order and conflict rule | Replaced by section 2 (official requirements mandatory; ADRs govern their own scope; conflicts escalate) |
| C3 listed governance files only generically; all governance edits implied heavy approval | Replaced by section 3: authority-changing documents are C3, routine reports and handoff updates are C0 |
| "No new dependencies" rule | Replaced by "explicitly approved dependencies only"; packet stop condition is "unapproved dependency" |
| Compatibility findings assumed a CLAUDE.md bridge and unconfirmed nested loading | Replaced by section 9 per the human's correction, with the Cursor/gitignore issue preserved |
| Earlier note that Task 0.5 was undefined | Superseded: Task 0.5 is Repository and Git Governance |

---

## 12. Current Application and Historical Handoff

**Current state (2026-10-28):** Task 0.4 remains the approved governance framework (OD-20). The project is now in authorized **Phase 1 foundation work**, not Phase 0 planning. The installed dependency state has known OD-18 compliance/security blockers. No Phase 1 completion or exit approval has been established.

**Current task and authority:** Read `.governance/handoffs/latest.md`, `.governance/index.md`, `Task_0.6_ADRs_and_Open_Decisions.md` §1 and `PHASE1_APPROVALS_RECORD.md` before taking action. The older `KIRO_HANDOFF.md` is a **historical documentation-only transfer**, not the current active assignment. Task 0.5 contains approved Git principles; OD-27 controls later decisions on branches, commits and remote timing.

**Implementation boundary:** Phase 1 concerns configuration, Express `/health`, replica-set DB/test infrastructure, initial React/Vite/Tailwind setup, smoke/env/logging/transaction tests and governance/Git checks. Do **not** build customer/admin authentication, pizza/inventory/order models, payments, stock operations, real-time updates or cron until their later phases and decisions authorize them.

**Carried constraints:** One writer, preserve uncommitted work, no unapproved dependencies or version substitutions, no self-approved gates, protect ignored governance and secrets, and update handoffs with the active writer and working-tree state. The human's next approval is needed for the narrow OD-18 Express/Zod/manifest correction; nothing in this file approves replacement versions.

---

*Governance status synchronized from the uploaded Task 0.4 source and the human-approved Phase 1 record on 2026-10-28. This does not attest to the user's live Git state or test results.*
