const { test, expect, chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(`
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Homework Management</h1>
      <div>Teacher Dashboard</div>
    </div>
  `);

  try {
    await expect(page.locator('h1').filter({ hasText: 'Homework' }).first()).toBeVisible({ timeout: 1000 });
    console.log('SUCCESS');
  } catch (e) {
    console.error('FAILED:', e.message);
  }

  await browser.close();
})();
