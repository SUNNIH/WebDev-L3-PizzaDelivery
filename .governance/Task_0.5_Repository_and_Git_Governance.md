# Task 0.5: Repository and Git Governance (Consolidated — Current Status Update)

> **CURRENT CONTROL STATUS — 2026-10-28:** Tasks 0.2–0.8 and the Phase 0 completion gate were human-approved on 2026-10-27. Later approvals include OD-01, OD-09 (**Phase 1 MongoDB test-harness portion only**), OD-14, OD-15, OD-18 (**original exact-version Phase 1 dependency tranche; amendment outstanding**), OD-20, OD-22, OD-23, OD-27, OD-28, OD-29 and OD-30; OD-26 was approved on 2026-10-27. The human subsequently directed **Phase 1 foundation implementation**. `npm install` succeeded under Node.js 24, but the installed manifest/lockfile versions and audit findings have not been reconciled against the approved OD-18 tranche. **Phase 1 exit is NOT APPROVED.** OD-02 remains withdrawn, OD-21 and later-phase decisions remain open as applicable, and no draft ADR is accepted.

> **SOURCE-OF-TRUTH NOTE:** This file states the approved repository and Git policy. Current decision statuses and dependencies are governed by `Task_0.6_ADRs_and_Open_Decisions.md` §1 and `PHASE1_APPROVALS_RECORD.md`. The active task and writer claim live in `.governance/handoffs/latest.md`; `.governance/index.md` provides the load map. The original Phase 0 planning-only notices and `KIRO_HANDOFF.md` are **historical**, not instructions to stop the subsequently authorized Phase 1 work. Any new or changed high-risk governance authority still requires human C3 approval.

**Project:** OIBSIP Pizza Delivery — Web Development & Design, Level 3, Task 1  
**Origin:** Human-approved Phase 0 planning deliverable; **current project phase: Phase 1 foundation**  
**Document status:** Existing repository/Git design preserved; later human-approved policy/status synchronized on 2026-10-28.  
**Approval status:** OD-27 approves the single-branch, explicit-commit and Phase 1 remote policy. OD-23 approves shared-directory single-writer governance; OD-14 approves manual private backups; OD-22 and OD-30 approve the Git-ignore and workspace baselines. This update approves **no new architecture or package version**.

**Evidence boundary:** The user reported Node.js `v24.22.2`, npm `11.19.1`, and a completed `npm install` with 8 audit findings (one High on production dependencies). Those are **reported terminal results**, not a verification of the live Git tree, remote, installed code, agent handoff or Phase 1 tests. Requirements (`R-xx`) are in Task 0.2, architecture references in Task 0.3, governance change classes in Task 0.4. The approved project folder is `OIBSIP/WebDev-L3-PizzaDelivery/` (OD-01).


---

## 1. Repository Structure

```
OIBSIP/                          repo root; remote repo named exactly OIBSIP (R-02)
├─ .gitignore                    tracked (R-32)
└─ WebDev-L3-PizzaDelivery/      approved folder name (OD-01, 2026-10-28); pattern [Track]-[Level/Task]-[Project] (R-03)
   ├─ README.md                  mandatory tracked deliverable by Phase 6; trackable under the Phase 1 ignore policy (R-05, R-33)
   ├─ screenshots/               required and tracked by Phase 6 (R-05); name approved (OD-22)
   ├─ package.json               npm workspaces root, workspaces: client, server (OD-30); must match approved OD-18 tranche
   ├─ package-lock.json          single authoritative lockfile (OD-30); staging/committing requires authorization (OD-27)
   ├─ .nvmrc                     recommended tracked Node 24 LTS indicator (pin mechanism is not a new OD)
   ├─ node_modules/              ignored; npm may also create client/node_modules and server/node_modules
   ├─ client/  server/           tracked source; npm workspaces, each with its own package.json
   ├─ tests/                     tracked; project-level directory, not a workspace (root dev dependencies remain subject to OD-18)
   ├─ .env.example               tracked, placeholders only (R-30)
   ├─ .env                       ignored, local only
   ├─ AGENTS.md (+ client/ server/ tests/)   ignored
   └─ .governance/               ignored
```

