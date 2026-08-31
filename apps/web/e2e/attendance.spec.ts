import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Attendance Management', () => {

  test.describe('Teacher Flow (chromium-teacher)', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');
    });

    test('Teacher can mark, save, and lock attendance', async ({ page }) => {
      const targetDate = '2026-08-25';

      await page.goto('/attendance');
      await expect(page.getByRole('heading', { name: 'Attendance' })).toBeVisible();
      
      // Select Date
      await page.fill('input[type="date"]', targetDate);
      
      // Select Section
      await page.locator('select').selectOption({ label: 'Class 10 - Section A' }); // Assume section name is Class 10 - Section A
      // Actually the value can be matched by just clicking or selecting by text
      await page.locator('select').selectOption({ index: 1 }); // Just select the first available section

      await expect(page.locator('text=Status: Unmarked')).toBeVisible();

      // Mark first student as ABSENT
      const absentRadio = page.locator('input[value="ABSENT"]').first();
      await absentRadio.click();

      // Save
      await page.getByRole('button', { name: 'Save Attendance' }).click();
      await expect(page.locator('text=Attendance saved successfully')).toBeVisible();
      
      // Status should update to Draft
      await expect(page.locator('text=Status: Draft')).toBeVisible();

      // Lock
      await page.getByRole('button', { name: 'Lock' }).click();
      await expect(page.locator('text=Attendance locked successfully')).toBeVisible();

      // Status should update to Locked
      await expect(page.locator('text=Status: Locked')).toBeVisible();

      // Verify cannot edit (radios disabled)
      await expect(absentRadio).toBeDisabled();
      
      // Verify no Publish or Correct buttons
      await expect(page.getByRole('button', { name: 'Publish' })).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'Correct' })).not.toBeVisible();
    });
    
    test('Teacher cannot bypass authorization for another branch', async ({ page, request }) => {
       // Just a simple navigation check
       await page.goto('/attendance?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01'); // different branch
       await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Branch Admin Flow (chromium-branchadmin)', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
    });

    test('Admin can mark, save, lock, publish, and correct attendance', async ({ page }) => {
      const targetDate = '2026-08-26';

      await page.goto('/attendance');
      
      // Select Date
      await page.fill('input[type="date"]', targetDate);
      
      // Select Section
      await page.locator('select').selectOption({ index: 1 });

      // Ensure it's unmarked
      await expect(page.locator('text=Status: Unmarked')).toBeVisible();

      // Mark first student as LATE
      const lateRadio = page.locator('input[value="LATE"]').first();
      await lateRadio.click();

      // Save & Lock
      await page.getByRole('button', { name: 'Save Attendance' }).click();
      await expect(page.locator('text=Attendance saved successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Lock' }).click();
      await expect(page.locator('text=Attendance locked successfully')).toBeVisible();

      // Admin CAN publish
      await page.getByRole('button', { name: 'Publish' }).click();
      await expect(page.locator('text=Attendance published successfully')).toBeVisible();
      await expect(page.locator('text=Status: Published')).toBeVisible();

      // Admin CAN correct
      await page.getByRole('button', { name: 'Correct' }).first().click();
      await expect(page.getByRole('heading', { name: 'Correct Attendance' })).toBeVisible();
      
      // Try empty reason
      await page.getByRole('button', { name: 'Apply Correction' }).click();
      await expect(page.locator('text=Correction reason is mandatory')).toBeVisible();
      
      // Try valid correction
      await page.locator('select[aria-label="Correction Status"]').selectOption('EXCUSED');
      await page.fill('textarea[aria-label="Correction Reason"]', 'Medical note provided');
      await page.getByRole('button', { name: 'Apply Correction' }).click();
      
      await expect(page.locator('text=Attendance corrected successfully')).toBeVisible();
      
      // Check that the excused radio is checked
      const excusedRadio = page.locator('input[value="EXCUSED"]').first();
      await expect(excusedRadio).toBeChecked();
    });
  });

  test.describe('Guardian History Flow (chromium-guardian)', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-guardian', 'EXPECTED_ROLE_SCOPE');
      
      // Seed a published record directly via psql to avoid race conditions.
      // E2E student ID: eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51
      // Branch: eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02
      // Year: aaaaaaaa-1111-1111-1111-111111111111
      // Section: aaaaaaaa-3333-3333-3333-333333333333
      try {
        execSync(`npx --no-install supabase db query "
          WITH new_session AS (
            INSERT INTO public.attendance_sessions (branch_id, academic_year_id, section_id, date, locked_at, published_at)
            VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-3333-3333-3333-333333333333', '2026-08-10', now(), now())
            ON CONFLICT DO NOTHING
            RETURNING id
          )
          INSERT INTO public.attendance_records (session_id, student_id, status)
          SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'ABSENT' FROM new_session
          ON CONFLICT DO NOTHING;
        " --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"`);
      } catch (e) {
        console.error('Failed to seed guardian attendance record', e);
      }
    });

    test('Guardian can view published absences', async ({ page }) => {
      await page.goto('/attendance/history');
      await expect(page.getByRole('heading', { name: 'Attendance History (Absences & Lates)' })).toBeVisible();
      
      // Should see the seeded absence
      await expect(page.locator('text=2026-08-10')).toBeVisible();
      await expect(page.locator('text=ABSENT')).toBeVisible();
      await expect(page.locator('text=Student E2E')).toBeVisible();
    });
    
    test('Guardian cannot access attendance entry page', async ({ page }) => {
      await page.goto('/attendance');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });
});
