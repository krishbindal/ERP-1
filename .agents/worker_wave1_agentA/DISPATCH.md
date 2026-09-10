## 2026-09-04T11:09:05Z
You are Agent A (Design System Foundation) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave1_agentA\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstream: FRONTEND-01 (Design System Foundation)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave1_agentA\.
2. Create and switch to a dedicated feature branch `feat/wave1-design-system` branched from baseline commit `efcbfe1c934d55b300a4bb3dab6342ad94439d84`.
   IMPORTANT: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx`, `package-lock.json`, and untracked files). DO NOT reset, clean, or overwrite them.
3. Exclusive File Boundary:
   - Primary ownership: `apps/web/src/app/globals.css` (and any associated theme/font config if required).
   - DO NOT edit `apps/web/src/app/layout.tsx`, `apps/web/src/components/layout/*`, `apps/web/package.json`, or feature pages.
4. Establish the complete semantic design system in `apps/web/src/app/globals.css`:
   - CSS variables:
     - `--background` and `--foreground`
     - `--surface` and `--surface-foreground` (card/panel background)
     - `--muted` and `--muted-foreground`
     - `--border`
     - `--input`
     - `--primary` and `--primary-foreground`
     - `--secondary` and `--secondary-foreground`
     - `--success` and `--success-foreground`
     - `--warning` and `--warning-foreground`
     - `--destructive` and `--destructive-foreground`
     - `--ring` (focus ring token)
     - `--radius` (border radius token, e.g. 0.5rem)
   - Typography hierarchy (Inter font family, standard font sizes, line heights, font weights)
   - Focus ring utility and visible focus styling conventions
   - Both light and dark theme token definitions where applicable
   - Compatibility with Tailwind v4 (Tailwind v4 uses `@theme` or `@import "tailwindcss";`). Map these CSS variables so standard Tailwind semantic classes (e.g. `bg-background`, `text-foreground`, `bg-surface`, `border-border`, `ring-ring`, `bg-primary`, etc.) resolve properly.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   Ensure all pass with exit code 0.
6. Commit:
   Stage only your modified file(s) (`git add apps/web/src/app/globals.css`).
   Commit with message: `feat(frontend): harden design system`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with:
   - Observation (files changed, tokens established)
   - Logic Chain
   - Caveats
   - Conclusion (commit SHA, branch name)
   - Verification Method (commands executed and exact outputs)
8. Send a message to the orchestrator (Recipient: "777c8e44-9743-470b-8626-e64c595088d4") reporting completion.
