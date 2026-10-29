# Task 0.7: Development Phase Gates (Consolidated — Current Status Update)

> **CURRENT CONTROL STATUS — 2026-10-28:** The Phase 0 planning deliverables (Tasks 0.2–0.8) and Phase 0 completion gate were human-approved on 2026-10-27. Subsequent human decisions approved OD-01, OD-09 (Phase 1 test harness only), OD-14, OD-15, OD-18 (original exact Phase 1 dependency tranche), OD-20, OD-22, OD-23, OD-27, OD-28, OD-29 and OD-30; OD-26 was approved on 2026-10-27. The human later directed **Phase 1 foundation implementation**. Dependency installation has begun, but **the Phase 1 exit gate is NOT APPROVED**, no Phase 1 implementation tests have been evidenced, and OD-18 requires a narrowly scoped security/compatibility amendment before the manifests can be considered compliant. OD-02 remains withdrawn; OD-21 and later-phase ODs remain open as applicable. No draft ADR is accepted.

> **VERSION AND PRECEDENCE NOTE:** This is a status synchronization, **not** a fresh authorization to change dependencies or to approve an exit gate. The adopted OD-29 gate procedure and OD-28 quality metrics in this document apply, subject to their recorded validation caveats. The updated `PHASE1_APPROVALS_RECORD.md` records the approved original OD-18 specification and the subsequent Express/Zod blockers. Historical Phase 0 no-implementation statements in older reports and handoffs are not current Phase 1 instructions. The decision register is Task 0.6 §1; only the human decides open ODs and approves gates.

**Project:** OIBSIP Pizza Delivery — Web Development & Design, Level 3, Task 1  
**Working folder:** `OIBSIP/WebDev-L3-PizzaDelivery/`  
**Document:** Approved Phase 0 planning content, synchronized for subsequently approved Phase 1 governance  
**Phase 1 status:** **IN PROGRESS (foundation only); exit gate NOT APPROVED**  
**Approved gate method:** OD-29, with SN1–SN6 empirical verification still outstanding  
**Quality standards:** OD-26 (Q1–Q9); metrics and severity interpretation approved under OD-28  
**Agent access:** Kiro scratch test recorded `ELIGIBLE`; other agent eligibility is not established by this record; OD-21 remains open.

The original requirement IDs, phase boundaries, test scenarios and gate checks below are preserved. Approval of the **procedure** does not constitute approval of any **individual phase gate** or any draft ADR. References: `Task_0.2_Requirements_Baseline.md`, `Task_0.3_System_Architecture.md`, `Task_0.4_Multi_Agent_Governance.md`, `Task_0.5_Repository_and_Git_Governance.md`, `Task_0.6_ADRs_and_Open_Decisions.md` and `PHASE1_APPROVALS_RECORD.md`.

**Quality standards (OD-26, approved)**

| Q | Standard |
|---|---|
| Q1 | All mandatory OIBSIP features complete |
| Q2 | Authentication, authorization and password recovery tested |
| Q3 | Razorpay verification and payment failure handling tested |
| Q4 | Inventory deduction, concurrency and recovery tested |
| Q5 | Security controls verified against approved designs |
| Q6 | Passing automated tests required for phase approval |
| Q7 | README, setup instructions and screenshots provided |
| Q8 | No unresolved critical defects or known high-severity security vulnerabilities at final acceptance |
| Q9 | Shared-directory multi-agent governance and handoffs verified |

---

## 1. Gate Procedure (HUMAN-APPROVED, OD-29; snapshot commands awaiting empirical validation)

**Gate states:** `NOT_STARTED → IN_PROGRESS → EVIDENCE_SUBMITTED → VERIFIED → APPROVED`, or `CHANGES_REQUIRED`. Only the human sets `APPROVED`. A gate is never implied by passing tests (A§7).

**Evidence pack** (Task 0.4 §6): an acceptance-criterion → evidence table; commands run with pass and fail counts; files changed; unverified items; open ODs touched; agent identity; and a state snapshot.

### 1.1 State snapshot

An approval refers to one exact state of the shared directory. The snapshot covers the commit, the index, staged and unstaged changes, deletions, untracked non-ignored project files, and the governance backup state. It uses only Git commands, with no `xargs` or `sha256sum`, so it runs the same way in Git Bash on Windows, macOS and Linux. `git hash-object` without `-w` computes a hash and writes nothing.

