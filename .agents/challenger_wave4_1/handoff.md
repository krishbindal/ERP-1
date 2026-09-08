# Handoff Report — Wave 4 Challenger (Adversarial Empirical Review)

**Role**: Wave 4 Challenger (`teamwork_preview_challenger`)  
**Target Branch**: `feat/wave4-integrated`  
**Commit SHA**: `96fac29a08b6b95bc93c686bf49990b01b019a71`  
**Base Commit SHA**: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)  
**Verdict**: **REJECTED** (P1 Test Suite Flakiness / Defect in `apps/web/e2e/students-form.spec.ts`)

---

## 1. Observation

### 1.1 Summary of Stress-Testing Results
| Challenge Area | Target | Verification Method | Result | Notes |
|---|---|---|---|---|
| 1. Focus Traps | Dialog & Drawer Tab cycling | Vitest & Playwright Chromium | **PASSED** | Tab wraps from last to first focusable element; Shift+Tab wraps from first to last; focus restored on close. |
| 2. Escape Dismissal | Dialog, Drawer, Toast | Vitest & Playwright Chromium | **PASSED** | Escape dismisses open Dialog and Drawer; sequential Escape dismisses active toasts from newest to oldest. |
| 3. Small Viewports | 320px, 375px, 390px | Playwright Chromium (320x568, 375x667, 390x844) | **PASSED** | Drawer `max-w-[85vw]` caps at 272px on 320px, leaving >= 47px backdrop visible and tap-accessible; Dialog `max-h-[calc(100vh-2rem)]` fits vertically (<= 536px); Table `role="region"` scrolls horizontally with 0 document blowout. |
| 4. Touch Targets | Controls >= 44x44px | Playwright bounding box inspection | **PASSED** | Hamburger button, Drawer close, Dialog close, Toast dismiss, navigation links, and mobile submit/cancel buttons all measure >= 44x44px. |
| 5. Core Code Quality | Build, Lint, Typecheck, Unit Tests | Turbopack, ESLint, tsc, Vitest | **PASSED** | 0 TS errors, 0 ESLint errors, Next.js build succeeds in 1115ms, 21 unit test files passed (161 tests). |
| 6. E2E Test Stability | Playwright Suite under repeated runs | Playwright Chromium | **FAILED (REPRODUCED)** | `apps/web/e2e/students-form.spec.ts:32:7` fails with timeout after database student count exceeds 10 due to table pagination overflow. Local parallel workers (6) trigger concurrency timeouts on database mutations. |

---

### 1.2 Verbatim Defect Observation: `e2e/students-form.spec.ts`

**Command executed**:
```bash
cd apps/web
npx playwright test e2e/students-form.spec.ts --project=chromium-branchadmin
```

**Verbatim Output and Failure Log**:
```
Running 8 tests using 6 workers
[1/8] [setup] › e2e\auth.setup.ts:15:8 › authenticate as superadmin
...
[7/8] [chromium-branchadmin] › e2e\students-form.spec.ts:5:7 › Student Enrollment Form Submission › Branch Admin encounters validation error display on invalid submit
[8/8] [chromium-branchadmin] › e2e\students-form.spec.ts:32:7 › Student Enrollment Form Submission › Branch Admin completes real student form submission successfully
  1) [chromium-branchadmin] › e2e\students-form.spec.ts:32:7 › Student Enrollment Form Submission › Branch Admin completes real student form submission successfully 

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=JaneE2E_1788548286842 SmithE2E_1788548286842')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=JaneE2E_1788548286842 SmithE2E_1788548286842')

      62 |     await page.goto('/students');
      63 |     await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
    > 64 |     await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
         |                                                                         ^
      65 |   });
      66 | });
        at C:\Users\krish\Desktop\ERP 1\apps\web\e2e\students-form.spec.ts:64:73
```

**Playwright Error Context Tree Inspection (`test-results/.../error-context.md`)**:
```yaml
  - heading "Students" [level=1]
  - link "Add Student":
    - /url: /students/new?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02
  - searchbox "Search students"
  - combobox "Filter by status":
    - option "All Statuses" [selected]
    - option "Active"
    - option "Inactive"
    - option "Withdrawn"
  - text: Showing 1-10 of 14 students
  - region "Data table":
    - table:
      - rowgroup:
        - row "Sort by Name (asc) Sort by Status (none) Actions Actions":
          - columnheader "Sort by Name (asc)":
            - button "Sort by Name (asc)": Name
          - columnheader "Sort by Status (none)":
            - button "Sort by Status (none)": Status
          - columnheader "Actions Actions"
      - rowgroup:
        - row "Student E2E ACTIVE View profile for Student E2E": ...
        ... (Rows 1-10) ...
  - paragraph: Page 1 of 2
  - button "Previous" [disabled]
  - button "Next"
```

---

### 1.3 Concurrency Contention Observation (Local Playwright Runs)

When executing `npx playwright test e2e/academic-structure.spec.ts e2e/attendance.spec.ts e2e/calendar.spec.ts e2e/regression-wave1-3.spec.ts e2e/responsive-mobile.spec.ts --project=chromium-branchadmin`:
- **With default local workers (6 parallel workers)**:
  Mutating tests `academic-structure.spec.ts:70:7` (Create Class) and `academic-structure.spec.ts:123:7` (Create Section) and `attendance.spec.ts:74:9` (Publish Attendance) execute simultaneously against the single local Supabase container. The "New Class" and "New Section" drawer form submissions hung on `Saving...`, exceeding Playwright's 30000ms locator timeout.
- **With `--workers=1`**:
  All 21 tests across those 5 spec files passed without a single failure in 58.9s (6 expected skips for role scope).

---

## 2. Logic Chain

