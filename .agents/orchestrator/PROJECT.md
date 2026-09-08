# Project: SchoolOS Frontend Hardening Master Orchestration

## Baseline State
- **Git Baseline Commit**: `efcbfe1c934d55b300a4bb3dab6342ad94439d84`
- **Origin/Master Commit**: `efcbfe1c934d55b300a4bb3dab6342ad94439d84` (Exact match confirmed)
- **Preserved User Modifications**:
  - `apps/web/src/components/layout/Sidebar.tsx` (Logout button `<form action="/auth/logout" method="POST">` with `type="submit"`)
  - `package-lock.json` (Pre-existing local npm install metadata)
  - Untracked diagnostic/log artifacts (`manual-test.js`, `full_diff.patch`, `*.log`, `*.txt`)
- **Safety Directive**: No destructive git actions (`git reset --hard`, `git clean`, `git stash drop`, blind file overwrites). Specialists execute in dedicated isolated worktrees/branches.

---

## Architecture
- **Framework**: Next.js 16.3.3 App Router, React 19.2.3, Tailwind CSS v4, Lucide React, Vitest, Playwright.
- **Routing & Proxy**: Next.js 16 uses `apps/web/src/proxy.ts` (replaces legacy `middleware.ts`). Must NOT be renamed.
- **Application Shell Boundaries**:
  - Current defect: `layout.tsx` wraps all routes in `<AppShell>`, leaking authenticated navigation chrome to `/login` and `/auth/update-password`.
  - Hardened architecture: Rearchitect shell boundaries to isolate unauthenticated routes (`(auth)`) from authenticated application pages (`(app)` / dashboard), preventing shell chrome bleed.
  - Mobile navigation: Add responsive hamburger menu and slide-out navigation sheet/drawer to `TopBar` / `Sidebar` for viewports < 768px (320px, 375px, 390px).
- **Design System**:
  - Semantic CSS tokens established in `apps/web/src/app/globals.css`: `--background`, `--foreground`, `--surface`, `--muted`, `--border`, `--input`, `--primary`, `--secondary`, `--success`, `--warning`, `--destructive`, `--ring`.
  - Typography hierarchy (Inter font family, standard scale and line heights), border radii, spacing conventions.
- **Shared UI Primitives**:
  - Canonical accessible primitives located in `apps/web/src/components/ui/`: `Button`, `Input`, `Select`, `Badge`, `Card`, `Tabs`, `Dialog`, `ConfirmDialog`, `Drawer`, `Toast`.
  - Mandatory accessibility: ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), focus trapping, focus restoration, escape key dismissal, and visible focus rings.
- **Elimination of Native Popups**:
  - Complete replacement of `window.confirm()` (8 instances) and `window.alert()` (18 instances) across academic structure, calendar, and scheduling tables with accessible `ConfirmDialog` and `Toast` primitives.
- **Form Patterns & Error Handling**:
  - Explicit `<label htmlFor="...">` and `<input id="...">` association.
  - Elimination of silent error swallowing (e.g. `students/new/page.tsx`), surfacing clear, accessible error alerts.
- **Performance Optimization**:
  - Request-level memoization: Wrap `getAppContext()` in `React.cache()` in `apps/web/src/lib/branch-context.ts` to eliminate duplicate database calls per request.
  - Query parallelization: Replace sequential 8-query waterfall in `scheduling/lib/page-data.ts` and `scheduling/timetable/page.tsx` with `Promise.all()`.
- **Frontend Testing**:
  - Component unit tests with React Testing Library / Vitest for UI primitives.
  - Playwright E2E stabilization: eliminate arbitrary `waitForTimeout` in favor of deterministic locator waits; expand CRUD coverage to include Class, Section, and Student form submission.
- **Strict Phase 6 Boundary**:
  - Strictly NO implementation of assessment business logic (Exams, marks entry, grading engine, results calculation, report-card generation).
  - Strictly NO modifications to database schemas, RLS policies, Identifier Engine, or backend auth.

---

