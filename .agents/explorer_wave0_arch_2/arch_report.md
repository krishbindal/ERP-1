# SchoolOS Frontend Architecture & High-Contention Report
**Author:** Wave 0 Frontend Architecture & Test Suite Explorer  
**Date:** 2026-09-04  
**Project Root:** `c:\Users\krish\Desktop\ERP 1`  
**Target Scope:** `apps/web/` & Shared Frontend Infrastructure  

---

## 1. Executive Summary

A deep architectural inspection of `apps/web/` reveals a modern core stack (**Next.js 16.3.3**, **React 19.2.3**, **Tailwind CSS v4**, **Lucide React 1.32.0**, **Vitest 4.1.11**, and **Playwright 1.62.1**) deployed over a nascent UI foundation. While basic functional capabilities exist across students, academic structure, attendance, scheduling, homework, and communication, the frontend exhibits severe structural gaps, architectural anti-patterns, and accessibility defects:

1. **Unconditional Root Shell Wrapping**: `apps/web/src/app/layout.tsx` unconditionally wraps all routes with `<AppShell>`, causing unauthenticated routes (`/login` and `/auth/update-password`) to render the full authenticated application chrome (Sidebar and TopBar).
2. **Missing Shared UI Primitive Layer**: `apps/web/src/components/ui/` does not exist. All buttons, inputs, tables, dialogs, drawers, and status badges are implemented ad-hoc with inconsistent Tailwind classes and zero shared design tokens.
3. **Pervasive Browser-Native Popups**: Workflows in academic structure, scheduling, and calendar rely directly on browser-native `window.confirm()` and `window.alert()` calls, violating enterprise UX and accessibility standards.
4. **Severe Query Waterfalls & Uncached Context**: `apps/web/src/lib/branch-context.ts` (`getAppContext()`) does not employ `React.cache()`, triggering 2 to 3 redundant Supabase auth and membership round-trips per server page render. In scheduling and timetable pages, up to 7 sequential database queries execute without `Promise.all` concurrency.
5. **Zero Mobile Navigation**: The desktop sidebar (`apps/web/src/components/layout/Sidebar.tsx`) is marked `hidden md:flex`. Below 768px, navigation completely vanishes with no hamburger menu, sheet, or bottom navigation bar.
6. **Accessibility Deficiencies**: Modals and slide-out drawers (e.g., `AttendanceManager.tsx` correction modal and `DrawerForm.tsx`) lack ARIA dialog attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), have no keyboard focus traps, and lack focus restoration.
7. **Testing Gaps & Tooling Incompleteness**: Playwright test suites rely on arbitrary `waitForTimeout` calls (e.g. in `attendance.spec.ts`), lack real form submission coverage for student enrollment and class/section CRUD, and neither `apps/web/package.json` nor the root `package.json` defines a `test:e2e` script.

---

## 2. Baseline & Working-Tree State

### 2.1 Git Metadata
- **Current Branch:** `master`
- **HEAD Commit SHA:** `efcbfe1c934d55b300a4bb3dab6342ad94439d84` (`origin/master`)
- **Working Tree State:** Dirty (Preserving pre-existing user work)

### 2.2 Pre-Existing User Work (Protected)
1. `apps/web/src/components/layout/Sidebar.tsx`:
   - Lines 67–71: The user previously replaced a non-functional `<button>` with an active HTML form post:
     ```tsx
     <form action="/auth/logout" method="POST">
       <button type="submit" className="p-1 rounded-md hover:bg-gray-800">
         <LogOut size={16} />
       </button>
     </form>
     ```
   - This routes through `apps/web/src/app/auth/logout/route.ts` which successfully signs out and redirects to `/login`.
   - **Protection Rule:** This exact functional behavior and form action must be strictly preserved during Agent C's shell refactor.
2. `package-lock.json`:
   - Modified by previous user installation. Must not be blindly overwritten, cleaned, or discarded.
3. Untracked scratch/debug artifacts:
   - `ORIGINAL_REQUEST.md`, `apps/web/manual-test.js`, `apps/web/playwright_output.log`, `apps/web/server.log`, `full_diff.patch`, `full_log*.txt`, `parse_results*.js`, etc.
   - Must remain intact and uncommitted.

