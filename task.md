# Phase 3C.4-B Core UI Implementation

## Requirements
- [x] Role-aware authenticated AppShell (`layout.tsx`, `Sidebar`, `TopBar` with Branch Selector).
- [ ] Strict branch selector scoped by actual user authorization.
- [x] Academic Structure hub (`/academic-structure`) with horizontal tabs.
- [ ] Academic Years table + CRUD drawer (Slide-out Drawer).
- [ ] Classes table + CRUD drawer.
- [ ] Sections table + CRUD drawer.
- [ ] AccessDenied state for unauthorized users.
- [ ] Loading/empty/error/success states.
- [ ] Unsaved-change confirmation.
- [ ] Server-side pagination/filtering/sorting.
- [ ] Human-readable database error mapping.
- [ ] Desktop/tablet/iPad/mobile responsive behavior.
- [ ] Keyboard/focus/accessibility behavior.
- [x] Playwright E2E tests for: Super Admin, Branch Admin, Teacher, cross-branch denial, academic CRUD, read-only Teacher behavior, error states.

## Steps
1. [x] Update `apps/web/src/app/layout.tsx` to include an AppShell layout (Sidebar + Topbar).
2. [ ] Fetch the user's roles and branch memberships on the server (`src/lib/supabase/server.ts`) to populate the Branch Selector.
3. [x] Build the `/academic-structure` page and its components (Tabs, Tables, Forms in Drawers).
4. [x] Build reusable UI components (Table, Drawer, Buttons, Inputs).
5. [x] Create Playwright tests in `apps/web/e2e`.
6. [x] Run `npm run validate` to ensure everything compiles and passes typecheck.
7. [ ] Run `npx playwright test` (or similar) to ensure E2E tests pass.
