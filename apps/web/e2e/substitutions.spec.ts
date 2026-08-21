import { test, expect } from '@playwright/test';

test.describe('Substitutions Management', () => {

  test.describe('Branch Admin CRUD & Conflicts', () => {
    test.use({ storageState: 'playwright/.auth/branchadmin.json' });

    test('should manage substitutions and handle conflicts', async ({ page }) => {

      // 0. Ensure prerequisite canonical entries exist (since tests run in parallel)
      await page.goto('/scheduling/timetable');
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption({ index: 1 });
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 });
      await page.locator('select[name="subject_id"]').selectOption({ index: 1 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 1 });
      await page.locator('select[name="room_id"]').selectOption({ index: 1 });
      await page.locator('select[name="period_id"]').selectOption({ index: 1 });
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Monday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption({ index: 1 });
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 });
      await page.locator('select[name="subject_id"]').selectOption({ index: 2 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 2 });
      await page.locator('select[name="room_id"]').selectOption({ index: 2 });
      await page.locator('select[name="period_id"]').selectOption({ index: 2 }); // Diff period
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Monday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // 1. Create a substitution
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      await page.getByRole('button', { name: 'New Substitution' }).click();
      
      // We expect there to be a canonical entry created by the timetable spec,
      // but to be safe, we just select the first available target
      await page.locator('input[name="substitution_date"]').fill('2026-08-17');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ index: 1 });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ index: 2 });
      await page.locator('select[name="substitute_room_id"]').selectOption({ index: 1 }); // optional
      await page.fill('input[name="reason"]', 'E2E Testing Sick Leave');
      await page.getByRole('button', { name: 'Save' }).click();

      // Should succeed
      await expect(page.locator('text=Create Substitution')).not.toBeVisible();

      // 2. Conflict 1: Substitute Teacher double-booked (same teacher on same date/time)
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-17');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ index: 2 }); // a different canonical entry at same time
      await page.locator('select[name="substitute_staff_id"]').selectOption({ index: 2 }); // same teacher
      await page.getByRole('button', { name: 'Save' }).click();

      // 3. Conflict 2: Canonical Teacher Double-booked
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-17');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ index: 2 });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ index: 3 });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 4. Date rule: Wrong weekday
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-18'); // Assuming mismatch
      await page.locator('select[name="timetable_entry_id"]').selectOption({ index: 1 });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ index: 2 });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 5. Date rule: Outside academic year
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2099-01-01');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ index: 1 });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ index: 2 });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 6. Cross-branch rejection
      await page.goto('/scheduling/substitutions?branchId=invalid-branch-id');
      await expect(page.locator('text=Access Denied')).toBeVisible();

      // 7. Cancel Substitution
      await page.goto('/scheduling/substitutions?date=2026-08-17');
      await page.locator('.bg-orange-50').first().click();
      const cancelBtn = page.getByRole('button', { name: 'Cancel Substitution' });
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      await expect(page.locator('.bg-orange-50')).not.toBeVisible();
    });
  });

  test.describe('Teacher Roles', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test('should view substitutions but cannot create', async ({ page }) => {
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).not.toBeVisible();
    });
  });

});
