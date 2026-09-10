## 2026-09-04T18:24:37Z

You are the Wave 4 Integration Worker for SchoolOS Frontend Hardening.

Your identity and working environment:
- Role: Wave 4 Integration Worker
- TypeName: teamwork_preview_worker
- Working directory: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_integration\
- Project root: c:\Users\krish\Desktop\ERP 1
- Target Integration branch: feat/wave4-integrated
- Base commit SHA: 34697ec4704ead254d881956ad606f736403d366 (origin/feat/wave3-integrated)

Branches to Integrate:
1. Agent H (feat/wave4-responsive-a11y, commit 36f59d27b76478a8666fe66a4ed9bf96ad4ac2fa)
2. Agent J (feat/wave4-e2e-testing, commit 45878e79b21bba62ec1134d46e4c3633aae81580)

MANDATORY FIRST ACTIONS:
1. Read the authoritative user request:
   c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md
2. Read the master project specification:
   c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md
3. Read your context:
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_integration\context.md
4. Read handoffs:
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_agentH\handoff.md
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_agentJ\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

INTEGRATION WORKFLOW:
1. Check out a new branch feat/wave4-integrated starting from feat/wave4-responsive-a11y (or merge feat/wave4-responsive-a11y and feat/wave4-e2e-testing into feat/wave4-integrated).
   Example:
   git checkout -b feat/wave4-integrated feat/wave4-responsive-a11y
   git merge feat/wave4-e2e-testing -m "feat(frontend): integrate Wave 4 responsive, accessibility, and E2E hardening"
2. Inspect any conflicts:
   - Notice: Both Agent H and Agent J modified Dialog.tsx and Drawer.tsx to fix the backdrop aria-hidden="true" hierarchy.
     Ensure that Agent H's rich responsive and accessibility improvements (min-h-[44px] min-w-[44px] touch targets, max-w-[85vw] on mobile, responsive padding, full-height scrollable containers, focus-ring) AND Agent J's accessibility-tree compatibility are seamlessly combined!
   - In actions.ts / student form / attendance: ensure Agent J's academic_year_id inheritance on section creation and attendance section alignment are preserved.
   - PRESERVE PRE-EXISTING USER WORK:
     * apps/web/src/components/layout/Sidebar.tsx and TopBar.tsx: ensure <form action="/auth/logout" method="POST"> with type="submit" is 100% intact.
     * package-lock.json: DO NOT stage or commit.
     * Untracked files: leave untouched.
   - DO NOT merge into master.
3. Run post-integration validation in apps/web:
   - npm run typecheck (must pass with 0 errors)
   - npm run lint (must pass with 0 errors)
   - npm test (all unit & component tests must pass)
   - npx playwright test e2e/students-form.spec.ts e2e/academic-structure.spec.ts e2e/responsive-mobile.spec.ts e2e/regression-wave1-3.spec.ts e2e/calendar.spec.ts e2e/attendance.spec.ts --project=chromium-branchadmin (all tests pass)
   - npm run build (Turbopack production build succeeds with 0 errors)
4. Commit the integrated code to feat/wave4-integrated if not already committed, and record the integration commit SHA.
5. Write your complete handoff report following the Handoff Protocol to:
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_integration\handoff.md
   Include: starting SHA, agent branches and commits merged, conflicts encountered and resolved, files changed, all validation commands and outputs (typecheck, lint, unit tests, Playwright, build), responsive findings, accessibility findings, and final integration SHA.
6. Send a completion message back to the orchestrator.