```bash
# SN1 branch, commit and readable record (record NO_COMMITS if the repo has none)
git rev-parse --verify -q HEAD || echo NO_COMMITS
git status --porcelain=v1 --branch --untracked-files=all

# SN2 index state: staged content, modes, and which paths are staged
git ls-files -s | git hash-object --stdin

# SN3 staged changes: staged additions, modifications and deletions
git diff --cached --binary | git hash-object --stdin

# SN4 unstaged changes to tracked files: modifications and deletions
git diff --binary | git hash-object --stdin

# SN5 untracked, non-ignored project files: names, then a fingerprint of their content
git -c core.quotepath=false ls-files -o --exclude-standard
git -c core.quotepath=false ls-files -o --exclude-standard | git hash-object --stdin-paths | git hash-object --stdin

# SN6 governance backup-manifest fingerprint (the date comes from the manifest or index.md)
git hash-object -- "<manifest-file>"
```

| Part | What it covers |
|---|---|
| SN1 | Branch, commit, and the full list of staged, unstaged, deleted and untracked paths |
| SN2 | Index state, including staged additions |
| SN3 | Staged additions, modifications and deletions, by content |
| SN4 | Unstaged modifications and deletions of tracked files, by content |
| SN5 | Untracked non-ignored project files, by name and content |
| SN6 | The governance backup state. Ignored AGENTS.md and `.governance/` files are outside the project snapshot, so the manifest of the latest backup (OD-14) stands in for them |

**Rules**
- **No-commit repositories:** record `NO_COMMITS`. SN3 still works on an unborn branch. This is expected behavior and was not run.
- **SN6 timing:** the manifest is mandatory from the first gate at which any AGENTS.md or `.governance/` file exists (Phase 1 exit onward). A governance file changed after the manifest date requires a fresh backup before the gate can be approved, because the backup trigger is each gate approval (Task 0.4 §8).
- **Verification:** re-run SN1 to SN6 and compare. Any difference voids the approval for the changed paths until they are re-verified. A newly created untracked file also voids it.
- **Shell and line endings:** run the snapshot in the same shell every time. Windows PowerShell or cmd pipelines can re-encode text and change the fingerprints. Hashing follows the repository's configured line-ending filters, so compare only on one machine and one configuration.
- **Limits:** files with newlines in their names are not handled. Both SN5 pipelines now use `core.quotepath=false` to avoid one pipeline escaping non-ASCII filenames while the other hashes pathnames. The SN5 pipeline, unborn-branch behavior, and SN6 backup-content correspondence **must be empirically verified in an authorized scratch/Phase 1 check** before gate evidence is trusted. `node_modules/` and other ignored output are intentionally excluded, and dependency state is carried by the tracked lockfile.
- **Phase 0:** there is no repository. The snapshot is the list of approved planning documents with a file hash for each, recorded in the human's own notes.

### 1.2 Agent eligibility (APPROVED under OD-29; does not close OD-21)

- An agent may hold the writer claim for implementation, or act as independent verifier, only after its instruction-access result is recorded as `ELIGIBLE`. Until then it is `UNTESTED`, and it is used only for read-only work that does not depend on loaded instructions.
- **The test** follows the Task 0.5 §7 scratch protocol, once per agent. The agent must:
  1. List the AGENTS.md files it loaded and quote the root and nested canaries.
  2. Read an ignored `.governance/` file through an explicit `Load:` line.
  3. Complete one claim-and-release cycle in a scratch handoff.
- The agent reports the evidence. **The human records `ELIGIBLE` or the failure.** An agent never marks itself eligible.
- Record the date, tool name and version, and launch directory. Re-test after a major tool update or a change in behavior.
- At least two agents must be `ELIGIBLE` before any gate that needs separate implementer and verifier roles.
- **OD-21 stays open** until all five agents are tested and the human records the Step C decision. One agent being `ELIGIBLE` does not close it. Step D (in-situ confirmation) repeats the check at the Phase 1 exit.

### 1.3 Independent verification

1. The verifier is a different agent from the one that produced the evidence pack, and its name is recorded. If usage limits make that impossible, the human records an attestation or waiver.
2. The verifier does the normal preflight (`git status`, latest handoff, instruction echo), then claims the writer slot as a **verification session**. It edits no source, tests, contracts or governance files except the verification report. Test runs may write only ignored output such as `coverage/`.
3. It re-runs the full suite and compares counts with the evidence pack. It reads the tests behind every C3-zone criterion plus at least three others. It checks diffs against the packet's allowed paths, the manifest against the approved dependency tranche, and `decisions.md` for any OD resolved silently. From Phase 1 on it runs V6, V9, V11 and S1 to S4, and checks the Q9 items.
4. The result is PASS or FAIL with severity-rated findings. A FAIL goes back to the implementer, who submits a new evidence pack, and a different agent from the fixer re-verifies it.

