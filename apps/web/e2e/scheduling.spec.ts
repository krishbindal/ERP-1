import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Scheduling Management', () => {
  // Use the admin auth state created by auth.setup.ts
  test.use({ storageState: 'playwright/.auth/branchadmin.json' });

  test.beforeEach(async ({}, testInfo) => {
    // To avoid parallel DB collisions on shared seeds, restrict mutations strictly to ONE project.
    test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
  });

  test('Branch Admin can manage rooms, bell schedules, and periods', async ({ page }) => {
    // 1. Branch Admin opens Scheduling.
    await page.goto('/scheduling?session=aaaaaaaa-1111-1111-1111-111111111111');
    await expect(page.getByRole('heading', { name: 'Scheduling' })).toBeVisible();
    
    // Check tabs
    await expect(page.getByRole('link', { name: 'Rooms' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bell Schedules' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Periods' })).toBeVisible();

    // 2. Creates a room
    const uniqueRoomName = `Test Room ${randomUUID()}`;
    // Rooms is the default tab, no need to click the link
    await page.getByRole('button', { name: 'Create Room' }).click();
    await expect(page.getByRole('heading', { name: 'New Room' })).toBeVisible();
    
    await page.fill('input[name="name"]', uniqueRoomName);
    await page.fill('input[name="capacity"]', '40');
    await page.selectOption('select[name="status"]', 'ACTIVE');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify room is created
    await expect(page.getByRole('cell', { name: uniqueRoomName, exact: true })).toBeVisible();

    // 3. Edits the room
    await page.getByRole('row', { name: new RegExp(uniqueRoomName) }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Room' })).toBeVisible();
    await page.fill('input[name="capacity"]', '45');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('row', { name: new RegExp(uniqueRoomName) }).getByRole('cell', { name: '45', exact: true })).toBeVisible();

    // 4. Archives the room
    await page.getByRole('row', { name: new RegExp(uniqueRoomName) }).getByRole('button', { name: 'Edit' }).click();
    await page.selectOption('select[name="status"]', 'ARCHIVED');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('row', { name: new RegExp(uniqueRoomName) }).getByRole('cell', { name: 'ARCHIVED', exact: true })).toBeVisible();

    // 5. Creates a bell schedule
    const uniqueScheduleName = `Test Schedule ${randomUUID()}`;
    await page.getByRole('link', { name: 'Bell Schedules' }).click();
    await page.waitForLoadState("networkidle"); // Wait for Next.js server navigation to complete
    await page.getByRole('button', { name: 'Create Bell Schedule' }).click();
    await expect(page.getByRole('heading', { name: 'New Bell Schedule' })).toBeVisible();
    
    await page.fill('input[name="name"]', uniqueScheduleName);
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByRole('cell', { name: uniqueScheduleName, exact: true })).toBeVisible();

    // 6. Creates periods
    await page.getByRole('link', { name: 'Periods' }).click();
    await page.waitForLoadState("networkidle"); // Wait for Next.js server navigation to complete
    await page.getByRole('button', { name: 'Create Period' }).click();
    await expect(page.getByRole('heading', { name: 'New Period' })).toBeVisible();
    
    // Select the bell schedule we just created
    await page.selectOption('select[name="bell_schedule_id"]', { label: uniqueScheduleName });
    await page.fill('input[name="name"]', 'Period 1');
    await page.fill('input[name="start_time"]', '08:00');
    await page.fill('input[name="end_time"]', '08:50');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('row', { name: /Period 1/ }).getByRole('cell', { name: uniqueScheduleName, exact: true })).toBeVisible();

    // 7. Invalid period time is rejected
    await page.getByRole('button', { name: 'Create Period' }).click();
    await page.selectOption('select[name="bell_schedule_id"]', { label: uniqueScheduleName });
    await page.fill('input[name="name"]', 'Invalid Period');
    // start time AFTER end time
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '09:00');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Expect error message
    await expect(page.getByText('Start time must be before end time.')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('Scheduling Security - Teacher Role', () => {
  test.use({ storageState: 'playwright/.auth/teacher.json' });

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');
  });

  test('Teacher cannot perform administrative mutations', async ({ page }) => {
    await page.goto('/scheduling?session=aaaaaaaa-1111-1111-1111-111111111111');
    await expect(page.getByRole('heading', { name: 'Scheduling' })).toBeVisible();
    
    // Create buttons should not be visible
    await expect(page.getByRole('button', { name: 'Create Room' })).not.toBeVisible();
    await page.getByRole('link', { name: 'Bell Schedules' }).click();
    await expect(page.getByRole('button', { name: 'Create Bell Schedule' })).not.toBeVisible();
    await page.getByRole('link', { name: 'Periods' }).click();
    await expect(page.getByRole('button', { name: 'Create Period' })).not.toBeVisible();
  });
});

test.describe('Scheduling Security - Cross Branch', () => {
  test.use({ storageState: 'playwright/.auth/branchadmin.json' });

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-branchadmin', 'EXPECTED_ROLE_SCOPE');
  });

  test('Cross-branch manipulation is rejected', async ({ page }) => {
    // This assumes explicitBranchId behavior prevents non-authorized access
    // By passing an explicit branch id that is not theirs
    const invalidBranchId = randomUUID();
    await page.goto(`/scheduling?branchId=${invalidBranchId}`);
    
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});
