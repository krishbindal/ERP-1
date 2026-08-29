import { expect } from '@playwright/test';
import { test as setup } from '@playwright/test';
import * as path from 'path';

const roles = [
  { name: 'superadmin', email: 'superadmin.e2e@test.com' },
  { name: 'branchadmin', email: 'admin.a.e2e@test.com' },
  { name: 'teacher', email: 'teacher.a1.e2e@test.com' },
  { name: 'teacher2', email: 'teacher.a2.e2e@test.com' },
  { name: 'teacher_limit', email: 'teacher.limit.e2e@test.com' },
  { name: 'guardian', email: 'guardian.e2e@test.com' },
];

for (const role of roles) {
  setup(`authenticate as ${role.name}`, async ({ page }) => {
    const authFile = path.join(__dirname, `../playwright/.auth/${role.name}.json`);
    
    await page.goto('/login');
    
    await page.getByLabel('Email').fill(role.email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    try {
      await page.waitForURL('/', { timeout: 10000 });
    } catch (e) {
      const errorMsg = page.locator('.text-red-500');
      if (await errorMsg.isVisible({ timeout: 2000 })) {
        console.log('Login error:', await errorMsg.textContent());
      }
      throw e;
    }
    
    // Check that we are logged in by seeing "Academic Structure" link or something similar,
    // Wait for dashboard to render so cookies are fully set
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.context().storageState({ path: authFile });
  });
}
