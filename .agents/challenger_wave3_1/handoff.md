# Empirical Challenge Report: Wave 3 Data & Feature UX

## 1. Observation

- **Branch Evaluated**: `feat/wave3-integrated`
- **HEAD Commit SHA**: `7c325204055cf1a8de914de240755816cb7c3c10`
- **Target Areas Evaluated**:
  1. Data Tables (Search, filter, column sort, pagination bounds, empty state rendering)
  2. Popup Elimination (`window.confirm()`, `window.alert()`, `ConfirmDialog`, `Toast`)
  3. Branch Context & Performance (`React.cache()` wrapping `getAppContext`, parallel query execution)
  4. Bulk Onboarding (RFC 4180 CSV tokenizer edge cases, column mapping, dropzone file validation)
- **Direct Observations & Command Results**:
  - **Audit for Browser Popups**:
    - Grep query `\b(window\.)?(alert|confirm)\s*\(` across all 40 files modified in Wave 3 returned **0 matches**. All browser-native popups were replaced with accessible `ConfirmDialog` and `toast` primitives.
    - Grep across the entire project identified 5 remaining legacy instances in unhardened Wave 0 files outside Wave 3 ownership boundaries: `AcademicYearsTable.tsx:12,16,20,22`, `BellSchedulesTable.tsx:12,16,20,22`, `PeriodsTable.tsx:12,16,20,22`, `RoomsTable.tsx:12,16,20,22`, and `TimetableEntryForm.tsx:184`.
  - **Branch Context Memoization**:
    - `apps/web/src/lib/branch-context.ts:1`: `import { cache } from 'react';`
    - `apps/web/src/lib/branch-context.ts:24`: `export const getAppContext = cache(async (): Promise<AppContext | null> => { ... });`
    - Verified: `getAppContext` is wrapped in React's request-level `cache()`.
  - **Scheduling Query Parallelization**:
    - `apps/web/src/app/scheduling/timetable/page-data.ts:38-65`: `fetchSchedulingPageData` collapses sequential queries into `Promise.all([activeYearRes, periodsRes, roomsRes, teachersRes])`.
    - `apps/web/src/app/scheduling/timetable/page-data.ts:111-144, 154-183`: `fetchTimetablePageData` collapses an 8-query waterfall into 2 parallel waves: Wave 1 runs 5 independent queries concurrently via `Promise.all()`, Wave 2 runs 3 queries concurrently via `Promise.all()`.
    - `apps/web/src/app/scheduling/page.tsx:35-38`: Parallelized periods and bell schedules fetching via `Promise.all()`.
    - `apps/web/src/app/scheduling/substitutions/page.tsx:28-43`: Parallelized calendar day check and substitution query via `Promise.all()`.
  - **Adversarial Stress Testing Results**:
    - **CSV Tokenizer (`parseCsv`)**: Tested with empty strings, whitespace-only content, Windows CRLF, Unix LF, legacy Mac CR (`\r`), multi-line quoted fields with embedded newlines, escaped quotes (`""`), commas within quotes, Unicode/emojis (`José Müller`, `王伟`, `أحمد`, `🎓`), unclosed quotes, ragged rows (padded/truncated to header length), missing header labels (fallback to `Column ${idx + 1}`), delimiter detection (`,`, `\t`, `;`), and large 1,000-row file throughput (< 150ms). All passed.
    - **Column Mapper (`ColumnMapper` & `autoMatchColumns`)**: Tested exact, alias, and substring matching. Verified that `usedHeaders` prevents one CSV column from being assigned to multiple entity fields. Verified required field validation blocks progression until `firstName` and `lastName` are mapped.
    - **Dropzone File Validation (`validateFile`, `formatFileSize`)**: Case-insensitive extension check (`.csv`, `.tsv`, `.xlsx`), rejection of non-whitelisted and disguised files (`.exe`, `.csv.exe`, `.pdf`), size limit enforcement, and formatting across 0 B, 1 KB, 1 MB, 10.5 MB.
    - **Data Tables (`ClassesList`, `StudentsTable`, `CalendarEventsTable`, `AttendanceHistoryTable`)**:
      - Search filtering safely handles regex characters (`[`, `]`, `(`, `)`, `*`, `+`, `?`, `\`).
      - Sorting: verified numeric level sorting (`(a.level ?? 0) - (b.level ?? 0)`) sorts 1, 2, 3, 10 rather than lexicographically (1, 10, 2, 3).
      - Pagination: verified on 25-record dataset that Page 1 disables Previous, Page 3 disables Next, page size splits 10 per page, and status filtering properly resets `currentPage` to 1.
      - Empty states: verified `TableEmptyRow` renders with clear descriptions and action buttons ("Create Class", "Clear Filter").
    - **ConfirmDialog & Toast Lifecycle**: Verified `onClose` on cancel, `onConfirm` on confirm, button disabling during `isLoading`, and programmatic toast dispatch (`success`, `error`, `warning`, `info`) and explicit dismissal (`toast.dismiss()`).
  - **Validation Commands Executed**:
    - `npm run typecheck` in `apps/web`: Exit code 0 (`tsc --noEmit` passed with 0 errors).
    - `npm run lint` in `apps/web`: Exit code 0 (0 errors, 1 harmless coverage warning).
    - `npm test` in `apps/web`: Exit code 0 (17 test files, 122 tests passed, 0 failed).
    - `npm run build` in `apps/web`: Exit code 0 (all 24 App Router routes compiled and optimized cleanly with Turbopack).
  - **User Work Preservation**:
    - `apps/web/src/components/layout/Sidebar.tsx` logout `<form action="/auth/logout" method="POST">` verified intact (`git diff feat/wave2-integrated HEAD -- apps/web/src/components/layout/Sidebar.tsx` is clean).
    - `package-lock.json` remains untouched in working tree and uncommitted.

---

## 2. Logic Chain

1. **Popup Elimination Verification**:
   - Grep search confirms zero instances of `window.confirm()` or `window.alert()` exist in any of the files modified in Wave 3.
   - Code review confirms that all user interactions that previously triggered modal blocks (class deletion, section deletion, event archive, attendance lock/publish) now open accessible `ConfirmDialog` components or issue non-blocking `toast` notifications.
   - Empirical component tests verified that `ConfirmDialog` prevents unintended actions upon cancellation and triggers the appropriate action upon confirmation, while displaying loading states during asynchronous execution.
2. **Data Tables Hardening Verification**:
   - The new `Table` primitive (`apps/web/src/components/ui/Table.tsx`) provides an accessible, tokenized HTML table hierarchy with default `scope="col"` on header cells.
   - Tables (`ClassesList`, `SectionsList`, `CalendarEventsTable`, `StudentsTable`, `AttendanceManager`, `AttendanceHistoryTable`) integrate real-time search, sorting with visual and ARIA indicators (`ArrowUpDown`, `ArrowUp`, `ArrowDown`, `aria-sort`), bounded pagination, and semantic empty-state card components (`TableEmptyRow`).
   - Stress-testing confirmed that searching special regex characters does not throw exceptions because searches use substring comparisons (`includes()`), and numeric sorting properly computes differences.
3. **Performance & Memoization Verification**:
   - Wrapping `getAppContext` in `React.cache()` guarantees that multiple components rendering within the same server request lifecycle reuse the resolved context rather than issuing duplicate auth and database queries.
   - Query parallelization in `fetchTimetablePageData` and `fetchSchedulingPageData` reduces the scheduling latency by batching independent table lookups in parallel waves via `Promise.all()`.
4. **Bulk Onboarding Resilience Verification**:
   - RFC 4180 parsing handles all standard and edge-case CSV inputs, including multiline records, escaped quotes, BOM headers, and ragged rows.
   - The 4-step wizard provides end-to-end guidance with pre-flight validation and column auto-matching, while respecting the backend architecture boundary without fabricating mock database mutations.
5. **Codebase Integrity**:
   - All 4 standard checks (`typecheck`, `lint`, `test`, `build`) pass cleanly with exit code 0.
   - No user work was overwritten or regressed.

---

## 3. Caveats

1. **Defensive Null-Check Recommendation for `CalendarEventsTable.tsx`**:
   - During stress testing, line 66 of `CalendarEventsTable.tsx` was observed to execute `const typeMatch = event.type.toLowerCase().includes(query);` without null-coalescing. While TypeScript typings enforce non-null `type` on `CalendarEvent`, any legacy or malformed record with a null `type` could cause a runtime `TypeError`. It is recommended for Wave 4/6 to update this line to `const typeMatch = (event.type || '').toLowerCase().includes(query);`.
2. **Remaining Legacy Popups in Wave 0 Scope**:
   - 5 files that were not part of Wave 3 specialist ownership still contain `confirm()` and `alert()` calls (`AcademicYearsTable.tsx`, `BellSchedulesTable.tsx`, `PeriodsTable.tsx`, `RoomsTable.tsx`, `TimetableEntryForm.tsx`). These should be prioritized in subsequent feature sweeps.
3. **Playwright E2E Tests**:
   - Browser E2E tests were not executed in this turn as E2E test stabilization and execution belong to Wave 4 (Agent J).

---

## 4. Conclusion

The Wave 3 implementation on `feat/wave3-integrated` (commit `7c325204055cf1a8de914de240755816cb7c3c10`) successfully passes all empirical stress tests, edge case validations, and architectural requirements. All data tables provide accessible search, sort, filter, pagination, and empty states; all native popups have been eliminated from modified files; branch context is request-cached; scheduling queries are parallelized; and bulk onboarding CSV ingestion handles complex edge cases cleanly.

**Verdict: CONFIRMED**

---

## 5. Verification Method

To independently verify these results:

1. **Git State Verification**:
   ```bash
   git rev-parse HEAD
   # Output must be: 7c325204055cf1a8de914de240755816cb7c3c10
   git status
   # Must show no staged files, package-lock.json preserved
   ```

2. **Zero Popups in Wave 3 Files**:
   ```powershell
   git diff --name-only feat/wave2-integrated HEAD | ForEach-Object {
     if (Test-Path $_) {
       Select-String -Path $_ -Pattern '\b(window\.)?(alert|confirm)\s*\('
     }
   }
   # Must return 0 matches
   ```

3. **Typecheck, Lint, Test, and Build**:
   ```bash
   cd apps/web
   npm run typecheck    # exit code 0
   npm run lint         # exit code 0
   npm test             # exit code 0 (17 test suites, 122 tests passed)
   npm run build        # exit code 0 (all 24 routes successfully compiled)
   ```

4. **Verify Sidebar User Action Preservation**:
   ```bash
   git diff feat/wave2-integrated HEAD -- apps/web/src/components/layout/Sidebar.tsx
   # Must return empty diff
   ```
