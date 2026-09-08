# WAVE 5 VISUAL QA REPORT

- **Auditor / Agent**: Agent K (Visual QA Specialist / FRONTEND-13)
- **Date**: 2026-09-07
- **Base Checkpoint SHA**: `1da2ce4e05fa9ee031d4f064638adac035b1e079` (`feat/wave4-integrated`)
- **Review Mode**: Read-Only First Investigation

---

## 1. Executive Summary

A comprehensive visual, responsive, and accessibility audit was executed across all 11 mandatory application surfaces of SchoolOS. The evaluation benchmarked the implementation against:
- The SchoolOS Master Specifications (`docs/` and root documentation)
- The Canonical Design System tokens (`apps/web/src/app/globals.css` and `docs/DESIGN.md`)
- Stitch Phase 3C.4 / Super Admin UI specifications (`docs/design/stitch_phase3c4_ui.md`, `01_login_screen.md`, `02_super_admin_shell.md`)
- Multi-viewport responsive standards (320px, 375px, 390px, 768px, and 1280px+ desktop)
- WCAG 2.1 AA accessibility guidelines (ARIA roles, accessible names, focus-visible rings, touch target minimums of 44x44px, focus traps, and modal semantics)

### Summary of Test Execution
- **Unit & Integration Test Suite (`vitest`)**: 21 test files passed, 161 tests passed (100% success rate, duration 25.5s).
- **TypeScript Static Verification (`tsc --noEmit`)**: 0 type errors.
- **Linter Verification (`eslint`)**: 0 errors.
- **Playwright Responsive E2E (`responsive-mobile.spec.ts`)**: Confirms mobile navigation drawer and horizontal table scrolling pass on mobile viewports.

---

## 2. Screens Reviewed (All 11 Surfaces)

The following 11 core surfaces and their constituent files were reviewed in depth:

| # | Surface Name | Primary Routes & Components Reviewed |
|---|---|---|
| 1 | **Dashboard** | `apps/web/src/app/page.tsx` (Route `/`) |
| 2 | **Students** | `apps/web/src/app/students/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `components/StudentsTable.tsx`, `components/student-enrollment-form.test.tsx` |
| 3 | **Academic Structure** | `apps/web/src/app/academic-structure/page.tsx`, `components/AcademicStructureNav.tsx`, `components/AcademicYearsTable.tsx`, `components/ClassesList.tsx`, `components/SectionsList.tsx`, `calendar/page.tsx`, `calendar/components/OperatingDaysEditor.tsx`, `calendar/components/CalendarEventsTable.tsx`, `calendar/components/EventModal.tsx` |
| 4 | **Scheduling / Timetable** | `apps/web/src/app/scheduling/page.tsx`, `components/RoomsTable.tsx`, `components/BellSchedulesTable.tsx`, `components/PeriodsTable.tsx`, `timetable/page.tsx`, `timetable/components/TimetableGrid.tsx`, `timetable/components/TimetableManager.tsx`, `substitutions/page.tsx` |
| 5 | **Attendance** | `apps/web/src/app/attendance/page.tsx`, `components/AttendanceManager.tsx`, `history/page.tsx`, `history/components/AttendanceHistoryTable.tsx` |
| 6 | **Communication** | `apps/web/src/app/communication/page.tsx`, `inbox/page.tsx`, `new/page.tsx`, `new/CommunicationForm.tsx` |
| 7 | **Bulk Upload / Onboarding** | `apps/web/src/app/students/bulk/page.tsx`, `components/bulk/StudentBulkWizard.tsx`, `components/bulk/BulkUploadDropzone.tsx`, `components/bulk/ColumnMapper.tsx`, `components/bulk/CsvPreviewTable.tsx` |
| 8 | **Authentication** | `apps/web/src/app/login/page.tsx`, `auth/update-password/page.tsx`, `auth/logout/route.ts`, `components/layout/AppShell.tsx` |
| 9 | **Dialogs & Drawers** | `apps/web/src/components/ui/Dialog.tsx`, `Drawer.tsx`, `ConfirmDialog.tsx`, `apps/web/src/app/academic-structure/components/DrawerForm.tsx` |
| 10 | **Tables & Primitives** | `apps/web/src/components/ui/Table.tsx`, `TableEmptyRow`, `Badge.tsx`, `Button.tsx`, `Input.tsx`, `Select.tsx`, `Tabs.tsx`, `Toast.tsx` |
| 11 | **App Shell & Navigation** | `apps/web/src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `SuperAdminBranchSelector.tsx`, `nav-items.ts` |

