import { test, expect } from '@playwright/test';


test.describe('Attendance Management', () => {

  test.describe('Teacher Flow (chromium-teacher)', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');
    });

    test('Teacher can mark, save, and lock attendance', async ({ page }, testInfo) => {
      const projectNames = ['chromium-superadmin', 'chromium-branchadmin', 'chromium-teacher', 'chromium-guardian', 'chromium-teacher2', 'chromium-limit', 'mobile-chrome-superadmin', 'mobile-chrome-branchadmin', 'mobile-chrome-teacher', 'webkit-superadmin', 'webkit-branchadmin', 'webkit-teacher', 'mobile-safari-superadmin'];
      const pIdx = Math.max(0, projectNames.indexOf(testInfo.project.name));
      const testIdx = testInfo.title.includes('Teacher') ? 0 : 1;
      const offset = (pIdx * 2) + testIdx;
      
      const weekdays = [];
      const curr = new Date('2026-09-01T00:00:00Z');
      while(weekdays.length < 100) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) weekdays.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      const sectionId = 'aaaaaaaa-3333-3333-3333-333333333333';
      for (let i = offset; i < weekdays.length; i++) {
        await page.goto(`/attendance?date=${weekdays[i]}&sectionId=${sectionId}`);
        const isUnmarked = await page.getByLabel('Status Indicator').filter({ hasText: 'Status: Unmarked' }).isVisible();
        if (isUnmarked) {
          break;
        }
      }
      await expect(page.getByLabel('Status Indicator').filter({ hasText: 'Status: Unmarked' })).toBeVisible();

      // Mark first student as ABSENT
      const absentRadio = page.locator('input[value="ABSENT"]').first();
      await absentRadio.click();

      // Save
      await page.getByRole('button', { name: 'Save Attendance' }).click();
      await expect(page.locator('text=Attendance saved successfully')).toBeVisible();
      
      // Status should update to Draft
      await expect(page.getByLabel('Status Indicator').filter({ hasText: 'Status: Draft' })).toBeVisible();

      // Lock
      await page.getByRole('button', { name: 'Lock' }).click();
      const lockConfirmBtn = page.getByRole('button', { name: 'Lock Attendance' });
      await expect(lockConfirmBtn).toBeVisible();
      await lockConfirmBtn.click();
      await expect(page.locator('text=Attendance locked successfully')).toBeVisible();

      // Status should update to Locked
      await expect(page.getByLabel('Status Indicator').filter({ hasText: 'Status: Locked' })).toBeVisible();

      // Verify cannot edit (radios disabled)
      await expect(absentRadio).toBeDisabled();
      
      // Verify no Publish or Correct buttons
      await expect(page.getByRole('button', { name: 'Publish' })).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'Correct' })).not.toBeVisible();
    });
    
    test('Teacher cannot bypass authorization for another branch', async ({ page }) => {
       // Just a simple navigation check
       await page.goto('/attendance?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01'); // different branch
       await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Branch Admin Flow (chromium-branchadmin)', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
    });

    test('Admin can mark, save, lock, publish, and correct attendance', async ({ page }, testInfo) => {
      const projectNames = ['chromium-superadmin', 'chromium-branchadmin', 'chromium-teacher', 'chromium-guardian', 'chromium-teacher2', 'chromium-limit', 'mobile-chrome-superadmin', 'mobile-chrome-branchadmin', 'mobile-chrome-teacher', 'webkit-superadmin', 'webkit-branchadmin', 'webkit-teacher', 'mobile-safari-superadmin'];
      const pIdx = Math.max(0, projectNames.indexOf(testInfo.project.name));
      const testIdx = testInfo.title.includes('Teacher') ? 0 : 1;
      const offset = (pIdx * 2) + testIdx;
      
      const weekdays = [];
      const curr = new Date('2026-09-01T00:00:00Z');
      while(weekdays.length < 100) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) weekdays.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      const sectionId = 'aaaaaaaa-3333-3333-3333-333333333333';
      for (let i = offset; i < weekdays.length; i++) {
        await page.goto(`/attendance?date=${weekdays[i]}&sectionId=${sectionId}`);
        const isUnmarked = await page.getByLabel('Status Indicator').filter({ hasText: 'Status: Unmarked' }).isVisible();
        if (isUnmarked) {
          break;
        }
      }
      await expect(page.getByLabel('Status Indicator').filter({ hasText: 'Status: Unmarked' })).toBeVisible();

      // Mark first student as LATE
      const lateRadio = page.locator('input[value="LATE"]').first();
      await lateRadio.click();

      // Save & Lock
      await page.getByRole('button', { name: 'Save Attendance' }).click();
      await expect(page.locator('text=Attendance saved successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Lock' }).click();
      const lockConfirmBtn = page.getByRole('button', { name: 'Lock Attendance' });
      await expect(lockConfirmBtn).toBeVisible();
      await lockConfirmBtn.click();
      await expect(page.locator('text=Attendance locked successfully')).toBeVisible();

      // Admin CAN publish
      await page.getByRole('button', { name: 'Publish' }).click();
      const publishConfirmBtn = page.getByRole('button', { name: 'Publish Attendance' });
      await expect(publishConfirmBtn).toBeVisible();
      await publishConfirmBtn.click();
      await expect(page.locator('text=Attendance published successfully')).toBeVisible();
      await expect(page.getByLabel('Status Indicator').filter({ hasText: 'Status: Published' })).toBeVisible();

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
      // Seeded data is managed deterministically by seed.sql to avoid db query transaction errors and race conditions
    });

    test('Guardian can view published absences', async ({ page }) => {
      await page.goto('/attendance/history');
      await expect(page.getByRole('heading', { name: 'Attendance History (Absences & Lates)' })).toBeVisible();
      
      // Should see the seeded absence
      const row = page.locator('tr').filter({ hasText: '2026-08-10' }).first();
      await expect(row).toBeVisible();
      await expect(row.getByText('ABSENT', { exact: true })).toBeVisible();
      await expect(row.getByText('Student E2E')).toBeVisible();
    });
    
    test('Guardian cannot access attendance entry page', async ({ page }) => {
      await page.goto('/attendance');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });
});





