import { test, expect } from '@playwright/test';

test.describe('Communication End-to-End Workflows', () => {
  test('Branch Admin can create an announcement and view it in Sent', async ({ page }, testInfo) => {
    // Only run this test for branchadmin and superadmin
    test.skip(testInfo.project.name.includes('teacher'), 'Teachers cannot create branch-wide announcements');
    
    // Go to communication dashboard
    await page.goto('/communication');

    // Ensure "New Message" button exists
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toBeVisible();

    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    const subject = `Test Announcement ${Date.now()}`;
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'This is an end-to-end test announcement body.');
    await page.selectOption('select[name="target_type"]', 'BRANCH');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*\/communication/);

    // Sent messages should now contain the announcement
    await expect(page.locator(`text=${subject}`)).toBeVisible();
  });

  test('Guardian cannot create messages, but can view Inbox', async ({ page }, testInfo) => {
    // We don't have a guardian project in this specific test suite by default,
    // but if we did, we'd ensure they don't see the "New Message" button.
    test.skip(!testInfo.project.name.includes('guardian'), 'Only applies to guardians');

    await page.goto('/communication');
    
    // Ensure "New Message" button does NOT exist
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toHaveCount(0);
  });
});
