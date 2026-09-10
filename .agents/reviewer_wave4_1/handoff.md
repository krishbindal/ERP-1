# Handoff Report — Wave 4 Reviewer (Frontend Hardening)

**Role**: Wave 4 Reviewer & Adversarial Critic (`teamwork_preview_reviewer`)  
**Target Branch**: `feat/wave4-integrated`  
**Base Commit SHA**: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)  
**Integration Commit SHA**: `96fac29a08b6b95bc93c686bf49990b01b019a71`  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Git Status and Pre-existing User Work Preservation
- **Branch**: `feat/wave4-integrated` verified at HEAD commit `96fac29a08b6b95bc93c686bf49990b01b019a71`.
- **Sidebar Logout Form**: `apps/web/src/components/layout/Sidebar.tsx` lines 49-57 strictly preserves `<form action="/auth/logout" method="POST">` with `<button type="submit" ... aria-label="Log out">`, augmented with `min-h-[44px] min-w-[44px]` and `focus-ring`.
- **TopBar Logout Form**: `apps/web/src/components/layout/TopBar.tsx` lines 139-148 strictly preserves `<form action="/auth/logout" method="POST">` with `<button type="submit" ... aria-label="Log out">`.
- **Lockfile and Untracked Files**: `package-lock.json` remains unstaged/uncommitted. Untracked logs, patches, and scripts remain completely undisturbed.
- **Master Branch**: Unmodified.

### 1.2 Quality & Standards Inspection
- **FRONTEND-10 (Responsive Hardening)**:
  - Layout behavior verified at 320px, 375px, 390px, 768px, and desktop.
  - `Drawer.tsx` line 131 applies `max-w-[85vw] sm:max-w-md`, preventing viewport blowout on 320px devices.
  - `Table.tsx` line 12 applies `role="region"`, `aria-label={regionLabel || props['aria-label'] || 'Data table'}`, `tabIndex={0}`, and `focus-visible:ring-2`, providing keyboard-accessible horizontal scrolling.
  - Touch targets strictly enforce `min-h-[44px] min-w-[44px]` across interactive controls (Dialog close, Drawer close, Toast dismiss, Sidebar/TopBar logout buttons, navigation links, operating day items, form cancel/submit buttons).
- **FRONTEND-11 (Accessibility Hardening)**:
  - `Dialog.tsx` & `Drawer.tsx` decoupled sibling backdrop with `aria-hidden="true"`; dialog container itself has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and is never nested inside an `aria-hidden` parent.
  - Focus trap properly implemented (Tab and Shift+Tab wrap around focusable elements). Focus entry on mount and focus restoration on unmount confirmed.
  - Escape key dismisses Dialogs, Drawers, and topmost active Toasts.
  - Form label associations (`htmlFor`/`id`), required markers (`aria-hidden="true"`), error bindings (`aria-describedby`, `aria-invalid`), and visible focus rings (`focus-ring`) verified.
  - 17 unit tests in `apps/web/src/components/ui/ui-a11y-responsive.test.tsx` pass cleanly.
- **Elimination of Native Popups**:
  - Confirmed 0 occurrences of `window.confirm` and 0 occurrences of `window.alert` in `apps/web/src`. Replaced by `ConfirmDialog` and `Toast`.
- **Integrity Audit**:
  - No hardcoded test responses or facade logic detected in source code.
  - No `waitForTimeout` calls found anywhere in `apps/web/e2e/`.

### 1.3 Validation Commands & Results

| Validation Step | Command | Result | Details |
|---|---|---|---|
| TypeScript Check | `npm run typecheck` | **PASS** | Exit code 0, 0 type errors |
| ESLint | `npm run lint` | **PASS** | Exit code 0 (0 errors, 4 non-blocking warnings) |
| Vitest Unit Tests | `npm test -- --run` | **PASS** | 22/22 test files passed, 175/175 tests passed (16.4s) |
| Turbopack Build | `npm run build` | **PASS** | Compiled in 2.1s, static generation 15/15 routes successful |
| Playwright E2E | `npx playwright test ...` | **FAIL** | 22 passed, 6 skipped, **1 failed** (strict mode violation) |

### 1.4 Detailed Failure Observations in E2E Suite

#### Finding 1: Major Defect — Playwright Strict Mode Violation in `e2e/calendar.spec.ts`
- **Location**: `apps/web/e2e/calendar.spec.ts:143:61` and line 188.
- **Verbatim Error**:
  ```
  Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Add Event' }) resolved to 2 elements:
      1) <button type="button" class="... self-start sm:self-auto">Add Event</button> aka getByRole('button', { name: 'Add Event' }).first()
      2) <button type="button" class="...">Add Event</button> aka getByLabel('Data table').getByRole('button', { name: 'Add Event' })
  ```
