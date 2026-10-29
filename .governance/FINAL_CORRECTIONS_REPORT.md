# OIBSIP — Phase 1 Approvals and Dependency Status Record

**As of:** 2026-10-28  
**Project:** Web Development & Design — Level 3, Task 1, Pizza Delivery  
**Project path:** `OIBSIP/WebDev-L3-PizzaDelivery/`  
**Document purpose:** Consolidate the later human-approved Phase 1 decisions and actual installation evidence; supersede the earlier `PHASE1_APPROVALS_RECORD.md` *status and OD-18 proposal* without accepting any new dependency substitutions or ADRs.  
**Phase 1 status:** Foundation implementation has been directed by the human and dependency installation has begun. **The Phase 1 exit gate is not approved.**  
**Next controlled action:** Review and approve a narrow OD-18 security/compatibility amendment, then reconcile manifests and continue foundation implementation.

> **Authority rule:** Official requirements and explicit human decisions outrank older planning proposals, prior agent reports, and package files. This record captures decisions already made; it does **not** itself grant new approvals. If an approval cannot be verified, flag the gap rather than treating a proposal as approved. The seven human-approved Phase 0 planning documents remain planning baselines, not instructions to restart Phase 0.

---

## 1. Approved Decisions Applicable to Phase 1

| ID | Human-approved decision | Boundary / outstanding work |
|---|---|---|
| **OD-01** | Project folder is exactly `WebDev-L3-PizzaDelivery` inside `OIBSIP`. | Do not rename or move it. |
| **OD-09 (P1 only)** | Use `MongoMemoryReplSet` with `wiredTiger` and automated MongoDB transaction **commit and rollback** tests. | Full inventory atomicity and reserve/commit/release design remain open for later phases. |
| **OD-14** | Back up ignored governance files as a private manual ZIP with a SHA-256 manifest. | Trigger at each gate approval and after governance-changing sessions; exclude `.env` and secrets. |
| **OD-15** | One local-first `AGENTS.md` instruction source: root kernel plus `client/`, `server/`, `tests/` modules, with explicit `Load:` lines. | Tool-specific shims only if access testing shows they are needed; OD-21 remains open. |
| **OD-18 (original P1 tranche)** | Exact Phase 1 dependency specification in §2 was human-approved after the older caret-based proposal. | **Not currently installation-ready:** Express `5.0.2` fails registry resolution; Zod 3.x has a reported High production advisory. Any correction needs a further human-approved amendment. |
| **OD-20** | Use the Task 0.4 governance structure, authority precedence, C0–C3 changes, eight-step workflow and load map. | An agent may not change decision status or self-approve a gate. |
| **OD-22** | One project README, `screenshots/`, ignore `.vscode/` and `.idea/`; agent-specific tool-folder rules stay commented pending testing. | Governance is ignored; mandatory deliverables are tracked. |
| **OD-23** | One physical working tree, one agent writer at a time; handoff records `Active writer:` and `Working tree at handoff:`. | Preserve other agents' uncommitted work. |
| **OD-26** | Nine production-grade quality standards Q1–Q9 from Phase 0, including tests, security, deliverables, and governance. | These standards do not approve later-phase architecture. |
| **OD-27** | Main branch only unless changed by the human; commits require explicit authorization; `origin` named `OIBSIP` is due at Phase 1 exit. | Never commit, push, reset, stash, switch branches or clean files without authorization. |
| **OD-28** | Server coverage: 75% lines / 65% branches; high-risk code: 90% / 80%; client builder: 60%; realtime p95 ≤ 2 seconds locally; agreed severity definitions. | Apply metrics to the appropriate phase; client builder and realtime are later phases. |
| **OD-29** | Gate states, SN1–SN6 snapshot, independent verification, eligibility and restricted N/A rule as proposed in Task 0.7 §1. | Snapshot commands need empirical validation. Only the human sets a gate to `APPROVED`. |
| **OD-30** | Node.js 24 LTS, npm, MongoDB 8.0.x, npm workspaces `client` and `server`, one root `package-lock.json`, a project-level non-workspace `tests/` directory, local replica set. | No additional package-lock files or alternate package manager. |

**Not approved by these Phase 1 decisions:** OD-02 is **withdrawn**; OD-21 remains **open**; the unresolved later-phase ODs (including OD-03–08, OD-10–13, OD-16–17, OD-19, OD-24 and OD-25) remain open or proposed as applicable. No draft ADR is accepted by this record. Only the **Phase 1 harness portion** of OD-09 is approved.

