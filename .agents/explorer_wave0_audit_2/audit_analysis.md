# SchoolOS Frontend Hardening — Comprehensive Audit & Specification Analysis Report

**Date:** 2026-09-04  
**Agent:** Wave 0 Frontend Audit & Spec Explorer (`explorer_wave0_audit_2`)  
**Workspace:** `c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave0_audit_2\`  
**Baseline Git Commit:** `efcbfe1c934d55b300a4bb3dab6342ad94439d84` (master HEAD)  
**Parent Task:** SchoolOS Frontend Hardening Master Orchestration  

---

## 1. Executive Summary

This report delivers a rigorous, code-grounded audit of the SchoolOS frontend codebase (`apps/web/src/`), cross-referenced with `SchoolOS_Master_Specification_FINAL` (specs 19, 20, 21, 27, 29, 30, 31, 44) and architectural decision logs (`docs/DESIGN.md`, `docs/design/`, `docs/44_DECISION_LOG.md`).

Every workstream (FRONTEND-01 through FRONTEND-14) has been investigated down to exact files and line numbers. The findings are categorized into **Confirmed Defects**, **Partially Confirmed Findings**, **Architectural Recommendations vs Mandatory Fixes**, **Stitch Visual Suggestions**, **Performance Targets Requiring Measurement**, and **Strict Phase 6 Boundaries**.

### Summary of Critical Discoveries:
1. **Application Shell Defect (P0/FRONTEND-02, FRONTEND-04):** `apps/web/src/app/layout.tsx` wraps all routes unconditionally in `<AppShell>`, causing unauthenticated `/login` and forced `/auth/update-password` routes to render with the authenticated `Sidebar` and `TopBar`.
2. **Missing Mobile Navigation (P0/FRONTEND-02, FRONTEND-10):** `Sidebar.tsx` has `hidden md:flex`, meaning it is completely hidden on screens `< 768px` (e.g., 320px, 375px, 390px), and neither `TopBar` nor `AppShell` provides a mobile hamburger menu or drawer. Mobile users have zero navigation capability.
3. **Absence of Shared UI Primitives (P1/FRONTEND-03):** `apps/web/src/components/ui/` does not exist. Form inputs, buttons, status badges, and tables are duplicated inline across 20+ files with ad-hoc classes.
4. **Native Browser Popups (P1/FRONTEND-03, FRONTEND-06, FRONTEND-07):** 8 instances of `confirm()` and 18 instances of `alert()` exist in production components.
5. **Silent Error Swallowing (P1/FRONTEND-05):** In `apps/web/src/app/students/new/page.tsx:51-54`, server action errors are logged to `console.error` and swallowed with an empty return, leaving users stranded with no feedback.
6. **Query Waterfall (P1/FRONTEND-09, FRONTEND-12):** `fetchSchedulingPageData` executes 5 sequential queries in series, followed by 3 more sequential queries in `timetable/page.tsx` (an 8-query waterfall for a single page load).
7. **Uncached App Context (P1/FRONTEND-12):** `getAppContext()` in `branch-context.ts` is not wrapped in `React.cache()`, triggering duplicate database calls per RSC render.
8. **Missing Bulk / Onboarding Infrastructure (P2/FRONTEND-08):** Zero backend contracts or frontend code exist for CSV import or onboarding.
9. **Accessibility & Form Deficiencies (P1/FRONTEND-11):** `DrawerForm.tsx` lacks ARIA dialog roles, focus traps, and focus restoration; forms across the app dissociate `<label>` from `<input>` (missing `htmlFor` and `id`).
10. **Testing Gaps (P1/FRONTEND-14):** Zero component tests exist; `students-security.spec.ts` only checks field visibility and never submits a student form; `attendance.spec.ts` relies on arbitrary `waitForTimeout(500)`.

---

## 2. Catalog of 14 Workstreams (FRONTEND-01 to FRONTEND-14)

### FRONTEND-01: Design System Foundation
- **Owned Scope:** Semantic tokens, typography scale, theme foundation, global CSS variables.
- **Specification Source:** `docs/DESIGN.md`, `19_UX_UI_SYSTEM.md` Section "Design tokens".
- **Current Implementation:**
  - `apps/web/src/app/globals.css`:
    ```css
    @import "tailwindcss";

    :root {
      --background: #ffffff;
      --foreground: #171717;
    }
    ...
    body {
      background: var(--background);
      color: var(--foreground);
      font-family: Arial, Helvetica, sans-serif;
    }
    ```
- **Code Observations:**
  1. `globals.css` uses Tailwind CSS v4 `@import "tailwindcss";`.
  2. Only `--background` and `--foreground` are defined. None of the tokens specified in `docs/DESIGN.md` exist (`surface`, `surface-dim`, `surface-container-*`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `primary: #2563eb`, `secondary: #4f46e5`, `error: #ef4444`).
  3. `body` font family specifies `Arial, Helvetica, sans-serif`, ignoring the required `Inter` font scale defined in `docs/DESIGN.md`.
  4. Dark mode defines arbitrary `#0a0a0a` / `#ededed` values rather than semantic surface tokens.
