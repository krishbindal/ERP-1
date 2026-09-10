## 2026-09-04T12:27:26Z
You are Agent F (Data Tables & Popup Migration) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentF\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstreams: FRONTEND-06 (Data Tables) & FRONTEND-07 (Feature UI Hardening - Table Portions)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentF\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave3-data-tables` branched from `feat/wave2-integrated` (commit `76393e920af80c3fb61cbad6b47f02c5e28e81b0`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx` logout POST form, `package-lock.json`, and untracked files). DO NOT reset, clean, or overwrite them.
3. Exclusive File Boundaries:
   - Primary ownership:
     - `apps/web/src/components/ui/Table.tsx` (create canonical accessible Table primitive if not present)
     - `apps/web/src/app/academic-structure/components/ClassesList.tsx`
     - `apps/web/src/app/academic-structure/components/SectionsList.tsx`
     - `apps/web/src/app/academic-structure/calendar/page.tsx`
     - `apps/web/src/app/academic-structure/calendar/components/EventModal.tsx`
     - `apps/web/src/app/students/page.tsx`
     - `apps/web/src/app/attendance/page.tsx`
     - `apps/web/src/app/attendance/history/page.tsx`
   - DO NOT edit `apps/web/src/lib/branch-context.ts` (owned by Agent G).
   - DO NOT edit `apps/web/src/components/layout/*` or `Sidebar.tsx`.
   - DO NOT introduce any Phase 6 assessment logic (exams, marks, grading, results, report-cards).
4. Core Hardening Tasks:
   A. Migrate all 8 `confirm()` calls to canonical `ConfirmDialog`:
      - `ClassesList.tsx` (2 confirm calls): Replace with `ConfirmDialog` state and async confirm handlers.
      - `SectionsList.tsx` (2 confirm calls): Replace with `ConfirmDialog`.
      - `calendar/page.tsx` (2 confirm calls): Replace with `ConfirmDialog`.
      - `EventModal.tsx` (2 confirm calls): Replace with `ConfirmDialog`.
   B. Migrate all 18 `alert()` calls across these pages to programmatic `toast.error()` and `toast.success()` from `@/components/ui/Toast`.
   C. Canonical Table Primitive & Polish:
      - In `apps/web/src/components/ui/Table.tsx`, establish standard `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, and empty state container using semantic surface/border tokens. Export from `@/components/ui/index.ts`.
      - In `ClassesList.tsx`, `SectionsList.tsx`, `students/page.tsx`, `attendance/page.tsx`, `attendance/history/page.tsx`:
        - Ensure tables have visible, accessible headers with proper scope (`<th scope="col">`).
        - Add search/filtering input, column sorting indicators, pagination or row count summary, and clear empty state cards when 0 rows are found.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all 4 exit with code 0.
6. Commit:
   Stage only your modified files.
   Commit message: `feat(frontend): harden data tables and popups`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with:
   - Observation (files changed, confirm/alert instances migrated, table features added)
   - Logic Chain
   - Caveats
   - Conclusion (commit SHA, branch name)
   - Verification Method (commands and outputs)
8. Send a message to orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`) reporting completion.
