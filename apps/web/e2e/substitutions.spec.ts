import { test, expect } from '@playwright/test';

test.describe('Substitutions Management', () => {
  test.describe('Branch Admin', () => {
    test.use({ storageState: 'e2e/.auth/branch-admin.json' });

    test('should view substitutions and open creation form', async ({ page }) => {
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      // Ensure form button is visible to branch admins
      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).toBeVisible();

      await createBtn.click();
      await expect(page.getByRole('heading', { name: 'Create Substitution' })).toBeVisible();
      
      // Close drawer for now
      await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('should reject cross-branch viewing', async ({ page }) => {
      // Trying to access another branch's context
      await page.goto('/scheduling/substitutions?branchId=invalid-branch-id');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Teacher', () => {
    test.use({ storageState: 'e2e/.auth/teacher.json' });

    test('should view substitutions but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      // Create button should NOT be visible to teachers
      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).not.toBeVisible();
    });
  });

  test.describe('Student', () => {
    test.use({ storageState: 'e2e/.auth/student.json' });

    test('should view substitutions but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      // Create button should NOT be visible to students
      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