**Regression rule:** every gate re-runs the whole automated suite, not only the new phase's tests.

### 1.4 Five interchangeable agents, one shared directory

- All commands are plain shell with no tool-specific features (R-36).
- Evidence lives in local files, not in chat history.
- Verification is sequential, in line with the single-writer rule.
- The handoff carries the gate state.
- A backup runs at each gate approval.
- No clone, worktree or synchronization workflow is used for gates.

---

## 2. Common Entry and Exit Criteria (APPROVED under OD-29; individual gate approvals remain human-only)

**Entry**
- **E1:** the previous gate is `APPROVED`. **Phase 0 exception:** there is no previous gate.
- **E2:** every OD in the phase's blocker list is decided by the human and recorded.
- **E3:** explicit human authorization to start.
- **E4:** the phase's scope, acceptance criteria and tests are written in `phases.md` and C3-approved. **Phase 0 exception:** the approved planning documents (Tasks 0.2 to 0.7) satisfy E4. `phases.md` is not created in Phase 0; it is created only during authorized Phase 1 setup, where the human-approved Phase 1 scope (section 3 and the section 7 checklist) is transcribed into it as the first act.
- **E5:** preflight is recorded: working-tree state known, uncommitted work described, no active writer claim, snapshot taken. **Phase 0 exception:** no repository exists or is authorized, so Git preflight does not apply. Document verification (section 6) replaces it.

**Exit**
- **X1:** every in-scope R-xx acceptance criterion has evidence of the right kind: an **automated test** for automatable criteria (marked A), or **documented verification evidence** for manual and documentation criteria (marked M). The evidence pack marks each criterion A or M (section 5).
- **X2:** the full automated suite passes (Q6). **Phase 0 exception:** there is no code, so document verification replaces tests. This Q6 interpretation is **human-approved (2026-10-27)** (section 6).
- **X3:** the phase's Q standards are met.
- **X4:** security controls are verified against designs the human has approved (Q5). **Phase 0 exception:** replaced by a document consistency check of the security requirements.
- **X5:** no open Critical defect in any phase. In Phases 1 to 5, an open High defect needs a human-recorded waiver naming a target phase. **Phase 6 has no waiver path** (section 5).
- **X6:** the handoff is current, the writer claim is released, governance files are untracked, and the shared directory still has exactly one working tree. **Phase 0 exception:** the Git-dependent parts are N/A.
- **X7:** independent verification is PASS.
- **X8:** the human sets `APPROVED`.

### 2.1 Not-applicable (N/A) rule (restricted)

A check or artifact may be recorded N/A **only when all of these hold**:
1. The artifact belongs to a **later phase**, or its timing was placed later by a recorded human decision (for example, OD-27 deferring remote creation).
2. The verifier has confirmed it does not exist yet, for example with `test -e <path>` or `git remote -v`.
3. The evidence pack records the artifact, the justification, and the phase from which the check becomes mandatory.

**An artifact that is mandatory for the current phase's exit cannot be excused because it is absent.** For Phase 1 that means the repository (when initialization is authorized), the project folder, `.gitignore`, `.env.example`, the AGENTS.md files, the test harness, the workspace root `package.json` and the single lockfile at `<folder>/package-lock.json`, and the approved-tranche dependency manifests. Their absence is a gate failure and not an N/A. Nothing from Phase 6 (screenshots, final README content, output files) is required earlier.

---

## 3. Phase-Gate Matrix

### 3.1 Scope and blockers

