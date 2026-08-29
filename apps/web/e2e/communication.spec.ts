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
    // ISOLATION: Use dedicated teacher2 for this test to avoid rate limit overlap
    const teacherContext = await browser.newContext({ storageState: 'playwright/.auth/teacher2.json' });
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

    // Invoke the worker manually in E2E since there is no cron trigger
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      await teacherPage.request.post(`${supabaseUrl}/functions/v1/communication-worker`, {
        headers: { 'Authorization': `Bearer ${serviceKey}` }
      });
    }

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

  test('Teacher rate limit enforces exactly 5 messages per day', async ({ browser }, testInfo) => {
    // Only run this once to prevent massive time usage and avoid multiple OS retries overlapping
    // We isolate this to a dedicated teacher_limit user
    test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');

    const limitContext = await browser.newContext({ storageState: 'playwright/.auth/teacher_limit.json' });
    const limitPage = await limitContext.newPage();

    for (let i = 1; i <= 6; i++) {
      await limitPage.goto('/communication/new');
      
      const targetTypeSelect = limitPage.locator('select[name="target_type"]');
      await targetTypeSelect.selectOption('CLASS');
      
      const targetIdSelect = limitPage.locator('select[name="target_id"]');
      const classId = await targetIdSelect.locator('option').nth(1).getAttribute('value');
      await targetIdSelect.selectOption(classId || '');

      const subject = `Rate Limit Test Message ${i} - ${Date.now()}`;
      await limitPage.fill('input[name="subject"]', subject);
      await limitPage.fill('textarea[name="content"]', `Test message body ${i}`);

      await limitPage.click('button[type="submit"]');

      if (i <= 5) {
        // First 5 should succeed and redirect
        await expect(limitPage).toHaveURL(/.*\/communication(?:\?.*)?$/);
        await expect(limitPage.locator('text=' + subject).first()).toBeVisible();
      } else {
        // 6th message should fail and remain on the form with an error toast
        await expect(limitPage).toHaveURL(/.*\/communication\/new/);
        await expect(limitPage.locator('text=Rate limit exceeded')).toBeVisible();
      }
    }
    await limitContext.close();
  });
});