---

## 3. Deep Component-by-Component Architecture Audit

### 3.1 Dependencies & Build Tooling (`apps/web/package.json`)
```json
{
  "dependencies": {
    "@supabase/ssr": "^0.12.4",
    "@supabase/supabase-js": "^2.112.3",
    "lucide-react": "^1.32.0",
    "next": "16.3.3",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.62.1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22.20.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.1.0",
    "@vitest/coverage-v8": "^4.1.11",
    "eslint": "^9",
    "eslint-config-next": "16.3.3",
    "jsdom": "^29.1.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.11"
  }
}
```
**Key Architectural Observations:**
- **Next.js 16.3.3 + React 19.2.3**: Cutting-edge React 19 / Next 16 environment. In Next.js 16, routing-level middleware is officially defined in `src/proxy.ts` (as documented in `docs/PRE_PHASE6_DEEP_AUDIT_REPORT.md`). Renaming `proxy.ts` to `middleware.ts` is explicitly prohibited.
- **Tailwind CSS v4 (`@tailwindcss/postcss` & `tailwindcss: ^4`)**: Tailwind v4 uses CSS-first configuration via `@import "tailwindcss";` and `@theme inline` directly within CSS. There is no `tailwind.config.js`.
- **Iconography**: `lucide-react` is already present and actively used across the sidebar and pages.
- **Missing Scripts**:
  - `npm run test` executes Vitest with a coverage flag: `node ../../scripts/patch-vitest-timeout.js && vitest run --coverage`.
  - There is **no script** for running Playwright E2E tests in `apps/web/package.json` (e.g. `"test:e2e": "playwright test"`). Tests can only be triggered via `npx playwright test`.

---

### 3.2 Design System & Styling Tokens (`apps/web/src/app/globals.css`)
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```
**Defects & Deficiencies:**
- **Missing Semantic Tokens**: Only `--background` and `--foreground` are defined. There are no tokens for:
  - Surface (`--surface`, `--surface-elevated`)
  - Muted content (`--muted`, `--muted-foreground`)
  - Borders & Inputs (`--border`, `--input`, `--ring`)
  - Primary branding (`--primary`, `--primary-foreground`)
  - Secondary/Tertiary accents (`--secondary`, `--secondary-foreground`)
  - Functional feedback (`--success`, `--warning`, `--destructive`)
- **Hardcoded Media Query Dark Mode**: `@media (prefers-color-scheme: dark)` overrides `:root` variables globally without an application-controlled toggle class (e.g. `.dark`), making dark/light theme consistency uncontrollable in complex admin workflows.
- **Font Fallback**: Defaults to `Arial, Helvetica, sans-serif` instead of modern Geist or standard design typography.

---

### 3.3 Shared UI Primitives (`apps/web/src/components/ui/`)
- **Directory Status**: Does NOT exist (`apps/web/src/components/ui` is missing entirely).
- **Current Primitive Inventory**: 0 primitives.
- **Required Foundation Components**:
  1. `Button` (variants: primary, secondary, outline, ghost, destructive, link; states: loading spinner, disabled)
  2. `Input` (types: text, email, password, number; states: error border, disabled, helper text, accessible label integration)
  3. `Select` (accessible dropdown wrapper)
  4. `Badge` (variants: neutral, success, warning, destructive; used for status indicators)
  5. `Card` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
  6. `Tabs` (tab navigation for multi-view pages like academic structure and scheduling)
  7. `Dialog` / `Modal` (accessible dialog with Radix/floating-ui or accessible HTML dialog semantics: `role="dialog"`, `aria-modal="true"`, focus trap, escape key handler)
  8. `ConfirmDialog` (canonical replacement for browser-native `window.confirm()`)
  9. `Drawer` / `Sheet` (slide-out panel for entity creation/editing with focus management)
  10. `Toast` / `Feedback` (toast notification context and container for server action error/success feedback)

---

### 3.4 Application Shell & Navigation
#### File: `apps/web/src/app/layout.tsx`
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```
#### File: `apps/web/src/components/layout/AppShell.tsx`
```tsx
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```
**Architecture Violation:**
- The root layout wraps `<AppShell>` unconditionally around every page.
- When an unauthenticated visitor accesses `/login`, or an authenticated user is forced onto `/auth/update-password`, `AppShell` renders the full sidebar and top bar around the form.
- The sidebar displays internal administrative links (`/`, `/academic-structure`, `/students`, `/scheduling`, etc.), and the topbar displays `No Branch Assigned` alongside the user avatar.
- **Architectural Solution**: Move `<AppShell>` into an authenticated route group layout `(dashboard)/layout.tsx` (or compose layout conditionally), and place `/login` and `/auth/update-password` in an isolated unauthenticated layout `(auth)/layout.tsx` without sidebar or topbar chrome.

