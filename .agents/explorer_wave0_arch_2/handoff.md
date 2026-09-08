# Handoff Report — Wave 0 Frontend Architecture & Contention Analysis
**Agent:** Wave 0 Frontend Architecture & Test Suite Explorer (`explorer_wave0_arch_2`)  
**Parent Orchestrator:** `777c8e44-9743-470b-8626-e64c595088d4`  
**Date:** 2026-09-04  

---

## 1. Observation

Direct observations from repository inspection:

1. **Root Git Baseline & Pre-Existing User Changes**:
   - `git status` output confirms branch `master`, HEAD commit `efcbfe1c934d55b300a4bb3dab6342ad94439d84`, with modified tracked files:
     - `apps/web/src/components/layout/Sidebar.tsx`
     - `package-lock.json`
   - `git diff apps/web/src/components/layout/Sidebar.tsx` shows lines 67–71 replaced a non-functioning `<button>` with an active POST form:
     ```tsx
     <form action="/auth/logout" method="POST">
       <button type="submit" className="p-1 rounded-md hover:bg-gray-800">
         <LogOut size={16} />
       </button>
     </form>
     ```
   - Multiple untracked files exist in the repository root (`apps/web/manual-test.js`, `full_diff.patch`, `full_log*.txt`, etc.).

2. **Frontend Dependencies & Framework Convention (`apps/web/package.json`)**:
   - Declares Next.js `16.3.3`, React `19.2.3`, `@playwright/test` `^1.62.1`, `tailwindcss` `^4`, `@tailwindcss/postcss` `^4`, and `lucide-react` `^1.32.0`.
   - Scripts: `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`, `"lint": "eslint"`, `"test": "node ../../scripts/patch-vitest-timeout.js && vitest run --coverage"`, `"typecheck": "tsc --noEmit"`. No `"test:e2e"` script is declared.
   - `apps/web/src/proxy.ts` (lines 4–68): In Next.js 16, proxy routing replaces middleware. `PRE_PHASE6_DEEP_AUDIT_REPORT.md` line 8 notes `proxy.ts` is the expected convention for Next.js 16 and must not be renamed to `middleware.ts`.

3. **Design Tokens & Theme Foundation (`apps/web/src/app/globals.css`)**:
   - Lines 3–6:
     ```css
     :root {
       --background: #ffffff;
       --foreground: #171717;
     }
     ```
   - Semantic tokens for `--surface`, `--muted`, `--border`, `--input`, `--primary`, `--secondary`, `--success`, `--warning`, `--destructive`, and focus rings are entirely absent.

4. **Shared UI Primitives (`apps/web/src/components/ui/`)**:
   - Directory does not exist on the filesystem (`find_by_name` and `list_dir` on `apps/web/src/components` returned only `BranchAccessError.tsx` and `layout/`).

5. **Shell Layout & Chrome Bleed (`apps/web/src/app/layout.tsx` & `apps/web/src/components/layout/AppShell.tsx`)**:
   - `apps/web/src/app/layout.tsx:18`:
     ```tsx
     <body className="min-h-full flex flex-col font-sans">
       <AppShell>{children}</AppShell>
     </body>
     ```
   - `apps/web/src/components/layout/AppShell.tsx:7–13` renders `<Sidebar />`, `<TopBar />`, and `<main>` unconditionally around all routes.
   - `apps/web/src/app/login/page.tsx:9–10` and `apps/web/src/app/auth/update-password/page.tsx:13–15` are rendered inside this authenticated shell, exposing the sidebar and topbar to unauthenticated users.

6. **Mobile Navigation Absence (`apps/web/src/components/layout/Sidebar.tsx`)**:
   - Line 6: `className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-screen border-r border-gray-800"`.
   - On screens < 768px, the sidebar is completely hidden. Neither `TopBar.tsx` nor `AppShell.tsx` provides a hamburger button or mobile drawer.

