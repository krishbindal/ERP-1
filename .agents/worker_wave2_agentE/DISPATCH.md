## 2026-09-04T11:34:39Z

You are Agent E (Forms & Feedback) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_agentE\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstreams: FRONTEND-05 (Forms & Feedback) and relevant FRONTEND-07 form portions
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_agentE\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave2-forms-feedback` branched from `feat/wave1-ui-primitives` (commit `c910854c9fe6cf1561e4bc556a1e2d929475f83a`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx`, `package-lock.json`, and untracked files).
3. Exclusive File Boundary:
   - Primary ownership:
     - `apps/web/src/app/students/new/page.tsx`
     - `apps/web/src/app/communication/new/CommunicationForm.tsx`
     - `apps/web/src/app/academic-structure/components/DrawerForm.tsx`
   - DO NOT edit `apps/web/src/components/layout/*`, `Sidebar.tsx`, `package.json`, or `package-lock.json`.
4. Core Hardening Tasks:
   A. Fix Silent Error Swallowing in Student Enrollment (`apps/web/src/app/students/new/page.tsx` DEF-03):
      - Lines 51-54 currently execute `console.error(result.error); return;` when enrollment fails.
      - Fix: Introduce visible, accessible error presentation (e.g. error banner with `role="alert"` or `toast.error(result.error)`), ensuring server-side action errors are rendered to the user.
   B. Form Accessibility & Label Association (DEF-10):
      - In `students/new/page.tsx`, `communication/new/CommunicationForm.tsx`, and `DrawerForm.tsx`, ensure every input has an explicit `<label htmlFor="...">` matching `<input id="...">`.
      - Required fields must have clear required markers (`required` attribute, visual asterisk).
      - Error states must have `aria-invalid="true"` and `aria-describedby`.
   C. Primitives Migration:
      - Migrate form inputs and buttons in these forms to consume canonical primitives from `@/components/ui/` (`Button`, `Input`, `Select`).
   D. Submit States:
      - Add loading state with spinner and disable submission button while action is executing to prevent duplicate submissions.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all pass with exit code 0.
6. Commit:
   Stage only your designated files (`apps/web/src/app/students/new/page.tsx`, `apps/web/src/app/communication/new/CommunicationForm.tsx`, `apps/web/src/app/academic-structure/components/DrawerForm.tsx`).
   Commit message: `feat(frontend): harden forms and feedback`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with 5 mandatory sections and notify orchestrator.