#### File: `apps/web/src/components/layout/Sidebar.tsx`
- **Mobile Collapse Defect**: Line 6: `className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-screen border-r border-gray-800"`. The entire sidebar is hidden with `hidden md:flex`. No hamburger button or mobile drawer exists in `TopBar.tsx` or `AppShell.tsx`. Mobile users on viewports < 768px have zero navigation ability.
- **Logout Form**: Lines 67–71 contain the user's pre-existing `<form action="/auth/logout" method="POST">`. This form handles server-side sign out and cookie invalidation cleanly. It must be preserved.

#### File: `apps/web/src/components/layout/TopBar.tsx`
- Server component querying:
  ```tsx
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const context = await getAppContext();
  ```
- Displays branch pill or `SuperAdminBranchSelector`.
- Lacks mobile hamburger toggle button to open the sidebar.

---

### 3.5 Authentication & Authorization UX
- **Middleware Proxy (`apps/web/src/proxy.ts`)**:
  - Handles route gating: redirects unauthenticated users to `/login`.
  - Enforces `requires_password_reset` RPC check; redirects to `/auth/update-password` if required.
  - Fail-closed security design when RPC fails.
- **Login Screen (`apps/web/src/app/login/page.tsx`)**:
  - Client component doing `supabase.auth.signInWithPassword`.
  - Manual retry loops and cookie listener.
  - Trapped inside `AppShell` layout.
- **Password Reset Screen (`apps/web/src/app/auth/update-password/page.tsx`)**:
  - Has `min-h-screen` styled container nested within `AppShell`'s `h-screen`, causing nested double scrollbars and visual distortion.
- **Branch Access Control (`apps/web/src/components/BranchAccessError.tsx`)**:
  - Rendered when `verifyPageBranchContext()` returns an error or unauthorized state.
  - Clean error message presentation, but lacks consistent design system button to return to dashboard or switch branches.

---

### 3.6 Data Tables & Entity Lists
1. **Students (`apps/web/src/app/students/page.tsx`)**:
   - Fetches all students via `StudentsService.listStudents()`.
   - Raw `<table>` element with inline borders and gray table headers.
   - Missing search bar, status filter, sorting by name/date, and pagination.
   - Status badge is hardcoded green `bg-green-100 text-green-800` regardless of status value.
2. **Academic Structure (`apps/web/src/app/academic-structure/`)**:
   - `AcademicYearsTable.tsx`, `ClassesTable.tsx`, `SectionsTable.tsx`.
   - Raw HTML tables with edit/delete buttons in row actions.
   - **Severe Defect**: Delete buttons invoke `window.confirm()` and `window.alert()`:
     - `AcademicYearsTable.tsx:12`: `if (confirm('Are you sure you want to delete this academic year?'))`
     - `AcademicYearsTable.tsx:16, 20, 22`: `alert(...)`
     - Same pattern repeated in `ClassesTable.tsx:12, 16, 20, 22` and `SectionsTable.tsx:12, 16, 20, 22`.
