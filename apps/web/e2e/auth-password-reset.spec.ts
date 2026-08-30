import { test, expect } from '@playwright/test';

test.describe('Temporary Credentials Enforcement', () => {
  // Use a clean context for authentication tests to avoid state bleed
  test.use({ storageState: { cookies: [], origins: [] } });

  test('User with force_password_reset=true is redirected and can reset', async ({ page }) => {
    // 1. Authenticate with the reset user
    await page.goto('/login');
    await page.getByLabel('Email').fill('reset.user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 2. User should be redirected to /auth/update-password
    await page.waitForURL('**/auth/update-password');
    await expect(page.getByRole('heading', { name: 'Update Password' })).toBeVisible();

    // 3. User cannot access a normal protected page (direct navigation blocked)
    await page.goto('/communication');
    await page.waitForURL('**/auth/update-password');

    // 4. Invalid password submission does not clear flag
    await page.getByLabel('New Password').fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
    
    // Check mismatch
    await page.getByLabel('New Password').fill('newpassword');
    await page.getByLabel('Confirm Password').fill('newpassword2');
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();

    // 5. Successful password update clears the flag
    await page.getByLabel('New Password').fill('newpassword123');
    await page.getByLabel('Confirm Password').fill('newpassword123');
    await page.getByRole('button', { name: 'Update Password' }).click();

    // 6. User is redirected to home and can access normal application
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });

    // Verify they can now access protected routes
    await page.goto('/communication');
    await expect(page.getByRole('heading', { name: 'Communication' })).toBeVisible();

    // 7. Verify logout works and new password works
    await page.goto('/auth/logout');
    await page.waitForURL('**/login');
    
    await page.getByLabel('Email').fill('reset.user@test.com');
    await page.getByLabel('Password').fill('newpassword123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should NOT be redirected to update password again
    await page.waitForURL('**/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('Normal user without force_password_reset can login normally', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('teacher.a1.e2e@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Should NOT be redirected to update password
    expect(page.url()).not.toContain('update-password');
  });
});