1. **Root Cause of `e2e/students-form.spec.ts:32:7` Failure**:
   - In Wave 3, `StudentsTable.tsx` was hardened to include pagination with `const pageSize = 10;`.
   - In Wave 4, Agent J authored `apps/web/e2e/students-form.spec.ts` to test real student enrollment.
   - The test inserts a new student with a timestamped name into Supabase and verifies the detail page `/students/[id]`.
   - The test then navigates to `/students` (line 62) and immediately asserts:
     ```ts
     await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
     ```
   - In an environment where fewer than 10 students exist, or when the new student's name sorts into the first 10 rows alphabetically, this assertion happens to pass.
   - However, in repeated local test execution (or in any seeded environment with > 10 students), the total student count exceeds 10 (e.g. `Showing 1-10 of 14 students`, `Page 1 of 2`).
   - The newly created student sorts onto Page 2.
   - Because `e2e/students-form.spec.ts` does NOT filter the table using `#student-search` (unlike `regression-wave1-3.spec.ts` which properly tests search filtering), nor does it navigate to Page 2, Playwright waits 5000ms searching the visible DOM of Page 1 and fails with `element(s) not found`.
   - This failure is 100% deterministic and fatal once cumulative test runs exceed 10 students.

2. **Root Cause of Concurrency Timeouts**:
   - `playwright.config.ts` sets `workers: process.env.CI ? 1 : undefined`.
   - When executing tests locally, `CI` is not set, resulting in 6 parallel worker processes creating and modifying foreign-key-interlocked tables (`academic_years`, `classes`, `sections`, `attendances`) at the exact same millisecond.
   - PostgreSQL transaction locks on shared parent records cause form submit actions to hang on `Saving...`.
   - Serializing with `--workers=1` completely resolves this contention.

3. **Status of Other Wave 4 Hardening Deliverables**:
   - **Dialog & Drawer Accessibility & Focus Traps**: Thoroughly stress-tested via Vitest and Playwright Chromium. Tab containment wraps from last button to close button; Shift+Tab wraps from close button to last button. Unnested backdrop siblings (`aria-hidden="true"`) prevent accessibility tree obscuration.
   - **Escape Key Dismissal**: Tested and confirmed across Dialog, Drawer, and sequentially across multiple Toasts (dismissing topmost active toast).
   - **320px Responsive Viewport**: Measured at 320x568. Navigation Drawer width is bounded by `max-w-[85vw]` (measures 272px), leaving >= 47px of backdrop exposed and tap-accessible. Dialog fits vertically with `max-h-[calc(100vh-2rem)]`. Table horizontal scroll region functions without document blowout.
   - **Touch Targets**: All interactive controls measure >= 44x44px.
   - **Core Build**: `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## 3. Caveats

- The application runtime code itself is sound: `StudentsTable` correctly paginates, and `StudentsService` correctly creates students and active enrollments in Supabase.
- The failure is in the newly integrated E2E test suite (`apps/web/e2e/students-form.spec.ts`), which Agent J owned in Wave 4 (`FRONTEND-14: Frontend Testing`). Because the integration worker certified the suite as regression-free and stable, this unhandled pagination assumption invalidates that certification under real repeated execution.

---

## 4. Conclusion

**Verdict: REJECTED**

While the responsive, accessibility, and UI primitive hardening delivered by Agent H is exceptional and fully verified, the E2E test suite deliverable from Agent J contains a fatal assumption that causes `e2e/students-form.spec.ts` to fail whenever more than 10 students exist in the branch.

### Required Remediation Before Wave 4 Certification:
1. **Fix `apps/web/e2e/students-form.spec.ts`**:
   Before line 64:
   ```ts
   // Navigate back to /students list and verify student is listed
   await page.goto('/students');
   await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();

   // Filter using the search input to ensure newly created student appears on page 1 of results
   await page.fill('#student-search', testFirstName);
   await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
   ```
2. **Document or Configure Local Test Execution**:
   Ensure local verification instructions specify `--workers=1` (or configure `playwright.config.ts` default workers to 1 for mutating database suites) to prevent local transaction deadlocks.

---

## 5. Verification Method

To independently reproduce the failure and verify all challenger observations:

1. **Verify Git Branch and Commit**:
   ```bash
   git status
   git log -n 1 --oneline
   ```
   *Expected*: On `feat/wave4-integrated`, commit `96fac29`.

2. **Reproduce the `students-form.spec.ts` Failure**:
   ```bash
   cd apps/web
   npx playwright test e2e/students-form.spec.ts --project=chromium-branchadmin
   ```
   *Result*: Test 2 fails with timeout on line 64: `Error: element(s) not found waiting for locator('text=JaneE2E_... SmithE2E_...')`.

3. **Verify Vitest Unit Suite (21 files, 161 tests)**:
   ```bash
   cd apps/web
   npm test -- --run
   ```
   *Expected*: 21 passed, 161 passed, 0 failures.

4. **Verify TypeScript & ESLint**:
   ```bash
   cd apps/web
   npm run typecheck
   npm run lint
   ```
   *Expected*: Exit code 0, 0 errors.

5. **Verify 5 Stable Specs with `--workers=1`**:
   ```bash
   cd apps/web
   npx playwright test e2e/academic-structure.spec.ts e2e/attendance.spec.ts e2e/calendar.spec.ts e2e/regression-wave1-3.spec.ts e2e/responsive-mobile.spec.ts --workers=1 --project=chromium-branchadmin
   ```
   *Expected*: 21 passed, 6 skipped, 0 failed.

6. **Verify Next.js Production Build**:
   ```bash
   cd apps/web
   npm run build
   ```
   *Expected*: Exit code 0, compiled successfully.
