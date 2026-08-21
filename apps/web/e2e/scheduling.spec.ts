import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Scheduling Management', () => {
  // Use the admin auth state created by auth.setup.ts
  test.use({ storageState: 'playwright/.auth/branchadmin.json' });

  test('Branch Admin can manage rooms, bell schedules, and periods', async ({ page }) => {
    // 1. Branch Admin opens Scheduling.
    await page.goto('/scheduling');
    await expect(page.locator('h1')).toHaveText('Scheduling');
    
    // Check tabs
    await expect(page.locator('text=Rooms')).toBeVisible();
    await expect(page.locator('text=Bell Schedules')).toBeVisible();
    await expect(page.locator('text=Periods')).toBeVisible();

    // 2. Creates a room
    const uniqueRoomName = `Test Room ${randomUUID()}`;
    await page.click('text=Rooms');
    await page.click('button:has-text("Create Room")');
    await expect(page.locator('h2:has-text("New Room")')).toBeVisible();
    
    await page.fill('input[name="name"]', uniqueRoomName);
    await page.fill('input[name="capacity"]', '40');
    await page.selectOption('select[name="status"]', 'ACTIVE');
    await page.click('button:has-text("Save")');
    
    // Verify room is created
    await expect(page.locator(`td:has-text("${uniqueRoomName}")`)).toBeVisible();

    // 3. Edits the room
    await page.click(`tr:has(td:text-is("${uniqueRoomName}")) >> button:has-text("Edit")`);
    await expect(page.locator('h2:has-text("Edit Room")')).toBeVisible();
    await page.fill('input[name="capacity"]', '45');
    await page.click('button:has-text("Save")');
    await expect(page.locator(`tr:has(td:text-is("${uniqueRoomName}")) >> td:has-text("45")`)).toBeVisible();

    // 4. Archives the room
    await page.click(`tr:has(td:text-is("${uniqueRoomName}")) >> button:has-text("Edit")`);
    await page.selectOption('select[name="status"]', 'ARCHIVED');
    await page.click('button:has-text("Save")');
    await expect(page.locator(`tr:has(td:text-is("${uniqueRoomName}")) >> td:has-text("ARCHIVED")`)).toBeVisible();

    // 5. Creates a bell schedule
    const uniqueScheduleName = `Test Schedule ${randomUUID()}`;
    await page.click('text=Bell Schedules');
    await page.click('button:has-text("Create Bell Schedule")');
    await expect(page.locator('h2:has-text("New Bell Schedule")')).toBeVisible();
    
    await page.fill('input[name="name"]', uniqueScheduleName);
    await page.click('button:has-text("Save")');
    
    await expect(page.locator(`td:has-text("${uniqueScheduleName}")`)).toBeVisible();

    // 6. Creates periods
    await page.click('text=Periods');
    await page.click('button:has-text("Create Period")');
    await expect(page.locator('h2:has-text("New Period")')).toBeVisible();
    
    // Select the bell schedule we just created
    await page.selectOption('select[name="bell_schedule_id"]', { label: uniqueScheduleName });
    await page.fill('input[name="name"]', 'Period 1');
    await page.fill('input[name="start_time"]', '08:00');
    await page.fill('input[name="end_time"]', '08:50');
    await page.click('button:has-text("Save")');

    await expect(page.locator(`tr:has(td:text-is("Period 1")) >> td:has-text("${uniqueScheduleName}")`)).toBeVisible();

    // 7. Invalid period time is rejected
    await page.click('button:has-text("Create Period")');
    await page.selectOption('select[name="bell_schedule_id"]', { label: uniqueScheduleName });
    await page.fill('input[name="name"]', 'Invalid Period');
    // start time AFTER end time
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '09:00');
    await page.click('button:has-text("Save")');
    
    // Expect error message
    await expect(page.locator('text=Start time must be before end time.')).toBeVisible();
    await page.click('button:has-text("Cancel")');
  });
});

test.describe('Scheduling Security & Roles', () => {
  // Test Teacher read-only role
  test('Teacher cannot perform administrative mutations', async ({ page }) => {
    // Assuming teacher auth state
    test.use({ storageState: 'playwright/.auth/teacher.json' });
    
    await page.goto('/scheduling');
    await expect(page.locator('h1')).toHaveText('Scheduling');
    
    // Create buttons should not be visible
    await expect(page.locator('button:has-text("Create Room")')).not.toBeVisible();
    await page.click('text=Bell Schedules');
    await expect(page.locator('button:has-text("Create Bell Schedule")')).not.toBeVisible();
    await page.click('text=Periods');
    await expect(page.locator('button:has-text("Create Period")')).not.toBeVisible();
  });

  // Cross-branch manipulation is tested via server action direct calling in Playwright, 
  // or by navigating to another branch explicitly
  test('Cross-branch manipulation is rejected', async ({ page, request }) => {
    test.use({ storageState: 'playwright/.auth/branchadmin.json' });
    // This assumes explicitBranchId behavior prevents non-authorized access
    // By passing an explicit branch id that is not theirs
    const invalidBranchId = randomUUID();
    const res = await page.goto(`/scheduling?branchId=${invalidBranchId}`);
    
    await expect(page.locator('text=You are not authorized to view this branch.')).toBeVisible();
  });
});
