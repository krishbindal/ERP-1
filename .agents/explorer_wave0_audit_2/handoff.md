# SchoolOS Frontend Hardening — Handoff Report

**Agent:** Wave 0 Frontend Audit & Spec Explorer (`explorer_wave0_audit_2`)  
**Parent:** Orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`)  
**Workspace:** `c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave0_audit_2\`  
**Date:** 2026-09-04  
**Handoff Type:** Hard (Task Complete)  

---

## 1. Observation

Direct code and specification observations with verbatim locations:

1. **Unconditional AppShell Wrapping:**
   `apps/web/src/app/layout.tsx`, lines 17-19:
   ```tsx
   <body className="min-h-full flex flex-col font-sans">
     <AppShell>{children}</AppShell>
   </body>
   ```
   Both unauthenticated `/login` and forced reset `/auth/update-password` routes are rendered inside `<AppShell>`, exposing the authenticated `Sidebar` and `TopBar` to unauthenticated or unreset sessions.

2. **Mobile Navigation Blackout:**
   `apps/web/src/components/layout/Sidebar.tsx`, line 6:
   ```tsx
   <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-screen border-r border-gray-800">
   ```
   On screen widths `< 768px` (including 320px, 375px, 390px), the sidebar is hidden (`hidden md:flex`). `apps/web/src/components/layout/TopBar.tsx` contains no hamburger icon, button, or drawer toggle. On mobile viewports, users have no navigation interface.

3. **Preserved Pre-Existing User Work:**
   `apps/web/src/components/layout/Sidebar.tsx`, lines 67-71:
   ```tsx
   <form action="/auth/logout" method="POST">
     <button type="submit" className="p-1 rounded-md hover:bg-gray-800">
       <LogOut size={16} />
     </button>
   </form>
   ```
   The logout form was modified by the user prior to this orchestration and must be strictly preserved across all subsequent refactors. The `<button>` lacks an accessible name (`aria-label="Log out"`).

4. **Absence of Shared Primitive Directory:**
   `find_by_name` on `apps/web/src/components/ui/` returns zero files. The directory does not exist. All buttons, inputs, selects, cards, badges, and modals are created ad-hoc with inline utility classes across 20+ files.

5. **Native Browser Popup Usage:**
   - 8 instances of `confirm()`:
     `apps/web/src/app/academic-structure/calendar/components/CalendarEventsTable.tsx:28`
     `apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx:12`
     `apps/web/src/app/academic-structure/components/ClassesTable.tsx:12`
     `apps/web/src/app/academic-structure/components/SectionsTable.tsx:12`
     `apps/web/src/app/scheduling/components/BellSchedulesTable.tsx:12`
     `apps/web/src/app/scheduling/components/PeriodsTable.tsx:12`
     `apps/web/src/app/scheduling/components/RoomsTable.tsx:12`
     `apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx:184`
   - 18 instances of `alert()`:
     `AcademicYearsTable.tsx:16,20,22`
     `ClassesTable.tsx:16,20,22`
     `SectionsTable.tsx:16,20,22`
     `BellSchedulesTable.tsx:16,20,22`
     `PeriodsTable.tsx:16,20,22`
     `RoomsTable.tsx:16,20,22`

6. **Silent Error Swallowing:**
   `apps/web/src/app/students/new/page.tsx`, lines 51-54:
   ```tsx
   if ('error' in result) {
     console.error(result.error);
     return;
   }
   ```
   Server-side enrollment failures are printed to `console.error` and swallowed without returning or rendering an error message to the user.

7. **Scheduling Sequential Query Waterfall:**
   `apps/web/src/app/scheduling/lib/page-data.ts`, lines 10-45:
   5 sequential queries (`academic_years` -> `timetable_entries` -> `periods` -> `rooms` -> `staff_branch_profiles`).
   Followed in `apps/web/src/app/scheduling/timetable/page.tsx`, lines 20-22:
   3 more sequential queries (`classes` -> `sections` -> `subjects`).
   Total: 8 sequential database roundtrips to Supabase for a single page render.

8. **Uncached Context Fetching:**
   `apps/web/src/lib/branch-context.ts`, line 23:
   `getAppContext()` queries Supabase auth and membership tables on every call. It is invoked independently by `TopBar.tsx:8`, by page-level `verifyPageBranchContext()`, and by pages directly, without `React.cache()`, causing multiple redundant network requests per page render.

9. **Accessibility & Form Gaps:**
   - `apps/web/src/app/academic-structure/components/DrawerForm.tsx`: Lacks `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trapping, and focus restoration.
   - `apps/web/src/app/students/new/page.tsx:64-77`: `<label>` elements lack `htmlFor` and inputs lack `id`.
   - `apps/web/src/app/communication/new/CommunicationForm.tsx:64,95,100`: `<label>` elements lack `htmlFor` and inputs/textarea lack `id`.