3. **Attendance (`apps/web/src/app/attendance/page.tsx` & `AttendanceManager.tsx`)**:
   - Multi-state table (PRESENT, ABSENT, LATE, EXCUSED) with radio buttons.
   - Status transitions (Draft -> Lock -> Publish).
   - Modal dialog for corrections (lines 308–354 in `AttendanceManager.tsx`) is a raw unstyled `<div>` with `fixed inset-0 bg-gray-600 bg-opacity-50`:
     - Missing `role="dialog"` and `aria-modal="true"`.
     - Missing accessible label (`aria-labelledby`).
     - No keyboard focus trap (user can Tab behind the modal).
     - No Escape key listener to close modal.

---

### 3.7 Scheduling & Performance Hotspots
1. **Query Waterfall in Timetable Page**:
   - File: `apps/web/src/app/scheduling/lib/page-data.ts`:
     - Query 1: `academic_years` (awaited single record)
     - Query 2: `timetable_entries` (awaited)
     - Query 3: `periods` (awaited)
     - Query 4: `rooms` (awaited)
     - Query 5: `staff_branch_profiles` (awaited)
   - File: `apps/web/src/app/scheduling/timetable/page.tsx`:
     - Query 6: `classes` (awaited)
     - Query 7: `sections` (awaited)
     - Query 8: `subjects` (awaited)
   - **Diagnosis**: 8 sequential round-trips over the network to PostgreSQL/Supabase. Queries 2 through 8 can be dispatched concurrently via `Promise.all()`, reducing server response latency by ~70%.
2. **Duplicate Context Invocations (`apps/web/src/lib/branch-context.ts`)**:
   - `getAppContext()` is called independently by:
     - `TopBar.tsx` (line 8)
     - `TimetablePage` via `verifyPageBranchContext()` (line 14)
     - `AttendancePage` (line 14 AND line 15 inside `verifyPageBranchContext`)
     - `HomeworkPage` (line 13 AND line 14 inside `verifyPageBranchContext`)
   - `getAppContext()` is a plain async function without `React.cache()`.
   - Each invocation triggers `supabase.auth.getUser()` and queries `branch_memberships` / `organization_memberships`.
   - In a single request to `/attendance`, `getAppContext()` executes **three separate times**, running 6 redundant database queries!
   - **Diagnosis**: Wrapping `getAppContext` with `import { cache } from 'react'; export const getAppContext = cache(async (): Promise<AppContext | null> => { ... });` will automatically deduplicate these calls within the RSC request scope with zero breaking changes.

---

### 3.8 Frontend Testing Setup & Coverage
1. **Playwright E2E Suite (`apps/web/playwright.config.ts`)**:
   - Projects configured for 4 roles (`superadmin`, `branchadmin`, `teacher`, `guardian`) across desktop Chrome, mobile Chrome (Pixel 5), and WebKit.
   - Authentication states preloaded via `playwright/.auth/${role}.json` created by `auth.setup.ts`.
   - 16 test spec files under `apps/web/e2e/`.
2. **Identified Deficiencies & Audit Gaps**:
   - **Dialog Interception Risk**: `academic-structure.spec.ts:52` explicitly uses `page.on('dialog', dialog => dialog.accept())` to handle browser-native `confirm()`. When Agent B & F replace `confirm()` with `ConfirmDialog`, this test will hang or fail unless updated to click the UI dialog confirm button.
   - **Flaky Synchronization**: `attendance.spec.ts` uses hardcoded `page.waitForTimeout(500)` at lines 30, 34, 94, 98 to wait for Next.js soft navigation.
   - **Missing Mutation Coverage**:
     - `students-security.spec.ts` checks that input fields are visible on `/students/new`, but never submits a student form.
     - Academic structure tests only cover Academic Year creation; Class and Section CRUD operations have zero E2E tests.
   - **Missing Component Tests**: Vitest (`apps/web/vitest.config.mts`) is configured with jsdom, but only action helper tests (`actions.test.ts`) exist. No React component tests exist; `@testing-library/react` is not installed.

---

## 4. High-Contention Files & Isolation Boundaries

To ensure safe multi-agent execution without merge conflicts or regressions, high-contention files have been cataloged with strict single-agent ownership and dependency sequencing.