---

## 3. Finding Classification Standard

Every observed finding has been classified into one of the six mandatory categories:
1. **actual functional defect**: An error breaking user workflows, navigation, or interaction.
2. **accessibility/usability defect**: A violation of WCAG standards (touch target < 44px, missing ARIA tags, or orphaned/unreachable features).
3. **responsive defect**: Horizontal page blowout, overflowing layout, or severe content squeezing on viewports (320px–768px).
4. **visual inconsistency**: Deviation from canonical design tokens (arbitrary raw Tailwind colors, missing canonical Card wrappers).
5. **Stitch preference/recommendation**: Stylistic suggestions from Stitch mockups differing from established canonical implementations.
6. **acceptable existing behavior**: Compliant, accessible, and functional production code meeting specifications.

---

## 4. Visual Findings (By Surface)

### Surface 1: Dashboard (`/`)
- **Finding 1.1 — Minimal Typography & Lack of Surface Container**:
  - *Observation*: `apps/web/src/app/page.tsx:5-8` renders raw uncontained `<div className="p-6">` with `<h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to SchoolOS.</p></div>`. No card wrapper, token-based colors, or grid layout is utilized.
  - *Classification*: **4. visual inconsistency**
- **Finding 1.2 — E2E Selector Anchor**:
  - *Observation*: The `<h1>Dashboard</h1>` heading is explicitly required and verified by Playwright tests (`e2e/auth.setup.ts:36`, `e2e/auth-password-reset.spec.ts:43`).
  - *Classification*: **6. acceptable existing behavior**

### Surface 2: Students
- **Finding 2.1 — Non-canonical "Add Student" Button Styling**:
  - *Observation*: `apps/web/src/app/students/page.tsx:29` uses `className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"` rather than canonical `<Button variant="primary">` or `bg-primary rounded-lg`.
  - *Classification*: **4. visual inconsistency**
- **Finding 2.2 — Hardcoded Profile Containers & Arbitrary Colors**:
  - *Observation*: `apps/web/src/app/students/[id]/page.tsx:31,57` uses raw `bg-white rounded shadow p-6` instead of `<Card>`, `text-gray-500` instead of `text-muted-foreground`, and `text-blue-600` for links.
  - *Classification*: **4. visual inconsistency**
- **Finding 2.3 — Static Status Badge in Detail View**:
  - *Observation*: `apps/web/src/app/students/[id]/page.tsx:49` displays student status with static `bg-green-100 text-green-800` rather than the dynamic canonical `<Badge variant={...}>` used in `StudentsTable.tsx`.
  - *Classification*: **4. visual inconsistency**

### Surface 3: Academic Structure
- **Finding 3.1 — Tab Navigation Color Hardcoding**:
  - *Observation*: `apps/web/src/app/academic-structure/components/AcademicStructureNav.tsx:31-32` applies `border-blue-500 text-blue-600` and `text-gray-500 hover:text-gray-700` instead of `border-primary text-primary` and `text-muted-foreground hover:text-foreground`.
  - *Classification*: **4. visual inconsistency**
- **Finding 3.2 — Operating Days Card & Custom Button**:
  - *Observation*: `apps/web/src/app/academic-structure/calendar/components/OperatingDaysEditor.tsx:73,84` uses `bg-white border-gray-200 text-gray-900` and a custom-styled `<button>` instead of `<Card>` and canonical `<Button>`.
  - *Classification*: **4. visual inconsistency**

