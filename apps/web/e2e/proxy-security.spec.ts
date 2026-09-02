import { test, expect } from '@playwright/test';

test.describe('Proxy / Middleware Runtime Security', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-teacher', 'Only need to run proxy tests once');
  });

  test('Unauthenticated user is redirected to /login', async ({ browser }) => {
    // Create an isolated context without any auth state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    await page.goto('/students');
    // Should be redirected by proxy.ts to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await context.close();
  });

  test('Normal authenticated user is not incorrectly redirected', async ({ page }) => {
    // Assuming this runs as 'chromium-teacher' or another valid authenticated role (via storageState)
    await page.goto('/students');
    // Should NOT redirect
    await expect(page).toHaveURL(/.*\/students/);
    await expect(page.locator('h1:has-text("Students")')).toBeVisible();
  });

  test('Logout remains usable', async ({ page }) => {
    // Navigate to a page
    await page.goto('/students');
    await expect(page.locator('h1:has-text("Students")')).toBeVisible();
    
    // Perform logout by navigating to the auth/logout route
    await page.goto('/auth/logout');
    
    // Verify redirect to login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify session is actually destroyed
    await page.goto('/students');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test.describe('Password Reset Flow', () => {
    test('User requiring password reset is redirected to /auth/update-password', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      
      page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
      
      // Login with the reset user
      await page.goto('/login');
      await page.getByLabel('Email').fill('reset.user@test.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Check if any error text appears on screen
      page.locator('.text-red-500').textContent().then(text => {
        if (text) console.log('UI ERROR:', text);
      }).catch(() => {});

      // Should be forced to update-password
      await expect(page).toHaveURL(/.*\/auth\/update-password/, { timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Update Password' })).toBeVisible();

      // Trying to navigate to a protected page directly should still redirect
      await page.goto('/students');
      await expect(page).toHaveURL(/.*\/auth\/update-password/);

      await context.close();
    });
  });

});