7. **Browser-Native Popups in Feature Flows**:
   - `AcademicYearsTable.tsx:12`: `if (confirm('Are you sure you want to delete this academic year?'))`
   - `AcademicYearsTable.tsx:16, 20, 22`: `alert(...)`
   - `ClassesTable.tsx:12, 16, 20, 22`: `confirm(...)` and `alert(...)`
   - `SectionsTable.tsx:12, 16, 20, 22`: `confirm(...)` and `alert(...)`
   - `CalendarEventsTable.tsx:28`: `if (!confirm('Are you sure you want to archive this event?')) return;`
   - `BellSchedulesTable.tsx:12, 16, 20, 22`: `confirm(...)` and `alert(...)`
   - `PeriodsTable.tsx:12, 16, 20, 22`: `confirm(...)` and `alert(...)`
   - `RoomsTable.tsx:12, 16, 20, 22`: `confirm(...)` and `alert(...)`
   - `TimetableEntryForm.tsx:184`: `if (confirm('Are you sure you want to archive this timetable entry?'))`

8. **Query Waterfalls and Uncached Context**:
   - `apps/web/src/lib/branch-context.ts:23`: `export async function getAppContext(): Promise<AppContext | null>` does not use `React.cache()`.
   - `apps/web/src/app/attendance/page.tsx:14–15`:
     ```tsx
     const context = await getAppContext();
     const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);
     ```
     `verifyPageBranchContext` internally calls `getAppContext()`, causing duplicate round-trips in addition to the call from `TopBar.tsx:8`.
   - `apps/web/src/app/scheduling/lib/page-data.ts:10–46` and `apps/web/src/app/scheduling/timetable/page.tsx:18–22`: 8 sequential queries are awaited one after another without `Promise.all()`.

9. **Accessibility Deficiencies in Modals**:
   - `AttendanceManager.tsx:308–354`: Correction modal is a raw `<div>` with `fixed inset-0 bg-gray-600 bg-opacity-50`; lacks `role="dialog"`, `aria-modal="true"`, focus trap, and Escape key listener.
   - `DrawerForm.tsx:14–45`: Drawer lacks ARIA dialog attributes, focus containment, and focus restoration.

10. **E2E Test Architecture & Fragility**:
    - `academic-structure.spec.ts:52`: `page.on('dialog', dialog => dialog.accept())` intercepts native browser dialogs.
    - `attendance.spec.ts:30, 34, 94, 98`: `await page.waitForTimeout(500)` relies on arbitrary timing rather than deterministic locators.
    - `students-security.spec.ts`: Asserts presence of inputs on `/students/new`, but contains zero form submission or mutation tests.

---

## 2. Logic Chain

1. **Isolation & Safety Requirement**:
   - From Observation 1, the working tree contains uncommitted user modifications (`Sidebar.tsx` and `package-lock.json`) and untracked files.
   - Running destructive git commands (`git reset --hard`, `git clean`) would destroy pre-existing user work.
   - Therefore, implementation specialists must be isolated in dedicated Git worktrees on separate branches, leaving the root working tree completely undisturbed.

2. **Wave 1 Ordering (Foundation Before Features)**:
   - From Observation 3 & 4, neither semantic tokens nor shared UI primitives exist.
   - From Observation 7 & 9, feature pages implement ad-hoc modals and native `confirm()`/`alert()` because canonical `Dialog`, `ConfirmDialog`, `Button`, and `Toast` primitives are missing.
   - Therefore, Wave 1 must exclusively execute Agent A (Design System tokens in `globals.css`) and Agent B (Primitives in `components/ui/`). All downstream feature agents (Waves 2–4) depend on these primitives.

3. **Wave 2 Ordering (Shell & Route Group Boundaries)**:
   - From Observation 5, wrapping `<AppShell>` in root `layout.tsx` exposes internal authenticated navigation to unauthenticated users on `/login` and `/auth/update-password`.
   - From Observation 6, mobile navigation is completely broken due to `hidden md:flex` on `Sidebar.tsx`.
   - From Observation 1, the user's `<form action="/auth/logout" method="POST">` in `Sidebar.tsx` must be preserved.
   - Therefore, Wave 2 must execute Agent C (rearchitect shell into `(auth)` and `(dashboard)` route groups, add mobile drawer, preserve logout form), Agent D (auth UX), and Agent E (forms/feedback).