### Surface 4: Scheduling / Timetable
- **Finding 4.1 — Raw Select and Button Primitives on Timetable View Switcher**:
  - *Observation*: `apps/web/src/app/scheduling/timetable/page.tsx:46-61` renders a raw `<select>` and raw `<button>` with custom Tailwind utility classes instead of canonical `<Select>` and `<Button variant="secondary">`.
  - *Classification*: **4. visual inconsistency**
- **Finding 4.2 — Timetable Grid Day and Time Tokens**:
  - *Observation*: `apps/web/src/app/scheduling/timetable/components/TimetableGrid.tsx` cleanly uses `bg-surface`, `border-border`, `bg-muted/70`, `text-foreground`, and theme-aware substitution badges (`bg-amber-500/15`).
  - *Classification*: **6. acceptable existing behavior**

### Surface 5: Attendance
- **Finding 5.1 — Unstyled Empty / Unconfigured States**:
  - *Observation*: `apps/web/src/app/attendance/page.tsx:36` and `attendance/history/page.tsx:51` render raw strings in bare `<div>` elements without card wrappers or empty state illustrations.
  - *Classification*: **4. visual inconsistency**
- **Finding 5.2 — Attendance Manager Matrix**:
  - *Observation*: `AttendanceManager.tsx` uses canonical `Table`, `Badge`, `Dialog`, `ConfirmDialog`, and semantic state badges for PRESENT, ABSENT, LATE, and EXCUSED.
  - *Classification*: **6. acceptable existing behavior**

### Surface 6: Communication
- **Finding 6.1 — Non-standard Card and Status Styles**:
  - *Observation*: `apps/web/src/app/communication/page.tsx:56,65,95` uses `bg-white`, `border-blue-200`, `bg-blue-50`, `text-blue-900`, and raw pills (`bg-green-100 text-green-800`) instead of canonical `<Card>` and `<Badge>`.
  - *Classification*: **4. visual inconsistency**
- **Finding 6.2 — Raw HTML in Inbox View**:
  - *Observation*: `apps/web/src/app/communication/inbox/page.tsx:22-37` renders raw unstyled HTML (`<div><h1>Inbox</h1>...</div>`) without padding, cards, list primitives, or typography tokens.
  - *Classification*: **4. visual inconsistency**

### Surface 7: Bulk Upload
- **Finding 7.1 — Canonical Design System Adherence**:
  - *Observation*: `apps/web/src/components/bulk/StudentBulkWizard.tsx` fully utilizes `<Card>`, `<Badge>`, `<Button>`, `bg-surface`, `border-border`, and `bg-muted/40` across all 4 steps.
  - *Classification*: **6. acceptable existing behavior**

### Surface 8: Authentication
- **Finding 8.1 — Duplicate Class Utilities**:
  - *Observation*: `apps/web/src/app/login/page.tsx:32` and `auth/update-password/page.tsx:39` contain `text-destructive text-red-500` simultaneously in the error alert container.
  - *Classification*: **4. visual inconsistency**

### Surface 9: Dialogs / Drawers
- **Finding 9.1 — Consistent Component Elevation & Radii**:
  - *Observation*: `Dialog.tsx` uses `rounded-xl border border-border bg-surface shadow-xl`, and `Drawer.tsx` uses `bg-surface text-surface-foreground shadow-2xl`. Both match canonical tokens.
  - *Classification*: **6. acceptable existing behavior**

### Surface 10: Tables
- **Finding 10.1 — Canonical Table Styling & Hover Highlights**:
  - *Observation*: `Table.tsx` applies `border-border bg-surface`, `[&_tr]:border-b`, and `hover:bg-muted/40`.
  - *Classification*: **6. acceptable existing behavior**

### Surface 11: App Shell / Navigation
- **Finding 11.1 — Shell Background Token**:
  - *Observation*: `AppShell.tsx:37` sets `className="flex h-screen overflow-hidden bg-gray-50"` instead of `bg-background` (`#f8fafc`).
  - *Classification*: **4. visual inconsistency**