- **OD-01 is human-approved (2026-10-28): `WebDev-L3-PizzaDelivery`**, consistent with the official `WebDev-L1-LandingPage` naming example. The name rests on the user-provided excerpts; the full official guide has not been checked.
- **Workspace root location (OD-30, approved 2026-10-28):** the npm workspace root `package.json` and the single `package-lock.json` live inside `WebDev-L3-PizzaDelivery/`, not at the repository root. Nothing named `package.json` or a lockfile belongs at `OIBSIP/` (check V13).
- **Dependency authority (OD-18):** the **original approved exact-version** Phase 1 tranche in `PHASE1_APPROVALS_RECORD.md` supersedes the older caret-range proposal and any agent-generated package manifests. `express@5.0.2` was reported unavailable and Zod 3.x has a reported production high-severity advisory; both require a **new human-approved** correction, not automatic agent substitution. `npm audit fix --force` is not approved. A successful `npm install` does not prove tranche compliance.
- `.gitignore` sits at the repo root so the anchored README exception resolves against the right directory.
- **One physical directory.** All five agents work in this single working tree (section 2). No second copy of the project exists.

---

## 2. Shared Working Directory Protocol (confirmed constraint)

**Confirmed shared-directory constraint; OD-23 APPROVED (2026-10-28):** Claude, Codex, Cursor, Antigravity and Kiro access one physical project directory on the same computer. The one-writer protocol below is now approved. It does not waive the approved roadmap or local-first policy.

**Structural rules**
- **No separate agent repositories, clones, worktrees or synchronization workflows** for the project. There is one working tree and one `.git`.
- **Only one agent modifies project files at a time.** Other sessions are read-only or closed. "Modify" includes source, tests, governance files, handoffs, lockfiles and formatter or auto-fix runs.
- **OD-27 approved Git policy:** work on branch `main` unless the human explicitly changes it; no agent-created branches/switches or automatic commits/pushes; commit only under a specifically authorized task or human command. The `origin` remote must target a reachable GitHub repository named exactly `OIBSIP` by Phase 1 exit unless its deadline is changed by the human.
- **AGENTS.md and governance files stay local-only** in that same directory (R-32). They are never copied between agents.
- **Instruction visibility across IDEs stays subject to verification** (section 7).

**Before any agent writes (read-only checks)**
```bash
git status --short --branch        # branch, modified, untracked, staged
git diff --stat; git diff --cached --stat
git stash list
git log -1 --oneline
test -e .git/index.lock && echo "index.lock present: stop and ask the human"
```
Then read `.governance/handoffs/latest.md`.

**Single-writer handoff**
1. **Claim:** if the handoff names another active writer that has not released, stop and ask the human. Otherwise record yourself as active writer (a routine C0 handoff update).
2. **Work** within the authorized packet only.
3. **Release:** before stopping, record the changed files, the working-tree state (staged, unstaged and untracked paths, uncommitted work left in place), and release the writer field.
4. **Rate-limit or crash:** agents are switched when usage limits hit, so a session may end without releasing. Only the human clears a stale claim. Another agent never assumes the previous one has stopped.
5. **Editor hygiene:** the outgoing IDE saves its buffers and stops editing before the next writer starts. The incoming IDE reloads from disk.

**Preserving existing uncommitted work**
- Never discard, overwrite or hide changes you did not make. Forbidden without explicit human approval: `git reset --hard`, `git clean` (any form), `git checkout -- <path>` and `git restore` on paths with changes, `git stash`, `git rebase`, `git commit --amend`, and branch switches with uncommitted changes.
- Uncommitted changes that are not described in the latest handoff and not part of your packet: stop and ask the human.
- Stage by explicit path only. Never use `git add -A` or `git add .`; tool-state folders and local files must not be swept in. Commit only when the packet or the human authorizes it.
- Do not remove a lock file such as `.git/index.lock` unless you have confirmed no Git process is running and the human agrees.

**Shared-runtime hygiene (for later phases):** one dev server, test run or database-writing process at a time, to avoid port and data collisions.

**Handoff amendment (OD-23 APPROVED):** Task 0.4 §7 now includes `Active writer:` and `Working tree at handoff:` (branch plus staged, unstaged and untracked summary). The current working writer must record both fields in `.governance/handoffs/latest.md`. Only the human may clear a stale writer claim.

---

## 3. Approved `.gitignore` design (OD-22, OD-30; verify actual file)

