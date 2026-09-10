# Agent G Dispatch

## 2026-09-04T12:27:26Z

You are Agent G (Scheduling & Performance) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentG\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstreams: FRONTEND-09 (Scheduling UX) & FRONTEND-12 (Frontend Performance)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentG\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave3-scheduling-perf` branched from `feat/wave2-integrated` (commit `76393e920af80c3fb61cbad6b47f02c5e28e81b0`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx` logout POST form, `package-lock.json`, and untracked files). DO NOT reset, clean, or overwrite them.
3. Exclusive File Boundaries:
   - Primary ownership:
     - `apps/web/src/lib/branch-context.ts` (EXCLUSIVE write ownership per PROJECT.md)
     - `apps/web/src/app/scheduling/timetable/page-data.ts`
     - `apps/web/src/app/scheduling/timetable/page.tsx`
     - `apps/web/src/app/scheduling/page.tsx`
     - `apps/web/src/app/scheduling/substitutions/page.tsx`
   - DO NOT edit `apps/web/src/components/layout/*`, `Sidebar.tsx`, `package.json`, or `package-lock.json`.
   - DO NOT introduce any Phase 6 assessment logic (exams, marks, grading, results, report-cards).
4. Core Hardening Tasks:
   A. Branch Context Memoization (FRONTEND-12):
      - In `apps/web/src/lib/branch-context.ts`:
        Import `cache` from `'react'`.
        Wrap `getAppContext` with `cache(async (...) => { ... })` so that multiple Server Components rendered in the same request share the same resolved context promise, eliminating duplicate database roundtrips.
   B. Scheduling Query Waterfall Optimization (FRONTEND-12, FRONTEND-09):
      - In `apps/web/src/app/scheduling/timetable/page-data.ts` and `timetable/page.tsx`:
        Identify sequential awaits that do not depend on each other (e.g. fetching rooms, periods, teachers, sections, subject assignments).
        Convert sequential waterfalls into parallel `Promise.all([...])` execution.
   C. Timetable Responsive UX (FRONTEND-09):
      - In `apps/web/src/app/scheduling/timetable/page.tsx`:
        Ensure timetable grid is wrapped in an accessible horizontal scrolling container (`overflow-x-auto`) to prevent layout blowout on mobile and tablet screens (<1024px).
        Add clear period/day headers with visible border separations using semantic design tokens.
        Add empty state indicators when no classes are scheduled for a given slot.
        Add loading skeletons for timetable data.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all 4 exit with code 0.
6. Commit:
   Stage only your modified files.
   Commit message: `feat(frontend): harden scheduling and frontend performance`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with:
   - Observation (files changed, query parallelization details, React.cache implementation)
   - Logic Chain
   - Caveats
   - Conclusion (commit SHA, branch name)
   - Verification Method (commands and outputs)
8. Send a message to orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`) reporting completion.
