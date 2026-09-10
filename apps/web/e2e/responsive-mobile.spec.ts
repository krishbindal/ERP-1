import { test, expect } from '@playwright/test';

test.describe('Responsive Mobile Behavior & Navigation Drawer', () => {

  test('375px viewport: Mobile navigation drawer opens, closes, and links work', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Set mobile viewport to 375x667 (iPhone SE standard)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Desktop sidebar should not be visible
    const desktopSidebar = page.locator('aside');
    if (await desktopSidebar.count() > 0) {
      await expect(desktopSidebar).not.toBeVisible();
    }

    // Mobile hamburger menu button should be visible
    const hamburgerBtn = page.locator('button[aria-label="Open navigation menu"]');
    await expect(hamburgerBtn).toBeVisible();

    // Open navigation drawer
    await hamburgerBtn.click();

    // Drawer modal should be visible
    const drawer = page.locator('[role="dialog"]').filter({ hasText: 'SchoolOS' });
    await expect(drawer).toBeVisible();

    // Navigation links should exist in drawer
    const studentsLink = drawer.locator('a:has-text("Students")');
    await expect(studentsLink).toBeVisible();

    // Clicking link in drawer closes drawer and navigates
    await studentsLink.click();
    await page.waitForURL('**/students');
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
    await expect(drawer).not.toBeVisible();

    // Test closing via Close button
    await hamburgerBtn.click();
    await expect(drawer).toBeVisible();
    const closeBtn = drawer.getByRole('button', { name: /close/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();

    // Test closing via Escape key
    await hamburgerBtn.click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('390px viewport: Mobile tables scroll horizontally without viewport clipping', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Set mobile viewport to 390x844 (iPhone 12/13/14 standard)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/students?session=aaaaaaaa-1111-1111-1111-111111111111');
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();

    // Verify page does not suffer horizontal body blowout
    const isBodyClipped = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(isBodyClipped).toBe(false);

    // Verify table has horizontal scrolling container
    const tableContainer = page.locator('div.overflow-x-auto').first();
    await expect(tableContainer).toBeVisible();

    // Navigate to academic structure classes tab
    await page.goto('/academic-structure?tab=classes&session=aaaaaaaa-1111-1111-1111-111111111111');
    await expect(page.locator('table')).toBeVisible();

    const isClassesBodyClipped = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(isClassesBodyClipped).toBe(false);
  });
});