10. **Testing Suite Deficiencies:**
    - `apps/web/e2e/attendance.spec.ts`: Lines 30, 34, 94, 98 use arbitrary `await page.waitForTimeout(500);`.
    - `apps/web/e2e/students-security.spec.ts`: Lines 67-78 only test form visibility (`toBeVisible()`); no test submits a student form.
    - `apps/web/e2e/academic-structure.spec.ts`: Only tests Academic Year CRUD; Class and Section CRUD are untested.
    - Zero React component tests (`.test.tsx`) exist in `apps/web/src/`.

11. **Bulk & Onboarding Backend Absences:**
    `grep_search` across `apps/web/src/` and `packages/` for `bulk`, `import`, `csv`, and `onboarding` yields zero backend contracts or schemas.

---

## 2. Logic Chain

1. **Shell Isolation (Observation 1 -> Finding DEF-01):**
   Because `RootLayout` in `layout.tsx` wraps all children in `<AppShell>`, any route defined under `apps/web/src/app/` will render `<Sidebar>` and `<TopBar>`. This breaches security UX requirements for `/login` and `/auth/update-password`, which must not present authenticated navigation chrome.
   *Conclusion:* A route group boundary (e.g. `(app)` vs `(auth)`) or layout-level route check is required.

2. **Mobile Navigation (Observation 2 -> Finding DEF-02):**
   `Sidebar.tsx` hides itself below `768px` using Tailwind's `hidden md:flex`. Because `TopBar.tsx` has no mobile menu trigger and no sheet/drawer exists for navigation, any viewport at 320px, 375px, or 390px completely lacks navigation links.
   *Conclusion:* Agent C must implement a mobile navigation sheet triggered from `TopBar`.

3. **User Work Preservation (Observation 3 -> Baseline Guardrail):**
   The user previously wrapped the logout icon in `<form action="/auth/logout" method="POST"><button type="submit">`. Discarding or resetting `Sidebar.tsx` would revert working logout behavior.
   *Conclusion:* Refactoring of `Sidebar.tsx` must preserve the `<form action="/auth/logout" method="POST">` structure while adding `aria-label="Log out"`.

4. **Shared Primitives & Native Popups (Observations 4 & 5 -> Findings DEF-04, DEF-05):**
   Because there is no canonical `ConfirmDialog` or `Toast` component in `components/ui/`, developer workflows defaulted to browser-native `confirm()` and `alert()`. Native popups block the JavaScript thread and violate the SchoolOS accessibility and certification standards.
   *Conclusion:* Agent B must build `ConfirmDialog` and `Toast` in `components/ui/`, and downstream feature owners must migrate all 8 `confirm()` and 18 `alert()` calls.

5. **Error Presentation (Observation 6 -> Finding DEF-03):**
   When `createStudentWithPlacement` returns an error object, `students/new/page.tsx` executes `console.error(result.error)` and returns early. The form remains idle without indicating error to the user.
   *Conclusion:* Agent E must replace this with user-facing error state presentation.

