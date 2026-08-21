import { test, expect } from '@playwright/test';

/**
 * Substitutions E2E Tests
 *
 * Fixture ownership:
 *   This test creates timetable entries on day_of_week = 3 (Wednesday) and 4 (Thursday).
 *   Days 1–2 belong to timetable.spec.ts and are NOT touched here.
 *   Seed data contains ZERO timetable_entries and ZERO substitutions, so any entries
 *   visible on days 3–4 are exclusively owned by this test.
 *
 *   Substitutions are created for specific dates (2026-08-19 Wed, 2026-08-20 Thu).
 *   These dates are deterministic and within the seeded academic year (2026-01-01 to 2026-12-31).
 *
 * Project gating:
 *   CRUD mutations run ONLY on chromium-branchadmin.
 *   Teacher read-only test runs ONLY on chromium-teacher.
 */

test.describe('Substitutions Management', () => {

  test.describe('Branch Admin CRUD & Conflicts', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-branchadmin',
        'Expected role-scope skip');
    });

    test('should manage substitutions and handle conflicts', async ({ page }) => {

      // ─── FIXTURE CLEANUP (retry resilience) ───
      // Cancel any leftover substitutions from previous failed runs
      for (const date of ['2026-08-19', '2026-08-20']) {
        await page.goto(`/scheduling/substitutions?date=${date}`);
        const orangeCards = page.locator('.bg-orange-50');
        let orangeCount = await orangeCards.count();
        while (orangeCount > 0) {
          await orangeCards.first().click();
          const cancelBtn = page.getByRole('button', { name: 'Cancel Substitution' });
          if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
            await page.waitForTimeout(500);
            await page.reload();
          }
          orangeCount = await page.locator('.bg-orange-50').count();
        }
      }

      // Archive any leftover timetable entries on our owned days (3, 4)
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();
      for (const day of ['3', '4']) {
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

      // ─── 0a. CREATE prerequisite timetable entry (Wednesday) ───
      // Class 11, Section B, Science, Branch Admin, Room 102, Period 1, Wednesday
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('3'); // Wednesday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // ─── 0b. CREATE prerequisite timetable entry (Thursday) ───
      // Class 10, Section A, Mathematics, Teacher A, Room 101, Period 1, Thursday
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await page.waitForTimeout(1000);
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('4'); // Thursday
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // Verify: 2 prerequisite entries created
      await page.waitForTimeout(500);
      await page.reload();
      await expect(page.locator('[data-testid="timetable-entry"][data-day="3"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="4"]')).toHaveCount(1);

      // ─── 1. CREATE a substitution for Wednesday ───
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      await page.getByRole('button', { name: 'New Substitution' }).click();
      // 2026-08-19 is a Wednesday
      await page.locator('input[name="substitution_date"]').fill('2026-08-19');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="substitute_room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.fill('input[name="reason"]', 'E2E Testing Sick Leave');
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify: drawer closes (success)
      await expect(page.locator('text=Create Substitution')).not.toBeVisible();

      // ─── 2. CREATE a second substitution for Thursday ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-20'); // Thursday
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 10 Section A - Mathematics (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Branch Admin' });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('text=Create Substitution')).not.toBeVisible();

      // ─── 3. NEGATIVE: Wrong weekday ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-18'); // Tuesday ≠ Wednesday
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 4. NEGATIVE: Outside academic year ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2099-01-01');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 5. Cross-branch rejection ───
      await page.goto('/scheduling/substitutions?branchId=invalid-branch-id');
      await expect(page.locator('text=Access Denied')).toBeVisible();

      // ─── 6. CANCEL the Wednesday substitution ───
      await page.goto('/scheduling/substitutions?date=2026-08-19');
      const orangeCard = page.locator('.bg-orange-50').first();
      await orangeCard.click();
      const cancelBtn = page.getByRole('button', { name: 'Cancel Substitution' });
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      await page.waitForTimeout(500);
      await page.reload();

      // Verify: no substitution entries on 2026-08-19
      await expect(page.locator('.bg-orange-50')).toHaveCount(0);

      // ─── FIXTURE CLEANUP: archive prerequisite timetable entries ───
      await page.goto('/scheduling/timetable');

      // Cancel remaining Thursday substitution first (if still active)
      await page.goto('/scheduling/substitutions?date=2026-08-20');
      const remainingSubs = page.locator('.bg-orange-50');
      if (await remainingSubs.count() > 0) {
        await remainingSubs.first().click();
        const cancelRemaining = page.getByRole('button', { name: 'Cancel Substitution' });
        if (await cancelRemaining.isVisible()) {
          await cancelRemaining.click();
          await page.waitForTimeout(500);
        }
      }

      // Archive timetable entries on our owned days (3, 4)
      await page.goto('/scheduling/timetable');
      for (const day of ['3', '4']) {
        const entryLocator = page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`);
        if (await entryLocator.count() > 0) {
          await entryLocator.first().click();
          page.once('dialog', d => d.accept());
          await page.getByRole('button', { name: 'Archive Entry' }).click();
          await page.waitForTimeout(500);
          await page.reload();
        }
      }

      // Verify cleanup: 0 entries on our owned days
      await expect(page.locator('[data-testid="timetable-entry"][data-day="3"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="4"]')).toHaveCount(0);
    });
  });

  test.describe('Teacher Roles', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-teacher',
        'Expected role-scope skip');
    });

    test('should view substitutions but cannot create', async ({ page }) => {
      await page.goto('/scheduling/substitutions');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