- **Action Required for Agent A:**
  Define semantic CSS custom properties in `globals.css` matching `docs/DESIGN.md`, configure `@theme` block for Tailwind v4, configure Inter font typography hierarchy, radius tokens (sm: 6px, md: 8px), and focus ring styles (`2px primary`).

---

### FRONTEND-02: Application Shell
- **Owned Scope:** `AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, authenticated shell boundaries.
- **Specification Source:** `19_UX_UI_SYSTEM.md` lines 14-16, `docs/design/02_super_admin_shell.md`, `docs/design/stitch_phase3c4_ui.md` Section 1.
- **Current Implementation:**
  - `apps/web/src/app/layout.tsx` (lines 17-19):
    ```tsx
    <body className="min-h-full flex flex-col font-sans">
      <AppShell>{children}</AppShell>
    </body>
    ```
  - `apps/web/src/components/layout/Sidebar.tsx` (lines 6, 67-71):
    ```tsx
    <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-screen border-r border-gray-800">
    ...
    <form action="/auth/logout" method="POST">
      <button type="submit" className="p-1 rounded-md hover:bg-gray-800">
        <LogOut size={16} />
      </button>
    </form>
    ```
  - `apps/web/src/components/layout/TopBar.tsx` (lines 5-11, 29-35):
    Server component reading context; no mobile menu trigger.
- **Code Observations:**
  1. `layout.tsx` unconditionally wraps all routes in `<AppShell>`.
  2. Unauthenticated pages (`/login`) and forced reset (`/auth/update-password`) are rendered with `Sidebar` and `TopBar`.
  3. On mobile (< 768px), `Sidebar` is `hidden md:flex`, and `TopBar` has no menu toggle, completely eliminating navigation on mobile viewports.
  4. `Sidebar.tsx:67-71` contains pre-existing user work (logout form POST) that must be preserved.
- **Action Required for Agent C:**
  Establish shell boundaries so `/login` and `/auth/update-password` do not inherit `Sidebar`/`TopBar`. Implement mobile drawer/navigation triggered from `TopBar`. Preserve the logout form submission and add accessible names.

---

### FRONTEND-03: Shared UI Primitives
- **Owned Scope:** `apps/web/src/components/ui/` (Button, Input, Select, Badge, Card, Tabs, Dialog, ConfirmDialog, Drawer, Toast).
- **Specification Source:** `docs/44_DECISION_LOG.md` ADR 012 (shadcn/ui + Tailwind), `docs/DESIGN.md` Section "Components", `19_UX_UI_SYSTEM.md` Section "Global components".
- **Current Implementation:**
  - Directory `apps/web/src/components/ui/` does NOT exist in the repository.
  - Every component uses raw HTML elements with custom inline Tailwind utility classes.
- **Code Observations:**
  1. Missing `ConfirmDialog`: Components rely on native `window.confirm()`.
  2. Missing `Toast` / alert banner: Components rely on `alert(result.error)`.
  3. Missing `Drawer`: `apps/web/src/app/academic-structure/components/DrawerForm.tsx` is an ad-hoc implementation lacking WAI-ARIA modal dialog compliance.
  4. Missing `Button`, `Input`, `Select`, `Badge`, `Card`, `Tabs`.
- **Action Required for Agent B:**
  Create code-owned primitives in `apps/web/src/components/ui/` with semantic token bindings, visible focus states, accessible names, disabled/loading states, keyboard navigation, and focus management (focus trap & restoration for Dialog/ConfirmDialog/Drawer).

---

### FRONTEND-04: Auth & Authorization UX
- **Owned Scope:** Login page UX, password reset UX, auth redirects, branch context UX hints, unauthorized/forbidden states.
- **Specification Source:** `docs/design/01_login_screen.md`, `docs/design/stitch_phase3c4_ui.md` Section 4, `SchoolOS_Master_Specification_FINAL/12_RBAC_PERMISSION_MATRIX.md`.
- **Current Implementation:**
  - `apps/web/src/app/login/page.tsx`:
    Inline styled form, wrapped in `AppShell` with full sidebar visible.
  - `apps/web/src/app/auth/update-password/page.tsx`:
    Wrapped in `AppShell` with `min-h-screen flex items-center justify-center`, resulting in double scrollbars and layout deformation.
  - `apps/web/src/components/BranchAccessError.tsx` vs `apps/web/src/app/scheduling/components/BranchAccessError.tsx`:
    Two duplicate implementations of `BranchAccessError`. Both render raw plain text for `NO_CONTEXT` and `NO_BRANCH_SELECTED` without navigation CTAs or design-system illustrations.
- **Action Required for Agent D:**
  Render clean standalone auth layouts for `/login` and `/auth/update-password` without authenticated chrome. Unify `BranchAccessError` into a single canonical component adhering to `docs/design/stitch_phase3c4_ui.md` Section 4 (icon, descriptive copy, "Return to Dashboard" CTA).

---

### FRONTEND-05: Forms & Feedback
- **Owned Scope:** Form patterns, validation feedback, submit states, server-action error presentation, eliminating silent error swallowing.
- **Specification Source:** `19_UX_UI_SYSTEM.md` Section "Forms", `docs/DESIGN.md` Section "States".
- **Current Implementation:**
  - `apps/web/src/app/students/new/page.tsx` (lines 51-54):
    ```tsx
    if ('error' in result) {
      console.error(result.error);
      return;
    }
    ```
    Silent error swallowing. If student enrollment fails, the error is written to console and the user sees no feedback.
  - `apps/web/src/app/students/new/page.tsx` (lines 64-77):
    Labels lack `htmlFor` attributes; inputs lack `id` attributes.
  - `apps/web/src/app/communication/new/CommunicationForm.tsx` (lines 64, 95, 100):
    Labels lack `htmlFor`; inputs and textarea lack `id`.
  - `apps/web/src/app/attendance/components/AttendanceManager.tsx` (lines 114-115):
    Ternary operator bug on error message extraction:
    `const err = res.error as any; setMessage({ text: err.message || typeof err === 'string' ? err : 'Failed to lock', type: 'error' });`
  - Inconsistent submit states: Forms either lack pending states or use manual `loading` booleans without button disablement.
- **Action Required for Agent E:**
  Eliminate silent error swallowing in `students/new/page.tsx`. Connect all form labels to inputs using explicit `htmlFor`/`id` pairs. Implement pending/loading states on submit buttons to prevent double-submission. Surface server action errors inline and via toast/alert primitives.

---

### FRONTEND-06: Data Tables
- **Owned Scope:** Table primitives, search, filtering, sorting, pagination, empty/loading/error states.
- **Specification Source:** `19_UX_UI_SYSTEM.md` Section "Tables", `docs/DESIGN.md` Section "Tables" and "States", `docs/design/stitch_phase3c4_ui.md` Section 3.2.
- **Current Implementation:**
  - `apps/web/src/app/students/page.tsx`:
    Unpaginated list of students (`StudentsService.listStudents()`). No search input, no filtering by class/section/status, no sorting, no pagination.
  - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`. No search, filter, or pagination.
  - `apps/web/src/app/academic-structure/components/ClassesTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`. No pagination or filtering.
  - `apps/web/src/app/academic-structure/components/SectionsTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`. No pagination or filtering.
  - `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`.
  - `apps/web/src/app/scheduling/components/PeriodsTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`.
  - `apps/web/src/app/scheduling/components/RoomsTable.tsx`:
    Lines 12, 16, 20, 22 use `confirm()` and `alert()`.