4. **Wave 3 Ordering (Data Tables, Scheduling & Context Optimization)**:
   - From Observation 7 & 8, tables suffer from browser-native alerts, and scheduling suffers from 8 sequential queries and uncached `getAppContext()` calls.
   - Therefore, Wave 3 must execute Agent F (migrate tables to Wave 1 `ConfirmDialog`/`Toast`), Agent G (wrap `getAppContext()` with `React.cache()` and parallelize scheduling queries with `Promise.all()`), and Agent I (bulk onboarding).

5. **Wave 4 Ordering (Cross-Cutting Verification & Test Hardening)**:
   - From Observation 10, tests currently expect native `dialog` events, use `waitForTimeout`, and lack mutation coverage.
   - Updating tests before Wave 1–3 changes land would result in premature test failures.
   - Therefore, Wave 4 must execute Agent H (responsive & accessibility validation across 320px–desktop) and Agent J (E2E test expansion, deterministic synchronization, replacing `page.on('dialog')` with dialog locator checks).

---

## 3. Caveats

1. **Local Test Execution**: This investigation was strictly read-only and analytical. No Playwright test runs or build commands were executed in this agent turn to prevent accidental lockfile or build cache side effects in the dirty working tree.
2. **Next.js 16 Route Group Migration**: Moving `apps/web/src/app/` pages into `(auth)` and `(dashboard)` route groups requires careful URL path preservation. In Next.js App Router, route group parenthesis folders do not affect URL pathname paths, making this safe, but all import aliases (`@/app/...`) must be verified.
3. **Database RLS Policies**: Backend RLS policies and SQL migrations are strictly out of scope. Performance optimizations in Agent G must remain strictly within the client/server query layer (`Promise.all`, `React.cache()`).

---

## 4. Conclusion

The SchoolOS frontend requires a disciplined, multi-wave architectural hardening. The core defects—unconditional shell wrapping, missing UI primitives, pervasive `window.confirm()`/`window.alert()` usage, uncached context queries, missing mobile navigation, and testing gaps—are fully confirmed with exact file locations.

By executing the 6-wave dependency sequence with dedicated Git worktrees for each specialist agent, the orchestrator can parallelize execution, prevent merge contention on critical files (`globals.css`, `layout.tsx`, `package.json`), strictly preserve the user's pre-existing `Sidebar.tsx` logout fix, and reach full certification before Phase 6.

---

## 5. Verification Method

To independently verify all claims made in this report:

1. **Verify Baseline & User Work**:
   ```powershell
   git status
   git diff apps/web/src/components/layout/Sidebar.tsx
   ```
   *Expected Result*: Clean commit efcbfe1 at origin/master; Sidebar.tsx contains `<form action="/auth/logout" method="POST">`.

2. **Verify Missing UI Directory & Primitives**:
   ```powershell
   Test-Path "apps/web/src/components/ui"
   ```
   *Expected Result*: Returns `False`.

3. **Verify Auth Chrome Bleed in Layout**:
   Inspect `apps/web/src/app/layout.tsx:18` to confirm `<AppShell>{children}</AppShell>` wraps all child routes.

4. **Verify Native Popup Usage**:
   ```powershell
   git grep "confirm(" apps/web/src/
   git grep "alert(" apps/web/src/
   ```
   *Expected Result*: Multiple matches in `AcademicYearsTable.tsx`, `ClassesTable.tsx`, `SectionsTable.tsx`, `RoomsTable.tsx`, etc.

5. **Verify Sequential Query Waterfall & Duplicate Context**:
   Inspect `apps/web/src/app/scheduling/lib/page-data.ts:10–46` and `apps/web/src/lib/branch-context.ts:23–30` to confirm absence of `React.cache()` and sequential `await` queries.

6. **Verify Playwright Configuration & Arbitrary Waits**:
   Inspect `apps/web/e2e/attendance.spec.ts:30, 34, 94, 98` for `waitForTimeout(500)`.
