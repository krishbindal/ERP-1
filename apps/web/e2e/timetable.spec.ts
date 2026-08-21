import { test, expect } from '@playwright/test';

test.describe('Timetable Management', () => {

  test.describe('Branch Admin CRUD & Conflicts', () => {
    test.use({ storageState: 'playwright/.auth/branchadmin.json' });

    test('should manage timetable entries and handle conflicts', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // 1. Create a REAL timetable entry (Monday)
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000); // NOSONAR
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Monday
      
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify success (drawer closes, no error)
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();
      await page.waitForTimeout(500); // Give Server Action a moment
      await page.reload();

      // 2. Edit the entry (UI is currently missing this binding)
      await page.locator('.bg-blue-50').first().click();
      await expect(page.getByRole('heading', { name: 'Edit Timetable Entry' })).toBeVisible();
      
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=Edit Timetable Entry')).not.toBeVisible();

      // 3. Archive the entry
      await page.locator('.bg-blue-50').first().click();
      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Archive Entry' }).click();
      await expect(page.locator('.bg-blue-50')).not.toBeVisible();

      // 4. Create base entry for conflicts (Tuesday)
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000); // NOSONAR
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();
      await page.waitForTimeout(500); // Give Server Action a moment
      await page.reload();

      // 5. Conflict 1: Section Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000); // NOSONAR
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333'); // Same section
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 6. Conflict 2: Teacher Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await page.waitForTimeout(1000); // NOSONAR
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334'); 
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' }); // Same teacher
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 7. Conflict 3: Room Double-Booking
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await page.waitForTimeout(1000); // NOSONAR
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334'); 
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555'); // Same room
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 8. Cross-branch rejection test
      await page.goto('/scheduling/timetable?branchId=00000000-0000-0000-0000-000000000000');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test.describe('Teacher Roles', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test('should view timetable but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