- **Finding 11.2 — Sidebar vs Mobile Drawer Theme Divergence**:
  - *Observation*: `Sidebar.tsx` has a hardcoded dark theme (`bg-gray-900 text-white border-gray-800`), whereas the mobile drawer (`TopBar.tsx`) renders the light semantic theme (`bg-surface text-foreground`).
  - *Classification*: **4. visual inconsistency**

---

## 5. Functional Findings (By Surface)

### Surface 4: Scheduling
- **Finding 4.F1 — Hard Page Reload on Tab Navigation**:
  - *Observation*: `apps/web/src/app/scheduling/page.tsx:60-90` uses standard HTML `<a href="...">` anchor tags instead of Next.js client-side `<Link href="...">`. Clicking between "Rooms", "Bell Schedules", and "Periods" triggers a full document re-fetch and page reload, resetting scroll position and client state.
  - *Classification*: **1. actual functional defect**

### Other Surfaces (1, 2, 3, 5, 6, 7, 8, 9, 10, 11)
- **Branch Context & Authorization Guards**: All surfaces enforce `verifyPageBranchContext` and cleanly display `BranchAccessError` when branch authorization is absent or unassigned.
- **Server Actions & Mutations**: Academic year deletion, class deletion, attendance saving, session locking/publishing, and password updates trigger correct transactional logic with server-side validations.
- *Classification*: **6. acceptable existing behavior**

---

## 6. Responsive Findings (By Viewport: 320px, 375px, 390px, 768px, 1280px+)

### 1. Viewport: 320px (Minimum Mobile / iPhone SE 1st Gen)
- **Finding R.1 — Academic Structure Nav Bar Overflow**:
  - *Observation*: `AcademicStructureNav.tsx:18` renders `<nav className="-mb-px flex space-x-8">`. With 4 tabs ("Academic Years", "Classes", "Sections", "Calendar") plus 32px spacing, the content requires ~365px. Without `overflow-x-auto`, tabs clip off-screen.
  - *Classification*: **3. responsive defect**
- **Finding R.2 — Scheduling Nav Bar Overflow**:
  - *Observation*: `scheduling/page.tsx:59` `<nav className="-mb-px flex space-x-8">` has no horizontal scrolling container, causing clipping on 320px.
  - *Classification*: **3. responsive defect**
- **Finding R.3 — Student Detail Definition List Squishing**:
  - *Observation*: `students/[id]/page.tsx:33` `<dl className="grid grid-cols-2 gap-4">` forces 2 columns on 320px (each column ~120px wide with page padding), compressing text. Should use `grid-cols-1 sm:grid-cols-2`.
  - *Classification*: **3. responsive defect**

### 2. Viewport: 375px (iPhone SE 2nd/3rd Gen)
- **Finding R.4 — TopBar Mobile Truncation**:
  - *Observation*: `TopBar.tsx:36` sets `truncate max-w-[100px] sm:max-w-xs` on the branch badge and `max-w-[200px]` on user profile, successfully preventing header overflow at 375px. Verified in Playwright `responsive-mobile.spec.ts`.
  - *Classification*: **6. acceptable existing behavior**
- **Finding R.5 — Responsive Navigation Drawer**:
  - *Observation*: Drawer width is constrained to `w-72 max-w-[85vw]`, leaving space for touch dismiss on mobile backdrops.
  - *Classification*: **6. acceptable existing behavior**

### 3. Viewport: 390px (iPhone 12/13/14 Standard)
- **Finding R.6 — Table Horizontal Scrolling Isolation**:
  - *Observation*: All canonical tables (`StudentsTable`, `AcademicYearsTable`, `ClassesList`, `SectionsList`, `AttendanceHistoryTable`, `TimetableGrid`) are wrapped in `w-full overflow-x-auto` regions. Playwright `responsive-mobile.spec.ts` confirms `document.documentElement.scrollWidth > window.innerWidth + 2` is `false`.
  - *Classification*: **6. acceptable existing behavior**

