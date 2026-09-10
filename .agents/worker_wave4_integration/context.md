# Wave 4 Integration Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_integration\`

## Project Root
`c:\Users\krish\Desktop\ERP 1`

## Base Checkpoint
- Starting SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)
- Target Integration Branch: `feat/wave4-integrated`

## Specialist Branches to Merge
1. **Agent H (Responsive & Accessibility)**:
   - Branch: `feat/wave4-responsive-a11y`
   - Commit: `36f59d27b76478a8666fe66a4ed9bf96ad4ac2fa`
   - Scope: Dialog/Drawer ARIA hierarchy decoupled backdrop, responsive mobile sizing (`max-w-[85vw]`, `max-h-[calc(100vh-2rem)]`), min 44x44px touch targets on buttons/links, keyboard table overflow regions (`role="region"`), toast escape dismissal, modernized drawer forms with canonical Input/Select primitives, 17 new tests in `ui-a11y-responsive.test.tsx`.
2. **Agent J (Frontend & E2E Testing)**:
   - Branch: `feat/wave4-e2e-testing`
   - Commit: `45878e79b21bba62ec1134d46e4c3633aae81580`
   - Scope: E2E test suites (real student form submission, academic structure CRUD, responsive mobile viewports, Wave 1-3 regressions, calendar, attendance), deterministic synchronization (no `waitForTimeout`), modern `ConfirmDialog` assertions, student enrollment fix for RLS visibility, section academic year inheritance, attendance section alignment.

## Preservation Rules
- `apps/web/src/components/layout/Sidebar.tsx` and `TopBar.tsx`: preserve `<form action="/auth/logout" method="POST">` with `type="submit"`.
- `package-lock.json`: do NOT stage or commit. Keep user modifications.
- Untracked files: preserve untouched.
- DO NOT merge into master.

## Required Post-Integration Validations
1. `npm run typecheck` in `apps/web` (0 errors)
2. `npm run lint` in `apps/web` (0 errors)
3. `npm test` in `apps/web` (all unit/component tests pass)
4. `npx playwright test` in `apps/web` (all 6 E2E test suites pass)
5. `npm run build` in `apps/web` (production build succeeds)