```gitignore
# Repo root. Last matching pattern wins, so exceptions must come after the rules they override.

# Dependencies, build output, coverage
node_modules/
dist/
build/
coverage/
.vite/
*.log

# Secrets (only placeholders may be committed)
.env
.env.*
!.env.example
*.pem
*.key

# OS noise
.DS_Store
Thumbs.db

# Editor state (OD-22, approved 2026-10-28)
.vscode/
.idea/

# Local-first governance (A§8, R-32)
AGENTS.md
AGENTS.override.md
AGENTS.local.md
.governance/

# Reserved, inactive. Agent-specific tool folders stay unignored until OD-21 compatibility testing (OD-22, approved 2026-10-28)
# Tool shims only if approved OD-15 strategy and empirical OD-21 testing justify them (local-only, R-36)
# .cursor/
# .kiro/
# .agents/

# Markdown is local-only by default (A§8)
*.md

# Mandatory exceptions (must follow *.md)
!/WebDev-L3-PizzaDelivery/README.md
```

Design notes:
- **Ignoring `*.md`, not directories.** Git cannot re-include a file whose parent directory is excluded. `*.md` ignores files only, so `<folder>/` stays open and the anchored negation works.
- **Anchored path.** The leading `/` ties the exception to `WebDev-L3-PizzaDelivery/README.md`. A root-only `!/README.md` would not work for this layout. The folder name is now approved (OD-01), so the placeholder is resolved. A typo in the name would leave the README ignored, and check V3 exposes it immediately.
- **Not ignored by design:** the lockfile, every `package.json`, tests and screenshots.
- **One project-level README (OD-22, approved):** any other mandatory Markdown file would need a new decision and its own exception.
- **Editor state:** `.vscode/` and `.idea/` are ignored (OD-22, approved).
- **Agent tool folders** (`.cursor/`, `.kiro/`, `.agents/`, and any others observed) remain unignored pending the broader OD-21 decision, so the ignore rules stay commented above. Kiro has passed its scratch visibility test, but the other agents have not been recorded as eligible; never assume tool folders are safe to stage. Explicit-path staging (section 2) prevents accidental commits. The live `.gitignore` contents must still be inspected; this example is not evidence that it was applied.

---

## 4. Verification Checklist (approved policy; live results not independently established)

Run from the **repository root (`OIBSIP/`)** in **Git Bash** or a compatible POSIX shell, not by pasting POSIX loops/`grep`/`find` into PowerShell. `<folder>` means `WebDev-L3-PizzaDelivery`. Verify the repository exists first; its current state, tracked paths, remote and commits have not been independently supplied. `git ls-files` shows index entries (tracked or staged, not proof of commit); `git diff --cached` shows staged changes; `git ls-tree HEAD` shows committed files (only after the first commit); `git ls-files -o --exclude-standard` shows untracked non-ignored files. These are **verification commands**, not authorization to stage, commit, switch branches or create a remote.

| # | Check | Expected |
|---|---|---|
| V1 | Remote name (R-02) | **Phase 1 exit check under approved OD-27:** `origin` exists, is reachable and points to remote repository named exactly `OIBSIP` (URL ends in `/OIBSIP` or `/OIBSIP.git`). No deferral unless the human subsequently authorizes a timing change. Phase 1 is authorized, but remote creation and Git writes still require scoped human instructions as applicable. |
| V2 | Project folder location (R-03) | folder exists directly under the repo root; name has the three-segment shape; tracked files exist beneath it; anything outside it is listed for human review, not failed |
| V3 | README not ignored (R-33) | exit `1` |
| V4 | Inspect applicable rules | shows the `!/<folder>/README.md` line (inspection only; a matching negation can make this exit 0) |
| V5a | README trackable (pre-staging) | dry run prints `add '<folder>/README.md'` |
| V5b | README in the index: staged or already tracked (after authorized `git add`) | exit `0` |
| V5c | README committed (after authorized commit) | path printed |
| V5d | README has a staged change (after `git add`, before commit) | path printed |
| V6 | Governance ignored | `0` for each path |
| V7 | Deliverables not ignored | `1` for each path |
| V8 | Secrets and build output ignored | `0` for each path |
| V9 | No tracked-but-ignored files | no output |
| V10 | Tracked Markdown is only the README plus human-approved exceptions | expected list only |
| V11 | No governance file tracked | no output |
| V12 | Untracked files reviewed (tool-state folders and the like) | listed for the human; nothing staged implicitly |
| V13 | Exactly one lockfile, at the workspace root `<folder>/package-lock.json`, and no stray root-level manifest. Distinguishes committed, index (tracked or staged), staged-change and untracked states | see the commands below |