### 4. Viewport: 768px (Tablet)
- **Finding R.7 — Two-Column Stacking and Sidebar Collapse**:
  - *Observation*: Layout transitions at `md:` (768px) breakpoint. The persistent sidebar disappears below `md`, and the hamburger menu activates cleanly. Controls bars stack on `< sm` and align horizontally on `sm` (640px) and `md` (768px).
  - *Classification*: **6. acceptable existing behavior**

### 5. Viewport: 1280px+ (Desktop)
- **Finding R.8 — Persistent Sidebar & Dense Layout**:
  - *Observation*: Persistent 256px (`w-64`) sidebar with sticky navigation, fluid main content area, and full data density on large monitors.
  - *Classification*: **6. acceptable existing behavior**

---

## 7. Accessibility Findings (WCAG 2.1 AA)

### Touch Targets (Minimum 44x44px)
- **Finding A.1 — Sub-44px "Back to List" Link**:
  - *Observation*: `students/[id]/page.tsx:28` `<Link href="/students" className="text-blue-600 hover:underline">Back to List</Link>` has a computed touch height of ~16px without touch padding.
  - *Classification*: **2. accessibility/usability defect**
- **Finding A.2 — Sub-44px Academic Structure Tabs**:
  - *Observation*: `AcademicStructureNav.tsx:33` uses `py-4 px-1`. While height is acceptable, the horizontal target width between tabs is only 4px padded, leading to accidental adjacent tab clicks on mobile.
  - *Classification*: **2. accessibility/usability defect**
- **Finding A.3 — Compliant Touch Targets**:
  - *Observation*: All icon buttons (`TopBar` hamburger menu, `Sidebar` logout button, `Dialog`/`Drawer` close buttons, table action links, and mobile drawer links) specify `min-h-[44px] min-w-[44px]` or `p-2.5`.
  - *Classification*: **6. acceptable existing behavior**

### ARIA Attributes and Roles
- **Finding A.4 — Missing `aria-current` on Sub-navigation Tabs**:
  - *Observation*: Neither `AcademicStructureNav.tsx` nor `scheduling/page.tsx` tabs provide `aria-current="page"` for active tab states. Screen reader users are not notified which tab is currently selected.
  - *Classification*: **2. accessibility/usability defect**
- **Finding A.5 — Missing Navigation Discoverability (Orphaned Features)**:
  - *Observation*: `nav-items.ts` omits links for:
    - Communication (`/communication`)
    - Bulk Student Onboarding (`/students/bulk`)
    - Admin App Configuration (`/admin/app-config`)
    Furthermore, `/students` does not offer a link to `/students/bulk`. Keyboard and screen-reader users have no standard navigation pathway to these features.
  - *Classification*: **2. accessibility/usability defect**
- **Finding A.6 — Modal Accessibility Architecture**:
  - *Observation*: `Dialog.tsx` and `Drawer.tsx` implement full keyboard focus trapping (Tab / Shift+Tab cycling), focus restoration to previous active element, Escape key dismissal, scroll locking on `document.body`, and unnested sibling backdrop elements with `aria-hidden="true"`.
  - *Classification*: **6. acceptable existing behavior**

### Focus Rings & Form Labeling
- **Finding A.7 — Global Focus Visible Rings**:
  - *Observation*: `globals.css:280-289` defines `.focus-ring` using a 2-ring shadow offset (`box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring)`), providing high contrast focus indicators across both light and dark backgrounds.
  - *Classification*: **6. acceptable existing behavior**
- **Finding A.8 — Form Field Association**:
  - *Observation*: `Input.tsx` and `Select.tsx` automatically link `<label htmlFor={id}>`, assign `aria-invalid="true"`, and attach `aria-describedby` pointing to error messages with `role="alert"`.
  - *Classification*: **6. acceptable existing behavior**

---