## Feature Inventory
| # | Feature | Workstream | Description | Milestone | Source |
|---|---------|------------|-------------|-----------|--------|
| 1 | Semantic Design Tokens | FRONTEND-01 | CSS variables for background, surface, muted, border, input, primary, secondary, destructive, ring | Wave 1 (Agent A) | ORIGINAL_REQUEST § Agent A |
| 2 | Typography & Visual Foundation | FRONTEND-01 | Inter hierarchy, scale, radii, global typography in globals.css | Wave 1 (Agent A) | ORIGINAL_REQUEST § Agent A |
| 3 | Core Shared UI Primitives | FRONTEND-03 | Accessible Button, Input, Select, Badge, Card, Tabs in components/ui/ | Wave 1 (Agent B) | ORIGINAL_REQUEST § Agent B |
| 4 | Accessible Dialog & Drawer Primitives | FRONTEND-03 | Accessible Dialog, ConfirmDialog, Drawer, Toast with focus trap & escape | Wave 1 (Agent B) | ORIGINAL_REQUEST § Agent B |
| 5 | App Shell Route Isolation | FRONTEND-02 | Isolate unauthenticated routes (/login, /auth/update-password) from AppShell | Wave 2 (Agent C) | ORIGINAL_REQUEST § Agent C, DEF-01 |
| 6 | Mobile Navigation Drawer | FRONTEND-02, 10 | Hamburger trigger and drawer for screens < 768px (320px-390px) | Wave 2 (Agent C) | ORIGINAL_REQUEST § Agent C, DEF-02 |
| 7 | Sidebar Preservation & Accessibility | FRONTEND-02 | Preserve user logout POST form; add aria-label and keyboard access | Wave 2 (Agent C) | ORIGINAL_REQUEST § Agent C, DEF-08 |
| 8 | Auth & Authorization UX | FRONTEND-04 | Branch context error display, unauthorized states, login & reset error UX | Wave 2 (Agent D) | ORIGINAL_REQUEST § Agent D |
| 9 | Form Validation & Error Feedback | FRONTEND-05 | Fix silent error swallowing, surface server-action errors, accessible labels | Wave 2 (Agent E) | ORIGINAL_REQUEST § Agent E, DEF-03 |
| 10 | Feature Form Hardening | FRONTEND-07 | Student create, academic year, class, section, event forms | Wave 2 (Agent E) | ORIGINAL_REQUEST § Agent E |
| 11 | Data Table Primitives & States | FRONTEND-06 | Search, sort, filter, pagination, empty, loading, error states | Wave 3 (Agent F) | ORIGINAL_REQUEST § Agent F |
| 12 | Native Popup Elimination | FRONTEND-06 | Replace confirm()/alert() in 8 tables with ConfirmDialog & Toast | Wave 3 (Agent F) | ORIGINAL_REQUEST § Agent F, DEF-04, 05 |
| 13 | Scheduling Query Optimization | FRONTEND-12 | Parallelize 8 sequential queries in page-data.ts and timetable/page.tsx | Wave 3 (Agent G) | ORIGINAL_REQUEST § Agent G, DEF-06 |
| 14 | Context Caching Optimization | FRONTEND-12 | Add React.cache() to getAppContext() in branch-context.ts | Wave 3 (Agent G) | ORIGINAL_REQUEST § Agent G, DEF-07 |
| 15 | Scheduling Responsive UX | FRONTEND-09 | Timetable grid responsiveness, slot selection, period forms | Wave 3 (Agent G) | ORIGINAL_REQUEST § Agent G |
| 16 | Bulk & Onboarding UX | FRONTEND-08 | Generic CSV dropzone, column mapping preview, document missing backend | Wave 3 (Agent I) | ORIGINAL_REQUEST § Agent I |
| 17 | Responsive Viewport Hardening | FRONTEND-10 | Viewport audits at 320px, 375px, 390px, 768px, desktop; fix clipping | Wave 4 (Agent H) | ORIGINAL_REQUEST § Agent H |
| 18 | Accessibility Remediation | FRONTEND-11 | ARIA dialogs, focus containment/restoration, label associations, visible focus | Wave 4 (Agent H) | ORIGINAL_REQUEST § Agent H |
| 19 | Frontend Test Expansion | FRONTEND-14 | Component unit tests, RTL foundation, CRUD coverage (Class, Section, Student) | Wave 4 (Agent J) | ORIGINAL_REQUEST § Agent J |
| 20 | Deterministic Test Synchronization | FRONTEND-14 | Eliminate arbitrary waitForTimeout; replace page.on('dialog') with locator checks | Wave 4 (Agent J) | ORIGINAL_REQUEST § Agent J, DEF-09 |
| 21 | Visual QA Review & Polish | FRONTEND-13 | Visual audit against Stitch references; spacing, hierarchy, consistency | Wave 5 (Agent K) | ORIGINAL_REQUEST § Agent K |
| 22 | Final Integration & Certification | MASTER | Merge branches, full validation (lint, typecheck, build, test), 23-criteria gate | Wave 6 (Coordinator) | ORIGINAL_REQUEST § Wave 6 |

---

## Milestones (Dependency Waves)
| # | Wave / Milestone | Scope & Assigned Agents | Dependencies | Status |
|---|------------------|-------------------------|--------------|--------|
| M0 | Wave 0: Baseline & Survey | Baseline report, audit & arch analysis, PROJECT.md | None | DONE |
| M1 | Wave 1: Foundation | Agent A (Design System, globals.css), Agent B (Shared UI Primitives) | M0 | DONE |
| M2 | Wave 2: Shell & Core UX | Agent C (App Shell & Mobile Nav), Agent D (Auth UX), Agent E (Forms & Feedback) | M1 | DONE |
| M3 | Wave 3: Data & Feature UX | Agent F (Data Tables & Popup Migration), Agent G (Scheduling & Performance), Agent I (Bulk Onboarding) | M1, M2 | IN_PROGRESS |
| M4 | Wave 4: Cross-Cutting Hardening | Agent H (Responsive & Accessibility), Agent J (Frontend Testing Expansion) | M2, M3 | PENDING |
| M5 | Wave 5: Visual QA | Agent K (Visual QA & Consistency Review) | M4 | PENDING |
| M6 | Wave 6: Final Integration & Gate | Integration Agent / Coordinator: Merges, Full Test Suite, Master Report | M1-M5 | PENDING |

