import { test, expect } from '@playwright/test';

test.describe('Communication End-to-End Workflows', () => {

  test('Branch Admin can create an announcement and view it in Sent', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('branchadmin'), 'Only for Branch Admin');
    
    await page.goto('/communication');
    
    // Ensure "New Message" button exists
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toBeVisible();

    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    // Fill out the form
    const subject = `Test Announcement ${Date.now()}`;
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'This is an end-to-end test announcement body.');
    await page.selectOption('select[name="target_type"]', 'BRANCH');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect back to /communication
    await expect(page).toHaveURL(/.*\/communication/);

    // Sent messages should now contain the announcement
    await expect(page.locator(`text=${subject}`)).toBeVisible();
  });

  test('Guardian cannot create messages, but can view Inbox', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('branchadmin') || testInfo.project.name.includes('teacher') || testInfo.project.name.includes('superadmin'), 'Not for teachers/admins');
    
    await page.goto('/communication');
    
    // Guardian should NOT see New Message button
    const newBtn = page.locator('text=New Message');
    await expect(newBtn).toHaveCount(0);
    
    // Guardian should see Inbox heading
    const inboxHeading = page.locator('h2', { hasText: 'Inbox' });
    await expect(inboxHeading).toBeVisible();
  });

});
