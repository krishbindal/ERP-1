import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const roles = [
  { name: 'superadmin', email: 'superadmin@test.com' },
  { name: 'branchadmin', email: 'admin.a@test.com' },
  { name: 'teacher', email: 'teacher.a1@test.com' },
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
    // Actually, dashboard has something? Let's just wait for 1000ms.
    await page.waitForTimeout(1000);

    await page.context().storageState({ path: authFile });
  });
}