```bash
cd "$(git rev-parse --show-toplevel)"

# V1
git remote get-url origin
# then verify the remote is actually reachable:
git ls-remote --exit-code origin >/dev/null 2>&1 && echo "Remote reachable" || echo "Remote not reachable"

# V2 (name shape is syntactic only; the human confirms the name against the guide)
test -d "WebDev-L3-PizzaDelivery" && echo present
printf '%s\n' "WebDev-L3-PizzaDelivery" | grep -E '^[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+$'
git ls-files -- "WebDev-L3-PizzaDelivery/" | head -n 1        # non-empty once files are staged
git ls-files | grep -v -e '^WebDev-L3-PizzaDelivery/'         # informational: .gitignore plus anything else legitimate

# V3, V4  (--no-index evaluates the rules even for tracked paths)
git check-ignore --no-index -q -- "WebDev-L3-PizzaDelivery/README.md"; echo $?
git check-ignore --no-index -v -- "WebDev-L3-PizzaDelivery/README.md"

# V5a  prints nothing if the README is already tracked and unmodified (inconclusive then; rely on V3)
git add -n -- "WebDev-L3-PizzaDelivery/README.md"
# V5b  only after the human authorizes staging; succeeds for staged OR already-tracked files (index), not proof of a commit
git ls-files --error-unmatch -- "WebDev-L3-PizzaDelivery/README.md"
# V5d  staged change only (empty if unchanged since HEAD)
git diff --cached --name-only -- "WebDev-L3-PizzaDelivery/README.md"
# V5c  only after the human authorizes a commit
git ls-tree -r --name-only HEAD -- "WebDev-L3-PizzaDelivery/README.md"

# V6 (expect 0), V7 (expect 1), V8 (expect 0): one path per call, because -q accepts a single pathname
for p in "WebDev-L3-PizzaDelivery/AGENTS.md" "WebDev-L3-PizzaDelivery/server/AGENTS.md" "WebDev-L3-PizzaDelivery/.governance/index.md"; do
  git check-ignore --no-index -q -- "$p"; echo "$p -> $?"; done
# V7 paths (expect 1, not ignored): WebDev-L3-PizzaDelivery/package.json, WebDev-L3-PizzaDelivery/package-lock.json, WebDev-L3-PizzaDelivery/.nvmrc, WebDev-L3-PizzaDelivery/.env.example,
#   WebDev-L3-PizzaDelivery/client/package.json, WebDev-L3-PizzaDelivery/server/package.json, a test file, a screenshot
# V8 paths (expect 0, ignored): WebDev-L3-PizzaDelivery/.env, WebDev-L3-PizzaDelivery/server/.env, WebDev-L3-PizzaDelivery/node_modules/x, WebDev-L3-PizzaDelivery/client/node_modules/x,
#   WebDev-L3-PizzaDelivery/server/node_modules/x, WebDev-L3-PizzaDelivery/.vscode/x, WebDev-L3-PizzaDelivery/.idea/x, and dist and coverage paths.
#   npm does not necessarily put every dependency in the root node_modules, so nested paths are checked too.

# V9
git ls-files -ci --exclude-standard
# V10
git ls-files '*.md'
# V11
git ls-files | grep -E '(^|/)AGENTS(\.override|\.local)?\.md$|(^|/)\.governance/'
# V12
git status --short | grep '^??'

# V13  lockfiles. Run in Git Bash or another POSIX shell (the find command needs one).
LOCK='(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$'
L="WebDev-L3-PizzaDelivery/package-lock.json"
# V13a  the root lockfile is not ignored (expect 1)
git check-ignore --no-index -q -- "$L"; echo $?
# V13b  committed lockfiles (skip if there are no commits): expect only $L
git ls-tree -r --name-only HEAD | grep -E "$LOCK"
# V13c  index lockfiles, tracked or staged: expect only $L
git ls-files | grep -E "$LOCK"
# V13d  staged lockfile changes: informational; only $L may appear
git diff --cached --name-status | grep -E "$LOCK"
# V13e  untracked, non-ignored lockfiles: expect no output
git ls-files -o --exclude-standard | grep -E "$LOCK"
# V13f  lockfiles on disk outside node_modules, tracked or not: expect only $L
find . -name node_modules -prune -o -type f \( -name package-lock.json -o -name npm-shrinkwrap.json -o -name yarn.lock -o -name pnpm-lock.yaml -o -name 'bun.lock*' \) -print
# V13g  no package.json at the repository root, tracked or untracked: expect no output
git ls-files | grep -E '^package\.json$'
git ls-files -o --exclude-standard | grep -E '^package\.json$'
```