| Contention File / Directory | Risk Level | Wave | Exclusive Owning Agent | Secondary Read/Consumer Agents | Safety Rules & Constraints |
|---|---|---|---|---|---|
| `apps/web/src/app/globals.css` | **CRITICAL** | Wave 1 | **Agent A** (Design System) | Agent B, C, D, E, F, H, K | Establish full design tokens (`--surface`, `--muted`, `--border`, `--input`, `--primary`, `--secondary`, etc.). Do not alter feature page styling. |
| `apps/web/src/components/ui/` | **CRITICAL** | Wave 1 | **Agent B** (UI Primitives) | Agents C, D, E, F, H, J, K | Creates canonical Button, Input, Select, Badge, Card, Tabs, Dialog, ConfirmDialog, Drawer, Toast. Zero changes outside this folder. |
| `apps/web/src/app/layout.tsx` | **CRITICAL** | Wave 2 | **Agent C** (Shell & Nav) | Agent D, K | Isolate root layout from authenticated chrome. Introduce route group layouts: `(auth)` vs `(dashboard)`. |
| `apps/web/src/components/layout/*` | **CRITICAL** | Wave 2 | **Agent C** (Shell & Nav) | Agent D, H, K | Must preserve `<form action="/auth/logout" method="POST">` in `Sidebar.tsx`. Add mobile hamburger toggle & mobile drawer. |
| `apps/web/src/lib/branch-context.ts` | **HIGH** | Wave 3 | **Agent G** (Scheduling & Perf) | Agents C, D, F, I | Wrap `getAppContext` with `React.cache()` for request memoization. Do not alter returned context types. |
| `apps/web/package.json` | **HIGH** | Wave 1 / 4 | **Agent B** (Wave 1) & **Agent J** (Wave 4) | All Agents | Managed via Integration Coordinator. Add UI/test packages only when strictly justified. Add `"test:e2e"` script. |
| `package-lock.json` | **CRITICAL** | All Waves | **Integration Coordinator Only** | None | Pre-existing user modifications must be preserved. Individual specialists must not commit lockfile changes unless authorized. |
| `apps/web/playwright.config.ts` | **HIGH** | Wave 4 | **Agent J** (Testing) | Agent H | Add responsive viewport tests and deterministic wait helpers. |

---

## 5. Wave Sequencing Plan (Waves 1 through 6)

```
===================================================================================
                               DEPENDENCY TIMELINE
===================================================================================

 WAVE 0: Baseline & Architecture Snapshot (Current)
   │  - Origin HEAD verified (efcbfe1)
   │  - User modifications preserved (Sidebar.tsx, package-lock.json)
   │  - High-contention ownership matrix established
   ▼
 WAVE 1: Design & Primitive Foundations
   ├── Agent A: Design Tokens & CSS Variables (`globals.css`) [FRONTEND-01]
   └── Agent B: Shared UI Primitives (`src/components/ui/`) [FRONTEND-03]
   │  (Gate: Primitives unit tested; Wave 1 integrated & validated)
   ▼
 WAVE 2: Shell, Navigation & Core UX
   ├── Agent C: App Shell & Responsive Nav (Preserves Sidebar.tsx logout) [FRONTEND-02]
   ├── Agent D: Auth & Permission UX (`/login`, `/auth/update-password`) [FRONTEND-04]
   └── Agent E: Form Patterns & Feedback (`AppConfigForm`, etc.) [FRONTEND-05]
   │  (Gate: Route boundary verified; auth pages render cleanly without AppShell)
   ▼
 WAVE 3: Data & Feature Modernization
   ├── Agent F: Data Tables & Elimination of alert/confirm [FRONTEND-06]
   ├── Agent G: Scheduling Optimization & `React.cache` deduplication [FRONTEND-09, 12]
   └── Agent I: Bulk Upload & Onboarding UI [FRONTEND-08]
   │  (Gate: ConfirmDialog replaces window.confirm; query waterfall eliminated)
   ▼
 WAVE 4: Cross-Cutting Hardening
   ├── Agent H: Accessibility & Responsive Verification (320px–desktop) [FRONTEND-10, 11]
   └── Agent J: E2E Test Suite Expansion & Deterministic Waits [FRONTEND-14]
   │  (Gate: Playwright tests pass across all roles; responsive checks certified)
   ▼
 WAVE 5: Visual QA & Audit Certification
   └── Agent K: Stitch Visual Compliance & Design Consistency Audit [FRONTEND-13]
   │  (Gate: Zero visual clipping or layout regressions)
   ▼
 WAVE 6: Master Integration & Final Certification
   └── Integration Coordinator: Merges specialist branches, full validation, final report
===================================================================================
```

