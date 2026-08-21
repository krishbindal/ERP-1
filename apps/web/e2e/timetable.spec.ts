import { test, expect } from '@playwright/test';

test.describe('Timetable Management', () => {
  test.describe('Branch Admin', () => {
    test.use({ storageState: 'e2e/.auth/branch-admin.json' });

    test('should view the timetable grid and create a new entry', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // Ensure form button is visible to branch admins
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).toBeVisible();

      await createBtn.click();
      await expect(page.getByRole('heading', { name: 'New Timetable Entry' })).toBeVisible();
      
      // Close drawer for now
      await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('should reject cross-branch viewing', async ({ page }) => {
      // Trying to access another branch's context (e.g. branch 2 instead of 1)
      await page.goto('/scheduling/timetable?branchId=invalid-branch-id');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Teacher', () => {
    test.use({ storageState: 'e2e/.auth/teacher.json' });

    test('should view timetable but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // Create button should NOT be visible to teachers
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).not.toBeVisible();
    });
  });

  test.describe('Student', () => {
    test.use({ storageState: 'e2e/.auth/student.json' });

    test('should view timetable but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // Create button should NOT be visible to students
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
