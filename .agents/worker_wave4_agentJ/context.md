# Agent J: Frontend & E2E Testing (FRONTEND-14) Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_agentJ\`

## Base Checkpoint
- Resume from SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)
- Dedicated branch: `feat/wave4-e2e-testing`
- Do NOT modify master.
- Do NOT modify database/RLS/security foundations.
- DO NOT implement Phase 6 business logic.
- PRESERVE pre-existing user work: `apps/web/src/components/layout/Sidebar.tsx`, `package-lock.json`, and untracked files.

## Mission & Scope (WAVE 4C — E2E / REGRESSION)
1. **E2E & Regression Coverage**:
   - Add or repair Playwright E2E and regression tests for:
     1. Real student form submission (`/students/new` -> verify submission and validation).
     2. Academic Year CRUD (`/academic-structure` -> create, edit, delete with ConfirmDialog).
     3. Class CRUD (`/academic-structure` -> create, edit, delete with ConfirmDialog).
     4. Section CRUD (`/academic-structure` -> create, edit, delete with ConfirmDialog).
     5. Responsive behavior (mobile viewports 375px/390px navigation drawer open/close, mobile table scrolling).
     6. Key Wave 1-3 regression flows (auth isolation, student list search/filter, scheduling timetable grid rendering, bulk CSV preview).
2. **Deterministic Synchronization**:
   - Replace arbitrary sleeps (`page.waitForTimeout`) with deterministic synchronization (locator waiting `toBeVisible()`, state assertions, response waits).
   - Replace any remaining `page.on('dialog')` native dialog listeners with checks against modern accessible `ConfirmDialog` and toast notifications.
   - Never weaken assertions, hide failures, convert failures into skips without documented reason, or create fake passing tests.
3. **Component Test Expansion**:
   - Add/expand RTL/Vitest unit tests for key user workflows.

## Validation Requirements
- `cd apps/web && npm run typecheck` must pass (0 errors).
- `cd apps/web && npm run lint` must pass (0 errors).
- `cd apps/web && npm test` must pass (all unit/component tests).
- Playwright tests must execute and pass.
- Commit your changes to `feat/wave4-e2e-testing`.
- Produce `handoff.md` in `.agents/worker_wave4_agentJ/handoff.md`.
