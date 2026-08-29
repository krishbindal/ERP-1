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
        'EXPECTED_ROLE_SCOPE');
    });

    test.beforeEach(async ({}, testInfo) => {
    // To avoid parallel DB collisions on shared seeds, restrict mutations strictly to ONE project.
    test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
  });

  test('should manage substitutions and handle conflicts', async ({ page }) => {

            // 🛠️ FIXTURE CLEANUP (retry resilience) 🛠️
      // Cancel any leftover substitutions from previous failed runs
      for (const date of ['2026-08-19', '2026-08-20']) {
        await page.goto(`/scheduling/substitutions?date=${date}`);
        let attempts = 0;
        while (attempts < 5) {
          const orangeCards = page.locator('.bg-orange-50');
          const orangeCount = await orangeCards.count();
          if (orangeCount === 0) break;
          
          await orangeCards.first().click();
          const cancelBtn = page.getByRole('button', { name: 'Cancel Substitution' });
          await expect(cancelBtn).toBeVisible();
          await cancelBtn.click();
          
          await expect(cancelBtn).not.toBeVisible();
          await page.reload();
          
          const newCount = await page.locator('.bg-orange-50').count();
          expect(newCount).toBeLessThan(orangeCount);
          attempts++;
        }
      }

      // Archive any leftover timetable entries on our owned days (3, 4)
      await page.goto('/scheduling/timetable');
      await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();
      for (const day of ['3', '4']) {
        let attempts = 0;
        while (attempts < 5) {
          const entryLocator = page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`);
          const count = await entryLocator.count();
          if (count === 0) break;
          
          await entryLocator.first().click();
          page.once('dialog', d => d.accept());
          
          const archiveBtn = page.getByRole('button', { name: 'Archive Entry' });
          await archiveBtn.click();
          
          await expect(archiveBtn).not.toBeVisible();
          await page.reload();
          
          const newCount = await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).count();
          expect(newCount).toBeLessThan(count);
          attempts++;
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
          
          await page.reload();
          count = await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).count();
        }
      }

      // ─── 0a. CREATE prerequisite timetable entry (Wednesday) ───
      // Class 11, Section B, Science, Branch Admin, Room 102, Period 1, Wednesday
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');
      await expect(page.locator('select[name="section_id"] option[value="aaaaaaaa-3333-3333-3333-333333333334"]')).toBeAttached();
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Branch Admin' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555556');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('3'); // Wednesday
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // ─── 0b. CREATE prerequisite timetable entry (Thursday) ───
      // Class 10, Section A, Mathematics, Teacher A, Room 101, Period 1, Thursday
      await page.getByRole('button', { name: 'Create Timetable Entry' }).click();
      await page.locator('select[name="class_id"]').selectOption('aaaaaaaa-2222-2222-2222-222222222222');
      await expect(page.locator('select[name="section_id"] option[value="aaaaaaaa-3333-3333-3333-333333333333"]')).toBeAttached();
      await page.locator('select[name="section_id"]').selectOption('aaaaaaaa-3333-3333-3333-333333333333');
      await page.locator('select[name="subject_id"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');
      await page.locator('select[name="staff_branch_profile_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.locator('select[name="period_id"]').selectOption('aaaaaaaa-6666-6666-6666-666666666666');
      await page.locator('select[name="day_of_week"]').selectOption('5'); // Friday
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();

      // Verify: 2 prerequisite entries created
      
      await page.reload();
      await expect(page.locator('[data-testid="timetable-entry"][data-day="3"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="5"]')).toHaveCount(1);

      // --- CALENDAR INTEGRATION: CREATE HOLIDAY ---
      await page.goto('/academic-structure/calendar');
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.getByLabel('Name').fill('E2E Holiday');
      await page.getByLabel('Start Date').fill('2026-08-19');
      await page.getByLabel('End Date').fill('2026-08-19');
      await page.getByLabel('Type').selectOption('HOLIDAY');
      // Instructional checkbox is automatically disabled for HOLIDAY
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Add Event' })).not.toBeVisible();

      // --- CALENDAR INTEGRATION: VERIFY SUBSTITUTION BLOCKED ---
      await page.goto('/scheduling/substitutions?date=2026-08-19');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();
      
      // Verify Non-instructional Banner
      await expect(page.locator('text=Non-instructional Day:')).toBeVisible();
      await expect(page.locator('text=E2E Holiday').first()).toBeVisible();

      // Verify "New Substitution" is hidden
      await expect(page.getByRole('button', { name: 'New Substitution' })).not.toBeVisible();

      // --- CALENDAR INTEGRATION: ARCHIVE HOLIDAY ---
      await page.goto('/academic-structure/calendar');
      const eventRow = page.locator('tr').filter({ hasText: 'E2E Holiday' }).first();
      page.once('dialog', d => d.accept());
      await eventRow.getByRole('button', { name: 'Archive' }).click();
        await expect(eventRow).toBeHidden({ timeout: 15000 });
      // ─── 1. CREATE a substitution for Wednesday ───
      await page.goto('/scheduling/substitutions?date=2026-08-19');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      await page.getByRole('button', { name: 'New Substitution' }).click();
      // 2026-08-19 is a Wednesday
      await page.locator('input[name="substitution_date"]').fill('2026-08-19');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.locator('select[name="substitute_room_id"]').selectOption('aaaaaaaa-5555-5555-5555-555555555555');
      await page.fill('input[name="reason"]', 'E2E Testing Sick Leave');
      await page.getByRole('button', { name: 'Save', exact: true }).click();

      // Verify: drawer closes (success)
      await expect(page.locator('text=Create Substitution')).not.toBeVisible();

      // ─── 2. CREATE a second substitution for Friday ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-21'); // Friday
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 10 Section A - Mathematics (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Branch Admin' });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.locator('text=Create Substitution')).not.toBeVisible();

      // ─── 3. NEGATIVE: Wrong weekday ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2026-08-18'); // Tuesday ≠ Wednesday
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.locator('.text-red-600')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // ─── 4. NEGATIVE: Outside academic year ───
      await page.getByRole('button', { name: 'New Substitution' }).click();
      await page.locator('input[name="substitution_date"]').fill('2099-01-01');
      await page.locator('select[name="timetable_entry_id"]').selectOption({ label: 'Class 11 Section B - Science (Period 1)' });
      await page.locator('select[name="substitute_staff_id"]').selectOption({ label: 'Teacher A' });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
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
      
      await expect(cancelBtn).not.toBeVisible();
      await page.reload();

      // Verify: no substitution entries on 2026-08-19
      await expect(page.locator('.bg-orange-50')).toHaveCount(0);
      
      // Wait for server action navigation to settle before manual goto
      await page.waitForLoadState("networkidle");

      // ─── FIXTURE CLEANUP: archive prerequisite timetable entries ───
      // Cancel remaining Friday substitution first (if still active)
      await page.goto('/scheduling/substitutions?date=2026-08-21');
      let attempts = 0;
      while (attempts < 5) {
        const remainingSubs = page.locator('.bg-orange-50');
        const count = await remainingSubs.count();
        if (count === 0) break;
        
        await remainingSubs.first().click();
        const cancelRemaining = page.getByRole('button', { name: 'Cancel Substitution' });
        await expect(cancelRemaining).toBeVisible();
        await cancelRemaining.click();
        
        await expect(cancelRemaining).not.toBeVisible();
        await page.reload();
        const newCount = await page.locator('.bg-orange-50').count();
        expect(newCount).toBeLessThan(count);
        attempts++;
      }

      // Archive timetable entries on our owned days (3, 5)
      await page.goto('/scheduling/timetable');
      for (const day of ['3', '5']) {
        let archAttempts = 0;
        while (archAttempts < 5) {
          const entryLocator = page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`);
          const count = await entryLocator.count();
          if (count === 0) break;
          
          await entryLocator.first().click();
          page.once('dialog', d => d.accept());
          
          const archiveBtn = page.getByRole('button', { name: 'Archive Entry' });
          await archiveBtn.click();
          
          await expect(archiveBtn).not.toBeVisible();
          await page.reload();
          
          const newCount = await page.locator(`[data-testid="timetable-entry"][data-day="${day}"]`).count();
          expect(newCount).toBeLessThan(count);
          archAttempts++;
        }
      }

      // Verify cleanup: 0 entries on our owned days
      await expect(page.locator('[data-testid="timetable-entry"][data-day="3"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="timetable-entry"][data-day="5"]')).toHaveCount(0);
    });
  });

  test.describe('Teacher Roles', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-teacher',
        'EXPECTED_ROLE_SCOPE');
    });

    test('should view substitutions but cannot create', async ({ page }) => {
      await page.goto('/scheduling/substitutions?date=2026-08-19');
      await expect(page.getByRole('heading', { name: 'Substitutions' })).toBeVisible();

      const createBtn = page.getByRole('button', { name: 'New Substitution' });
      await expect(createBtn).not.toBeVisible();
    });
  });
});