6. **Performance & Waterfall (Observations 7 & 8 -> Findings DEF-06, DEF-07):**
   `fetchSchedulingPageData` queries 5 tables sequentially when 4 of those tables do not depend on each other. `timetable/page.tsx` then executes 3 more sequential queries. Simultaneously, `getAppContext()` is called multiple times per request without `React.cache()`.
   *Conclusion:* Wrapping `getAppContext()` in `React.cache()` and executing non-dependent scheduling queries via `Promise.all` will reduce roundtrips from 8 to 2.

7. **Bulk Import Boundary (Observation 11 -> Scope Enforcement):**
   `ORIGINAL_REQUEST.md` explicitly warns: "Inspect existing backend contracts first. Do not invent APIs. If backend functionality is missing: document it, stop at the frontend boundary, do not silently create fake functionality."
   *Conclusion:* Agent I must build only generic frontend UI components (CSV dropzone, column mapping preview) and document the missing backend ingestion pipeline as deferred per `docs/POST_AUDIT_REMEDIATION_PLAN.md`.

8. **Strict Phase 6 Protection:**
   The Master Specification reserves Exams, Marks, Grading, Results, and Report Cards for Phase 6. No frontend hardening work may introduce business logic for these domains.

---

## 3. Caveats

1. **Pre-Existing Modified Working Tree:**
   `apps/web/src/components/layout/Sidebar.tsx` and `package-lock.json` are pre-modified. All worktree setups must branch from `efcbfe1c934d55b300a4bb3dab6342ad94439d84` without wiping these files in the primary repository root.
2. **Backend Services / Third-Party Integrations:**
   External SMS and email notification providers remain simulated/mocked in local environment; this is an operational deployment control and does not block frontend hardening certification.
3. **Vitest vs Playwright Test Split:**
   Server actions are currently tested via Vitest. Adding component testing with React Testing Library will require adding `@testing-library/react` and `@testing-library/jest-dom` under Agent J's ownership with coordinator approval.

---

## 4. Conclusion

The SchoolOS frontend codebase is functionally sound in core CRUD operations and RBAC isolation, but possesses **13 confirmed defects** (DEF-01 through DEF-13), including critical shell leakage on auth routes, missing mobile navigation, browser-native popup dependence, silent form error swallowing, and an 8-query scheduling waterfall.

The 14 workstreams have been fully mapped to the Multi-Agent Dependency Waves (Waves 1 through 6) with unambiguous file boundaries and strict Phase 6 boundary protections. The audit report `audit_analysis.md` provides complete implementation guidance for Agents A through K.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Unconditional AppShell Wrapping:**
   Inspect `apps/web/src/app/layout.tsx` at line 18:
   `git grep -n "AppShell" apps/web/src/app/layout.tsx`
   Observe `<AppShell>{children}</AppShell>` without route conditional logic.

2. **Verify Mobile Sidebar Concealment:**
   Inspect `apps/web/src/components/layout/Sidebar.tsx` at line 6:
   `git grep -n "hidden md:flex" apps/web/src/components/layout/Sidebar.tsx`

3. **Verify Native `confirm()` and `alert()` Usage:**
   Run:
   `git grep -n "confirm(" apps/web/src/`
   `git grep -n "alert(" apps/web/src/`
   Observe 8 matches for `confirm(` and 18 matches for `alert(`.

4. **Verify Silent Error Swallowing in Student Enrollment:**
   Inspect `apps/web/src/app/students/new/page.tsx` lines 51-54:
   `git grep -n -A 5 "if ('error' in result)" apps/web/src/app/students/new/page.tsx`

5. **Verify Scheduling Waterfall:**
   Inspect `apps/web/src/app/scheduling/lib/page-data.ts` lines 10-45 and `apps/web/src/app/scheduling/timetable/page.tsx` lines 20-22.

6. **Verify Lack of Component Tests:**
   Run:
   `git grep "render(" apps/web/src/`
   Observe zero component test matches.