| Phase | R-xx in scope | Q standards | ODs that block start |
|---|---|---|---|
| 0 | R-01, R-34, R-35, R-36, R-38 | Q9 (documents only) | none |
| 1 | R-02, R-03, R-04, R-06, R-07, R-30, R-32, R-33, R-37, plus the harness for R-24, R-28, R-31 | Q5, Q6, Q9 | 09 (harness only), 14, 15 (strategy), 18 (original tranche), 20, 23, 27, 28, 29; OD-01, OD-22, OD-30 also approved. **Current issue:** OD-18 Express/Zod amendment needed; implementation directed, gate not approved |
| 2 | R-08, R-09, R-10, R-16 (auth), R-17, R-25 (hashing, roles), R-29 | Q2, Q5, Q6, Q9 | 10, 11, 12 |
| 3 | R-11, R-12, R-13, R-26, and R-28 for inventory models and availability only | Q4 (availability only), Q5, Q6, Q9 | 04, 07, 08, 13 (fields), 16, 17, 19, 25 |
| 4 | R-14, R-19, R-25 (own orders), R-26, R-27, R-28 (reserve, commit, release, concurrency) | Q3, Q4 (deduction, concurrency, recovery), Q5, Q6, Q9 | 05, 06, 09 (full), 24, 18 (razorpay tranche) |
| 5 | R-15, R-16 (dashboard), R-18, R-20 to R-23, R-25 (admin) | Q2 (admin), Q4, Q5, Q6, Q9 | 03, 13 (schedule), 18 (socket tranche), 28 (approved latency metrics) |
| 6 | all R-xx re-verified, R-05, R-30, R-31, R-35 | Q1, Q5, Q6, Q7, Q8, Q9 | none currently |

R-24 and R-31 apply in every phase.

### 3.2 Phase-specific entry and exit criteria

| Phase | Entry beyond E1 to E5 | Exit: measurable criteria and required tests |
|---|---|---|
| 0 | Project start | Document verification only (section 6). No code, no Git, no automated tests |
| 1 | The Phase 1 readiness checklist (section 7) | The test command runs a smoke test and a replica-set transaction test, both passing. The transaction test verifies that a transaction commits and that an aborted transaction rolls back with no change, using `MongoMemoryReplSet` with a transaction-capable storage engine (approved test setup, OD-30; the package remains subject to OD-18). Missing env → startup fails. A non-test Razorpay key → startup refused. Log-redaction test passes. `.env.example` has placeholders only. AGENTS.md files exist and are ignored. At least one claim-and-release cycle between two distinct `ELIGIBLE` agents is recorded (Q9). The workspace root `package.json` (workspaces `client`, `server`), the workspace manifests and the single lockfile `<folder>/package-lock.json` hold only approved-tranche dependencies, and V13 shows exactly one lockfile. Git checks follow section 3.3. The snapshot including SN6 is recorded |
| 2 | none | Tests pass for the R-08 to R-10, R-16 (auth), R-17 and R-29 criteria: expired or reused tokens rejected, role-escalation attempt rejected, non-admin gets a generic 401 at admin login, customer login rejects admin, `tokenVersion` invalidation, no account enumeration, tokens stored hashed, CSRF suite per the approved design, email captured by the stub |
| 3 | none | **Inventory models and availability only.** Ingredient fields (`stock`, `reserved`, `threshold`, `isActive`) validate: non-negative, `reserved` defaults to 0, and `reserved ≤ stock` holds on fixtures. Seed is idempotent. The catalogue's `inStock` flag is correct for fixtures where `reserved` is set directly, and inactive ingredients are not offered. Customers never see exact `stock` or `reserved`. Pricing returns integers only, and tampered totals are ignored. Exactly 5 bases and 5 sauces selectable, and the vegetable rule follows OD-25. **No reserve, commit, release or concurrency tests in this phase** |
| 4 | The unconfirmed Razorpay behavior is checked against current docs and recorded (payment fetch fields, receipt lookup, order closing). OD-24 has a human-approved design | Reserve, commit and release unit tests. **Concurrency tests:** N parallel orders against stock K → exactly K succeed and stock never goes negative. Idempotency, verification, recovery and sweeper suites from Task 0.3 §10. The concurrency and recovery suites pass 10 consecutive runs. A manual test-mode "Success" checkout is recorded with a screenshot (R-14) |
| 5 | none | Admin authorization matrix passes. Manual stock update rejects values below `reserved` or negative. The low-stock job sends one digest for the low-stock episode and, under the **still-unapproved OD-13 design**, re-arms after any availability recovery above threshold, including reservation release. Test the second drop and plausible retry/duplicate-send behavior. The `needsRefund` filter works. Latency meets the approved OD-28 thresholds in section 5 |
| 6 | Phases 1 to 5 `APPROVED` | See section 3.4. **Unresolved Critical defects or known High-severity security vulnerabilities make the gate fail, with no waiver** |

### 3.3 Phase 1 Git checks

Checks follow the restricted N/A rule (section 2.1). A "mandatory" check cannot be excused because its artifact is absent.

