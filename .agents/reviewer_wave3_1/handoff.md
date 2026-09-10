# Handoff Report — Reviewer 1 (Wave 3 Data & Feature UX)

## Review Summary

**Verdict**: **REQUEST_CHANGES**

Branch Under Review: `feat/wave3-integrated`  
HEAD Commit: `7c325204055cf1a8de914de240755816cb7c3c10`  
Reviewer: Reviewer 1 (Data & Feature UX Specialist Reviewer & Adversarial Critic)

---

## 1. Observation

1. **Native Popup Elimination Audit (FRONTEND-06 & FRONTEND-07)**:
   - A global ripgrep search for `\b(window\.)?(confirm|alert)\s*\(` across `apps/web/src` reveals **5 active `confirm()` calls** and **12 active `alert()` calls** remaining in the codebase:
     - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx`:
       - Line 12: `if (confirm('Are you sure you want to delete this academic year?')) {`
       - Line 16: `alert(result.error);`
       - Line 20: `alert(err.message);`
       - Line 22: `alert('An unexpected error occurred during deletion.');`
     - `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx`:
       - Line 12: `if (confirm('Are you sure you want to delete this bell schedule?')) {`
       - Line 16: `alert(result.error);`
       - Line 20: `alert(err.message);`
       - Line 22: `alert('An unexpected error occurred during deletion.');`
     - `apps/web/src/app/scheduling/components/PeriodsTable.tsx`:
       - Line 12: `if (confirm('Are you sure you want to delete this period?')) {`
       - Line 16: `alert(result.error);`
       - Line 20: `alert(err.message);`
       - Line 22: `alert('An unexpected error occurred during deletion.');`
     - `apps/web/src/app/scheduling/components/RoomsTable.tsx`:
       - Line 12: `if (confirm('Are you sure you want to delete this room?')) {`
       - Line 16: `alert(result.error);`
       - Line 20: `alert(err.message);`
       - Line 22: `alert('An unexpected error occurred during deletion.');`
     - `apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx`:
       - Line 184: `if (confirm('Are you sure you want to archive this timetable entry?')) {`
   - Agent F eliminated popups in `ClassesTable`/`ClassesList` (1 confirm, 3 alerts), `SectionsTable`/`SectionsList` (1 confirm, 3 alerts), and `CalendarEventsTable` (1 confirm). Total eliminated: 3 confirms, 6 alerts.
   - Out of the baseline 8 `confirm()` and 18 `alert()` calls, **62.5% of confirms (5/8)** and **66.7% of alerts (12/18)** remain unmigrated.
   - Agent F documented in its caveats (`.agents/worker_wave3_agentF/handoff.md` § 3) that it omitted `AcademicYearsTable.tsx` and all scheduling files (`BellSchedulesTable`, `PeriodsTable`, `RoomsTable`, `TimetableEntryForm`) due to perceived file ownership boundaries. Agent G focused only on timetable grid and page-data orchestration, leaving these scheduling tables unhardened.

2. **Canonical Table Primitive & Modernized Tables**:
   - `apps/web/src/components/ui/Table.tsx`: Canonical primitive created with `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` (`scope="col"`), `TableCell`, `TableCaption`, `TableEmpty`, and `TableEmptyRow`. Properly exported via `apps/web/src/components/ui/index.ts`.
   - Modernized tables: `ClassesList.tsx`, `SectionsList.tsx`, `CalendarEventsTable.tsx`, `StudentsTable.tsx`, `AttendanceManager.tsx`, and `AttendanceHistoryTable.tsx` incorporate search, multi-column sorting, pagination, `TableEmptyRow`, and accessible `ConfirmDialog` / `toast`.
   - Backward-compatible wrappers exist for `ClassesTable.tsx`, `SectionsTable.tsx`, and `CalendarEventForm.tsx`.
   - Tables omitted from modernization: `AcademicYearsTable.tsx`, `BellSchedulesTable.tsx`, `PeriodsTable.tsx`, and `RoomsTable.tsx` remain as legacy unstyled HTML tables without sorting, search, pagination, or column scopes.

3. **Scheduling & Performance (FRONTEND-09 & FRONTEND-12)**:
   - `apps/web/src/lib/branch-context.ts`: Line 24 wraps `getAppContext` with `cache(...)` from `'react'`.
   - `apps/web/src/app/scheduling/timetable/page-data.ts`:
     - `fetchSchedulingPageData`: Wave 1 runs 4 parallel queries via `Promise.all([academic_years, periods, rooms, staff_branch_profiles])`; Wave 2 runs `timetable_entries`.
     - `fetchTimetablePageData`: Wave 1 runs 5 parallel queries via `Promise.all([academic_years, periods, rooms, staff_branch_profiles, subjects])`; Wave 2 runs 3 parallel queries via `Promise.all([timetable_entries, classes, sections])`.
   - `apps/web/src/app/scheduling/timetable/components/TimetableGrid.tsx`: Wrapped with `role="region"`, `aria-label="Timetable Schedule Grid"`, `tabIndex={0}`, `overflow-x-auto`, `min-w-[840px] md:min-w-[960px]`.
   - `apps/web/src/app/scheduling/timetable/loading.tsx`: Next.js loading skeleton exists and mirrors timetable grid.

4. **Bulk Onboarding (FRONTEND-08)**:
   - `apps/web/src/components/bulk/BulkUploadDropzone.tsx`: Accessible drag-and-drop file upload with keyboard triggers, file extension validation (`.csv`, `.tsv`, `.xlsx`), and 10MB size limit.
   - `apps/web/src/components/bulk/csv-parser.ts`: RFC 4180 tokenizer supporting delimiter detection, quoted commas, escaped quotes `""`, multiline records, and BOM stripping.
   - `apps/web/src/components/bulk/ColumnMapper.tsx` & `CsvPreviewTable.tsx`: 3-pass heuristic auto-matching, canonical Select primitive, preview table with mapped badges.
   - `apps/web/src/components/bulk/StudentBulkWizard.tsx`: 4-step wizard with client-side validation (duplicate admission numbers, missing required names).
   - No fake DB mutations: Step 4 explicitly communicates that the client mapper validates data and connects to the backend ingestion pipeline, simulating queueing for pre-flight UX without creating fake DB rows or fake API endpoints.
   - Route `/students/bulk`: Implemented in `apps/web/src/app/students/bulk/page.tsx` with branch context verification and read-only protection.

5. **User Work Preservation**:
   - `apps/web/src/components/layout/Sidebar.tsx`: Lines 49-57 maintain `<form action="/auth/logout" method="POST">` with `type="submit"` and `<LogOut size={16} aria-hidden="true" />` verbatim intact. `git diff 76393e9 HEAD -- apps/web/src/components/layout/Sidebar.tsx` returns empty diff.
   - `package-lock.json`: Remains modified in working tree, untouched, unstaged, uncommitted.
   - Untracked artifacts (`manual-test.js`, `playwright_output.log`, `server.log`, `full_diff.patch`, `*.txt`, etc.): 100% preserved.

6. **Validation Commands Execution (`apps/web`)**:
   - `npm run typecheck`: Exit code 0 (`tsc --noEmit` passed with 0 errors).
   - `npm run lint`: Exit code 0 (0 errors; 1 harmless unused directive warning in coverage).
   - `npm test`: Exit code 0 (17 test files, 122 tests passed, 0 failed).
   - `npm run build`: Exit code 0 (Next.js 16.3.3 Turbopack build succeeded; all 24 routes compiled).

---

## 2. Logic Chain

1. **Mandate Discrepancy**:
   - Prompt requirement: *"complete elimination of native `confirm()` (8 calls) and `alert()` (18 calls) replaced with `ConfirmDialog` and `Toast`"*.
   - PROJECT.md Feature 12: *"Replace confirm()/alert() in 8 tables with ConfirmDialog & Toast"*.
   - 23-Point Certification Gate Criteria #8: *"Hardened workflows do not use browser-native `alert()` or `confirm()`"*.
   - Current branch state: 5 `confirm()` calls and 12 `alert()` calls remain active across 5 components.
   - Observation leads directly to conclusion: The requirement is incomplete.

2. **Root Cause Analysis**:
   - Agent F claimed that `AcademicYearsTable.tsx` was outside its boundary, and that scheduling files were owned by Agent G.
   - Agent G focused exclusively on query parallelization and timetable grid responsiveness, not touching secondary scheduling tables (`BellSchedulesTable`, `PeriodsTable`, `RoomsTable`, `TimetableEntryForm`).
   - Integration Agent merged the three branches without remediating the gap between Agent F and Agent G.
   - Because neither specialist migrated these 5 components, browser-native popups and legacy unstyled tables persist.

3. **Integrity Assessment**:
   - This failure is an inter-agent boundary gap and incomplete scope delivery, not a fraudulent facade or fabricated test.
   - However, approving this branch would violate Gate Criteria #8 and approve an incomplete Wave 3 implementation where users still encounter native browser popups and unhardened tables.

---

## 3. Findings

### [Critical] Finding 1: Incomplete Elimination of Native `confirm()` and `alert()` Popups
- **What**: 5 native `confirm()` calls and 12 native `alert()` calls remain in active application code.
- **Where**:
  - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx` (Lines 12, 16, 20, 22) — 1 confirm, 3 alerts
  - `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx` (Lines 12, 16, 20, 22) — 1 confirm, 3 alerts
  - `apps/web/src/app/scheduling/components/PeriodsTable.tsx` (Lines 12, 16, 20, 22) — 1 confirm, 3 alerts
  - `apps/web/src/app/scheduling/components/RoomsTable.tsx` (Lines 12, 16, 20, 22) — 1 confirm, 3 alerts
  - `apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx` (Line 184) — 1 confirm
- **Why**: Violates 23-Point Gate Criteria #8, PROJECT.md Feature 12, and the dispatch review mission. Native popups freeze the JavaScript thread, cannot be styled, lack accessible focus trapping/restoration, and break headless automated test runs.
- **Suggestion**:
  1. In `AcademicYearsTable.tsx`: Replace native `confirm()` with `@/components/ui/ConfirmDialog` and replace `alert()` with `toast.error()` / `toast.success()`.
  2. In `BellSchedulesTable.tsx`: Replace native `confirm()` with `ConfirmDialog` and `alert()` with `toast`.
  3. In `PeriodsTable.tsx`: Replace native `confirm()` with `ConfirmDialog` and `alert()` with `toast`.
  4. In `RoomsTable.tsx`: Replace native `confirm()` with `ConfirmDialog` and `alert()` with `toast`.
  5. In `TimetableEntryForm.tsx`: Replace native `confirm()` with `ConfirmDialog`.

### [Major] Finding 2: Unhardened Legacy Data Tables
- **What**: Four secondary management tables (`AcademicYearsTable`, `BellSchedulesTable`, `PeriodsTable`, `RoomsTable`) still use raw `<table>` elements without `scope="col"` on headers, search filtering, column sorting, pagination, or canonical `Table` / `TableEmptyRow` primitives.
- **Where**:
  - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx`
  - `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx`
  - `apps/web/src/app/scheduling/components/PeriodsTable.tsx`
  - `apps/web/src/app/scheduling/components/RoomsTable.tsx`
- **Why**: Creates visual and behavioral inconsistency across the application shell. While `Classes` and `Sections` enjoy modern search/sort/filter/paginate tables, their sibling tabs (`Academic Years`, `Periods`, `Rooms`, `Bell Schedules`) retain unstyled pre-hardening tables.
- **Suggestion**: Migrate these tables to use the canonical `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, and `TableEmptyRow` primitives, with `ConfirmDialog` for deletes.

---

## 4. Verified Claims

| Item / Claim | Verification Command / Target | Result | Status |
|---|---|---|---|
| Sidebar logout POST form preservation | `git diff 76393e9 HEAD -- apps/web/src/components/layout/Sidebar.tsx` | Verbatim intact; empty diff | PASS |
| `package-lock.json` uncommitted/untouched | `git status` / `git diff HEAD -- package-lock.json` | Untouched, unstaged | PASS |
| Canonical `Table.tsx` primitive | `components/ui/Table.tsx`, `components/ui/table.test.tsx` | Full primitive suite with `scope="col"`, tests pass | PASS |
| `React.cache()` on `getAppContext` | `apps/web/src/lib/branch-context.ts:24` | `export const getAppContext = cache(...)` | PASS |
| Scheduling query parallelization | `apps/web/src/app/scheduling/timetable/page-data.ts` | 8-query waterfall converted to 2 parallel `Promise.all` waves | PASS |
| TimetableGrid accessible scroll region | `apps/web/src/app/scheduling/timetable/components/TimetableGrid.tsx:96-100` | `role="region"`, `aria-label`, `tabIndex={0}` present | PASS |
| Timetable loading skeleton | `apps/web/src/app/scheduling/timetable/loading.tsx` | Loading skeleton implemented | PASS |
| Bulk upload dropzone & RFC 4180 parser | `apps/web/src/components/bulk/` | Dropzone, parser, column mapper, preview table pass 24 tests | PASS |
| No fake backend DB mutations in bulk | `StudentBulkWizard.tsx` | Honest architectural notice; no fabricated DB calls | PASS |
| TypeScript check | `npm run typecheck` in `apps/web` | Exit code 0, 0 errors | PASS |
| ESLint check | `npm run lint` in `apps/web` | Exit code 0, 0 errors | PASS |
| Vitest test suite | `npm test` in `apps/web` | 17 test files, 122 tests passed, 0 failed | PASS |
| Next.js production build | `npm run build` in `apps/web` | Exit code 0, all 24 routes successfully compiled | PASS |
| Complete popup elimination (8 confirm, 18 alert) | `grep_search` across `apps/web/src` | 5 confirms and 12 alerts still remain | **FAIL** |

---

## 5. Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: **HIGH**
- **Core Challenge**: The system currently claims popup elimination and data table hardening for Wave 3, but 5 critical tables/forms were completely unmigrated due to territorial file boundary assumptions between Agent F and Agent G.

### Challenges

#### [Critical] Challenge 1: Unhandled Native Confirmation Popups Break Accessibility and Automated CI
- **Assumption Challenged**: All user confirmation flows in Wave 3 use accessible modal dialogs.
- **Attack Scenario**: A user or automated headless test triggers a delete in `Academic Years`, `Bell Schedules`, `Periods`, `Rooms`, or archives a slot in `TimetableEntryForm`. The browser triggers a blocking `window.confirm()` and `window.alert()`.
- **Blast Radius**: Headless Playwright tests fail with unhandled dialog timeouts; keyboard and screen reader users cannot trap focus; inconsistent UX with modern `ConfirmDialog` used elsewhere.
- **Mitigation**: Assign an immediate remediation pass to replace the remaining 5 `confirm()` and 12 `alert()` calls with `ConfirmDialog` and `toast`.

#### [Medium] Challenge 2: Ingestion Queue Simulation in Step 4 Lacks Backend Disconnection Alert
- **Assumption Challenged**: Users understand that bulk onboarding is currently in pre-flight preview mode.
- **Attack Scenario**: A user completes Step 4 of the bulk onboarding wizard and sees `"Bulk Ingestion Queued Successfully"`, assuming student records were actually inserted into the database.
- **Blast Radius**: User expectation mismatch until backend ingestion worker is implemented.
- **Mitigation**: The UI currently shows a notice explaining the architecture; ensure the banner explicitly clarifies that records are staged for Phase 6 backend ingestion.

---

## 6. Caveats

- All automated checks (`typecheck`, `lint`, `npm test`, `npm run build`) pass cleanly with exit code 0. The reason tests pass despite the remaining popups is that unit tests for `AcademicYearsTable`, `BellSchedulesTable`, etc., were not added or did not assert on dialog triggers.
- The work completed by Agents F, G, and I on their respective target files is of high technical quality. The defect is strictly one of incomplete coverage across the full inventory of tables and native popups specified in PROJECT.md.

---

## 7. Conclusion

While the integrated branch `feat/wave3-integrated` incorporates substantial improvements (canonical Table primitive, query parallelization, React.cache memoization, accessible timetable scroll, and a comprehensive bulk onboarding wizard), it **fails the certification criteria for complete elimination of browser-native popups**:
- 5 out of 8 `confirm()` calls remain active.
- 12 out of 18 `alert()` calls remain active.
- 4 secondary data tables remain unhardened.

Therefore, the verdict is **REQUEST_CHANGES**.

---

## 8. Verification Method

To reproduce and independently verify these findings on `feat/wave3-integrated`:

1. **Verify Git Commit**:
   ```bash
   git rev-parse HEAD
   # Must be 7c325204055cf1a8de914de240755816cb7c3c10
   ```

2. **Detect Remaining Native Popups**:
   ```powershell
   # Search for active confirm calls
   git grep -n "confirm(" -- "apps/web/src/*.tsx" "apps/web/src/*.ts"
   # Output demonstrates 5 calls in AcademicYearsTable, BellSchedulesTable, PeriodsTable, RoomsTable, TimetableEntryForm

   # Search for active alert calls
   git grep -n "alert(" -- "apps/web/src/*.tsx" "apps/web/src/*.ts"
   # Output demonstrates 12 calls across AcademicYearsTable, BellSchedulesTable, PeriodsTable, RoomsTable
   ```

3. **Verify Passing Build and Tests**:
   ```powershell
   cd "apps/web"
   npm run typecheck   # Exit 0
   npm run lint        # Exit 0
   npm test            # Exit 0 (122 tests pass)
   npm run build       # Exit 0 (all routes compile)
   ```
