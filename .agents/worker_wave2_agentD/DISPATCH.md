## 2026-09-04T11:34:39Z
You are Agent D (Auth & Authorization UX) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_agentD\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstream: FRONTEND-04 (Auth & Authorization UX)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_agentD\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave2-auth-ux` branched from `feat/wave1-ui-primitives` (commit `c910854c9fe6cf1561e4bc556a1e2d929475f83a`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx`, `package-lock.json`, and untracked files).
3. Exclusive File Boundary:
   - Primary ownership: `apps/web/src/app/login/page.tsx`, `apps/web/src/app/auth/update-password/page.tsx`, and `apps/web/src/components/BranchAccessError.tsx`.
   - DO NOT modify backend auth, database schemas, RLS policies, Identifier Engine, or `Sidebar.tsx`.
4. Core Hardening Tasks:
   A. Login Page UX (`apps/web/src/app/login/page.tsx`):
      - Modernize styling using semantic tokens (`bg-background`, `text-foreground`, `Card`, `Button`, `Input` from `@/components/ui/`).
      - Connect inputs with accessible labels (`htmlFor` / `id`), clear visible focus rings.
      - Ensure errors are surfaced clearly with accessible alerts (`role="alert"`).
      - Add loading submit state (`isLoading` with spinner, `disabled` while authenticating).
   B. Password Reset UX (`apps/web/src/app/auth/update-password/page.tsx`):
      - Modernize with `Card`, `Button`, `Input`, password validation indicators, accessible error feedback, and loading submit state.
   C. Branch Context & Authorization Error Presentation (`apps/web/src/components/BranchAccessError.tsx`):
      - Harden the branch access error component using `Card` and semantic warning/destructive tokens.
      - Clearly explain the reason for the access blockage (missing branch assignment vs unauthorized role) and provide actionable steps (e.g. switch branch or contact administrator).
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all pass with exit code 0.
6. Commit:
   Stage only your modified files (`apps/web/src/app/login/page.tsx`, `apps/web/src/app/auth/update-password/page.tsx`, `apps/web/src/components/BranchAccessError.tsx`).
   Commit message: `feat(frontend): harden auth ux`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with 5 mandatory sections and notify orchestrator.