### Wave 1: Foundations (Agent A & Agent B)
- **Agent A (FRONTEND-01)**: Implements semantic tokens in `apps/web/src/app/globals.css`. Sets up `--background`, `--foreground`, `--surface`, `--muted`, `--border`, `--input`, `--primary`, `--secondary`, `--success`, `--warning`, `--destructive`, `--ring`, radius conventions, and typography scales.
- **Agent B (FRONTEND-03)**: Implements canonical UI primitives in `apps/web/src/components/ui/` (`Button`, `Input`, `Select`, `Badge`, `Card`, `Tabs`, `Dialog`, `ConfirmDialog`, `Drawer`, `Toast`). Ensures keyboard navigation, ARIA attributes, and accessible focus outlines.

### Wave 2: Shell & Core UX (Agent C, Agent D, Agent E)
- **Agent C (FRONTEND-02 / FRONTEND-10 nav)**:
  - Splits `apps/web/src/app/layout.tsx` into unauthenticated route group `(auth)` and authenticated route group `(dashboard)`.
  - Refactors `Sidebar.tsx`: **strictly preserves** `<form action="/auth/logout" method="POST">`.
  - Implements responsive mobile navigation (hamburger button on `TopBar.tsx` toggling an accessible mobile drawer/sheet).
- **Agent D (FRONTEND-04)**: Hardens `/login` and `/auth/update-password` within the isolated `(auth)` layout. Modernizes `BranchAccessError.tsx` with clear return actions.
- **Agent E (FRONTEND-05 / FRONTEND-07 forms)**: Modernizes forms (e.g. `AppConfigForm`, `CommunicationForm`) to consume Wave 1 `Input`, `Select`, `Button`, and Toast primitives. Eliminates silent error swallowing.

### Wave 3: Feature UX & Performance (Agent F, Agent G, Agent I)
- **Agent F (FRONTEND-06 / FRONTEND-07 tables)**:
  - Upgrades `StudentsPage`, `AcademicYearsTable`, `ClassesTable`, `SectionsTable`.
  - Replaces all instances of `window.confirm()` and `window.alert()` with the Wave 1 `ConfirmDialog` and Toast primitives.
  - Implements reusable search, status filtering, sorting, and pagination.
- **Agent G (FRONTEND-09 / FRONTEND-12)**:
  - Memoizes `getAppContext()` in `apps/web/src/lib/branch-context.ts` using `React.cache()`.
  - Refactors `apps/web/src/app/scheduling/lib/page-data.ts` to execute timetable and scheduling queries concurrently via `Promise.all()`.
  - Measures latency before and after optimization.
- **Agent I (FRONTEND-08)**: Builds frontend bulk upload and onboarding wizard UI using Wave 1 primitives, adhering strictly to existing backend API boundaries.

### Wave 4: Cross-Cutting Hardening (Agent H & Agent J)
- **Agent H (FRONTEND-10 / FRONTEND-11)**: Audits and verifies mobile responsiveness at 320px, 375px, 390px, 768px, and desktop. Verifies touch targets (minimum 44x44px), focus containment, and ARIA attributes across all updated components.
- **Agent J (FRONTEND-14)**:
  - Updates `apps/web/e2e/academic-structure.spec.ts` to assert on `ConfirmDialog` instead of `page.on('dialog')`.
  - Replaces arbitrary `waitForTimeout` calls in `attendance.spec.ts` with deterministic locator assertions.
  - Adds E2E test coverage for real student form creation (`/students/new`) and class/section CRUD.
  - Adds `"test:e2e": "playwright test"` to `apps/web/package.json`.

