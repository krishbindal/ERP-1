import { test, expect } from '@playwright/test';

test.describe('Academic Structure Role Tests', () => {

  test('Teacher gets Access Denied when trying to create', async ({ page }) => {
    // This test should run in the 'teacher' project
    if (test.info().project.name !== 'teacher') test.skip();
    
    await page.goto('/academic-structure');
    
    await expect(page.locator('text=Academic Years')).toBeVisible();
    await expect(page.locator('button:has-text("Create Academic Year")')).not.toBeVisible();
    
    await page.goto('/academic-structure?tab=classes');
    await expect(page.locator('button:has-text("Create Class")')).not.toBeVisible();
  });

  test('Branch Admin can create, edit, and delete an Academic Year', async ({ page }) => {
    if (test.info().project.name !== 'branchadmin') test.skip();
    
    await page.goto('/academic-structure');
    
    // Create
    await page.click('button:has-text("Create Academic Year")');
    await expect(page.locator('text=New Academic Year')).toBeVisible();
    
    const uniqueYear = `2026-2027-${Date.now()}`;
    await page.fill('input[name="name"]', uniqueYear);
    await page.fill('input[name="start_date"]', '2026-06-01');
    await page.fill('input[name="end_date"]', '2027-05-31');
    await page.click('button:has-text("Save")');
    
    // Verify it appears
    await expect(page.locator(`text=${uniqueYear}`)).toBeVisible();

    // Edit
    const row = page.locator('tr', { hasText: uniqueYear });
    await row.locator('button:has-text("Edit")').click();
    await page.fill('input[name="start_date"]', '2026-06-02');
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=2026-06-02`)).toBeVisible();
    
    // Delete
    page.on('dialog', dialog => dialog.accept());
    await row.locator('button:has-text("Delete")').click();
    
    await expect(page.locator(`text=${uniqueYear}`)).not.toBeVisible();
  });
  
  test('Super Admin can switch branches', async ({ page }) => {
    if (test.info().project.name !== 'superadmin') test.skip();
    
    await page.goto('/academic-structure');
    
    // Check for branch selector
    const branchSelector = page.locator('select').first();
    await expect(branchSelector).toBeVisible();
  });

});
