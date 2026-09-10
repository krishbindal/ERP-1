# Wave 4 Remediation Worker Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_remediation\`

## Project Root
`c:\Users\krish\Desktop\ERP 1`

## Target Branch
- Branch: `feat/wave4-integrated`
- Base Commit: `96fac29a08b6b95bc93c686bf49990b01b019a71`

## Specific Defect Fixes
1. **Fix Student Table Pagination in `apps/web/e2e/students-form.spec.ts`**:
   - In lines 62-65, after navigating to `/students`, search for the created student using the search input:
     ```ts
     await page.getByPlaceholder('Search by name or admission number...').fill(testFirstName);
     await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
     ```
   - This ensures the assertion does not fail if cumulative students push the record to Page 2.

2. **Fix Playwright Strict Mode Button Selector in `apps/web/e2e/calendar.spec.ts`**:
   - In lines 143 & 188, `page.getByRole('button', { name: 'Add Event' })` matches both the section header button and the empty state button in `TableEmpty`.
   - Update to `page.getByRole('button', { name: 'Add Event' }).first().click()`.

3. **Validation Requirements**:
   - `npm run typecheck` in `apps/web` (0 errors)
   - `npm run lint` in `apps/web` (0 errors)
   - `npm test -- --run` in `apps/web` (all unit tests pass)
   - `npx playwright test e2e/students-form.spec.ts e2e/academic-structure.spec.ts e2e/responsive-mobile.spec.ts e2e/regression-wave1-3.spec.ts e2e/calendar.spec.ts e2e/attendance.spec.ts --project=chromium-branchadmin --workers=1` (all pass!)
   - `npm run build` in `apps/web` (0 errors)

4. **Preservation**:
   - `<form action="/auth/logout" method="POST">` in `Sidebar.tsx` and `TopBar.tsx` strictly preserved.
   - `package-lock.json` and untracked files preserved untouched.
