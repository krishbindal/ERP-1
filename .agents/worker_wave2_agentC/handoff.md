# Handoff Report: Agent C (Application Shell & Navigation)

**Workstreams**: FRONTEND-02 (Application Shell) & FRONTEND-10 (Navigation)  
**Branch**: `feat/wave2-app-shell`  
**Commit**: `d577588072cbe25a5aae768f9563a8df33a7cd86` (`feat(frontend): harden application shell`)  
**Base Commit**: `c910854c9fe6cf1561e4bc556a1e2d929475f83a` (`feat/wave1-ui-primitives`)  
**Target Milestone**: Wave 2: Shell & Core UX  

---

## 1. Observation

### Baseline State & Preserved Modifications
1. Verified baseline commit: `c910854c9fe6cf1561e4bc556a1e2d929475f83a` (`feat(frontend): establish ui primitives`).
2. Checked working tree state:
   - `apps/web/src/components/layout/Sidebar.tsx` contained pre-existing user modification:
     ```tsx
     <form action="/auth/logout" method="POST">
       <button type="submit" className="p-1 rounded-md hover:bg-gray-800">
         <LogOut size={16} />
       </button>
     </form>
     ```
   - `package-lock.json` contained pre-existing local npm metadata.
   - Untracked artifacts (`manual-test.js`, `playwright_output.log`, `server.log`, `*.patch`, `*.txt`) remained preserved and uncommitted.

### Code Defect Findings
- **DEF-01 (Unconditional AppShell Leakage)**: In `apps/web/src/app/layout.tsx:18`, `<AppShell>{children}</AppShell>` unconditionally wrapped all application routes without checking current pathname. On `/login` and `/auth/update-password`, unauthenticated users were erroneously presented with the full authenticated `Sidebar` and `TopBar`.
- **DEF-02 (Missing Mobile Navigation)**: `apps/web/src/components/layout/Sidebar.tsx:6` had `hidden md:flex`, making navigation completely inaccessible on mobile viewports (< 768px: 320px, 375px, 390px). `TopBar.tsx` lacked any hamburger trigger or mobile drawer.
- **DEF-08 (Accessibility & Visible Focus)**: `Sidebar.tsx` navigation lacked landmark labelling (`aria-label="Main navigation"` was missing), lacked `aria-current="page"` on active links, and lacked visible focus ring indicators (`focus-ring`). The logout submit button lacked an `aria-label`.

---

## 2. Logic Chain

1. **Fixing AppShell Route Leakage (DEF-01)**:
   - In `apps/web/src/components/layout/AppShell.tsx`, converted component to a Client Component (`'use client'`) utilizing `usePathname()` from `next/navigation`.
   - Defined `isUnauthenticatedRoute(pathname: string | null): boolean`:
     - Checks if pathname is `/login`, starts with `/login/`, or starts with `/auth/`.
     - Explicitly excludes `/auth/logout` so that the logout action/route retains its standard container context.
     - When `isUnauthenticatedRoute(pathname)` is true, renders a clean, isolated full-height container:
       ```tsx
       <main className="min-h-screen bg-background">{children}</main>
       ```
     - When false, renders authenticated application chrome (`Sidebar`, `TopBar`, and scrollable main content).
   - In `apps/web/src/app/layout.tsx`, resolved session and `getAppContext()` on the server and passed `context` and `userEmail` down to `AppShell`, ensuring SSR compatibility and zero hydration mismatch.