- **Action Required for Agent F:**
  Create reusable table presentation primitives (or clean composite wrappers). Replace all `confirm()` and `alert()` calls with `ConfirmDialog` and toast primitives. Add scalable pagination, search, and empty states with CTAs for high-value entity tables (especially Students). Avoid over-paginating tiny configuration lists where detrimental to UX.

---

### FRONTEND-07: Feature UI Hardening
- **Owned Scope:** Hardening feature views across Students, Academic Structure, Attendance, Homework, Communication, and Admin App-Config.
- **Specification Source:** `20_SCREEN_INVENTORY.md`, `docs/design/stitch_phase3c4_ui.md`.
- **Current Implementation:**
  - `apps/web/src/app/students/page.tsx`:
    Line 50 hardcodes `bg-green-100 text-green-800` for all statuses regardless of value.
  - `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx`:
    Line 66 checks `year.status === 'active'`, but form saves uppercase `'ACTIVE'`, resulting in false fallback to gray badge.
  - `apps/web/src/app/homework/components/TeacherDashboard.tsx`:
    Lacks empty state CTA and uses hardcoded status badges.
- **Action Required for Agents E, F, & G (per ownership):**
  Harden status badge color mapping, align enum casing, standardize action buttons with accessible names, and add consistent empty states.

---