- **Why `--no-index`:** without it, `check-ignore` does not report tracked paths as ignored, so V6 to V8 could wrongly pass for a tracked governance file or `.env`.
- **V5a is not proof of tracking.** `git add -n` changes nothing. V5b shows the file is in the index (staged or already tracked), V5d shows a pending staged change, and only V5c (HEAD) shows it is committed. R-05's "Git tracks" is satisfied by V5b and V5c together.
- **V13 replaces the earlier lockfile expectation** (`server/package-lock.json`). There is exactly one authoritative lockfile, at the workspace root. The user reports an npm installation succeeded, but V13 has not been evidenced here, and the installed dependency versions still require OD-18 reconciliation.

---

## 5. Secrets and Previously Tracked Files

**Secrets**
- Only `.env.example` with placeholders is committed. Task 0.3 already refuses to start with a non-test Razorpay key.
- Never paste secrets into task packets, reports, handoffs or agent chats. Never include `.env` in the governance backup.
- Candidate for the root kernel: agents must not read or echo `.env`. The kernel is a C3 document, so this needs human approval.

**Files already tracked.** Adding an ignore rule does not untrack anything. If a repository exists:
1. Inventory with `git ls-files -ci --exclude-standard`.
2. Copy every listed path to a safe location first.
3. Get the human's approval per path (A§8: no untracking without checking).
4. Dry-run with `git rm --cached -n -- <path>`, then run `git rm --cached -- <path>` (`-r` for directories). This keeps the working copy. Never use plain `git rm`.
5. Commit, then confirm the file still exists locally, shows as ignored, and V9 is empty.

In the shared directory, step 4 changes the index for every agent at once, so it runs only as a single-writer task with a recorded handoff.

**Secret scanning.** `git log -S` counts changes in occurrences of a literal string and is not a regex scanner. Use these git-native checks. They list commit ids and paths only, never matched values, so a secret is not echoed into a report or agent log.

```bash
PATTERN='rzp_(live|test)_[A-Za-z0-9]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'

# S1  secret-like filenames tracked now (expect no output)
git ls-files | grep -E '(^|/)\.env(\..*)?$|\.(pem|key)$' | grep -v '\.env\.example$'
# S2  content in the staged index, file names only
git grep --cached -lIE "$PATTERN"
# S3  history: -G takes a regex over added or removed lines; list commit ids only
git log --all -G "$PATTERN" --format='%h'
# S4  secret-like filenames anywhere in history
git log --all --name-only --format= | sort -u | grep -E '(^|/)\.env(\..*)?$|\.(pem|key)$' | grep -v '\.env\.example$'
```

- **Placeholders** in `.env.example` must not match the pattern, for example `RAZORPAY_KEY_ID=<set-locally>`.
- **Limits:** best-effort. It misses unknown token formats, encoded values, unreachable objects and reflog-only commits. A clean result is not proof.
- **Hits:** inspect the named commit by hand, treat the secret as compromised and rotate it.
- **History:** untracking does not erase history. If a secret was ever committed or pushed, rotate it. The Razorpay keys, SMTP credentials, JWT secret and admin credentials are all in scope. A history rewrite is a separate decision needing explicit human approval.
- **Dedicated scanners** such as gitleaks or trufflehog would be extra tooling. That needs explicit human approval under the dependency rule in Task 0.4 §3, and none is adopted here.

---

## 6. Governance Backup and Restore (OD-14 APPROVED)

