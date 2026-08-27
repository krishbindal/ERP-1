import { test, expect } from '@playwright/test';

test.describe('Communication End-to-End Workflows', () => {
  test('Branch Admin can create an announcement and view it in Sent', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
    
    // Go to communication dashboard
    await page.goto('/communication');

    // Ensure "New Message" button exists
    const newBtn = page.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();

    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    const subject = `Test Branch Announcement ${Date.now()}`;
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'This is an end-to-end test announcement body.');
    await page.selectOption('select[name="target_type"]', 'BRANCH');

    // Ensure target_id is NOT visible since it's BRANCH
    await expect(page.locator('select[name="target_id"]')).not.toBeVisible();

    // Submit
    await page.click('button[type="submit"]');

    // Wait for Next.js Server Action to settle before navigation
    await page.waitForTimeout(1000);

    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*\/communication(?:\?.*)?$/);

    // Sent messages should now contain the announcement
    await expect(page.locator(`text=${subject}`).first()).toBeVisible();
  });

  test('Teacher can create class announcement and branch-wide targeting is denied', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');

    await page.goto('/communication');
    
    const newBtn = page.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();

    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    // Ensure BRANCH option is not available for teachers (it shouldn't be in the DOM)
    const targetTypeSelect = page.locator('select[name="target_type"]');
    await expect(targetTypeSelect.locator('option[value="BRANCH"]')).not.toBeAttached();
    await expect(targetTypeSelect.locator('option[value="CLASS"]')).toBeAttached();

    // Select CLASS
    await targetTypeSelect.selectOption('CLASS');
    
    // Target ID select should appear
    const targetIdSelect = page.locator('select[name="target_id"]');
    await expect(targetIdSelect).toBeVisible();

    // The select should have at least one option besides the placeholder
    await expect(targetIdSelect.locator('option').nth(1)).toBeAttached();

    // Select the first available authorized class
    const classId = await targetIdSelect.locator('option').nth(1).getAttribute('value');
    await targetIdSelect.selectOption(classId || '');

    const subject = `Test Class Announcement ${Date.now()}`;
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'Teacher class announcement.');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for Next.js Server Action to settle before navigation
    await page.waitForTimeout(1000);

    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*\/communication(?:\?.*)?$/);

    // Sent messages should now contain the announcement
    await expect(page.locator(`text=${subject}`).first()).toBeVisible();
  });

  test('Recipient can view message in inbox', async () => {
    // Implement recipient inbox test if we had a guardian or student project
    // Skipping for now as we don't have a direct recipient project setup yet
    test.skip(true, 'EXPECTED_ROLE_SCOPE');
  });
});