### FRONTEND-08: Bulk & Onboarding UX
- **Owned Scope:** Bulk upload UX shell, import wizard, CSV reconciliation preview, duplicate resolution presentation, onboarding checklist.
- **Specification Source:** `27_IMPORT_EXPORT.md`, `39_PROJECT_ROADMAP.md` Section "Onboarding Checklists", `ORIGINAL_REQUEST.md` line 475.
- **Current Implementation:**
  - Repository check: `grep_search` across `apps/web/src/` and `packages/` for `bulk`, `import`, `csv`, and `onboarding` found ZERO backend contracts, endpoints, or DB functions.
  - `docs/FEATURE_INVENTORY_RECONCILIATION.md` line 20 and `docs/POST_AUDIT_REMEDIATION_PLAN.md` line 33 explicitly classify Bulk Import and Onboarding Automation as DEFERRED.
- **Code Observations:**
  - `ORIGINAL_REQUEST.md` specifically directs:
    "Inspect existing backend contracts first. Do not invent APIs. If backend functionality is missing: document it, stop at the frontend boundary, do not silently create fake functionality."
- **Action Required for Agent I:**
  Document the backend API gap explicitly. Build only generic, reusable frontend infrastructure (e.g. client-side CSV parsing dropzone, column mapping preview component, step-by-step wizard shell) without fabricating non-existent backend endpoints.

---

### FRONTEND-09: Scheduling UX
- **Owned Scope:** Timetable grid, period management, room management, bell schedule management, responsive timetable representation.
- **Specification Source:** `39_PROJECT_ROADMAP.md` Scheduling domain, `30_PERFORMANCE_SCALABILITY.md` line 11 ("timetable"), `docs/DESIGN.md` Section "Responsive Rules".
- **Current Implementation:**
  - `apps/web/src/app/scheduling/timetable/components/TimetableGrid.tsx`:
    Line 89: `<div className="min-w-[800px]">` wrapped in `overflow-x-auto`.
    On mobile viewports (320px, 375px, 390px), this produces a wide 7-day grid that forces horizontal scrolling with unreadable narrow day columns.
  - `apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx`:
    Line 184 uses `confirm('Are you sure you want to archive this timetable entry?')`.
- **Action Required for Agent G:**
  Implement responsive timetable layout: full multi-column grid on desktop, and a single-day selector / tabbed day view on mobile screens (< 768px). Replace `confirm()` with `ConfirmDialog`. Coordinate query optimization with FRONTEND-12.

---

### FRONTEND-10: Responsive Behavior & Navigation
- **Owned Scope:** Viewport behavior across 320px, 375px, 390px, 768px, and desktop; mobile nav, drawer sheets, horizontal scrolling mitigation.
- **Specification Source:** `docs/DESIGN.md` Section "Responsive Rules", `19_UX_UI_SYSTEM.md` Section "Mobile", `ORIGINAL_REQUEST.md` lines 708-732.
- **Current Implementation:**
  - 320px / 375px / 390px:
    - Sidebar is completely hidden (`hidden md:flex`), leaving users with zero navigation links.
    - TopBar has no hamburger button.
    - `TimetableGrid` overflows at `min-w-[800px]`.
    - `DrawerForm` has `pl-10`, causing 40px margin squeeze on narrow mobile screens.
    - Entity data tables (`AcademicYearsTable`, `StudentsPage`) have no card view or responsive stacking.
- **Action Required for Agent H & Agent C:**
  Verify and fix mobile layouts at 320px, 375px, 390px, 768px, and desktop. Ensure mobile drawer navigation exists, tables collapse or scroll cleanly with proper mobile headers, and forms fit mobile viewports without horizontal clipping.

---