- **Backup set:** every root/module `AGENTS.md` and the complete `.governance/` folder, **never** `.env`, keys or credentials. Enumerate ignored paths as needed; verify the precise backup list before archiving.
- **Approved method (a):** **manual private ZIP with a SHA-256 manifest**, stored in a human-controlled private location. Record the last backup date in `.governance/index.md`.
- **Approved triggers:** at every gate approval and at the end of every governance-changing session. Perform backup only when no agent holds the active writer claim.
- **Not approved:** option (b), a separate Git backup repository. It remains a historical alternative and must not be used without new human authorization. Do not treat a backup as an agent synchronization workflow.
- **Restore:**
  1. Copy files back to the same relative paths.
  2. Verify the manifest hashes.
  3. Confirm V6 and V9.
  4. Run the instruction-echo test per agent.
- **Never use** `git clean -x` or `-fdx`; they delete ignored files. A fresh clone, worktree or CI checkout will not contain governance files. Agents do not create these for the project (section 2).
- **Current status:** option (a) is human-approved under OD-14. Actual private ZIP/manifest existence, restore integrity and last-backup date remain to be verified locally; this document does not certify that a backup was made.

---

## 7. Cross-IDE Access to Ignored Files (OD-15, OD-21)

**Current evidence:** Kiro passed the six-case scratch instruction/claim-release check on 2026-10-28 and was recorded `ELIGIBLE` in the Phase 1 approvals record. Eligibility of Codex, Claude, Cursor and Antigravity is **not established by the supplied records**, and OD-21 remains OPEN. Cursor ignored-file visibility and other agents' behavior remain unverified. Shared physical files do not guarantee identical IDE instruction discovery.

**OD-15 strategy is APPROVED; empirical access is a separate requirement.** Step B has been completed for Kiro only under scoped scratch authorization. OD-21 stays open; test each other agent before assigning it implementation or independent verification. Phase 1 may proceed with eligible Kiro as separately authorized, but the OD-29 independent verification and Phase 1 gate must still meet the eligible-verifier requirement or an expressly recorded human waiver.

| Step | What | Who authorizes | Needs a repository? |
|---|---|---|---|
| A. Strategy | **APPROVED OD-15:** one AGENTS.md source of truth, root plus client/server/tests, shims only if empirically justified | Human (approved 2026-10-28) | No |
| B. Empirical test | **KIRO DONE; other agents unverified.** Run the protocol in a disposable scratch directory outside OIBSIP before each other agent is used | Human, separate scoped authorization | Scratch only, never the project |
| C. Decision | OD-21 remains **OPEN** pending the human's broader five-agent compatibility decision; record results, do not auto-close | Human | No |
| D. In-situ confirmation | Repeat the real-project echo check for agents being relied on; required Phase 1 exit evidence | Authorized Phase 1, OD-29 procedures | Yes |

**Order now:** OD-15 strategy is approved; Kiro completed its scratch check; its in-project confirmation and independent verification remain pending. Do not treat Phase 1 as blocked solely because Codex has not been tested for implementation; **do not assign independent verification to an untested agent**. Step D is an exit check, not a new implementation-start blocker. No result for another agent may be inferred from Kiro's test.

**Scratch test protocol (B)**
- The scratch directory lives outside OIBSIP, holds only canary text (no secrets, no project content), and is deleted afterwards. If it needs a throwaway `git init`, that is covered by the Step B authorization. It is a shared test fixture for all five agents, not a project clone and not a per-agent repository.
- Cases: (1) root AGENTS.md not ignored, as a baseline; (2) root ignored; (3) nested AGENTS.md not ignored; (4) nested ignored; (5) an ignored `.governance/` file read through an explicit `Load:` line.
- Each agent (Claude, Codex, Cursor, Antigravity, Kiro) gets a fresh session. Launch from the scratch root, and for Codex also from the nested directory, since its discovery is startup-based. One agent at a time, as in section 2.
- Ask each agent to list the instruction files it loaded and to quote the canary. Record whether it was loaded, and by what mechanism.
- Results go into the human's local notes now, and into `decisions.md` once that file exists.

