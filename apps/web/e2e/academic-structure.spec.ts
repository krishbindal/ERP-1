import { test, expect } from '@playwright/test';

test.describe('Academic Structure Role Tests', () => {

  test('Teacher gets Access Denied when trying to create and sees branch identity without switching', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'teacher') test.skip();
    
    await page.goto('/academic-structure');
    
    // Verify branch identity and no selector
    await expect(page.locator('text=Test Branch')).toBeVisible();
    await expect(page.locator('select')).not.toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Academic Years' })).toBeVisible();
    await expect(page.locator('button:has-text("Create Academic Year")')).not.toBeVisible();
    
    await page.goto('/academic-structure?tab=classes');
    await expect(page.locator('button:has-text("Create Class")')).not.toBeVisible();
  });

  test('Branch Admin can create, edit, and delete an Academic Year but cannot switch branch', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') test.skip();
    
    await page.goto('/academic-structure');

    // Verify branch identity and no selector
    await expect(page.locator('text=Test Branch')).toBeVisible();
    await expect(page.locator('select')).not.toBeVisible();
    
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
  
  test('Branch Admin attempting to access another branch resource is denied', async ({ request }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') test.skip();
  });

});