| Check | Phase 1 status | N/A allowed only when |
|---|---|---|
| V1 remote name | **Mandatory for Phase 1 exit** under approved R-02: the remote repository named `OIBSIP` must exist and be verifiable | **No N/A for Phase 1 by default.** Only an explicit later human approval changing R-02 timing under OD-27 permits rephasing; that decision is not made here |
| V2 folder location | Mandatory: the project folder is a Phase 1 deliverable | never |
| V3, V4 README rule check | Mandatory: `.gitignore` is a Phase 1 deliverable, and `check-ignore` works on a path that does not exist yet | never |
| V5a README trackable | N/A allowed: the README file is a Phase 6 deliverable (R-05) | If README is absent, V5a may be N/A until Phase 6; confirm its actual current state before recording an N/A |
| V5b, V5c, V5d index, committed, staged change | Mandatory once staging or a commit is authorized (OD-27). V5b shows the file is in the index (staged or tracked), V5d a pending staged change, V5c that it is committed | Only if no staging or commit is authorized; determine authorization and actual Git state during preflight |
| V6, V7, V8 ignore results | Mandatory: paths may be hypothetical. V7 and V8 use the workspace paths in Task 0.5 §4, including `client/node_modules` and `server/node_modules` | never |
| V9, V10, V11, V12 | Mandatory: the repository is a Phase 1 deliverable | never (if repository initialization was not authorized, Phase 1 cannot pass) |
| V13 lockfile check | Mandatory once a repository exists: exactly one lockfile, at `<folder>/package-lock.json`, tracked or untracked strays detected (V13a, V13c to V13g). V13b needs a commit | never, except V13b when no commit exists (the verifier confirms) |
| S1 secret filenames | Mandatory once a repository exists | never |
| S2 to S4 history scans | Mandatory from the first commit | No commit exists yet, which is confirmed by the verifier |

Screenshots, output files and final README content are Phase 6 deliverables and are not checked in Phase 1. **R-06/R-07 clarify dependency timing:** Phase 1 records the full official/handoff stack and verifies only the approved Phase 1 installation tranche; later-phase packages (including Razorpay, email/auth and realtime packages as applicable) are verified when introduced, with full-stack traceability at Phase 6. No extra dependency or OD-18 tranche is approved by this clarification.

### 3.4 Phase 6 final acceptance

- All 15 official checklist items have evidence (Q1): 8 user-side and 7 admin-side.
- The full suite passes, and a security review against Task 0.3 §8 is done.
- Production dependencies are checked with `npm audit --omit=dev`, with every high or critical finding fixed.
- The README setup instructions have been followed successfully (Q7), and screenshots are present and tracked (V5c).
- Q9 is verified one last time.
- The video, LinkedIn, peer evaluation and submission exclusions are recorded as outside this workflow, not waived (R-35).
- **Hard defect conditions apply (section 5.3).**

---

## 4. Verification and Evidence Checklist (every gate)

| # | Item | Evidence |
|---|---|---|
| 1 | Preflight and snapshot | `git status --short --branch`, `git worktree list` shows one entry, latest handoff read, snapshot SN1 to SN6 per section 1.1. Phase 0: document verification and a document hash list instead |
| 2 | Instruction access | Each agent used in the phase is `ELIGIBLE`, with the recorded test date and the echo test on file. OD-21 stays open until all five agents are tested and the human decides |
| 3 | Scope | Changed files all within the packet's allowed paths |
| 4 | Dependencies | Manifest diff matches the approved tranche (the dependency rule in Task 0.4 §3), across the root, `client` and `server` manifests and the single lockfile (V13) |
| 5 | Tests | Command, pass and fail counts, full suite |
| 6 | Acceptance mapping | R-xx → test name (A) or documented evidence reference (M) |
| 7 | Security | V6, V9, V11 and S1 to S4, from Phase 1 on |
| 8 | Decisions | No OD resolved silently; touched ODs listed |
| 9 | Defects | Defect log reviewed against section 5.2 |
| 10 | Governance | Writer claim released, handoff updated, backup date current, SN6 fingerprint recorded |
| 11 | Verification | Verifier name, PASS or FAIL, findings |
| 12 | Approval | Human's `APPROVED` with date and snapshot reference |
| 13 | N/A register | Every N/A claim lists the artifact, the justification, the phase it becomes mandatory, and the verifier's confirmation that it is absent. No Phase 1 mandatory artifact appears here |

---

## 5. Human-Approved Quality Metrics (OD-28, approved 2026-10-28)

### 5.1 Test coverage and acceptance evidence