---

## High-Contention File Isolation Rules
To prevent merge conflicts and race conditions, the following files have strict single-agent write ownership:

| File / Directory | Exclusive Owner | Wave | Contention Rule |
|------------------|-----------------|------|-----------------|
| `apps/web/src/app/globals.css` | Agent A | Wave 1 | Other agents must only consume established classes |
| `apps/web/src/components/ui/*` | Agent B | Wave 1 | Other agents consume primitives via imports; never rewrite primitives |
| `apps/web/src/app/layout.tsx` | Agent C | Wave 2 | Exclusively owned by Agent C for shell boundary rearchitecting |
| `apps/web/src/components/layout/*` | Agent C | Wave 2 | Exclusively owned by Agent C (must preserve Sidebar logout POST action) |
| `apps/web/src/lib/branch-context.ts` | Agent G | Wave 3 | Exclusively owned by Agent G for `React.cache()` memoization |
| `apps/web/playwright.config.ts` | Agent J | Wave 4 | Exclusively owned by Agent J |
| `apps/web/package.json` | Coordinator / Agent J | Wave 4 | Only updated when explicitly adding approved test dependencies |
| `package-lock.json` | READ-ONLY / PRESERVED | All | Do NOT commit or discard pre-existing user package-lock modifications |

---

## Interface Contracts

### UI Primitives Contract (`apps/web/src/components/ui/`)
- `Button`: `variant`: `'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost'`; `size`: `'sm' | 'md' | 'lg'`; `isLoading?: boolean`; `disabled?: boolean`; `children: React.ReactNode`.
- `Input`: `label?: string`; `error?: string`; `helperText?: string`; standard `React.InputHTMLAttributes<HTMLInputElement>`; automatically connects `id`, `htmlFor`, and `aria-describedby`.
- `Select`: `label?: string`; `error?: string`; `options: Array<{ value: string; label: string }>`; standard `React.SelectHTMLAttributes<HTMLSelectElement>`.
- `Dialog`: `isOpen: boolean`; `onClose: () => void`; `title: string`; `description?: string`; `children: React.ReactNode`; accessible modal with focus trap, ESC listener, and `aria-modal="true"`.
- `ConfirmDialog`: `isOpen: boolean`; `onClose: () => void`; `onConfirm: () => void | Promise<void>`; `title: string`; `message: string`; `confirmText?: string`; `cancelText?: string`; `isDestructive?: boolean`; `isLoading?: boolean`.
- `Drawer`: `isOpen: boolean`; `onClose: () => void`; `title: string`; `side?: 'left' | 'right'`; `children: React.ReactNode`.
- `Toast` / `Feedback`: programmatic notification API (`toast.success()`, `toast.error()`, `toast.info()`) replacing `alert()`.
- `Badge`: `variant`: `'default' | 'success' | 'warning' | 'destructive' | 'outline'`.
- `Card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

### App Shell Contract
- Unauthenticated layouts (`/login`, `/auth/update-password`) render clean container without sidebar, topbar, or tenant switcher.
- Authenticated layout renders `AppShell` with desktop `Sidebar` and `TopBar` + mobile navigation sheet.
- Logout action contract: Submits POST request to `/auth/logout` via `<form action="/auth/logout" method="POST">`.

### Performance Contract
- `getAppContext()`: Returns `Promise<AppContext | null>` with `React.cache()` deduplication.
- Scheduling data fetching: `Promise.all([fetchAcademicYears(), fetchTimetableEntries(), fetchPeriods(), fetchRooms(), fetchStaffProfiles()])`.

---

## 23-Point Certification Gate Criteria
1. No VERIFIED unresolved P0 frontend defects remain.
2. No VERIFIED unresolved P1 frontend defects remain (unless explicitly documented as deferred with rationale).
3. Canonical shared primitives exist in `apps/web/src/components/ui/`.
4. Application shell boundaries are correct.
5. Mobile navigation works across 320px, 375px, 390px, 768px, and desktop.
6. Auth pages do not inherit authenticated chrome incorrectly.
7. Design tokens and typography are coherent in `globals.css`.
8. Hardened workflows do not use browser-native `alert()` or `confirm()`.
9. Forms surface meaningful failures (no silent error swallowing).
10. Loading/error/empty states are usable.
11. High-value data tables have scalable UX (search, filter, sort, pagination).
12. Dialogs and drawers satisfy required accessibility semantics (roles, focus trap, restoration).
13. Keyboard interaction works across all interactive components.
14. Visible focus states exist on all interactive controls.
15. No critical mobile clipping or navigation failures remain.
16. Measured performance bottlenecks (context duplication, query waterfalls) are addressed.
17. Critical frontend regression coverage exists.
18. Playwright tests actually execute and pass.
19. `lint` passes.
20. `typecheck` passes.
21. `build` passes.
22. No accidental files or user work are committed.
23. Final git diff is intentional, reviewable, and preserves user modifications.
