import { test, expect } from '@playwright/test';

const TEST_EVENT_HOLIDAY = 'E2E_DETERMINISTIC_HOLIDAY';
const TEST_EVENT_EDITED = 'E2E_DETERMINISTIC_HOLIDAY_EDITED';
const TEST_EVENT_MAKEUP = 'E2E_DETERMINISTIC_MAKEUP';

const TEST_DATE_START = '2030-03-10';
const TEST_DATE_END = '2030-03-11';
const TEST_DATE_INVALID_END = '2030-03-09';

test.describe('Calendar UI Role Tests', () => {

  // Read-only tests can run on all browsers against default active year.
  test.describe('Read-Only Roles', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test('Teacher cannot mutate calendar events or operating days', async ({ page }) => {
      await page.goto('/academic-structure/calendar');
      await expect(page.getByRole('heading', { name: 'Academic Structure' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Operating Days' })).toBeVisible();

      // Verify Operating Days inputs are disabled
      const mondayCheckbox = page.locator('input[name="operating-day-1"]');
      await expect(mondayCheckbox).toBeDisabled();

      // Verify "Add Event" button is hidden
      await expect(page.getByRole('button', { name: 'Add Event' })).toBeHidden();

      // Verify "Edit" and "Archive" buttons are hidden inside the table
      await expect(page.getByRole('button', { name: 'Edit' })).toBeHidden();
      await expect(page.getByRole('button', { name: 'Archive' })).toBeHidden();
    });
  });

  test.describe('Read-Only Student', () => {
    test.use({ storageState: 'playwright/.auth/student.json' });
    
    test('Student cannot mutate calendar events', async ({ page }) => {
      await page.goto('/academic-structure/calendar');
      await expect(page.getByRole('button', { name: 'Add Event' })).toBeHidden();
    });
  });

  // Destructive CRUD runs ONLY on chromium to avoid parallel mutation of shared state
  test.describe('Destructive Role: Branch Admin', () => {
    // Only run this block on chromium
    test.skip(({ browserName }) => browserName !== 'chromium', 'Mutations should only run once on Chromium');
    
    test.use({ storageState: 'playwright/.auth/branchadmin.json' });

    let isolatedYearId: string;

    test.beforeAll(async ({ request }) => {
      // Create a deterministic isolated Academic Year to avoid mutating shared active year.
      // We will hit a generic supabase endpoint or an app route, but we don't have a direct route
      // for creating academic years from tests.
      // If we don't have an API route to easily create it from Playwright, we can just use
      // the existing active year and clean up perfectly. Let's do perfect cleanup instead of
      // creating an academic year via fragile manual requests.
    });

    // Instead of beforeAll setup which might be complex, we just use deterministic cleanup.
    // We will save original operating days and restore them.
    let originalOperatingDays: number[] = [];

    test('Branch Admin can mutate Operating Days and Calendar Events', async ({ page }) => {
      await page.goto('/academic-structure/calendar');
      
      // Save original operating days
      originalOperatingDays = [];
      for (let i = 1; i <= 7; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        if (await cb.isChecked()) {
          originalOperatingDays.push(i);
        }
      }
      
      // If no days were checked initially (should not happen but just in case), default to M-F
      if (originalOperatingDays.length === 0) originalOperatingDays = [1,2,3,4,5];

      // Ensure all days from 1 to 7 are checked so we test disabling the last one.
      for (let i = 1; i <= 7; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        if (!(await cb.isChecked())) {
          await cb.check();
        }
      }
      await page.getByRole('button', { name: 'Save Days' }).click();
      await expect(page.getByText('Successfully updated operating days.')).toBeVisible();

      // Now uncheck days 1 to 6.
      for (let i = 1; i <= 6; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        await cb.uncheck();
      }
      // Day 7 should now be the only one checked and must be disabled.
      const day7 = page.locator('input[name="operating-day-7"]');
      await expect(day7).toBeChecked();
      await expect(day7).toBeDisabled();

      // Restore original operating days
      for (let i = 1; i <= 7; i++) {
        const cb = page.locator(`input[name="operating-day-${i}"]`);
        const shouldBeChecked = originalOperatingDays.includes(i);
        if (shouldBeChecked && !(await cb.isChecked())) {
          await cb.check();
        } else if (!shouldBeChecked && (await cb.isChecked())) {
          // Can only uncheck if it's not the last one, but we are checking first, then unchecking.
          // Check all first to avoid the 'last day' constraint
        }
      }
      
      // Check all target days first
      for (const d of originalOperatingDays) {
        await page.locator(`input[name="operating-day-${d}"]`).check();
      }
      // Then uncheck the others
      for (let i = 1; i <= 7; i++) {
        if (!originalOperatingDays.includes(i)) {
          await page.locator(`input[name="operating-day-${i}"]`).uncheck();
        }
      }

      await page.getByRole('button', { name: 'Save Days' }).click();

      // --- EVENTS UX ---
      
      // 1. Create HOLIDAY
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.fill('input[name="name"]', TEST_EVENT_HOLIDAY);
      await page.fill('input[name="start_date"]', TEST_DATE_START);
      // Test invalid date order
      await page.fill('input[name="end_date"]', TEST_DATE_INVALID_END);
      await page.getByRole('button', { name: 'Save Event' }).click();
      await expect(page.getByText('Start date must be before or equal to end date.')).toBeVisible();
      
      // Fix date
      await page.fill('input[name="end_date"]', TEST_DATE_END);
      await page.selectOption('select[name="type"]', 'HOLIDAY');
      
      await expect(page.getByLabel('Is Instructional Day')).not.toBeChecked();
      await page.getByRole('button', { name: 'Save Event' }).click();
      
      // Verify event in table
      const holidayRow = page.locator('tr', { hasText: TEST_EVENT_HOLIDAY });
      await expect(holidayRow).toBeVisible();
      await expect(holidayRow.locator('td').nth(3)).toContainText('No'); 

      // 2. Edit to OTHER
      await holidayRow.getByRole('button', { name: 'Edit' }).click();
      await page.fill('input[name="name"]', TEST_EVENT_EDITED);
      await page.selectOption('select[name="type"]', 'OTHER');
      await page.getByLabel('Is Instructional Day').check(); 
      await page.getByRole('button', { name: 'Save Event' }).click();

      const editedRow = page.locator('tr', { hasText: TEST_EVENT_EDITED });
      await expect(editedRow).toBeVisible();
      await expect(editedRow.locator('td').nth(3)).toContainText('Yes'); 

      // 3. Create MAKEUP_DAY
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.fill('input[name="name"]', TEST_EVENT_MAKEUP);
      await page.fill('input[name="start_date"]', '2030-03-12');
      await page.fill('input[name="end_date"]', '2030-03-12');
      await page.selectOption('select[name="type"]', 'MAKEUP_DAY');
      await page.getByRole('button', { name: 'Save Event' }).click();
      const makeupRow = page.locator('tr', { hasText: TEST_EVENT_MAKEUP });
      await expect(makeupRow.locator('td').nth(3)).toContainText('Yes');

      // --- CLEANUP EVENTS ---
      page.on('dialog', dialog => dialog.accept());
      for (const name of [TEST_EVENT_EDITED, TEST_EVENT_MAKEUP]) {
        const row = page.locator('tr', { hasText: name }).first();
        if (await row.isVisible()) {
          await row.getByRole('button', { name: 'Archive' }).click();
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });
});
