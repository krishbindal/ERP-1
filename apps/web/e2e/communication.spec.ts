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

  test('Recipient can view message in inbox', async ({ browser }, testInfo) => {
    // Only run this specifically in guardian project, as the sender context is isolated
    test.skip(testInfo.project.name !== 'chromium-guardian', 'EXPECTED_ROLE_SCOPE');
    
    // We need to login as Teacher first to send the message
    const teacherContext = await browser.newContext({ storageState: 'playwright/.auth/teacher.json' });
    const teacherPage = await teacherContext.newPage();
    
    await teacherPage.goto('/communication');
    const newBtn = teacherPage.getByRole('link', { name: 'New Message' });
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    
    const targetTypeSelect = teacherPage.locator('select[name="target_type"]');
    await targetTypeSelect.selectOption('CLASS');
    
    const targetIdSelect = teacherPage.locator('select[name="target_id"]');
    const classId = await targetIdSelect.locator('option').nth(1).getAttribute('value');
    await targetIdSelect.selectOption(classId || '');

    const subject = 'Test Inbox Message ' + Date.now();
    await teacherPage.fill('input[name="subject"]', subject);
    await teacherPage.fill('textarea[name="content"]', 'Please check your inbox.');

    await teacherPage.click('button[type="submit"]');
    await expect(teacherPage).toHaveURL(/.*\/communication(?:\?.*)?$/);
    await expect(teacherPage.locator('text=' + subject).first()).toBeVisible();
    await teacherContext.close();

    // Now guardian views the message
    const guardianContext = await browser.newContext({ storageState: 'playwright/.auth/guardian.json' });
    const guardianPage = await guardianContext.newPage();
    
    await guardianPage.goto('/communication/inbox');
    
    // Poll for message
    const messageLocator = guardianPage.locator('text=' + subject).first();
    await expect(messageLocator).toBeVisible({ timeout: 15000 });
    
    await messageLocator.click();
    await expect(guardianPage.locator('text=Please check your inbox.')).toBeVisible();

    await guardianPage.reload();
    await expect(guardianPage.locator('text=' + subject).first()).toBeVisible();
    await guardianContext.close();
    
    // Verify unrelated recipient cannot see it
    // Create a new context and login
    const unrelatedContext = await browser.newContext();
    const unrelatedPage = await unrelatedContext.newPage();
    await unrelatedPage.goto('/login');
    await unrelatedPage.fill('input[type="email"]', 'teacher.b1@test.com');
    await unrelatedPage.fill('input[type="password"]', 'password123');
    await unrelatedPage.click('button[type="submit"]');
    
    await unrelatedPage.waitForURL(url => !url.href.includes('/login'));
    await unrelatedPage.goto('/communication/inbox');
    
    await expect(unrelatedPage.locator('text=' + subject)).not.toBeVisible({ timeout: 5000 });
    await unrelatedContext.close();
  });
});