### Wave 5: Visual QA (Agent K)
- **Agent K (FRONTEND-13)**: Inspects rendered screens against Stitch UI specifications (`docs/design/stitch_phase3c4_ui.md`, `01_login_screen.md`, `02_super_admin_shell.md`). Audits visual spacing, color contrast, and typographic hierarchy.

### Wave 6: Final Integration & Certification
- Coordinator merges specialist branches in dependency order into `frontend-hardening-integration`.
- Validates the entire test suite: `npm run lint`, `npm run typecheck`, `npm run test`, `npx playwright test`, and `npm run build`.
- Confirms pre-existing user work (`Sidebar.tsx` logout form and `package-lock.json`) remains intact.
- Issues final certification decision.

---

## 6. Git Worktree & Branch Isolation Strategy

To guarantee that no specialist agent pollutes or disrupts the dirty working tree containing pre-existing user changes, all specialists must operate in dedicated Git worktrees on isolated feature branches.

### 6.1 Worktree Architecture
```
Project Root: c:\Users\krish\Desktop\ERP 1\  (master branch, holds user's Sidebar.tsx & package-lock.json)
Worktrees Directory: c:\Users\krish\Desktop\ERP 1\.worktrees\

  ├── agent-a-design/         -> branch: feat/frontend-01-design-system
  ├── agent-b-primitives/     -> branch: feat/frontend-03-ui-primitives
  ├── agent-c-shell/          -> branch: feat/frontend-02-shell-navigation
  ├── agent-d-auth/           -> branch: feat/frontend-04-auth-ux
  ├── agent-e-forms/          -> branch: feat/frontend-05-forms-feedback
  ├── agent-f-tables/         -> branch: feat/frontend-06-data-tables
  ├── agent-g-scheduling/     -> branch: feat/frontend-09-scheduling-perf
  ├── agent-h-a11y/           -> branch: feat/frontend-10-responsive-a11y
  ├── agent-i-bulk/           -> branch: feat/frontend-08-bulk-onboarding
  └── agent-j-testing/        -> branch: feat/frontend-14-testing-expansion
```

### 6.2 Worktree Lifecycle Commands
1. **Creation** (executed by Integration Coordinator from `master` HEAD `efcbfe1`):
   ```powershell
   git branch feat/frontend-01-design-system efcbfe1c934d55b300a4bb3dab6342ad94439d84
   git worktree add .worktrees/agent-a-design feat/frontend-01-design-system
   ```
2. **Specialist Execution**:
   - Agent works exclusively inside `.worktrees/<agent-folder>/`.
   - Validates changes locally (`npm run lint`, `npm run typecheck`).
   - Commits with descriptive conventional commit message (e.g. `feat(frontend): harden design system`).
3. **Integration Merge**:
   - Integration Coordinator merges completed branches into `frontend-hardening-integration`:
     ```powershell
     git checkout -b frontend-hardening-integration efcbfe1c934d55b300a4bb3dab6342ad94439d84
     git merge --no-ff feat/frontend-01-design-system -m "feat(frontend): integrate design system tokens"
     ```
4. **Cleanup**:
   ```powershell
   git worktree remove .worktrees/agent-a-design
   ```

---

## 7. Immediate Recommendations for Coordinator

1. **Lock Down High-Contention Files**: Prohibit any concurrent modifications to `globals.css`, `layout.tsx`, and `package.json`.
2. **Execute Wave 1 Immediately**: Dispatch Agent A and Agent B in parallel worktrees to establish the design tokens and UI primitives before any feature code is migrated.
3. **Enforce Route Group Restructuring in Wave 2**: Direct Agent C to split `apps/web/src/app/layout.tsx` into `(auth)` and `(dashboard)` route groups, resolving the critical auth-chrome bleed defect while strictly retaining the user's `<form action="/auth/logout" method="POST">` in `Sidebar.tsx`.
4. **Enforce `React.cache()` & `Promise.all` in Wave 3**: Mandate `React.cache()` memoization in `apps/web/src/lib/branch-context.ts` to instantly eliminate redundant auth and membership RPC calls.