2. **Mobile Navigation Drawer (DEF-02)**:
   - In `apps/web/src/components/layout/TopBar.tsx`, added a mobile hamburger trigger button:
     ```tsx
     <button
       type="button"
       aria-label="Open navigation menu"
       onClick={() => setIsDrawerOpen(true)}
       className="md:hidden p-2 -ml-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-ring cursor-pointer inline-flex items-center justify-center"
     >
       <Menu className="h-6 w-6" aria-hidden="true" />
     </button>
     ```
   - Integrated `Drawer` from `@/components/ui/Drawer` (`side="left"`, title `"SchoolOS"`).
   - The drawer contains:
     - **Branch Context Indicator**: Renders current branch badge, or `<SuperAdminBranchSelector>` when superadmin.
     - **Complete Navigation List**: All 8 primary routes (`Dashboard`, `Academic Structure`, `Students`, `Scheduling Configuration`, `Timetable`, `Substitutions`, `Attendance`, `Homework`), with automatic drawer close on link selection (`onClick={() => setIsDrawerOpen(false)}`).
     - **Profile Section**: User avatar and email truncate cleanly.
     - **Preserved Logout Form**: `<form action="/auth/logout" method="POST">` with `type="submit"` and `aria-label="Log out"`.

3. **Accessibility, Landmarks & Focus Rings (DEF-08)**:
   - In `apps/web/src/components/layout/Sidebar.tsx`:
     - Added `<nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4">`.
     - Added `aria-current={active ? "page" : undefined}` on navigation links.
     - Centralized route active matching in `isLinkActive()` (`nav-items.ts`), properly handling root `/` and disambiguating nested routes (e.g. `/scheduling` vs `/scheduling/timetable`).
     - Added `focus-ring` classes to all navigation links, profile actions, and hamburger buttons.

4. **Strict Logout Form Preservation**:
   - Preserved verbatim `<form action="/auth/logout" method="POST">` with `<button type="submit">` in both `Sidebar.tsx` and `TopBar.tsx` (Drawer), adding `aria-label="Log out"` and `focus-ring` for accessibility.

5. **Automated Test Coverage**:
   - Created `apps/web/src/components/layout/layout.test.tsx` containing 20 tests.
   - Verified 100% statement, branch, function, and line coverage for `AppShell.tsx` and `Sidebar.tsx`, and 90% statement coverage for `TopBar.tsx`.

---

## 3. Caveats

- **SuperAdmin Scope Multiplicity**: If a Super Admin has multiple organization scopes, `TopBar` and `Drawer` currently bind to `context.organizationScopes[0]` as per existing application contract. Multi-org selection is handled by `SuperAdminBranchSelector`.
- **Pre-existing Working-Tree Files**: `package-lock.json` and untracked scratch files were carefully left untouched in the working directory as directed by the master specification.

---

## 4. Conclusion

The application shell and navigation infrastructure for SchoolOS has been hardened to specification:
- DEF-01 resolved: `/login` and `/auth/update-password` render clean containers without authenticated navigation chrome leakage.
- DEF-02 resolved: Mobile viewports (< 768px) have a responsive, accessible slide-out `Drawer` triggered by a hamburger button.
- DEF-08 resolved: Semantic landmark `<nav aria-label="Main navigation">`, `aria-current="page"`, and `focus-ring` are implemented on all navigation controls.
- Logout POST form structure (`<form action="/auth/logout" method="POST">` with `type="submit"`) is strictly preserved on both desktop and mobile drawer.
- All verification checks (`typecheck`, `lint`, `test`, `build`) pass with exit code 0.

---

## 5. Verification Method

### Automated Commands (Run in `apps/web`)

1. **TypeScript Typecheck**:
   ```bash
   npm run typecheck
   # Output: tsc --noEmit (Exit code 0)
   ```

2. **ESLint**:
   ```bash
   npm run lint
   # Output: 0 errors (Exit code 0)
   ```

3. **Vitest Unit & Component Tests**:
   ```bash
   npm test
   # Output: 8 passed (8), 72 tests passed (72), Exit code 0
   ```

4. **Next.js Production Build**:
   ```bash
   npm run build
   # Output: Compiled successfully, 14/14 static and dynamic routes generated (Exit code 0)
   ```

### Files to Inspect
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/AppShell.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/components/layout/TopBar.tsx`
- `apps/web/src/components/layout/nav-items.ts`
- `apps/web/src/components/layout/layout.test.tsx`

### Git Commit Verification
- Run `git show --stat d577588072cbe25a5aae768f9563a8df33a7cd86` on branch `feat/wave2-app-shell` to confirm only the 6 designated files were modified and committed.