A floor, not a goal. Traceability is the primary criterion.
- **Every R-xx acceptance criterion has verification evidence of the appropriate kind.**
  - **A (automatable):** an automated test that passes. Examples: R-08 to R-10, R-17, R-24, R-26, R-27, R-28, R-29.
  - **M (manual or documentation):** documented verification evidence, such as command output, a file and line reference, a screenshot, or a checked item recorded in the report. Examples: R-01 to R-05, R-33 (Git command output), R-34 to R-36, R-38, and the README and screenshot parts of R-05.
  - The final A or M classification of each criterion is set in `phases.md` and approved by the human.
  - Q6 requires all automated tests to pass and A criteria to have automated tests. It does not require inventing tests for M criteria.
- Every state-machine transition and every API error code has at least one automated test.
- Server overall: lines ≥ 75%, branches ≥ 65%.
- High-risk modules (auth, CSRF, checkout, orders, payments, inventory, sweeper): lines ≥ 90%, branches ≥ 80%.
- Client builder and summary components: lines ≥ 60%.
- Targets apply from the phase that introduces the module.

### 5.2 Real-time latency (R-15, R-23) and defect severity

Local-machine thresholds:

| Measure | OD-28 approved threshold |
|---|---|
| Admin change → customer dashboard, Socket.IO, single admin, up to 10 connected customers | p95 ≤ 2 s, max ≤ 5 s |
| State reconciled after a socket reconnect | ≤ 5 s |
| Polling fallback, or polling if OD-03 chooses it (5 s interval) | visible within 10 s |
| Expired reservation released after `expiresAt` | ≤ 2 sweeper cycles |

Defect severity (needed by Q8):

| Severity | Definition |
|---|---|
| Critical | Data loss or corruption; stock oversold or negative; payment accepted without verified capture; paid order left unconfirmed with stock mismatch; authentication bypass or role escalation; one customer reading another's order; secret exposure; the core flow (register → order → pay) is unusable |
| High | A mandatory feature fails on its primary path with no workaround; a security weakness exploitable with moderate effort (for example a missing CSRF check on a state-changing route); reservations stuck by a recovery failure |
| Medium | A feature is partly wrong but has a workaround; validation gaps with no security impact; flaky tests |
| Low | Cosmetic, wording, documentation |

### 5.3 Defect rules (implements OD-26 Q8)

- A security defect is rated at least as high as the severity table says.
- "Known" means recorded in the defect log (`.governance/reports/defects.md`, local), or reported by a review, a test, a verifier or `npm audit`.
- **Phases 1 to 5:** an open Critical blocks approval. An open High needs a recorded human waiver naming a target phase.
- **Waivers do not resolve defects.** Every waiver from Phases 1 to 5 expires at Phase 6.
- **Phase 6 final acceptance, hard conditions (OD-26 and OD-28):**
  1. Zero open Critical defects.
  2. Zero known High-severity security vulnerabilities.
  3. "Unresolved" means open, deferred, waived or accepted as risk. Only a fix verified by an independent agent resolves a defect.
  4. **No waiver is available for either condition at Phase 6.** Relaxing them would be a new human decision amending OD-26, not a waiver.
  5. The Phase 6 verifier independently re-checks the defect log, re-runs `npm audit --omit=dev`, and reviews the security controls against Task 0.3 §8 and every approved design.
  6. If any condition fails, the gate state is `CHANGES_REQUIRED` and the human cannot set `APPROVED`.
  7. Open non-security High defects at final acceptance need the human's explicit, recorded acceptance under the approved OD-28 severity policy; this does not waive the Critical/high-security hard conditions.

---

## 6. Phase 0 Completion Criteria (historical; Phase 0 gate APPROVED 2026-10-27)

**Document verification replaces automated tests, Git checks and the previous-gate requirement in Phase 0.**

1. Tasks 0.2 to 0.6 are human-approved planning deliverables (done and recorded).
2. Task 0.7 is human-approved (done, 2026-10-27).
3. Task 0.8 completes a cross-document consistency review, and the human reconciles any findings.
4. Historical Phase 0 checklist required an OD register. Later approved decisions and their exact scopes are now recorded in updated Task 0.6 §1; OD-02 remains withdrawn.
5. R-xx coverage: every requirement R-01 to R-38 appears in some phase scope and has an acceptance criterion.
6. OD-26's nine standards are mapped to phases (section 3.1).
7. The human confirms in writing that no application code or repository change happened in Phase 0. I cannot verify this.
8. **Q6 interpretation (HUMAN-APPROVED, 2026-10-27):** Q6 applies to phases that produce code. For Phase 0, document verification is the passing evidence, and no automated application tests are run.
9. The human **approved** the Phase 0 gate on 2026-10-27. The corresponding status must be reflected in `phases.md` during authorized Phase 1 governance setup; local `phases.md` contents have not been supplied for this review.