### FRONTEND-11: Accessibility
- **Owned Scope:** WAI-ARIA compliance, focus entry/containment/restoration, visible focus, escape key handling, label association, icon button labels.
- **Specification Source:** `31_ACCESSIBILITY.md`, `19_UX_UI_SYSTEM.md` Section "Accessibility", `docs/DESIGN.md` Section "Accessibility", `ORIGINAL_REQUEST.md` lines 688-706.
- **Current Implementation:**
  - `apps/web/src/app/academic-structure/components/DrawerForm.tsx`:
    Lacks `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, and focus restoration.
  - `apps/web/src/components/layout/Sidebar.tsx` (line 68):
    Logout submit button `<button type="submit" ...><LogOut size={16} /></button>` lacks `aria-label="Log out"`.
  - Missing label associations in `students/new/page.tsx`, `CommunicationForm.tsx`, and `AttendanceManager.tsx` (`<label>` tags lack `htmlFor` and inputs lack `id`).
  - Missing visible focus indicators: interactive elements lack `focus-visible:ring-2 focus-visible:ring-blue-600`.
- **Action Required for Agent H & Primitive Owners:**
  Add standard ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) to modal containers. Implement accessible focus trapping and focus restoration on open/close. Ensure all `<label>` elements have matching `htmlFor` and `id` attributes. Add `aria-label` to all icon buttons. Ensure visible focus rings on interactive elements.

---

### FRONTEND-12: Frontend Performance
- **Owned Scope:** Query waterfalls, duplicate context requests, expensive re-renders, measurement before and after optimization.
- **Specification Source:** `30_PERFORMANCE_SCALABILITY.md` Section "Principles" ("Measure before optimizing"), `ORIGINAL_REQUEST.md` lines 418-444, 734-750.
- **Current Implementation:**
  1. **Scheduling Query Waterfall:**
     `apps/web/src/app/scheduling/lib/page-data.ts`:
     - Line 10: `await supabase.from('academic_years').select('id')...`
     - Line 19: `await supabase.from('timetable_entries').select(...)...`
     - Line 36: `await supabase.from('periods').select('*')...`
     - Line 37: `await supabase.from('rooms').select('*')...`
     - Line 38: `await supabase.from('staff_branch_profiles').select(...)...`
     Followed immediately in `apps/web/src/app/scheduling/timetable/page.tsx`:
     - Line 20: `await supabase.from('classes').select('*')...`
     - Line 21: `await supabase.from('sections').select('*')...`
     - Line 22: `await supabase.from('subjects').select('*')...`
     Total: **8 sequential roundtrips** to Supabase. `periods`, `rooms`, `teachers`, and `subjects` do NOT depend on `academicYearId` and could run in parallel with `academic_years`.
  2. **Duplicate `getAppContext()` Invocations:**
     `apps/web/src/lib/branch-context.ts:23`:
     `getAppContext()` queries Supabase Auth and memberships directly on every call. It is called by `TopBar.tsx:8`, by page-level `verifyPageBranchContext()`, and by pages directly (e.g., `attendance/page.tsx:14`, `homework/page.tsx:13`, `communication/page.tsx:10`). It is NOT wrapped in `React.cache()`, causing redundant DB queries per request.
- **Action Required for Agent G:**
  Wrap `getAppContext()` in `React.cache()`. Refactor `fetchSchedulingPageData` and `timetable/page.tsx` using `Promise.all` to batch independent queries. Capture baseline query count and execution latency before and after optimization.

---

### FRONTEND-13: Visual QA
- **Owned Scope:** Visual hierarchy, typography consistency, spacing conventions, surface elevation, control states, Stitch alignment.
- **Specification Source:** `docs/DESIGN.md`, `docs/design/stitch_phase3c4_ui.md`.
- **Current Implementation:**
  - High degree of visual variance across feature pages:
    - Ad-hoc button classes (`bg-blue-600 hover:bg-blue-700`, `bg-green-600 hover:bg-green-700`, `px-3 py-1`, `px-4 py-2`).
    - Inconsistent card surfaces (`bg-white shadow rounded`, `bg-white shadow-sm border`, `bg-white shadow-xl`).
    - Typography defaults to Arial; inconsistent heading weights and sizes across pages.
    - Empty states are unstyled gray text without illustrations or CTAs.
- **Action Required for Agent K:**
  Audit integrated screens in Wave 5 against Stitch designs and `docs/DESIGN.md`. Verify typography hierarchy, token usage, button styling, card elevation, and empty state presentation.

---

### FRONTEND-14: Frontend Testing
- **Owned Scope:** Component test foundation, React Testing Library evaluation, Playwright E2E improvements, deterministic waits, real CRUD coverage.
- **Specification Source:** `29_TESTING_QA.md`, `ORIGINAL_REQUEST.md` lines 500-528.
- **Current Implementation:**
  - `apps/web/package.json`:
    Vitest and JSDOM are installed (`vitest`, `jsdom`, `@vitejs/plugin-react`). `@testing-library/react` is not installed.
  - Zero component tests (`.test.tsx`) exist in `apps/web/`.
  - `apps/web/e2e/attendance.spec.ts`:
    Lines 30, 34, 94, 98 use arbitrary `await page.waitForTimeout(500);` instead of deterministic assertions.
  - `apps/web/e2e/students-security.spec.ts`:
    Lines 67-78 only test form visibility (`toBeVisible()`). Zero tests fill out and submit a student enrollment form.
  - `apps/web/e2e/academic-structure.spec.ts`:
    Only tests Academic Year CRUD. Class CRUD and Section CRUD are completely untested.
- **Action Required for Agent J:**
  Establish component testing using Vitest + React Testing Library. Replace arbitrary `waitForTimeout` calls with deterministic waits. Add full student form enrollment E2E tests, Class CRUD E2E tests, Section CRUD E2E tests, and responsive layout assertions.

---

## 3. Categorized Findings Matrix

### Category A: Confirmed Defects in Code

| Finding ID | Workstream | File Path & Line | Defect Description | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | FRONTEND-02 / 04 | `apps/web/src/app/layout.tsx:18` | `<AppShell>` wraps all routes unconditionally; `/login` and `/auth/update-password` inherit authenticated `Sidebar` and `TopBar`. | P0 |
| **DEF-02** | FRONTEND-02 / 10 | `apps/web/src/components/layout/Sidebar.tsx:6` | `Sidebar` is `hidden md:flex`, with no mobile hamburger menu or drawer toggle in `TopBar`, leaving `< 768px` users with zero navigation. | P0 |
| **DEF-03** | FRONTEND-05 | `apps/web/src/app/students/new/page.tsx:51-54` | Silent error swallowing: Server action errors are logged to `console.error` and swallowed with empty `return;`, leaving user with no error feedback. | P1 |
| **DEF-04** | FRONTEND-06 / 07 | Multiple files (8 instances) | Browser-native `confirm()` used for deletions in `AcademicYearsTable.tsx:12`, `ClassesTable.tsx:12`, `SectionsTable.tsx:12`, `BellSchedulesTable.tsx:12`, `PeriodsTable.tsx:12`, `RoomsTable.tsx:12`, `CalendarEventsTable.tsx:28`, `TimetableEntryForm.tsx:184`. | P1 |
| **DEF-05** | FRONTEND-05 / 06 | Multiple files (18 instances) | Browser-native `alert()` used for error presentation in `AcademicYearsTable.tsx:16,20,22`, `ClassesTable.tsx:16,20,22`, `SectionsTable.tsx:16,20,22`, `BellSchedulesTable.tsx:16,20,22`, `PeriodsTable.tsx:16,20,22`, `RoomsTable.tsx:16,20,22`. | P1 |
| **DEF-06** | FRONTEND-09 / 12 | `apps/web/src/app/scheduling/lib/page-data.ts:10-45` & `timetable/page.tsx:20-22` | Sequential query waterfall: 5 consecutive awaits in `page-data.ts` + 3 consecutive awaits in `page.tsx` = 8 sequential DB roundtrips. | P1 |
| **DEF-07** | FRONTEND-12 | `apps/web/src/lib/branch-context.ts:23` | `getAppContext()` is not wrapped in `React.cache()`, causing duplicate DB roundtrips across `TopBar`, page checks, and page loaders within a single request. | P1 |
| **DEF-08** | FRONTEND-11 | `apps/web/src/app/academic-structure/components/DrawerForm.tsx:14-45` | Drawer form lacks `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, and focus restoration upon closing. | P1 |
| **DEF-09** | FRONTEND-11 | `apps/web/src/components/layout/Sidebar.tsx:68` | Logout submit button has no accessible text or `aria-label="Log out"`. | P1 |
| **DEF-10** | FRONTEND-05 / 11 | `apps/web/src/app/students/new/page.tsx:65-76` | Form `<label>` elements lack `htmlFor` and inputs lack `id`, breaking screen reader label association. | P1 |
| **DEF-11** | FRONTEND-07 | `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx:66` | Casing mismatch: checks `year.status === 'active'`, but `AcademicYearForm.tsx:78-81` outputs uppercase `'ACTIVE'`. Status badge always falls through to gray. | P2 |
| **DEF-12** | FRONTEND-04 | `apps/web/src/app/scheduling/components/BranchAccessError.tsx` | Duplicate file duplicating `apps/web/src/components/BranchAccessError.tsx`. | P2 |
| **DEF-13** | FRONTEND-05 | `apps/web/src/app/attendance/components/AttendanceManager.tsx:114-115` | Operator precedence error in error message fallback logic (`err.message || typeof err === 'string' ? err : 'Failed to lock'`). | P2 |

