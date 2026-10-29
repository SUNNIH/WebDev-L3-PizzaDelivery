# Client Workspace — AGENTS.md

**Scope:** `client/` only. **Parent:** `../AGENTS.md` (project root).  
**Project state:** Phase 1 foundation in progress; Phase 1 exit gate **NOT APPROVED**.

## Required instruction loading

1. Read `../AGENTS.md` and this `client/AGENTS.md`; report the filenames actually loaded.
2. From the project root, read `.governance/index.md`, `.governance/decisions.md`, and `.governance/handoffs/latest.md`.
3. Read the **currently human-authorized task packet** and its `Load:` references. For client/API boundaries, consult the relevant Task 0.3 sections; for Phase 1 acceptance and OD-28 metrics, consult Task 0.7; for dependency approvals, consult the current `.governance/PHASE1_APPROVALS_RECORD.md` and any subsequently approved OD-18 amendments.
4. Check Git status, the active writer claim, task scope, change classification (C0–C3), and required ODs **before edits**. Stop on conflicts, missing approval, or unexplained changes. Historical handoffs and installed package versions are not evidence of approval.

## Phase 1 client scope — foundation only

- Create or maintain a minimal React + Vite + Tailwind application shell that starts successfully and provides a simple, accessible foundation for later phases.
- Configure the approved client build and styling setup; add only the minimal entry point, app component, and supporting configuration needed for Phase 1.
- Write and run relevant client smoke/component tests with the **approved** testing dependencies, within the current task packet.
- Keep client configuration and public environment settings free of secrets. Browser-visible environment variables must never contain server credentials or payment secrets.
- Follow established project file placement and the single authoritative workspace root lockfile.

**Do not implement in Phase 1:** customer/admin login or signup; email verification; pizza catalogue/builder; pricing; checkout/payments; orders; inventory; admin dashboards; real-time status; notifications. These belong to later phases and need their own authorization.

## Dependency and contract restrictions

- The original **exact-version** OD-18 Phase 1 specification is in `.governance/PHASE1_APPROVALS_RECORD.md`. Historical caret-based proposals are superseded. Refer there for the approved React, Vite, Tailwind, React Testing Library and other client dependency versions; **do not treat the current manifests as authority**.
- A Phase 1 **OD-18 corrective amendment remains pending**. Do not add, replace, pin, upgrade or remove npm packages, change manifest/lockfile dependency versions, approve installation scripts, or run `npm audit fix --force` without the necessary human authorization.
- **C1:** implement/test/refactor within the authorized client task without changing shared contracts.
- **C2/C3:** changes to API contracts, cross-module behavior, security designs, new dependencies, governance/AGENTS.md or open decisions require the applicable human approval. Do not change server code or its environment definitions under a client-only packet.
- Use server-owned APIs and contracts as approved; do not invent backend routes or treat unaccepted architecture recommendations as implemented features.

## Quality, Git and handoff

- Prioritize clear accessible markup, responsive layout, explicit loading/error handling when applicable, and component testability. Do not invent additional frameworks or tools.
- Apply **OD-28** thresholds from Task 0.7: server coverage is **75% lines / 65% branches**; high-risk paths **90% / 80%** when present; the **60% client pizza-builder target applies when the builder is implemented in a later phase**, not in Phase 1.
- Follow OD-23: one active writer; preserve existing and uncommitted work. Follow OD-27: no unauthorized commit/push, branch switch, stash, destructive reset/clean/restore, clone/worktree, or bulk staging.
- Report changed paths, tests and outcomes, acceptance-criterion evidence, limitations and unverified items. Update the live handoff within authorized reporting scope and release the writer claim. Passing tests never approves a gate; only the human does.

**Governance edits, including this file, are C3 and require explicit human approval before adoption.**