---

## 7. Phase 1 Readiness and Exit-Blocker Checklist (as of 2026-10-28)

The check marks below distinguish **human-approved decisions and observed setup** from **actual test/evidence completion**. Approval of a decision does not prove its implementation or approve the Phase 1 exit gate.

### 7.1 Decisions and authorization

- [x] Phase 0 gate and OD-26/Q6 Phase 0 interpretation human-approved (2026-10-27).
- [x] OD-01 (`WebDev-L3-PizzaDelivery`), OD-22 (README/screenshots and editor ignores), OD-30 (Node 24, npm, MongoDB 8.0.x, npm workspaces and replica-set harness baseline) human-approved.
- [x] OD-09 **Phase 1 test harness only** human-approved: `MongoMemoryReplSet` with `wiredTiger`, transaction commit and rollback tests. Full inventory atomicity remains undecided.
- [x] OD-14 private ZIP + SHA-256 backup; OD-15 root/module `AGENTS.md` load strategy; OD-20 governance structure; OD-23 single-writer protocol and the two added handoff fields human-approved.
- [x] OD-27 main-branch/authorized-commit policy; OD-28 severity, coverage and latency metrics; OD-29 gate procedure with empirical snapshot-validation caveat human-approved.
- [x] **Original** exact-version OD-18 Phase 1 tranche human-approved (see updated `PHASE1_APPROVALS_RECORD.md`), **but this does not approve Kiro's changed manifests or any replacement versions**.
- [x] Human subsequently instructed Kiro to continue **Phase 1 foundation implementation**. Phase 0 documentation-only stop instructions are historical.
- [x] Kiro's separate scratch eligibility test was recorded as `ELIGIBLE`. OD-21 remains open, and no other agent's eligibility is established here.

### 7.2 Observed setup and unresolved exit requirements

- [x] User's PowerShell reports Node.js `v24.22.2` and npm `11.19.1` (OD-30 runtime requirement satisfied).
- [x] User's `npm install` completed (363 packages added; 366 audited). **Installation success is not approval of installed versions.**
- [ ] **OD-18 security/compatibility amendment:** express `5.0.2` was not published (`ETARGET`); approved Zod 3.x is affected by the reported High production advisory. Obtain an explicit human decision on exact replacement versions and any compatibility work.
- [ ] Align all three manifests and the single root lockfile with the **amended** OD-18; confirm exactly one lockfile using V13 and review the pending install scripts rather than granting blanket approval.
- [ ] Resolve or formally disposition npm audit findings. User-reported audit: 8 total (3 moderate, 2 high, 3 critical), with one High production finding involving Zod. **No automatic `npm audit fix --force`.**
- [ ] Confirm the current `AGENTS.md`, `.governance/index.md`, `.governance/decisions.md`, `.governance/phases.md` and `.governance/handoffs/latest.md` actually match the newly synchronized records. The contents of those live files were not included in this upload.
- [ ] Confirm local Git branch, staged/unstaged/untracked paths, ignore rules, origin remote (`OIBSIP` due by Phase 1 exit), and backup manifest; these were not evidenced in the supplied logs.
- [ ] Complete the Phase 1 foundation implementation **within the approved scope only**: Express `/health`, env validation, safe logging, MongoDB connection, minimal React/Vite/Tailwind UI, and the test harness. No Pizza, Ingredient, Order, Admin, Auth, Razorpay, Socket.IO or cron feature implementations yet.
- [ ] Pass smoke and env-configuration tests, redaction tests, and both replica-set transaction **commit and rollback** tests. Collect the Phase 1 acceptance-criterion → evidence report; no passing tests are yet demonstrated in these uploaded materials.
- [ ] Empirically validate OD-29 snapshot commands SN1–SN6, then capture a consistent snapshot and verified governance backup.
- [ ] Obtain independent verification by a **different eligible** agent, or a human-recorded OD-29 attestation/waiver if needed. A second eligible agent is required for the normal two-agent route; do **not** infer Codex has been tested.
- [ ] Human explicitly sets the Phase 1 exit gate to `APPROVED` **only after** the applicable evidence and verification requirements are met.

**Not a Phase 1 start blocker:** OD-21's final five-agent test, or later-phase design decisions. **Still binding for exit:** approved OD-27 remote requirement unless human changes it, approved OD-29 verification, and approved OD-28/OD-26 security and quality criteria.

