import { test, expect } from '@playwright/test';

test.describe('Academic Structure Role Tests', () => {

  test('Teacher gets Access Denied when trying to create and sees branch identity without switching', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'teacher') test.skip();
    
    await page.goto('/academic-structure');
    
    // Verify branch identity and no selector
    await expect(page.locator('text=Test Branch')).toBeVisible();
    await expect(page.locator('select')).not.toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Academic Years' })).toBeVisible();
    await expect(page.locator('button:has-text("Create Academic Year")')).not.toBeVisible();
    
    await page.goto('/academic-structure?tab=classes');
    await expect(page.locator('button:has-text("Create Class")')).not.toBeVisible();
  });

  test('Branch Admin can create, edit, and delete an Academic Year but cannot switch branch', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') test.skip();
    
    await page.goto('/academic-structure');

    // Verify branch identity and no selector
    await expect(page.locator('text=Test Branch')).toBeVisible();
    await expect(page.locator('select')).not.toBeVisible();
    
    // Create
    await page.click('button:has-text("Create Academic Year")');
    await expect(page.locator('text=New Academic Year')).toBeVisible();
    
    const uniqueYear = `2026-2027-${Date.now()}`;
    await page.fill('input[name="name"]', uniqueYear);
    await page.fill('input[name="start_date"]', '2026-06-01');
    await page.fill('input[name="end_date"]', '2027-05-31');
    await page.click('button:has-text("Save")');
    
    // Verify it appears
    await expect(page.locator(`text=${uniqueYear}`)).toBeVisible();

    // Edit
    const row = page.locator('tr', { hasText: uniqueYear });
    await row.locator('button:has-text("Edit")').click();
    await page.fill('input[name="start_date"]', '2026-06-02');
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=2026-06-02`)).toBeVisible();
    
    // Delete
    page.on('dialog', dialog => dialog.accept());
    await row.locator('button:has-text("Delete")').click();
    
    await expect(page.locator(`text=${uniqueYear}`)).not.toBeVisible();
  });
  
  test('Branch Admin attempting to access another branch resource is denied', async ({ page, request }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') test.skip();

    await page.goto('/academic-structure');

    // Get auth token from cookies
    const cookies = await page.context().cookies();
    const tokenCookies = cookies.filter(c => c.name.includes('-auth-token'));
    tokenCookies.sort((a, b) => a.name.localeCompare(b.name));
    const fullCookieValue = tokenCookies.map(c => decodeURIComponent(c.value)).join('');
    
    let accessToken;
    try {
      const parsed = JSON.parse(fullCookieValue);
      accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token;
    } catch (e) {
      console.warn("Failed to parse auth cookie", e);
    }

    expect(accessToken).toBeTruthy();

    // Use default local supabase URL if env not set in test
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Usually provided by Playwright env

    // Attempt to insert into Second Test Branch (eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03)
    const response = await request.post(`${supabaseUrl}/rest/v1/academic_years`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', // Unowned branch
        name: 'Malicious Cross-Branch Year',
        start_date: '2026-01-01',
        end_date: '2026-12-31'
      }
    });

    if (response.ok()) {
      // RLS might silently drop the insert and return empty representation
      const data = await response.json();
      expect(data).toHaveLength(0);
    } else {
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });

});

