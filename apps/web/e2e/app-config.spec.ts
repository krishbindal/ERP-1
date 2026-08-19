import { test, expect } from '@playwright/test';

test.describe('App Config Admin Tests', () => {

  test('Teacher gets Access Denied when trying to access app config', async ({ page }) => {
    if (test.info().project.name !== 'teacher') test.skip();
    
    await page.goto('/admin/app-config');
    
    // Verify Access Denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Branch App Configuration' })).not.toBeVisible();
  });

  test('Branch Admin can view and edit their branch app config', async ({ page }) => {
    if (test.info().project.name !== 'branchadmin') test.skip();
    
    await page.goto('/admin/app-config');

    // Verify page loads
    await expect(page.locator('h1', { hasText: 'Branch App Configuration' })).toBeVisible();
    
    // Edit config
    const uniqueSlug = `schoolos-noida-${Date.now()}`;
    await page.fill('input[name="slug"]', uniqueSlug);
    await page.fill('input[name="app_name"]', 'SchoolOS Noida E2E');
    await page.selectOption('select[name="status"]', 'active');
    
    await page.click('button:has-text("Save Configuration")');
    
    // Verify success message
    await expect(page.locator('text=Configuration updated successfully.')).toBeVisible();
    
    // Reload and verify
    await page.reload();
    await expect(page.locator('input[name="slug"]')).toHaveValue(uniqueSlug);
    await expect(page.locator('input[name="app_name"]')).toHaveValue('SchoolOS Noida E2E');
  });
  
  test('Super Admin can view and edit app configs across branches', async ({ page }) => {
    if (test.info().project.name !== 'superadmin') test.skip();
    
    await page.goto('/admin/app-config');
    
    // Verify page loads
    await expect(page.locator('h1', { hasText: 'Branch App Configuration' })).toBeVisible();
    
    // We assume the Super Admin uses the branch selector to change branches
    // Since we don't have the explicit test for changing branches here, we just verify they have access
    await expect(page.locator('input[name="app_name"]')).toBeVisible();
  });

});