---

## 8. Current Decision Boundaries and Risks

- **OD-28:** Approved. Section 5 coverage floors, latency and severity definitions govern the appropriate phases; client builder and real-time thresholds apply only when those features are introduced.
- **OD-29:** Approved subject to empirically validating SN1–SN6 before treating their output as gate evidence. One writer; independent verifier; human-only gate approval.
- **OD-18:** Original exact-version Phase 1 tranche approved but install is not compliant until an explicit amendment resolves Express, Zod and any other demonstrated incompatibilities. Older caret-based manifests are superseded.
- **OD-09:** **Only its Phase 1 transaction-capable test harness is approved.** Inventory reservation design and full atomicity remain open for later phases.
- **OD-21:** Open; Kiro has an eligible scratch result. Agent instruction access must be verified individually before an agent works as implementer or verifier.
- **Phase 2–5 ODs:** OD-10/11/12 before authentication; OD-04/07/08/13(fields)/16/17/19/proposed 25 before inventory and builder schemas; proposed OD-24 and OD-05/06/full OD-09 before payment; OD-03 and OD-13 job timing before real-time/cron. No later-phase ADR is accepted.
- **Open Phase 4 risk:** external Razorpay request may outlive the gateway-creation lock. Fencing and ambiguous-request recovery remain undecided. This is not part of Phase 1 implementation.
- **Historical review conflicts settled by later decisions:** OD-20/23 approved, OD-27 approved, coverage tooling expressly included under original OD-18, Kiro scratch test separately authorized and performed. Do not re-open these approvals merely because the 2026-10-27 planning text described them as pending.

---

## 9. Consolidation Notes (superseded wording removed)

| Original item | Resolution |
|---|---|
| E1, E5, X2, X4, X6 had no Phase 0 handling | Phase 0 exceptions added. Q6 interpretation was marked as needing approval, and is now human-approved (2026-10-27) |
| E4 required `phases.md` with no Phase 0 exception | Approved planning documents satisfy Phase 0. `phases.md` is created only in authorized Phase 1 setup |
| Phase 3 included reserve, commit, release and concurrency tests | Phase 3 covers inventory models and availability only. Reserve, commit, release and concurrency testing moved to Phase 4 |
| Phase 1 Git checks all required | Conditional on artifact availability, then restricted so Phase 1 mandatory artifacts cannot be N/A merely for being absent |
| N/A allowed whenever an artifact was absent | Restricted: only later-phase artifacts, with evidence and justification |
| Snapshot used `git diff --stat` and `sha256sum` | Replaced by Git-only commands covering the index, staged and unstaged changes, deletions, untracked files and the backup-manifest fingerprint |
| Every R-xx criterion has a passing test | Replaced by A (automated test) or M (documented evidence) |
| No per-agent instruction verification | Agents must be `ELIGIBLE` before implementing or verifying. OD-21 stays open |
| Phase 6 defect waivers implied | Phase 6 has no waiver path for Critical defects or known High-severity security vulnerabilities |

---

## 10. Current Status and Handoff Rule (updated 2026-10-28)

**Phase 0:** Tasks 0.2–0.8 and the completion gate human-approved; the earlier planning-only instructions remain valid as **historical provenance**, not a prohibition on the separately authorized Phase 1 implementation.

**Phase 1:** Foundation work has been directed and dependency installation reported successful, but the **Phase 1 exit gate is NOT APPROVED**. The installed tree is not demonstrated to match OD-18. Express version availability, Zod security and other audit findings require the narrow amendment and verification specified in §7.2.

**Active handoff:** This planning document is **not** the live implementation handoff. The single-writer agent must use `.governance/handoffs/latest.md` and `.governance/index.md`, subject to verifying that those local files have been synchronized. The older `KIRO_HANDOFF.md` is a documentation-only historical transfer, not the current implementation assignment.

**Authoritative decisions:** Task 0.6 §1 and the updated `PHASE1_APPROVALS_RECORD.md` for the human-approved original dependency tranche and known blockers. Use later explicit human approval for any new OD-18 amendments. Preserve all prior code, lockfile and uncommitted changes; require explicit permission for dependency-version changes, commits, new architectural decisions and gate approval.

**Implementation boundaries:** Phase 1 foundation only. No new feature-phase models, routes or payment/auth/inventory implementations. Do not self-approve Phase 1 on the strength of dependency installation or a passing smoke test.