## 8. Stitch Comparison & Architectural Reconciliation

| Area | Stitch Phase 3C.4 Specification | Existing Canonical Implementation | Alignment Analysis & Recommendation |
|---|---|---|---|
| **Shell Navigation** | Left sidebar + Topbar with branch selector & user menu (`stitch_phase3c4_ui.md` §1) | `AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `SuperAdminBranchSelector.tsx` | **Aligned**: Persists sidebar on desktop, hamburger drawer on mobile. Super admin branch switcher functions as specified. |
| **Dashboard** | Grid-based layout, skeleton loaders, welcome greeting (`stitch_phase3c4_ui.md` §2) | Minimal placeholder `<div className="p-6"><h1>Dashboard</h1>...</div>` | **Stitch Preference (Cat 5)**: Wave 4 scope only required an anchor heading for E2E tests. Retain `<h1>Dashboard</h1>` and add clean greeting card. |
| **Academic Structure Hub** | Tabbed interface for Years, Classes, Sections (`stitch_phase3c4_ui.md` §3.1) | `AcademicStructureNav.tsx` with tabs + Calendar | **Aligned**: Seamlessly routes via query params `?tab=years\|classes\|sections`. |
| **Slide-Out Forms** | Create/edit opens slide-out drawer on right (`stitch_phase3c4_ui.md` §3.3) | `DrawerForm.tsx` wrapping `Drawer.tsx` with `side="right"` | **Aligned**: Preserves user context without full-page navigation. |
| **Permission Denied** | Polite centered illustration and "Return to Dashboard" (`stitch_phase3c4_ui.md` §4) | `BranchAccessError.tsx` with branch switcher prompt & dashboard return | **Aligned**: Secure, polite, accessible error boundary. |
| **Table Zebra Striping** | Zebra striping using container tokens (`docs/DESIGN.md` §Components) | Canonical `Table.tsx` with row hover highlights (`hover:bg-muted/40`) | **Acceptable Existing Behavior (Cat 6)**: Subtle row hovers offer superior contrast and clarity over harsh alternating stripes. |

---

## 9. Fixes Made

**None — Read-only review.** In accordance with Wave 5 read-only exploratory constraints, zero source code or working-tree files were modified.

---

## 10. Test Execution Status

| Test Suite | Command | Result | Coverage / Notes |
|---|---|---|---|
| Unit & Integration | `npm run test --workspace=apps/web` | **PASSED (161/161 tests)** | 21 test files, 100% test pass rate |
| TypeScript | `npm run typecheck --workspace=apps/web` | **PASSED (0 errors)** | Full strict typecheck verified |
| ESLint | `npm run lint --workspace=apps/web` | **PASSED (0 errors, 1 warning)** | 0 lint errors (1 unused directive warning in coverage artifact) |
| Responsive E2E | Playwright `responsive-mobile.spec.ts` | **PASSED** | 375px navigation drawer & 390px table scrolling verified |

---

## 11. Unresolved Issues Categorization

### Priority 0 (P0 — Blockers)
*None.* No security, authorization, data isolation, or critical functional crashes were identified.

### Priority 1 (P1 — Serious Usability / Accessibility Deficiencies)
1. **Unstyled Communication Inbox (`/communication/inbox`)**:
   - `apps/web/src/app/communication/inbox/page.tsx:22-37` is unstyled bare HTML without layout padding, cards, or design tokens.
2. **Hard Page Reload on Scheduling Tab Navigation (`/scheduling`)**:
   - `apps/web/src/app/scheduling/page.tsx:60-90` uses raw `<a>` tags instead of `<Link>`, triggering full browser reloads and page flicker on tab change.
3. **Orphaned Application Features in Navigation**:
   - Communication (`/communication`) and Bulk Student Onboarding (`/students/bulk`) have no links in `nav-items.ts` or on the main student index, making them undiscoverable through primary UI.
4. **Missing Horizontal Scroll Wrapper on Sub-Navigation Tabs**:
   - `AcademicStructureNav.tsx:18` and `scheduling/page.tsx:59` overflow horizontally on 320px mobile viewports because `<nav>` lacks `overflow-x-auto`.
5. **Sub-44px Touch Target on Student Detail Back Link**:
   - `students/[id]/page.tsx:28` touch area is ~16px height, failing WCAG 2.1 touch target minimums.

### Priority 2 (P2 — Visual Inconsistencies & Token Deviations)
1. **Raw Tailwind Color Hardcoding**:
   - `students/page.tsx:29`: `bg-blue-600`
   - `students/[id]/page.tsx:28`: `text-blue-600`
   - `AcademicStructureNav.tsx:31`: `text-blue-600 border-blue-500`
   - `communication/page.tsx:48,65`: `bg-blue-600`, `bg-blue-50`, `border-blue-200`
   - `AppShell.tsx:37`: `bg-gray-50` instead of `bg-background`
   - `OperatingDaysEditor.tsx:73`: `bg-white border-gray-200`
   - All should be mapped to semantic tokens (`bg-primary`, `text-primary`, `border-primary`, `bg-surface`, `border-border`).
2. **Missing `aria-current="page"` on Sub-navigation Tabs**:
   - `AcademicStructureNav.tsx` and `scheduling/page.tsx` tabs lack `aria-current` attributes.
3. **Detail View Responsive Grid Squeeze**:
   - `students/[id]/page.tsx:33` `<dl className="grid grid-cols-2">` should be adjusted to `grid-cols-1 sm:grid-cols-2` for 320px/375px screens.
4. **Duplicate Utility Classes on Auth Pages**:
   - `login/page.tsx:32` and `auth/update-password/page.tsx:39` contain duplicate `text-destructive text-red-500`.

---

## 12. Recommendations for Remediation (Smallest Necessary Changes)

1. **Scheduling Navigation**:
   - Replace `<a href="...">` with `<Link href="...">` in `apps/web/src/app/scheduling/page.tsx`.
   - Add `aria-current={tab === key ? "page" : undefined}` and `overflow-x-auto` to the `<nav>` container.
2. **Academic Structure Navigation**:
   - Add `overflow-x-auto` to `<nav className="-mb-px flex space-x-8">`.
   - Add `aria-current={isSelected ? "page" : undefined}`.
   - Replace `text-blue-600 border-blue-500` with `text-primary border-primary`.
   - Increase horizontal padding to `px-3` (`min-h-[44px]`).
3. **Communication Inbox Styling**:
   - Wrap `apps/web/src/app/communication/inbox/page.tsx` in `<div className="space-y-6">` and apply canonical `<Card>` or `<Table>` styling to message items.
4. **Navigation Discoverability**:
   - Add `{ href: "/communication", label: "Communication", icon: MessageSquare }` to `nav-items.ts`.
   - Add a secondary button `<Link href="/students/bulk"><Button variant="outline">Bulk Import</Button></Link>` next to "Add Student" on `apps/web/src/app/students/page.tsx`.
5. **Student Detail Page**:
   - Wrap "Back to List" in `<Button variant="ghost" size="sm">` or add touch padding.
   - Update `<dl>` to `grid grid-cols-1 sm:grid-cols-2 gap-4`.
   - Use canonical `<Card>` for profile and guardian sections.
   - Use `<Badge variant={...}>` for student status.

---

## 13. Final Decision

**FINAL DECISION: VISUAL QA REQUIRES REMEDIATION**

*Rationale*:
The architectural foundations, core UI primitives (`Table`, `Dialog`, `Drawer`, `ConfirmDialog`, `Input`, `Select`, `Button`, `Badge`), authentication boundary, and test suites are exceptionally robust with 100% pass rates. However, targeted remediation of the P1 usability defects (specifically the unstyled communication inbox, raw anchor tag reloads in scheduling, orphaned navigation for communication/bulk-upload, and mobile sub-nav overflow at 320px) is required before final wave certification.
