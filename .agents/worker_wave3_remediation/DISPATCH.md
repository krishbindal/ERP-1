## 2026-09-04T12:55:25Z

You are the Wave 3 Remediation Worker for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_remediation\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.
Also inspect c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave3_1\handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Branch: `feat/wave3-integrated` (currently at commit `7c325204055cf1a8de914de240755816cb7c3c10`).
Reviewer 1 issued REQUEST_CHANGES because 5 `confirm()` and 12 `alert()` calls remain in secondary table files that fell between Agent F and Agent G's boundaries.

Your Mission:
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_remediation\.
2. Checkout and work directly on branch `feat/wave3-integrated`:
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx` logout POST form, `package-lock.json`, and untracked files). DO NOT reset, clean, or overwrite them.
3. Migrate all remaining 5 `confirm()` and 12 `alert()` calls to canonical `ConfirmDialog` and `Toast` (`toast.error()`, `toast.success()`) in:
   - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx` (Lines 12, 16, 20, 22):
     - Replace `confirm()` with `ConfirmDialog` state and async confirm handler.
     - Replace 3 `alert()` calls with `toast.error()` / `toast.success()`.
     - Modernize table using canonical `@/components/ui/Table` primitives (`Table`, `TableHeader`, `TableRow`, `TableHead` with `scope="col"`, `TableCell`, `TableEmptyRow`), search filtering, and empty state.
   - `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx` (Lines 12, 16, 20, 22):
     - Replace `confirm()` with `ConfirmDialog`.
     - Replace 3 `alert()` calls with `toast.error()` / `toast.success()`.
     - Modernize table with canonical `Table` primitives, `scope="col"`, search filtering, and empty state.
   - `apps/web/src/app/scheduling/components/PeriodsTable.tsx` (Lines 12, 16, 20, 22):
     - Replace `confirm()` with `ConfirmDialog`.
     - Replace 3 `alert()` calls with `toast.error()` / `toast.success()`.
     - Modernize table with canonical `Table` primitives, `scope="col"`, search filtering, and empty state.
   - `apps/web/src/app/scheduling/components/RoomsTable.tsx` (Lines 12, 16, 20, 22):
     - Replace `confirm()` with `ConfirmDialog`.
     - Replace 3 `alert()` calls with `toast.error()` / `toast.success()`.
     - Modernize table with canonical `Table` primitives, `scope="col"`, search filtering, and empty state.
   - `apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx` (Line 184):
     - Replace native `confirm('Are you sure you want to remove this timetable entry?')` with accessible `ConfirmDialog`.
4. Audit & Verification:
   - Search across all `apps/web/src/app/` and `apps/web/src/components/` to verify ZERO `confirm(` or `alert(` calls remain anywhere.
   - Run in `apps/web`:
     - `npm run typecheck`
     - `npm run lint`
     - `npm test`
     - `npm run build`
   Ensure all 4 commands exit with code 0.
5. Commit:
   Stage only your modified files.
   Commit message: `fix(frontend): eliminate remaining native popups and modernize secondary tables`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
6. Write `handoff.md` with:
   - Observation (files changed, confirm/alert instances migrated, zero remaining popups verified)
   - Logic Chain
   - Caveats
   - Conclusion (commit SHA)
   - Verification Method (commands and outputs)
7. Send a message to orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`) reporting completion.
