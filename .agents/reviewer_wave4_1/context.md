# Reviewer Wave 4 Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave4_1\`

## Project Root
`c:\Users\krish\Desktop\ERP 1`

## Target Branch & Commit
- Branch: `feat/wave4-integrated`
- Commit SHA: `96fac29a08b6b95bc93c686bf49990b01b019a71`
- Base SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)

## Scope of Review
1. Responsive Hardening (FRONTEND-10):
   - Layout behavior at 320px, 375px, 390px, 768px, desktop.
   - Mobile navigation drawer, backdrop, scroll lock, touch targets (min 44x44px).
   - Horizontal table overflow regions, timetable scrolling.
2. Accessibility Hardening (FRONTEND-11):
   - Dialog and Drawer semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
   - Decoupled backdrop overlay (`aria-hidden="true"` on backdrop sibling, not parent container).
   - Focus containment (trap), focus restoration on close, escape key dismissal.
   - Form label and error associations.
   - Visible focus states (`focus-ring`).
3. Frontend & E2E Testing (FRONTEND-14):
   - Real student form submission, Academic Structure CRUD, mobile viewports, regression flows.
   - Deterministic waits (no arbitrary `waitForTimeout`).
   - Modern ConfirmDialog assertions.
4. User Work Preservation:
   - `Sidebar.tsx` and `TopBar.tsx` logout POST action (`<form action="/auth/logout" method="POST">`) is preserved.
   - `package-lock.json` and untracked files preserved.
   - Master branch untouched.

## Verification Commands
- `cd apps/web && npm run typecheck`
- `cd apps/web && npm run lint`
- `cd apps/web && npm test -- --run`
- `cd apps/web && npx playwright test e2e/students-form.spec.ts e2e/academic-structure.spec.ts e2e/responsive-mobile.spec.ts e2e/regression-wave1-3.spec.ts e2e/calendar.spec.ts e2e/attendance.spec.ts --project=chromium-branchadmin`
- `cd apps/web && npm run build`
