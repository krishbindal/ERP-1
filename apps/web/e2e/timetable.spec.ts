import { test, expect } from '@playwright/test';

/**
 * Timetable E2E Tests
 *
 * Fixture ownership:
 *   This test creates timetable entries on day_of_week = 1 (Monday) and 2 (Tuesday).
 *   Days 3–7 are NOT touched and belong to other specs (substitutions uses 3, 4).
 *   Seed data contains ZERO timetable_entries, so any entries visible on days 1–2
 *   are exclusively owned by this test (or a previous failed retry).
 *
 * Project gating:
 *   CRUD mutations run ONLY on chromium-branchadmin.
 *   Teacher read-only test runs ONLY on chromium-teacher.
 *   All other projects skip these tests (the project-level storageState
 *   already provides role coverage for non-mutating tests in other specs).
 */

test.describe('Timetable Management', () => {

  test.describe('Branch Admin CRUD & Conflicts', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-branchadmin',
        'Expected role-scope skip');
    });

    test('should manage timetable entries and handle conflicts', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

      // ─── FIXTURE CLEANUP (retry resilience) ───
      // Archive only THIS test's owned days (1=Monday, 2=Tuesday).
      // Seed data has 0 timetable entries; any entries on these days are ours.
      for (const day of ['1', '2']) {
        let count = await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).count();
        while (count > 0) {
          await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).first().click();
          page.once('dialog', d => d.accept());
          await page.getByRole('button', { name: 'Archive Entry' }).click();
          await page.waitForTimeout(500);
          await page.reload();
          count = await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).count();
        }
      }

      // ─── 1. CREATE a timetable entry (Monday) ───
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('1'); // Monday
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify: drawer closes (success)
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();
      await page.waitForTimeout(500);
      await page.reload();

      // Verify: exactly 1 entry on Monday
      await expect(page.locator('[data-testid="timetable-entry"][data-day="1"]')).toHaveCount(1);

      // ─── 2. EDIT the Monday entry (change room) ───
      await page.locator('[data-testid="timetable-entry"][data-day="1"]').click();
      await expect(page.getByRole('heading', { name: 'Edit Timetable Entry' })).toBeVisible();
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=Edit Timetable Entry')).not.toBeVisible();

      // ─── 3. CREATE a second entry (Tuesday) — sets up conflict tests ───
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();
      await page.waitForTimeout(500);
      await page.reload();

      // Verify: 2 entries total (Monday + Tuesday)
      await expect(page.locator('[data-testid="timetable-entry"][data-day="1"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="2"]')).toHaveCount(1);

      // ─── 4. ARCHIVE the Monday entry ───
      // Target it specifically: Monday entry now has Room 102 after edit
      await page.locator('[data-testid="timetable-entry"][data-day="1"]').click();
      await expect(page.getByRole('heading', { name: 'Edit Timetable Entry' })).toBeVisible();
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Archive Entry' }).click();
      await page.waitForTimeout(500);
      await page.reload();

      // Verify: Monday entry gone, Tuesday entry remains
      await expect(page.locator('[data-testid="timetable-entry"][data-day="1"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="2"]')).toHaveCount(1);

      // ─── 5. CONFLICT: Section double-booking (Tuesday) ───
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333'); // Same section
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify: drawer stays open with exclusion error
      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 6. CONFLICT: Teacher double-booking (Tuesday) ───
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' }); // Same teacher
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 7. CONFLICT: Room double-booking (Tuesday) ───
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555'); // Same room
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('2'); // Tuesday
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.locator('.text-red-600')).toContainText('violates exclusion constraint');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 8. Cross-branch rejection ───
      await page.goto('/scheduling/timetable?branchId=00000000-0000-0000-0000-000000000000');
      await expect(page.locator('text=Access Denied')).toBeVisible();

      // ─── FIXTURE CLEANUP: archive the remaining Tuesday entry ───
      await page.goto('/scheduling/timetable');
      await page.locator('[data-testid="timetable-entry"][data-day="2"]').click();
      page.once('dialog', d => d.accept());
      await page.getByRole('button', { name: 'Archive Entry' }).click();
      await page.waitForTimeout(500);
      await page.reload();

      // Verify cleanup: 0 entries on our owned days
      await expect(page.locator('[data-testid="timetable-entry"][data-day="1"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="2"]')).toHaveCount(0);
    });
  });

  test.describe('Teacher Roles', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-teacher',
        'Expected role-scope skip');
    });

    test('should view timetable but cannot create entries', async ({ page }) => {
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();
      const createBtn = page.getByRole('button', { name: 'Create Timetable Entry' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