---

### Category B: Partially Confirmed Findings

| Finding ID | Workstream | Subject | Observation & Status |
| :--- | :--- | :--- | :--- |
| **PCF-01** | FRONTEND-10 | Mobile table clipping | Tables in `AcademicYearsTable.tsx` and `StudentsPage` use `min-w-full`. On 320px and 375px viewports, columns squeeze and text wraps heavily, but they do not cause horizontal layout rupture if overflow is hidden. However, mobile stacked card views are missing. |
| **PCF-02** | FRONTEND-14 | Playwright coverage gaps | `attendance.spec.ts` exists and passes, but uses `waitForTimeout(500)`. `students-security.spec.ts` exists and verifies RBAC, but omits form submission. Academic structure spec verifies Academic Year CRUD, but omits Class and Section CRUD. |
| **PCF-03** | FRONTEND-04 | Branch switching UX | Super Admin branch selector works (`SuperAdminBranchSelector.tsx`), but normal multi-branch users have no branch selection UI (as specified in ADR 008/009, multi-branch users currently error out with "Ambiguous branch context"). |

---

### Category C: Architectural Recommendations vs Mandatory Fixes

| Item | Status | Rationale & Recommendation |
| :--- | :--- | :--- |
| **Mandatory Fix: Shell Boundary** | **Mandatory** | Next.js route grouping `(app)/` vs `(auth)/` or explicit route check in `layout.tsx` is required to prevent unauthenticated pages from rendering the authenticated shell. |
| **Mandatory Fix: Native Popups** | **Mandatory** | `alert()` and `confirm()` must be completely replaced with `ConfirmDialog` and toast primitives before certification. |
| **Mandatory Fix: React.cache()** | **Mandatory** | `getAppContext()` must be wrapped in `React.cache()` to prevent multiple identical DB queries per RSC render. |
| **Recommendation: React Hook Form / Zod** | **Recommendation (Do Not Add)** | The codebase currently uses native `FormData` and clean server action validation. Introducing React Hook Form or Zod across all forms would add unnecessary dependency bloat. Form validation can be hardened using native validation and server action error feedback. |
| **Recommendation: Radix UI / Headless UI** | **Recommendation (Selective)** | As per ADR 012, components should be code-owned (shadcn pattern). Use lightweight focus trap and dialog helpers rather than massive black-box UI frameworks. |
| **Recommendation: Component Testing Library** | **Recommendation (Adopt RTL)** | Vitest and JSDOM are already installed. Installing `@testing-library/react` allows unit testing of shared primitives without needing a full browser instance. |