---

## 2. OD-18 — Later Human-Approved *Original* Phase 1 Dependency Tranche

The following **exact versions** supersede the earlier `^2.1.8` Vitest / `^6.0.3` Vite / `^10.1.1` MongoDB Memory Server proposal in the prior record. The declarations below document the **original approval**. They are **not** a recommendation to reinstall them unchanged: see §3 for identified blockers.

### Workspace root: `WebDev-L3-PizzaDelivery/package.json`

```json
{
  "name": "oibsip-pizza-delivery",
  "private": true,
  "workspaces": ["client", "server"],
  "devDependencies": {
    "vite": "7.3.7",
    "vitest": "5.0.5",
    "@vitest/coverage-v8": "5.0.5",
    "mongodb-memory-server": "11.3.0"
  },
  "engines": {
    "node": "^24.0.0"
  }
}
```

### Client: `WebDev-L3-PizzaDelivery/client/package.json`

```json
{
  "name": "client",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "19.3.0",
    "react-dom": "19.3.0"
  },
  "devDependencies": {
    "vite": "7.3.7",
    "@vitejs/plugin-react": "5.2.0",
    "@tailwindcss/vite": "4.3.3",
    "tailwindcss": "4.3.3",
    "@testing-library/react": "16.2.0",
    "@testing-library/jest-dom": "6.7.0",
    "@testing-library/user-event": "14.6.0",
    "jsdom": "26.0.0"
  }
}
```

