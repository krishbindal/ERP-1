# Agent H: Responsive (FRONTEND-10) & Accessibility (FRONTEND-11) Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_agentH\`

## Base Checkpoint
- Resume from SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)
- Dedicated branch: `feat/wave4-responsive-a11y`
- Do NOT modify master.
- Do NOT modify database/RLS/security foundations.
- DO NOT implement Phase 6 business logic.
- PRESERVE pre-existing user work: `apps/web/src/components/layout/Sidebar.tsx` (logout POST action `<form action="/auth/logout" method="POST">`), `package-lock.json`, and untracked files.

## Mission & Scope
1. **WAVE 4A — RESPONSIVE (FRONTEND-10)**:
   - Verify and remediate actual UI behavior at: 320px, 375px, 390px, 768px, desktop.
   - Prioritize: mobile navigation (hamburger trigger and drawer), tables (horizontal scroll wrapper, overflow handling), timetable (accessible scroll region, empty states), forms (grid collapsing, padding, touch targets), dialogs (max-width, viewport fitting, scrollable body), drawers (responsive widths, full-height mobile sheets), action controls (touch target min 44x44px, no button clipping), usable touch targets.
   - Do not claim mobile-ready based on CSS inspection alone.

2. **WAVE 4B — ACCESSIBILITY (FRONTEND-11)**:
   - Verify and remediate:
     - Dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
     - Drawer semantics (`role="dialog"`, `aria-modal="true"`).
     - Accessible names (`aria-label` on icon-only buttons like close, search, clear, menu, logout).
     - Keyboard interaction across interactive elements.
     - Focus entry, focus containment (focus trap inside open modals/drawers), focus restoration (restore focus to trigger element upon closing).
     - Escape key dismissal behavior for dialogs, drawers, and toasts.
     - Form label association (`<label htmlFor="...">` associated with `<input id="...">`).
     - Validation/error association (`aria-describedby` pointing to error IDs, `aria-invalid="true"` on invalid inputs).
     - Visible focus states (ensure `focus-ring` / `focus:ring-2` / visible outlines on all interactive controls).
     - Confirmed contrast problems (ensure text meets WCAG AA contrast).
   - Do not blindly apply standards where the actual criterion is not applicable.

## Validation Requirements
- `cd apps/web && npm run typecheck` must pass (0 errors).
- `cd apps/web && npm run lint` must pass (0 errors).
- `cd apps/web && npm test` must pass.
- Write unit tests for your responsive and accessibility improvements (e.g. testing focus trapping, focus restoration, escape key handling, label associations).
- Commit your changes to `feat/wave4-responsive-a11y`.
- Produce `handoff.md` in `.agents/worker_wave4_agentH/handoff.md`.