**Candidates if Cursor fails (all untested, none adopted)**
- **Explicit read in the packet's `Load:` line.** Cursor documents that the terminal and MCP tools used by Agent are not blocked by the ignore file, so a terminal read may work where file tools do not.
- **Paste the packet into the chat.** This needs no policy change.
- **`.git/info/exclude` instead of `.gitignore`.** This is not assumed to fix visibility, and it alters the approved policy mechanism, so it needs human approval.
- **A Cursor-specific local shim.** This only helps if Cursor can see it while Git still ignores it, which the same mechanism may contradict.
- **Committing AGENTS.md.** This is a policy exception, not recommended, and needs explicit human approval.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| `*.md` hides a Markdown file that is actually mandatory | V10 audit, plus OD-22 |
| Placeholder left in the README exception | V3 fails immediately |
| Rule added but file already tracked | V9 |
| A tracked file matching an ignore rule evades a plain `check-ignore` | Use `--no-index` (V3 to V8), and run V9 |
| Secrets in history | Rotate; history rewrite only with approval |
| Scanner output leaks a secret into logs or reports | S1 to S4 print commit ids and paths only |
| Ignored governance files lost to `git clean -x`, a new clone or worktree | Forbid those commands; backup per section 6 |
| Cursor hides ignored files | Step B test, then OD-21 |
| Backup repo nested inside OIBSIP | Keep it outside the working tree |
| `README.md` casing on case-insensitive filesystems | Use that exact casing; V3 and V5 verify |
| Two agents or IDEs write at once in the shared directory | Single-writer claim in the handoff, human clears stale claims (section 2) |
| Stale IDE buffers or auto-save overwrite another agent's edits | Outgoing IDE saves and stops; incoming IDE reloads from disk |
| Agent discards or hides uncommitted work (`reset --hard`, `clean`, `stash`) | Forbidden without human approval; stop and ask when changes are unexplained |
| Concurrent Git commands collide (`index.lock`) | One writer at a time; never delete a lock without confirming no Git process |
| `git add -A` sweeps in tool-state folders or local files | Explicit-path staging only; V12 review |
| Stale writer claim after a rate-limit or crash | Only the human clears it |
| `npm install` run from the wrong directory creates a stray `package.json` or lockfile at the repo root, or in `client/` or `server/` | Install only from `<folder>`, as a single-writer task; V13 detects tracked and untracked strays |
| npm nests some dependencies in `client/node_modules` or `server/node_modules` | The `node_modules/` rule matches at any depth; V8 checks the nested paths |

---

## 9. Decision Status (current as of 2026-10-28)

**Human-approved decisions:** OD-01, OD-09 (**P1 harness only**), OD-14, OD-15, OD-18 (**original exact-version tranche, correction pending**), OD-20, OD-22, OD-23, OD-26, OD-27, OD-28, OD-29 and OD-30. OD-02 withdrawn; OD-21 and later-phase decisions remain open; **no ADR accepted**. The current decision register is Task 0.6 §1; `PHASE1_APPROVALS_RECORD.md` is the approved-tranche reference. Approval of a planning deliverable does not by itself approve any OD or Phase 1 exit gate.

**Git/governance decisions affecting Phase 1**

| OD | Decision | Status |
|---|---|---|
| OD-01 | Folder name; also fixes the `.gitignore` exception line | **Human-approved 2026-10-28: `WebDev-L3-PizzaDelivery`** |
| OD-14 | Private manual ZIP of ignored governance/instructions with SHA-256 manifest; approved triggers | **APPROVED 2026-10-28** |
| OD-15 | One root/module `AGENTS.md` source of truth with explicit `Load:` lines and test-dependent shims | **APPROVED 2026-10-28**; OD-21 remains open |
| OD-20 | Authority precedence, C0–C3 classes, eight-step workflow and phase gates | **APPROVED 2026-10-28** |
| OD-21 | Broader ignored-file/AGENTS compatibility across all five agents | **OPEN**; Kiro scratch `ELIGIBLE` only |
| OD-22 | Whether any other Markdown file is a mandatory deliverable; the screenshots directory name; whether tool-state folders are ignored | **Human-approved 2026-10-28:** one project-level README, `screenshots/`, ignore `.vscode/` and `.idea/`, agent-specific tool folders stay unignored until OD-21 testing, local-first policy preserved |
| OD-23 | Shared working tree, one writer, handoff `Active writer` and `Working tree at handoff` fields | **APPROVED 2026-10-28** |
| OD-27 | One `main` branch, human-authorized commits, no destructive Git operations; `OIBSIP` remote due by Phase 1 exit | **APPROVED 2026-10-28**; remote not independently verified |
| OD-28 | Coverage, latency and severity definitions in Task 0.7 | **APPROVED 2026-10-28** |
| OD-29 | Gate procedure, snapshots SN1–SN6, eligibility and independent verification | **APPROVED 2026-10-28**; snapshot commands need empirical validation |
| OD-18 | Phase 1 exact-version dependencies | **Original tranche APPROVED**; Express/Zod security/compatibility amendment still requires human approval |