### Server: `WebDev-L3-PizzaDelivery/server/package.json`

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "dependencies": {
    "express": "5.0.2",
    "mongoose": "9.8.1",
    "dotenv": "16.5.0",
    "zod": "3.25.0",
    "helmet": "8.3.0",
    "cors": "2.8.6"
  },
  "devDependencies": {
    "supertest": "7.3.1"
  }
}
```

**Approved-scope boundaries:** These are 20 distinct direct packages across 21 declarations (because Vite appears in both workspace manifests). Do not silently add an omitted package, adjust versions, introduce `^` ranges or upgrade a package merely because a later version is available. Phase 2–5 libraries and application features are *not* part of this tranche.

---

## 3. OD-18 — Installation Blockers and Required Narrow Amendment

**Blocker A — Express:** On 2026-10-28, `npm install` failed with `ETARGET: No matching version found for express@5.0.2`. Therefore that exact approved declaration cannot be used as-is. Kiro subsequently modified three manifests without a recorded new human-approved version selection. The chosen replacement and every resulting manifest change must be reviewed and explicitly approved before being treated as the corrected OD-18 specification.

**Blocker B — Zod:** User-provided audit output reports a **High** vulnerability in `zod <4.6.6`; the installed Zod version was `3.25.76`, and the original OD-18 declaration was `3.25.0`. Downgrading within Zod 3.x does **not** address this advisory. Migration to an appropriate patched release may require application API adjustments, and must be tested and human-approved. The audit proposes `zod@4.6.7` with `--force`; that proposal is **not an authorization** to execute it.

**Blocker C — Other dependency drift and advisories:** The successful installation used older, caret-based manifests rather than the exact OD-18 tranche. User-provided installed versions include Vitest `2.1.9`, Vite `6.4.5` and `mongodb-memory-server@10.4.3`, not the later approved exact versions. Full `npm audit` reported **8 vulnerabilities** (3 moderate, 2 high, 3 critical), with findings involving Vitest, its transitive packages, esbuild and Zod. `npm audit --omit=dev` reported **one High production finding (Zod)**. Some findings are development-only, but should not be dismissed without a reviewed disposition.

**Required next decision:** A **human-approved OD-18 amendment** naming feasible, secure, compatible exact versions and any justified exceptions. The original approved versions above remain the historical baseline; until amendment, they are **not automatically safe or installable**. No `npm audit fix --force`, unreviewed install-script approvals or silent package-version edits.

---

## 4. Actual Local Setup and Installation Evidence (User-Reported)

**Reported working directory:** `C:\Users\HomePC\OIBSIP\WebDev-L3-PizzaDelivery`  
**Node.js:** `v24.22.2` (**meets OD-30**)  
**npm:** `11.19.1`  
**Latest `npm install`:** succeeded; **363 packages added**, **366 audited**, **8 vulnerabilities** reported.  
**Production audit:** one High issue involving Zod.  
**Memory server:** `npm ls mongodb-memory-server --all` returned `mongodb-memory-server@10.4.3`.  
**Installation scripts awaiting review** (`npm install-scripts ls`):

- `mongodb-memory-server@10.4.3` — `node ./postinstall.js`
- `esbuild@0.25.12` — `node install.js`
- `esbuild@0.21.5` — `node install.js`

These are **recorded observations, not approvals**. The user manually ran the diagnostic commands to conserve agent tokens. An installation success message does not establish that the manifests match OD-18, that the test binary has been downloaded, or that Phase 1 tests pass. Do not infer the Git branch, remote, working-tree state or created application files from this report; inspect those locally when necessary.

---

## 5. Scope of Authorized Phase 1 Foundation Work

The user has instructed Kiro to proceed with **Phase 1 foundation work**, not to restart Phase 0. Existing files and uncommitted work must be preserved. Once the approved dependency problem is resolved, the applicable Phase 1 scope is:

1. Express server skeleton, stable `/health` endpoint, error shape and smoke test.
2. Zod-based environment validation, `.env.example` placeholders, rejection of unsafe credentials, CORS and Helmet, log redaction and tests.
3. MongoDB 8.0.x replica-set capable connection; `MongoMemoryReplSet`/WiredTiger transaction commit and rollback tests.
4. Minimal React, Vite and Tailwind setup with basic client tests.
5. Vitest, Supertest, coverage, Git ignore/workspace and single-lockfile checks, evidence report, and current handoff.

**Out of scope for Phase 1:** User/Admin/Pizza/Ingredient/Order business models; authentication, email, Razorpay integration, pricing/checkout, stock operations, Socket.IO and cron. Future-stack description in the architecture does not authorize early implementation.

---

## 6. Agent Eligibility, Single Writer and Independent Verification

- **Kiro:** Scratch instruction-access test recorded as **ELIGIBLE** on 2026-10-28 (root and nested `AGENTS.md`, ignored `.governance` via explicit `Load:`, and claim/release tested). The older eligibility evidence is retained from the prior record.
- **Codex, Claude, Cursor, Antigravity:** No successful eligibility test for these agents is established in this record. Do not invent one, and do not require the user to switch development agents merely to continue Kiro's already-directed foundation work.
- **OD-21:** Still open; one Kiro result does not close compatibility testing for all agents.
- **Gate verification:** OD-29 calls for an eligible, independent verifier (or a human-recorded attestation/waiver under its rules) **before the Phase 1 gate can be approved**. An eligibility or gate outcome must not be self-declared by an agent. The exact implementation/verification timing of the second-agent requirement should be reflected in the live `decisions.md` if it was subsequently amended by the human.
- **One writer:** Before modifying anything, read the actual project `AGENTS.md`, `git status`, and `.governance/handoffs/latest.md`. Respect the active writer claim and preserve existing uncommitted changes.

---

## 7. Current Register Sync and Handoff Actions

**This document replaces the outdated `PHASE1_APPROVALS_RECORD.md` content for the topics it covers.** It does not rewrite the seven approved Phase 0 documents or retroactively make their historical claims current.

To keep the live instruction system consistent, the human-controlled governance update should also ensure:

- `.governance/decisions.md` reflects the approved OD statuses above and clearly identifies the **pending OD-18 amendment**.
- `.governance/index.md` points to the current record and states that Phase 1 foundation work has begun, **but the Phase 1 gate is not approved**.
- `.governance/handoffs/latest.md` identifies the active writer, the actual working-tree state, the last completed installation and the next authorized action.
- `KIRO_HANDOFF.md` (2026-10-28 documentation-only transfer), `SYNCHRONIZATION_REPORT.md` and `FINAL_CORRECTIONS_REPORT.md` are treated as **historical evidence**, not current implementation instructions.
- Any C3 edit to authority-bearing governance documents must be explicitly authorized by the human, reviewed for drift and included in the private governance backup.

**Not an approval:** This updated record does not approve Express or Zod replacement versions, resolve the 8 audit findings, authorize a commit, or approve the Phase 1 exit gate.

---

*Reconciled from the uploaded 2026-10-28 Phase 1 approvals record, the later human-approved OD-18 tranche and the user's 2026-10-28 PowerShell installation/audit output. Current filesystem and Git state have not been independently inspected.*
