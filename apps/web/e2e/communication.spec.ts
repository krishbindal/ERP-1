import { test, expect } from '@playwright/test';

test.describe('Communication End-to-End Workflows', () => {

  test('Branch Admin can view and create announcements', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('branchadmin'), 'Only for Branch Admin');
    
    await page.goto('/communication');
    
    const heading = page.locator('h1', { hasText: 'Communication Center' });
    await expect(heading).toBeVisible();

    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toBeVisible();

    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
  });

  test('Teacher section-scoped announcement form', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('teacher'), 'Only for Teacher');
    
    await page.goto('/communication');
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toBeVisible();
    
    await newBtn.click();
    await expect(page.locator('select[name="target_type"]')).toBeVisible();
  });

  test('Guardian linked-child visibility (Inbox)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('branchadmin') || testInfo.project.name.includes('teacher') || testInfo.project.name.includes('superadmin'), 'Not for teachers/admins');
    
    await page.goto('/communication');
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toHaveCount(0);
    
    const inboxHeading = page.locator('h2', { hasText: 'Inbox' });
    await expect(inboxHeading).toBeVisible();
  });

});
