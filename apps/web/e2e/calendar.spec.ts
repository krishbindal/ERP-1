import { test, expect } from '@playwright/test';

/**
 * Calendar UI E2E Tests
 * 
 * Architecture:
 * - Role gating via test.info().project.metadata (matches repo pattern)
 * - NO feature-level storageState overrides
 * - Destructive mutations restricted to exact 'chromium-branchadmin' project
 * - Read-only assertions for teacher role
 * - Student auth does not exist in current infrastructure; not tested here
 * - Cleanup guaranteed via afterEach
 */

const TEST_EVENT_HOLIDAY = 'E2E_CAL_HOLIDAY';
const TEST_EVENT_EDITED = 'E2E_CAL_HOLIDAY_EDITED';
const TEST_EVENT_MAKEUP = 'E2E_CAL_MAKEUP';

test.describe('Calendar UI', () => {

  // ================================================================
  // READ-ONLY: Teacher
  // ================================================================
  test('Teacher cannot mutate calendar events or operating days', async ({ page }) => {
    const meta = test.info().project.metadata as { role?: string };
    if (meta?.role !== 'teacher') test.skip(true, 'Expected role-scope skip');

    await page.goto('/academic-structure/calendar');
    await expect(page.getByRole('heading', { name: 'Academic Structure' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operating Days' })).toBeVisible();

    // Operating Days checkboxes are disabled for read-only roles
    const mondayCheckbox = page.locator('input[name="operating-day-1"]');
    await expect(mondayCheckbox).toBeDisabled();

    // Mutation buttons are not visible
    await expect(page.getByRole('button', { name: 'Add Event' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeHidden();
  });

  // ================================================================
  // DESTRUCTIVE: Branch Admin mutations (chromium-branchadmin only)
  // ================================================================
  test.describe('Branch Admin Calendar Mutations', () => {

    // Gate to exact project to prevent mobile-chrome and other projects from running mutations
    test.beforeEach(({ }, testInfo) => {
      if (testInfo.project.name !== 'chromium-branchadmin') {
        test.skip(true, 'Destructive calendar mutations run only on chromium-branchadmin');
      }
    });

    // Guaranteed cleanup: archive any test-created events even if the test fails
    test.afterEach(async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'chromium-branchadmin') return;

      try {
        await page.goto('/academic-structure/calendar');
        page.on('dialog', dialog => dialog.accept());

        const testEventNames = [TEST_EVENT_HOLIDAY, TEST_EVENT_EDITED, TEST_EVENT_MAKEUP];
        for (const eventName of testEventNames) {
          const row = page.locator('tr', { hasText: eventName }).first();
          if (await row.isVisible({ timeout: 2000 }).catch(() => false)) {
            const archiveBtn = row.getByRole('button', { name: 'Archive' });
            if (await archiveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await archiveBtn.click();
              // Wait for the row to disappear after archive
              await expect(row).toBeHidden({ timeout: 5000 }).catch(() => {});
            }
          }
        }
      } catch {
        // Best-effort cleanup; do not fail the test on cleanup errors
      }
    });

    test('Branch Admin can manage operating days', async ({ page }) => {
      await page.goto('/academic-structure/calendar');
      await expect(page.getByRole('heading', { name: 'Operating Days' })).toBeVisible();

      // Record original state
      const originalChecked: number[] = [];
      for (let i = 1; i <= 7; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        if (await cb.isChecked()) {
          originalChecked.push(i);
        }
      }
      if (originalChecked.length === 0) return; // Safety: no operating days to test

      // Check all 7 days
      for (let i = 1; i <= 7; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        if (!(await cb.isChecked())) {
          await cb.check();
        }
      }
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText('Operating days updated successfully.')).toBeVisible();

      // Uncheck days 1-6, leaving only day 7
      for (let i = 1; i <= 6; i++) {
        await page.locator(`input[name="operating-day-${i}"]`).uncheck();
      }

      // Day 7 is the last remaining — must be disabled
      const day7 = page.locator('input[name="operating-day-7"]');
      await expect(day7).toBeChecked();
      await expect(day7).toBeDisabled();

      // Restore original days: check all originals first, then uncheck non-originals
      for (const d of originalChecked) {
        const cb = page.locator(`input[name="operating-day-${d}"]`);
        if (!(await cb.isChecked())) await cb.check();
      }
      for (let i = 1; i <= 7; i++) {
        if (!originalChecked.includes(i)) {
          const cb = page.locator(`input[name="operating-day-${i}"]`);
          if (await cb.isChecked()) await cb.uncheck();
        }
      }
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText('Operating days updated successfully.')).toBeVisible();
    });

    test('Branch Admin can create, edit, and archive calendar events', async ({ page }) => {
      await page.goto('/academic-structure/calendar');

      // --- Create HOLIDAY ---
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.getByLabel('Name').fill(TEST_EVENT_HOLIDAY);
      await page.getByLabel('Start Date').fill('2030-03-10');
      // Test invalid date validation
      await page.getByLabel('End Date').fill('2030-03-09');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Start date must be before or equal to end date.')).toBeVisible();

      // Fix the date
      await page.getByLabel('End Date').fill('2030-03-11');
      await page.getByLabel('Type').selectOption('HOLIDAY');

      // Instructional checkbox should be unchecked and disabled for HOLIDAY
      const instructionalCheckbox = page.getByLabel('Is Instructional Day');
      await expect(instructionalCheckbox).not.toBeChecked();
      await expect(instructionalCheckbox).toBeDisabled();

      await page.getByRole('button', { name: 'Save' }).click();

      // Verify event appears in table
      const holidayRow = page.locator('tr', { hasText: TEST_EVENT_HOLIDAY });
      await expect(holidayRow).toBeVisible();
      await expect(holidayRow.locator('td').nth(3)).toContainText('No');

      // --- Edit to OTHER with instructional=true ---
      await holidayRow.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Name').fill(TEST_EVENT_EDITED);
      await page.getByLabel('Type').selectOption('OTHER');
      // For OTHER type, instructional checkbox should be enabled
      await expect(page.getByLabel('Is Instructional Day')).toBeEnabled();
      await page.getByLabel('Is Instructional Day').check();
      await page.getByRole('button', { name: 'Save' }).click();

      const editedRow = page.locator('tr', { hasText: TEST_EVENT_EDITED });
      await expect(editedRow).toBeVisible();
      await expect(editedRow.locator('td').nth(3)).toContainText('Yes');

      // --- Archive the edited event ---
      page.on('dialog', dialog => dialog.accept());
      await editedRow.getByRole('button', { name: 'Archive' }).click();
      await expect(editedRow).toBeHidden();

      // --- Create MAKEUP_DAY ---
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.getByLabel('Name').fill(TEST_EVENT_MAKEUP);
      await page.getByLabel('Start Date').fill('2030-03-12');
      await page.getByLabel('End Date').fill('2030-03-12');
      await page.getByLabel('Type').selectOption('MAKEUP_DAY');

      // For MAKEUP_DAY, instructional should be checked and disabled
      await expect(page.getByLabel('Is Instructional Day')).toBeChecked();
      await expect(page.getByLabel('Is Instructional Day')).toBeDisabled();

      await page.getByRole('button', { name: 'Save' }).click();
      const makeupRow = page.locator('tr', { hasText: TEST_EVENT_MAKEUP });
      await expect(makeupRow).toBeVisible();
      await expect(makeupRow.locator('td').nth(3)).toContainText('Yes');
      // Cleanup happens in afterEach
    });
  });
});
