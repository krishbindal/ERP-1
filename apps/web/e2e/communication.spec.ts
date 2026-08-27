import { test, expect } from '@playwright/test';

test.describe('Communication End-to-End Workflows', () => {
  test('Branch Admin can create an announcement and view it in Sent', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
    
    await page.goto('/communication');
    const newBtn = page.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    const subject = 'Test Branch Announcement ' + Date.now();
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'This is an end-to-end test announcement body.');
    await page.selectOption('select[name="target_type"]', 'BRANCH');

    await expect(page.locator('select[name="target_id"]')).not.toBeVisible();
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/communication(?:\?.*)?$/);
    await expect(page.locator('text=' + subject).first()).toBeVisible();
  });

  test('Teacher can create class announcement and branch-wide targeting is denied', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');

    await page.goto('/communication');
    const newBtn = page.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    const targetTypeSelect = page.locator('select[name="target_type"]');
    await expect(targetTypeSelect.locator('option[value="BRANCH"]')).not.toBeAttached();
    await expect(targetTypeSelect.locator('option[value="CLASS"]')).toBeAttached();

    await targetTypeSelect.selectOption('CLASS');
    
    const targetIdSelect = page.locator('select[name="target_id"]');
    await expect(targetIdSelect).toBeVisible();
    await expect(targetIdSelect.locator('option').nth(1)).toBeAttached();

    const classId = await targetIdSelect.locator('option').nth(1).getAttribute('value');
    await targetIdSelect.selectOption(classId || '');

    const subject = 'Test Class Announcement ' + Date.now();
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'Teacher class announcement.');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/communication(?:\?.*)?$/);
    await expect(page.locator('text=' + subject).first()).toBeVisible();
  });

  test('Recipient can view message in inbox', async ({ page, browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');

    await page.goto('/communication');
    const newBtn = page.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    await expect(page).toHaveURL(/.*\/communication\/new/);

    const targetTypeSelect = page.locator('select[name="target_type"]');
    await targetTypeSelect.selectOption('CLASS');
    
    const targetIdSelect = page.locator('select[name="target_id"]');
    await expect(targetIdSelect).toBeVisible();

    const classId = await targetIdSelect.locator('option').nth(1).getAttribute('value');
    await targetIdSelect.selectOption(classId || '');

    const subject = 'Test Inbox Message ' + Date.now();
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="content"]', 'Please check your inbox.');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/communication(?:\?.*)?$/);
    await expect(page.locator('text=' + subject).first()).toBeVisible();

    // Give the worker time to process the event
    await page.waitForTimeout(4000);

    const guardianContext = await browser.newContext();
    const guardianPage = await guardianContext.newPage();
    
    await guardianPage.goto('/login');
    await guardianPage.fill('input[type="email"]', 'guardian.e2e@test.com');
    await guardianPage.fill('input[type="password"]', 'password123');
    await guardianPage.click('button[type="submit"]');

    // Wait until URL changes away from login
    await guardianPage.waitForURL(url => !url.href.includes('/login'));

    await guardianPage.goto('/communication/inbox');
    
    const messageLocator = guardianPage.locator('text=' + subject).first();
    await expect(messageLocator).toBeVisible();
    
    await messageLocator.click();

    await expect(guardianPage.locator('text=Please check your inbox.')).toBeVisible();

    await guardianPage.reload();
    await expect(guardianPage.locator('text=' + subject).first()).toBeVisible();

    await guardianContext.close();
  });
});
