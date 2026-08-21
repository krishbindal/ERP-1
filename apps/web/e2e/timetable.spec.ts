import { test, expect } from '@playwright/test';

test.describe('Timetable Management', () => {

  test.describe('Branch Admin CRUD & Conflicts', () => {
    test.use({ storageState: 'playwright/.auth/branchadmin.json' });

    test('should manage timetable entries and handle conflicts', async ({ page }) => {
      // 1. Navigate to timetable
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // 2. Create a REAL timetable entry
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      
      await page.locator('select[name="class_id"]').selectOption({ index: 1 });
      // wait a moment for sections to filter
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 });
      await page.locator('select[name="subject_id"]').selectOption({ index: 1 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 1 });
      await page.locator('select[name="room_id"]').selectOption({ index: 1 });
      await page.locator('select[name="period_id"]').selectOption({ index: 1 });
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Monday
      
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify success (drawer closes, no error)
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // 3. Edit the entry (UI is currently missing this binding)
      await page.locator('.bg-blue-50').first().click();
      await expect(page.getByRole('heading', { name: 'Edit Timetable Entry' })).toBeVisible();
      
      await page.locator('select[name="room_id"]').selectOption({ index: 2 });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=Edit Timetable Entry')).not.toBeVisible();

      // 4. Archive the entry
      await page.locator('.bg-blue-50').first().click();
      await page.locator('select[name="status"]').selectOption('ARCHIVED');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.bg-blue-50')).not.toBeVisible();

      // 5. Conflict 1: Section Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption({ index: 1 });
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 }); // Same section
      await page.locator('select[name="subject_id"]').selectOption({ index: 2 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 2 });
      await page.locator('select[name="room_id"]').selectOption({ index: 2 });
      await page.locator('select[name="period_id"]').selectOption({ index: 1 }); // Same period
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Same day
      await page.getByRole('button', { name: 'Save' }).click();

      // Should show DB conflict error
      await expect(page.locator('.text-red-600')).toContainText('violates exclude constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 4. Conflict 2: Teacher Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption({ index: 2 });
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 }); // Diff section
      await page.locator('select[name="subject_id"]').selectOption({ index: 2 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 1 }); // Same teacher
      await page.locator('select[name="room_id"]').selectOption({ index: 2 });
      await page.locator('select[name="period_id"]').selectOption({ index: 1 }); // Same period
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Same day
      await page.getByRole('button', { name: 'Save' }).click();

      // Should show DB conflict error
      await expect(page.locator('.text-red-600')).toContainText('violates exclude constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 5. Conflict 3: Room Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption({ index: 2 });
      await page.waitForTimeout(1000); // NOSONAR 
      await page.locator('select[name="section_id"]').selectOption({ index: 1 }); 
      await page.locator('select[name="subject_id"]').selectOption({ index: 2 });
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ index: 2 });
      await page.locator('select[name="room_id"]').selectOption({ index: 1 }); // Same room
      await page.locator('select[name="period_id"]').selectOption({ index: 1 }); // Same period
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Same day
      await page.getByRole('button', { name: 'Save' }).click();

      // Should show DB conflict error
      await expect(page.locator('.text-red-600')).toContainText('violates exclude constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 6. Cross-branch rejection test
      await page.goto('/scheduling/timetable?branchId=00000000-0000-0000-0000-000000000000');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Teacher Roles', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test('should view timetable but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // Create button should NOT be visible to teachers
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).not.toBeVisible();
    });
  });

});
