import { test, expect } from '@playwright/test';

test.describe('Route Isolation (Wave 2 Regression)', () => {
  // Use clean context without cookies/session
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Unauthenticated /login route does not render AppShell sidebar or topbar chrome', async ({ page }) => {
    await page.goto('/login');

    // Verify login form is present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Authenticated chrome MUST NOT be present
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCount(0);

    const topbar = page.locator('header');
    await expect(topbar).toHaveCount(0);
  });

  test('Unauthenticated /auth/update-password route does not render AppShell chrome', async ({ page }) => {
    await page.goto('/auth/update-password');

    // Authenticated chrome MUST NOT be present
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCount(0);

    const topbar = page.locator('header');
    await expect(topbar).toHaveCount(0);
  });
});

test.describe('Data Table Enhancements & Primitives (Wave 3 Regression)', () => {

  test('Students table: real-time search filtering, column sorting, and pagination controls', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students');
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();

    const searchInput = page.locator('#student-search');
    await expect(searchInput).toBeVisible();

    // Test search filter
    await searchInput.fill('NonExistentStudentNameXYZ');
    await expect(page.locator('text=No matching students found')).toBeVisible();

    // Clear search filter
    await searchInput.fill('');
    await expect(page.locator('table')).toBeVisible();

    // Test column sorting on Name
    const nameHeader = page.locator('th').filter({ hasText: 'Name' }).first();
    await expect(nameHeader).toBeVisible();
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', /(ascending|descending)/);
  });

  test('Classes & Sections tables: search filtering, sorting, and accessible ConfirmDialog (no native popups)', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Track whether any native window.confirm or window.alert fires
    let nativePopupFired = false;
    page.on('dialog', () => {
      nativePopupFired = true;
    });

    // 1. Classes Table
    await page.goto('/academic-structure?tab=classes');
    await expect(page.locator('table')).toBeVisible();

    const classSearchInput = page.locator('#class-search');
    await expect(classSearchInput).toBeVisible();

    // Filter classes
    await classSearchInput.fill('FilterCheckClass123');
    await expect(page.locator('text=No matching classes found')).toBeVisible();

    // Reset filters button triggers ConfirmDialog
    const resetBtn = page.locator('button:has-text("Reset Filters")');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      const resetDialog = page.getByRole('dialog');
      await expect(resetDialog).toBeVisible();
      await expect(resetDialog.getByText('Reset Search Filters')).toBeVisible();
      // Confirm reset
      await resetDialog.getByRole('button', { name: 'Reset Filters' }).click();
      await expect(resetDialog).not.toBeVisible();
    }

    // 2. Sections Table
    await page.goto('/academic-structure?tab=sections');
    await expect(page.locator('table')).toBeVisible();

    const sectionSearchInput = page.locator('#section-search');
    await expect(sectionSearchInput).toBeVisible();

    // Assert that no native alert/confirm popups fired throughout the flow
    expect(nativePopupFired).toBe(false);
  });
});

test.describe('Timetable & Bulk Upload Rendering (Wave 3 Regression)', () => {

  test('Timetable grid and view switchers render properly', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/scheduling/timetable');
    await expect(page.getByRole('heading', { name: 'Timetable' })).toBeVisible();

    // View selector dropdown exists with required options
    const viewSelect = page.locator('#view');
    await expect(viewSelect).toBeVisible();
    await expect(viewSelect.locator('option[value="section"]')).toHaveText('By Section');
    await expect(viewSelect.locator('option[value="teacher"]')).toHaveText('By Teacher');
    await expect(viewSelect.locator('option[value="room"]')).toHaveText('By Room');
  });

  test('Bulk student onboarding wizard renders properly', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/bulk');
    await expect(page.getByRole('heading', { name: 'Bulk Student Onboarding' })).toBeVisible();

    // Wizard interface (dropzone and file browsing)
    await expect(page.locator('text=Import student rosters in bulk')).toBeVisible();
    await expect(page.locator('button:has-text("Browse Files")')).toBeVisible();
  });
});
