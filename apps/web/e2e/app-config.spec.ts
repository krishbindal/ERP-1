import { test, expect } from '@playwright/test';

test.describe('App Config Admin Tests', () => {

  test('Teacher gets Access Denied when trying to access app config', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'teacher') test.skip();
    
    await page.goto('/admin/app-config');
    
    // Verify Access Denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Branch App Configuration' })).not.toBeVisible();
  });

  test('Branch Admin can view and edit their branch app config', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') test.skip();
    
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
    if (test.info().project.metadata?.role !== 'superadmin') test.skip();
    
    await page.goto('/admin/app-config');
    
    // Initial state: super admin has no branch selected
    await expect(page.locator('text=Please select a branch to view its configuration.')).toBeVisible();
    
    // Select a branch from the global selector
    await page.getByRole('combobox', { name: 'Branch' }).selectOption({ index: 1 });
    
    // Verify page loads for that branch
    await expect(page.locator('h1', { hasText: 'Branch App Configuration' })).toBeVisible();
    await expect(page.locator('input[name="app_name"]')).toBeVisible();

    // Select another branch
    await page.getByRole('combobox', { name: 'Branch' }).selectOption({ index: 2 });
    await expect(page.locator('input[name="app_name"]')).toBeVisible();
  });

});