- **Scratch tests:** Kiro has passed and was recorded `ELIGIBLE`. Other agents need their own scoped test before they implement or verify; OD-21 remains open.
- **Carried open:** OD-03–08, OD-10–13, OD-16–17, OD-19, OD-21, and proposed OD-24/25 as applicable. OD-02 stays withdrawn.
- **Still awaiting approval from Task 0.3:** the guarded `expired → received` edge (OD-06), the CSRF mechanism (OD-10), and OD-19.
- **Unresolved risk, to be closed before Phase 4 (OD-05, OD-09):** the gateway-creation lock may expire before its external Razorpay request ends. Fencing, lock ownership and recovery for ambiguous gateway requests are not designed, and nothing in this document resolves them.

---

## 10. Consolidation Notes (superseded wording removed)

| Original item | Resolution |
|---|---|
| Plain `git check-ignore -q` for V3 to V8 | Replaced by `--no-index -q` so tracked files are evaluated; path loop for single-pathname limit |
| V5 as one combined check | Split into V5a (trackable), V5b (staged), V5c (committed) |
| V12 history scan using `git log -S` | Replaced by S1 to S4 (`-G`, `git grep --cached`, filename checks) that print no values |
| V2 asserting only the project folder at top level | Replaced by a location and name-shape check; other files are listed for review, not failed |
| OD-15/OD-21 testing tied to Phase 1 authorization | Replaced by Steps A to D; testing runs in a scratch directory before Phase 1 |
| Task 0.6 handoff described as undefined | Superseded: Task 0.6 is ADRs and Open Decisions |
| Implicit single-user working-tree assumption | Replaced by section 2 (shared directory, single writer) |
| `<folder>` placeholder and `server/package-lock.json` in V7 | Superseded by the approved folder name and workspace-root lockfile (OD-01, OD-30, 2026-10-28); V13 added; V5b relabeled and V5d added to separate index, staged and committed states |

---

## 11. Current Application and Historical Task 0.6 Handoff

**Current state (2026-10-28):** Task 0.5 and Task 0.6 were human-approved as planning deliverables; OD-27 now separately approves the relevant Git policy. **Phase 1 foundation work is directed and in progress, but its exit gate is NOT APPROVED.** No accepted ADR is established. This document does not itself authorize staging, committing, pushing, or an OD-18 package substitution. The former Task 0.6 handoff is historical.

**Inputs:** the source packet, `Task_0.2_Requirements_Baseline.md`, `Task_0.3_System_Architecture.md`, `Task_0.4_Multi_Agent_Governance.md`, this document, and the Project Instructions.

**Current references and carry-forward:**
- **Live:** `.governance/index.md`, `.governance/decisions.md`, `.governance/phases.md`, `.governance/handoffs/latest.md` (verify each exists and agrees with the approved records; no status is implied by a missing file).
- **Approvals:** Task 0.6 §1 is the consolidated register; `PHASE1_APPROVALS_RECORD.md` governs OD-18 original exact versions and the pending corrective amendment.
- **Git and project scope:** OD-23 single writer; OD-27 one `main` branch, explicit commits, `OIBSIP` remote needed at Phase 1 exit; OD-30 root workspace lockfile; OD-14 private backup. The current Git state, lockfile correctness and remote still require real verification.
- **Open issues:** security/version compliance in dependencies (including the Express ETARGET and the reported high-severity Zod finding), OD-21 broader agent eligibility, OD-29 empirical snapshot check and independent Phase 1 gate verification. Later-phase decisions, including the OD-06 edge, OD-10 CSRF design and OD-19 currency, remain unresolved by these Phase 1 corrections.

**Constraints:** continue only the separately authorized Phase 1 task packet; no unapproved package additions/upgrades, no unapproved Git writes, no destructive commands, no concurrent writers, no later-phase app models or features, and no self-approved gate. Changes to an authoritative governance file are C3 and need explicit human direction. The current handoff, not the old `KIRO_HANDOFF.md`, governs the next task.
