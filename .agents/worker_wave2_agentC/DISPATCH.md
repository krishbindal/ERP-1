## 2026-09-04T11:34:39Z

Scope & Mission:
Workstreams: FRONTEND-02 (Application Shell) & FRONTEND-10 (Navigation)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_agentC\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave2-app-shell` branched from `feat/wave1-ui-primitives` (commit `c910854c9fe6cf1561e4bc556a1e2d929475f83a`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx` logout POST form, `package-lock.json`, and untracked files).
3. Exclusive File Boundary:
   - Primary ownership: `apps/web/src/app/layout.tsx` and `apps/web/src/components/layout/*` (`AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`).
   - DO NOT edit `apps/web/package.json`, `package-lock.json`, auth pages, or feature pages.
4. Core Hardening Tasks:
   A. Unconditional AppShell leakage fix (DEF-01):
      In `AppShell.tsx` (or route layout), inspect pathname via `usePathname()`. If the user is on an unauthenticated route (`/login` or starting with `/auth/` such as `/auth/update-password`, but excluding `/auth/logout`), DO NOT render the authenticated sidebar, topbar, or tenant switcher. Instead render a clean full-height container: `<main className="min-h-screen bg-background">{children}</main>`.
   B. Mobile Navigation (DEF-02):
      In `TopBar.tsx`, add a mobile hamburger menu button (`<button aria-label="Open navigation menu" className="md:hidden ...">`) with `Menu` from `lucide-react`.
      When clicked, open an accessible slide-out mobile drawer using `Drawer` from `@/components/ui/Drawer`. The drawer must contain the complete navigation link list, branch context indicator, profile section, and the preserved logout form.
   C. CRITICAL PRESERVATION of Logout Form in `Sidebar.tsx`:
      Lines 67-71 contain:
      ```tsx
      <form action="/auth/logout" method="POST">
        <button type="submit" className="p-1 rounded-md hover:bg-gray-800" aria-label="Log out">
          <LogOut size={16} />
        </button>
      </form>
      ```
      You MUST strictly preserve this `<form action="/auth/logout" method="POST">` structure with `type="submit"`. Add `aria-label="Log out"` to the button for accessibility.
   D. Accessible Navigation & Visible Focus (DEF-08):
      Add `<nav aria-label="Main navigation">` landmark semantics, `aria-current="page"` on the active navigation link, visible focus rings (`focus-ring`), and full keyboard accessibility.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all pass with exit code 0.
6. Commit:
   Stage only your modified files in `apps/web/src/app/layout.tsx` and `apps/web/src/components/layout/*`.
   Commit message: `feat(frontend): harden application shell`.
   Do NOT stage or commit `package-lock.json` or untracked scratch files.
7. Write `handoff.md` with 5 mandatory sections and notify orchestrator.
