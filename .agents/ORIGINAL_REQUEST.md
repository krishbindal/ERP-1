# Original User Request

## Initial Request — 2026-09-04T10:51:18Z

# SCHOOLOS — FRONTEND HARDENING MASTER ORCHESTRATION
MULTI-AGENT IMPLEMENTATION + INTEGRATION + CERTIFICATION

Repository:
krishbindal/ERP-1

Working directory:
c:\Users\krish\Desktop\ERP 1

Integrity mode:
development

============================================================
CURRENT BASELINE
============================================================

Expected master baseline:
efcbfe1c934d55b300a4bb3dab6342ad94439d84

FIRST ACTION:
Verify actual origin/master HEAD before doing anything.

The previously attempted single-agent Frontend Hardening Slice 01
made ZERO successful code changes.

KNOWN PRE-EXISTING WORKING-TREE STATE:

- apps/web/src/components/layout/Sidebar.tsx
  modified from an earlier logout-button fix
- package-lock.json
  modified from an earlier npm install
- several untracked scratch/debug/log files exist

These are PRE-EXISTING USER WORK.

DO NOT:

- reset --hard
- git clean
- delete untracked files
- overwrite Sidebar.tsx blindly
- overwrite package-lock.json blindly
- stash/drop existing work
- include pre-existing work in specialist commits unless explicitly required

Before creating branches/worktrees, record:

- current branch
- HEAD SHA
- origin/master SHA
- git status
- modified tracked files
- untracked files

Create a baseline report preserving this exact state.

============================================================
MISSION
============================================================

Execute the COMPLETE FRONTEND HARDENING PROGRAM identified by
the frontend audit using multiple specialized agents.

Goal:

Bring the SchoolOS frontend to a certifiable hardened state
BEFORE Phase 6 Assessments implementation.

The program must improve:

- design system
- shared UI primitives
- application shell
- navigation
- authentication UX
- authorization UX
- forms
- feedback states
- data tables
- search/filter/pagination
- loading/error/empty states
- scheduling UX
- responsive behavior
- accessibility
- performance
- bulk/onboarding UX
- frontend testing
- visual consistency

Every change must be:

- grounded in actual repository behavior
- aligned with the Master Specification
- consistent with current architecture
- minimally invasive
- backward compatible unless a documented migration is required
- independently validated
- auditable
- reversible

============================================================
STRICT SCOPE
============================================================

DO NOT implement Phase 6 product functionality.

DO NOT implement:

- Exams
- Marks entry business logic
- Grading engine
- Results
- Report-card business logic
- Assessment workflows

Generic reusable frontend infrastructure required by future
Phase 6 work MAY be established, including:

- data grids
- table primitives
- form primitives
- accessible dialogs/drawers
- bulk upload infrastructure
- feedback components
- reusable validation infrastructure

But no Phase 6 business logic may be implemented.

DO NOT modify:

- database schema
- RLS policies
- Identifier Engine
- authentication security foundations
- backend authorization
- unrelated backend business logic

Do not use frontend hardening as an excuse for broad cleanup.

============================================================
SOURCE OF TRUTH
============================================================

Before implementation:

1. Verify origin/master.
2. Inspect repository state.
3. Read the frontend audit.
4. Read relevant Master Specification sections.
5. Inspect current implementation.
6. Verify audit findings independently.
7. Separate:

   - confirmed defects
   - partially confirmed findings
   - recommendations
   - Stitch visual suggestions
   - performance targets requiring measurement

The audit is evidence, not automatic truth.

Do not blindly implement every recommendation.

Proposed libraries are NOT mandatory.

Evaluate the existing stack before adding dependencies.

============================================================
MULTI-AGENT ARCHITECTURE
============================================================

Use isolated branches/worktrees.

Every implementation agent MUST have:

- dedicated branch/worktree
- explicit ownership
- explicit file boundary
- dependency list
- validation requirements
- commit requirement

No two implementation agents may concurrently modify
the same high-contention files.

The integration agent is the ONLY agent allowed to merge
specialist branches into the integration branch.

If an agent discovers cross-boundary work:

1. stop
2. report the dependency
3. coordinator assigns ownership
4. continue only after ownership is resolved

============================================================
HIGH-CONTENTION FILES
============================================================

These require especially strict ownership:

- apps/web/src/app/globals.css
- apps/web/src/app/layout.tsx
- apps/web/src/components/layout/*
- package.json
- package-lock.json
- shared UI primitive directory
- Playwright configuration
- global theme/configuration

Do not allow multiple agents to independently modify these.

============================================================
AGENT MAP
============================================================

AGENT A — DESIGN SYSTEM FOUNDATION

Workstream:
FRONTEND-01

Own:

- semantic design tokens
- typography
- theme foundation
- global visual language

Primary ownership:

- globals.css
- font/theme configuration
- design-system configuration

Must establish:

- background
- foreground
- surface
- muted
- border
- input
- primary
- secondary
- success
- warning
- destructive
- focus ring

Also establish:

- typography hierarchy
- spacing conventions
- radius conventions
- theme behavior

Do not redesign feature pages.


AGENT B — SHARED UI PRIMITIVES

Workstream:
FRONTEND-03

Own:

apps/web/src/components/ui/

Evaluate and implement as justified:

- Button
- Input
- Select
- Badge
- Card
- Tabs
- Dialog
- ConfirmDialog
- Drawer
- Toast/feedback primitive

Required:

- accessible names
- keyboard interaction
- visible focus
- disabled states
- loading states where appropriate
- semantic variants
- predictable APIs
- dialog semantics
- focus management
- focus restoration
- escape handling where appropriate

Do not mass-migrate all feature pages.


AGENT C — APPLICATION SHELL + NAVIGATION

Workstreams:

FRONTEND-02
FRONTEND-10 navigation

Own:

- application shell
- sidebar
- topbar
- authenticated shell boundaries
- mobile navigation

Required:

- login/reset pages do not inherit authenticated navigation incorrectly
- desktop navigation preserved
- mobile navigation functional
- keyboard navigation functional
- sidebar profile/logout behavior preserved

IMPORTANT:

Inspect the existing Sidebar.tsx change first.

Do not overwrite the pre-existing logout-button fix.


AGENT D — AUTH + AUTHORIZATION UX

Workstream:
FRONTEND-04

Own frontend authorization presentation.

Inspect:

- login
- password reset
- auth redirects
- branch context
- permission-driven UI
- unauthorized states

Do not weaken backend authorization.

Client-side checks are UX hints only.

Backend/RPC/RLS remain authoritative.

Test:

- unauthenticated
- authenticated
- password reset
- incorrect branch
- missing branch context
- Super Admin


AGENT E — FORMS + FEEDBACK

Workstreams:

FRONTEND-05
relevant FRONTEND-07 form portions

Own:

- form patterns
- validation
- errors
- success feedback
- submit states
- server-action error presentation

Investigate existing architecture before adding
React Hook Form, Zod, or similar dependencies.

Do not add libraries simply because the audit suggested them.

Eliminate silent error swallowing in owned paths.

Do not blindly rewrite every form.


AGENT F — DATA TABLES

Workstreams:

FRONTEND-06
relevant FRONTEND-07 table portions

Own reusable data presentation:

- table primitive
- search
- filtering
- sorting
- pagination
- empty states
- loading states
- error states

Prioritize high-value entity lists.

Do NOT blindly paginate tiny configuration lists
where it would harm UX.

Preserve backend scoping and authorization.


AGENT G — SCHEDULING + PERFORMANCE

Workstreams:

FRONTEND-09
FRONTEND-12

Own:

- scheduling UX
- query orchestration
- performance optimization
- duplicate app-context fetching
- unnecessary clientification

Investigate:

- reported sequential Supabase query waterfall
- duplicate getAppContext calls
- expensive rerenders

Measure before/after.

Do not claim performance improvement without measurements.

Do not rewrite scheduling unnecessarily.


AGENT H — RESPONSIVE + ACCESSIBILITY

Workstreams:

FRONTEND-10
FRONTEND-11

Own:

- responsive layouts
- mobile behavior
- keyboard navigation
- focus handling
- ARIA
- touch targets
- clipping/overflow
- mobile tables
- mobile timetable

At minimum verify:

- 320px
- 375px
- 390px
- 768px
- desktop

Inspect actual UI behavior, not source code alone.


AGENT I — BULK + ONBOARDING

Workstream:

FRONTEND-08

Own frontend UX for:

- bulk upload
- import wizard
- reconciliation
- duplicate resolution
- onboarding checklist

Inspect existing backend contracts first.

Do not invent APIs.

If backend functionality is missing:

- document it
- stop at the frontend boundary
- do not silently create fake functionality


AGENT J — FRONTEND TESTING

Workstream:

FRONTEND-14

Own:

- component testing foundation
- React Testing Library evaluation
- Playwright improvements
- responsive assertions
- CRUD coverage
- deterministic synchronization

Address audit gaps including:

- real student form submission
- academic year CRUD
- class CRUD
- section CRUD
- responsive assertions
- arbitrary waitForTimeout usage where deterministic waits are possible

Never weaken assertions.

Never convert failures into fake skips.


AGENT K — VISUAL QA

Workstream:

FRONTEND-13

Analysis/QA ownership.

Review representative screens for:

- typography
- spacing
- hierarchy
- surfaces
- controls
- navigation
- responsive behavior
- consistency with Stitch references

Do not independently redesign pages.

Implementation changes go to the owning agent.


============================================================
DEPENDENCY WAVES
============================================================

WAVE 0 — BASELINE / COORDINATION

Coordinator only.

- verify baseline
- snapshot working tree
- inspect audit/spec
- establish ownership
- create worktrees
- determine dependencies


WAVE 1 — FOUNDATION

Run:

- Agent A
- Agent B

Agent B may depend on token decisions from Agent A.

Integrate Wave 1 before broad feature migration.


WAVE 2 — SHELL / CORE UX

Run:

- Agent C
- Agent D
- Agent E

These agents consume Wave 1 primitives.

Integrate and run regression.


WAVE 3 — DATA / FEATURE UX

Run:

- Agent F
- Agent G
- Agent I

Maintain strict ownership.


WAVE 4 — CROSS-CUTTING HARDENING

Run:

- Agent H
- Agent J


WAVE 5 — VISUAL QA

Run:

- Agent K

Visual QA reviews the integrated result.


WAVE 6 — FINAL INTEGRATION

Coordinator/integration agent:

- merge branches in dependency order
- resolve conflicts conservatively
- preserve user changes
- run complete validation
- inspect final diff
- inspect final git state


============================================================
COMMIT POLICY
============================================================

Each specialist creates a focused commit.

Suggested messages:

feat(frontend): harden design system
feat(frontend): establish ui primitives
feat(frontend): harden application shell
feat(frontend): harden auth ux
feat(frontend): harden forms and feedback
feat(frontend): harden data tables
perf(frontend): optimize scheduling ux
feat(frontend): harden responsive accessibility
feat(frontend): add bulk onboarding ux
test(frontend): expand frontend regression coverage

Do not squash blindly.

Preserve useful commit boundaries.


============================================================
TESTING STANDARD
============================================================

Every agent validates its own changes.

Relevant checks include:

- lint
- typecheck
- unit tests
- component tests
- targeted E2E
- accessibility
- responsive checks
- performance measurements
- build

No fake certification.

Never:

- hide failures
- weaken assertions
- add arbitrary waits just to pass
- skip failing tests without documented cause
- claim tests passed when they were not executed


============================================================
ACCESSIBILITY STANDARD
============================================================

Verify:

- semantic dialog role
- accessible dialog name
- modal semantics
- keyboard access
- focus entry
- focus containment
- focus restoration
- escape behavior
- form label association
- error association
- required fields
- icon-button accessible names
- visible focus state


============================================================
RESPONSIVE STANDARD
============================================================

Verify actual representative workflows at:

320px
375px
390px
768px
desktop

Inspect:

- navigation
- tables
- timetable
- forms
- dialogs
- drawers
- action buttons

Do not declare the app mobile-ready solely from CSS inspection.


============================================================
PERFORMANCE STANDARD
============================================================

Performance claims require measurement.

Where applicable capture:

- scheduling load behavior
- query counts
- duplicate context requests
- meaningful render behavior

Do not blindly add memoization or caching.

Optimize observed bottlenecks.


============================================================
NATIVE POPUPS
============================================================

Create canonical replacement primitives as part of shared UI work.

Migration of existing alert()/confirm() usage may happen
through the appropriate feature owners.

By final certification, there must be no remaining
browser-native popup usage in hardened application flows.


============================================================
LOADING / ERROR / EMPTY STATES
============================================================

Where relevant, establish consistent patterns for:

- loading
- error
- empty
- success
- retry

Do not create meaningless placeholder states.


============================================================
PHASE 6 PROTECTION
============================================================

The result should prepare the frontend for Phase 6.

Generic infrastructure MAY be improved.

Assessment-specific business logic MUST NOT be implemented.


============================================================
CERTIFICATION GATE
============================================================

The frontend may be certified only when:

1. No VERIFIED unresolved P0 frontend defects remain.

2. No VERIFIED unresolved P1 frontend defects remain,
   unless a specific item is explicitly documented as
   deferred with rationale and approval.

3. Canonical shared primitives exist.

4. Application shell boundaries are correct.

5. Mobile navigation works.

6. Auth pages do not inherit authenticated chrome incorrectly.

7. Design tokens and typography are coherent.

8. Hardened workflows do not use browser-native alert/confirm.

9. Forms surface meaningful failures.

10. Loading/error/empty states are usable.

11. High-value data tables have scalable UX.

12. Dialogs/drawers satisfy required accessibility semantics.

13. Keyboard interaction works.

14. Focus behavior works.

15. No critical mobile clipping/navigation failures remain.

16. Measured performance bottlenecks identified by the audit
    have been addressed or explicitly documented.

17. Critical frontend regression coverage exists.

18. Playwright tests actually execute and pass.

19. lint passes.

20. typecheck passes.

21. build passes.

22. no accidental files or user work are committed.

23. final diff is intentional and reviewable.


============================================================
FINAL DELIVERABLE
============================================================

Produce:

# FRONTEND HARDENING MASTER REPORT

## 1. BASELINE
- origin/master SHA
- initial HEAD
- working-tree state
- preserved user changes

## 2. AGENT RESULTS
For every agent:
- ownership
- branch
- files changed
- commit SHA
- validation
- unresolved items

## 3. INTEGRATED CHANGES

## 4. AUDIT FINDING MATRIX

For every original finding:

- status
- confirmed/not confirmed
- fixed/deferred/not applicable
- evidence
- commit

## 5. STITCH FINDINGS

Separate:

- adopted
- partially adopted
- rejected
- deferred

## 6. TEST RESULTS

Include:

- lint
- typecheck
- build
- unit
- component
- Playwright
- accessibility
- responsive
- performance

## 7. REMAINING ISSUES

Group into:

- P0
- P1
- P2
- recommendations

## 8. PHASE 6 READINESS

State exactly which frontend foundations are now ready
for Phase 6 and which dependencies remain.

## 9. GIT STATE

Include:

- final HEAD
- branch
- specialist commits
- integration commits
- working-tree state
- user modifications preserved
- scratch files preserved
- accidental-file check

## 10. FINAL DECISION

Return exactly one:

FRONTEND HARDENING CERTIFIED

OR

FRONTEND HARDENING NOT CERTIFIED

If NOT CERTIFIED:
list exact blockers and STOP.


============================================================
STOP CONDITION
============================================================

After final frontend certification:

STOP.

Do not begin Phase 6.

Do not continue unrelated cleanup.

Do not silently modify backend/security/database systems.

Wait for explicit Phase 6 authorization.


============================================================
CORE PRINCIPLE
============================================================

PARALLELIZE IMPLEMENTATION.

ISOLATE OWNERSHIP.

CENTRALIZE ARCHITECTURE.

INTEGRATE CONSERVATIVELY.

VERIFY INDEPENDENTLY.

NEVER TRADE CORRECTNESS FOR SPEED.

## Follow-up — 2026-09-04T17:34:29Z

# SCHOOLOS — WAVE 4 RESUME AUTHORIZATION

AUTHORIZED:
Resume frontend hardening from the verified remote checkpoint.

BASE:
origin/feat/wave3-integrated
SHA:
34697ec4704ead254d881956ad606f736403d366

DO NOT:
- restart Waves 1–3
- modify master
- launch the full 11-agent swarm
- modify database/RLS/security foundations
- implement Phase 6
- delete/reset/clean/stash pre-existing user work

QUOTA-SAFE EXECUTION:
Use ONLY these implementation agents concurrently:

1. Agent H — FRONTEND-10 Responsive + FRONTEND-11 Accessibility
2. Agent J — FRONTEND-14 Frontend/E2E Testing

Coordinator remains responsible for:
- dependency coordination
- integration
- conflict resolution
- final verification

WAVE 4A — RESPONSIVE

Verify and remediate actual UI behavior at:
320px
375px
390px
768px
desktop

Prioritize:
- mobile navigation
- tables
- timetable
- forms
- dialogs
- drawers
- action controls
- overflow/clipping
- usable touch targets

Do not claim mobile-ready based on CSS inspection alone.

WAVE 4B — ACCESSIBILITY

Verify and remediate:
- dialog semantics
- drawer semantics
- accessible names
- aria-modal where appropriate
- keyboard interaction
- focus entry
- focus containment
- focus restoration
- escape behavior
- form label association
- validation/error association
- icon-button names
- visible focus states
- confirmed contrast problems

Do not blindly apply standards where the actual criterion is not applicable.

WAVE 4C — E2E / REGRESSION

Add or repair tests for:
- real student form submission
- academic year CRUD
- class CRUD
- section CRUD
- responsive behavior
- key Wave 1–3 regression flows

Replace arbitrary sleeps with deterministic synchronization where possible.

Never:
- weaken assertions
- hide failures
- convert failures into skips without documented reason
- create fake passing tests

OWNERSHIP:
Agents must use isolated branches/worktrees.
Do not concurrently modify the same files.
Coordinator alone integrates the branches.

PRE-EXISTING USER WORK:
Preserve package-lock.json and all existing untracked files.
Do not clean/reset/stash/delete them.

VALIDATION:
Each agent must run relevant:
- lint
- typecheck
- targeted tests

Coordinator must run after integration:
- lint
- typecheck
- build
- unit/component tests
- Playwright
- responsive verification
- accessibility verification

PERFORMANCE:
Do not make unsupported performance claims.
Measure only where Wave 4 changes affect performance.

FINAL GATE:
Wave 4 is complete only when:
- no verified unresolved Wave-4 P0/P1 defects remain
- responsive navigation works
- representative mobile workflows do not critically clip
- accessibility issues identified as real are fixed
- required E2E flows actually execute and pass
- no arbitrary test sleeps remain where deterministic waits are available
- lint/typecheck/build/tests pass
- no unrelated scope changes were introduced

COMMIT:
Each agent creates focused commits.
Coordinator integrates them into a new Wave 4 integration branch.

DO NOT merge into master.

FINAL REPORT:
Return:
- starting SHA
- agent branches
- commits
- files changed
- responsive findings
- accessibility findings
- E2E findings
- tests
- unresolved issues
- final integration SHA
- git status
- certification decision

STOP after Wave 4 integration and certification.
DO NOT START Wave 5 automatically.

## 2026-09-07T05:37:29Z

# AUTHORIZE WAVE 5 — VISUAL QA ONLY

Base:
origin/feat/wave4-integrated
SHA:
1da2ce4e05fa9ee031d4f064638adac035b1e079

IMPORTANT:
Wave 4 has passed independent forensic verification.

Start ONLY FRONTEND-13 Visual QA / Stitch Alignment.

DO NOT:
- modify backend
- modify database
- modify RLS/security foundations
- implement Phase 6
- restart Waves 1–4
- launch a large implementation swarm
- change working-tree user files
- merge into master

Mode:
READ-ONLY FIRST.

Inspect the integrated application against:
- SchoolOS Master Specification
- existing design system
- Stitch references
- representative desktop/mobile screens

Review:
- dashboard
- students
- academic structure
- scheduling/timetable
- attendance
- communication
- bulk upload
- authentication
- dialogs/drawers
- tables
- app shell/navigation

For each finding classify:

1. actual functional defect
2. accessibility/usability defect
3. responsive defect
4. visual inconsistency
5. Stitch preference/recommendation
6. acceptable existing behavior

Do NOT rewrite screens merely to resemble Stitch.

Use the current canonical UI primitives.

Verify that visual improvements do not regress:
- authorization
- branch context
- business behavior
- E2E selectors
- accessibility
- responsive behavior

If implementation changes are genuinely required:
- identify the owning area
- make the smallest necessary change
- validate it
- create a focused commit
- do not perform broad redesign

Final report:

# WAVE 5 VISUAL QA REPORT

Include:
- baseline SHA
- screens reviewed
- visual findings
- functional findings
- responsive findings
- accessibility findings
- Stitch comparison
- fixes made
- tests run
- unresolved issues
- recommendation

Final decision:

VISUAL QA PASSED

or

VISUAL QA REQUIRES REMEDIATION

STOP AFTER WAVE 5.
DO NOT START PHASE 6.