- **Root Cause**: `CalendarEventsTable.tsx` renders an "Add Event" button in the section header, and when the table is empty, also renders an "Add Event" action button inside the empty state (`TableEmpty`). Querying `getByRole('button', { name: 'Add Event' })` without `.first()` resolves ambiguously and fails Playwright strict mode.
- **Suggested Fix**: Update `apps/web/e2e/calendar.spec.ts` lines 143 and 188 to use `.first()`:
  ```ts
  await page.getByRole('button', { name: 'Add Event' }).first().click();
  ```

#### Finding 2: Medium Defect — Test Flakiness Under Concurrent Execution & Pagination Assumption
- **Location**: `apps/web/e2e/students-form.spec.ts:64` and `apps/web/playwright.config.ts`.
- **Observation**:
  - When running Playwright without `--workers=1`, 6 parallel workers concurrently mutate the shared local Supabase database, resulting in race conditions and test timeouts.
  - In `students-form.spec.ts:64`, after creating a student, the test navigates to `/students` and asserts `await expect(page.locator('text=JaneE2E_... SmithE2E_...')).toBeVisible();`. Because the students table is paginated at 10 students per page (FRONTEND-06), once more than 10 students exist in the database, the newly created student is placed on page 2 and is not visible without searching.
- **Suggested Fix**:
  1. In `apps/web/e2e/students-form.spec.ts`, filter the table using the search box prior to the visibility assertion:
     ```ts
     await page.locator('#student-search').fill(testLastName);
     await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
     ```
  2. In `apps/web/playwright.config.ts`, ensure `workers: 1` or run E2E suites with sequential workers when targeting the shared local database to prevent state pollution.

---

## 2. Logic Chain

1. **Responsive & A11y Implementation Quality**:
   - The implementation of `Dialog.tsx`, `Drawer.tsx`, `Toast.tsx`, `Table.tsx`, `Input.tsx`, and `Select.tsx` is genuinely high quality. Sibling backdrops prevent accessibility tree masking; focus traps wrap seamlessly; touch targets strictly meet 44x44px; and table horizontal scroll regions provide keyboard accessibility.
   - All 175 unit and component tests pass without issue.
2. **Discrepancy with Integration Worker Handoff Report**:
   - `worker_wave4_integration/handoff.md` reported `6 skipped, 23 passed (32.9s) Exit code: 0` for Playwright E2E.
   - Independent verification revealed that `e2e/calendar.spec.ts` fails with an immediate strict mode violation (`getByRole('button', { name: 'Add Event' })` resolving to 2 elements).
   - Under the Master Specification and Certification Gate Criterion 18 ("Playwright tests actually execute and pass") and Rule "Never claim tests passed when they were not executed or hide failures", the reviewer cannot issue an APPROVE verdict while an E2E test actively fails.
3. **Verdict Determination**:
   - Because the failure is localized to test locator ambiguity in `calendar.spec.ts` and test data pagination in `students-form.spec.ts`, it is readily fixable without requiring architectural rework.
   - Therefore, the verdict is **REQUEST_CHANGES**.

---

## 3. Caveats

- **No Integrity Violation**:
  - No evidence of hardcoded test results, facade logic, or deliberate fabrication was found. The failure is an honest oversight caused by adding the accessible empty state button in `TableEmpty` inside `CalendarEventsTable.tsx`, which introduced a second "Add Event" button on the page.
- **Preserved User Work**:
  - Sidebar and TopBar logout POST actions, lockfile, and untracked files remain intact and unmodified.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

Wave 4 has implemented robust responsive layouts (FRONTEND-10) and accessibility primitives (FRONTEND-11), passed TypeScript typechecking, passed ESLint, passed all 175 Vitest unit tests, and passed Turbopack production builds.

However, the integration worker must address the following two items before final certification:
1. **Fix Playwright strict mode violation in `e2e/calendar.spec.ts`**:
   Target `getByRole('button', { name: 'Add Event' }).first()` at lines 143 and 188.
2. **Harden `e2e/students-form.spec.ts` against table pagination**:
   Use `#student-search` before asserting student visibility on `/students` to ensure idempotency across multiple test runs.

---

## 5. Verification Method

Once the changes are applied:

1. **Execute Playwright E2E Test Suite**:
   ```bash
   cd apps/web
   npx playwright test e2e/students-form.spec.ts e2e/academic-structure.spec.ts e2e/responsive-mobile.spec.ts e2e/regression-wave1-3.spec.ts e2e/calendar.spec.ts e2e/attendance.spec.ts --project=chromium-branchadmin --workers=1
   ```
   *Expected*: 23 passed, 6 skipped, **0 failed** (exit code 0).

2. **Execute Full Validation Suite**:
   ```bash
   cd apps/web
   npm run typecheck
   npm run lint
   npm test -- --run
   npm run build
   ```
   *Expected*: All exit code 0.