---

### Category D: Stitch Visual Suggestions

| Suggestion | Source | Status | Rationale |
| :--- | :--- | :--- | :--- |
| **Semantic Design Tokens** | `docs/DESIGN.md` | **Adopt** | Adopt primary `#2563eb`, secondary `#4f46e5`, error `#ef4444`, surface containers, and outline tokens in `globals.css`. |
| **Inter Typography Hierarchy** | `docs/DESIGN.md` | **Adopt** | Replace `Arial, Helvetica, sans-serif` in `globals.css` with Inter and configure font scale (`display-xl` to `label-caps`). |
| **Radius: 8px card, 6px button** | `docs/DESIGN.md` | **Adopt** | Align `Button` and `Card` primitives to consistent radius tokens. |
| **Empty State with CTA** | `docs/DESIGN.md`, `stitch_phase3c4_ui.md` | **Adopt** | Replace plain text ("No students found") with centered icon, message, and action CTA ("Add First Student"). |
| **Mobile Slide-out to Modal** | `stitch_phase3c4_ui.md` Sec 5.3 | **Adopt** | Make `DrawerForm` full-screen on mobile viewports (< 768px). |
| **Mass Page Redesign** | Stitch mockups | **Reject** | Maintain existing application structure and data flow; apply styling surgically via primitives and tokens without tearing down working screens. |

---

### Category E: Performance Targets Requiring Measurement

| Target | Target Metric | Baseline Behavior | Measurement Strategy |
| :--- | :--- | :--- | :--- |
| **Timetable Page Load** | Reduced DB roundtrips from 8 to 2 | 8 sequential DB queries (`academic_years` -> `timetable_entries` -> `periods` -> `rooms` -> `staff` -> `classes` -> `sections` -> `subjects`) | Benchmark query count and server execution time before and after parallelization using `performance.now()`. |
| **`getAppContext` Deduplication** | 1 DB query per request | 2-4 duplicate queries across TopBar, verifyPageBranchContext, and page loaders | Log query count per request in development before and after applying `React.cache()`. |
| **Client-side Bundle Size** | Zero heavy UI library bloat | Clean `package.json` with minimal dependencies | Track production build output (`npm run build`) before and after primitive implementation. |

---

### Category F: Strict Phase 6 Boundaries

The following domains and modules are **STRICTLY PROHIBITED** from modification or implementation during the Frontend Hardening Program:

1. **Exams & Assessments:** Do NOT create exams tables, exam schedule pages, or assessment creation forms.
2. **Marks Entry:** Do NOT implement marks entry grids, gradebook logic, or marks calculation APIs.
3. **Grading Engine:** Do NOT implement grading scales, CGPA/percentage calculation, or grade assessment business rules.
4. **Results & Report Cards:** Do NOT implement report card generation, result publishing, or PDF report cards.
5. **Database Schema & Migrations:** Do NOT add or alter PostgreSQL tables, columns, constraints, or enum types.
6. **Row-Level Security (RLS):** Do NOT modify any RLS policies or database security definitions.
7. **Identifier Engine:** Do NOT modify the sequence generator or identifier allocation logic.
8. **Backend Authorization:** Do NOT bypass or alter backend authorization checks in server actions or Supabase RPCs.

**Allowed Generic Preparation:**
Specialist agents may create generic, reusable UI infrastructure that Phase 6 will later consume, such as generic data grids, table primitives, accessible dialogs, form primitives, and feedback toasts.

---

## 4. Multi-Agent Dependency Waves & Ownership

```
Wave 0: Baseline / Coordination (Coordinator) — COMPLETE
  │
  ├── Wave 1: Foundation
  │     ├── Agent A (FRONTEND-01): Design System & globals.css
  │     └── Agent B (FRONTEND-03): Shared UI Primitives (components/ui/)
  │
  ├── Wave 2: Shell & Core UX (Depends on Wave 1 primitives)
  │     ├── Agent C (FRONTEND-02, 10-nav): AppShell, Sidebar, TopBar, Mobile Nav
  │     ├── Agent D (FRONTEND-04): Auth / Reset UX, Unauthorized States
  │     └── Agent E (FRONTEND-05, 07-forms): Form Hardening, Validation, Error Handling
  │
  ├── Wave 3: Data & Feature UX (Depends on Wave 1 & 2)
  │     ├── Agent F (FRONTEND-06, 07-tables): Data Tables, Pagination, Search, Popups
  │     ├── Agent G (FRONTEND-09, 12): Scheduling Optimization, Waterfall Elimination
  │     └── Agent I (FRONTEND-08): Bulk & Onboarding UX Shell (Frontend Only)
  │
  ├── Wave 4: Cross-Cutting Hardening
  │     ├── Agent H (FRONTEND-10, 11): Responsive & Accessibility Across All Viewports
  │     └── Agent J (FRONTEND-14): Testing, RTL Component Tests, Playwright Hardening
  │
  ├── Wave 5: Visual QA
  │     └── Agent K (FRONTEND-13): Visual Review, Stitch Consistency, Final Audit
  │
  └── Wave 6: Final Integration & Certification
        └── Coordinator: Merges, Conflict Resolution, Full CI Validation, Final Report
```

---

## 5. High-Contention File Allocation

To prevent concurrent merge conflicts, file ownership is strictly assigned:

| File / Directory | Sole Owner | Permitted Collaborators |
| :--- | :--- | :--- |
| `apps/web/src/app/globals.css` | **Agent A** | Coordinator only |
| `apps/web/src/app/layout.tsx` | **Agent C** | Coordinator only |
| `apps/web/src/components/layout/*` | **Agent C** | Coordinator only |
| `apps/web/src/components/ui/*` | **Agent B** | All agents consume read-only |
| `apps/web/src/lib/branch-context.ts` | **Agent G** (performance/cache) / **Agent D** (auth) | Sequential ownership (Wave 2 Agent D, Wave 3 Agent G) |
| `apps/web/src/app/scheduling/lib/page-data.ts` | **Agent G** | Coordinator only |
| `package.json` / `package-lock.json` | **Agent J** (for RTL / test deps) | Requires explicit coordinator approval |
| `apps/web/playwright.config.ts` | **Agent J** | Coordinator only |
| `apps/web/src/components/BranchAccessError.tsx` | **Agent D** | Coordinator only |

---

## 6. Verification & Certification Readiness

The audit confirms that the SchoolOS frontend has a clear path to certification under the 23 Certification Gate criteria defined in `ORIGINAL_REQUEST.md`. Once the multi-agent waves resolve the 13 confirmed defects (DEF-01 through DEF-13), eliminate native popups, remove the scheduling waterfall, provide mobile navigation, and establish test coverage, the frontend will be fully certified and ready for Phase 6.
