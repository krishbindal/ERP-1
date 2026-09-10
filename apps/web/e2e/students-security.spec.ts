import { test, expect } from '@playwright/test';

/**
 * Students Security E2E Tests
 *
 * Proves:
 * 1. Branch admin can access /students for their own branch
 * 2. Teacher can access /students (read-only — no Add Student button)
 * 3. Students page enforces branch context authorization
 * 4. Students/new page enforces authorization and does not use hardcoded IDs
 * 5. Students/[id] page enforces authorization
 * 6. Cross-branch student access is rejected
 * 7. Invalid/missing branch context is rejected
 */
test.describe('Students Page Authorization', () => {

  test('Branch Admin can access /students for their own branch', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Check empty state
    await page.goto('/students');
    await expect(page.locator('text=Please select an Academic Session above to view enrolled students.')).toBeVisible();

    await page.goto('/students?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Page should render successfully — not show Access Denied
    await expect(page.locator('h1:has-text("Students")')).toBeVisible();

    // Branch admin should see the "Add Student" link
    await expect(page.locator('a:has-text("Add Student")')).toBeVisible();

    // The table should render (even if empty)
    await page.locator('select#academic-session').selectOption({ value: 'aaaaaaaa-1111-1111-1111-111111111111' });
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Student E2E')).toBeVisible();
  });

  test('Teacher can access /students in read-only mode', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'teacher') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Page should render successfully
    await expect(page.locator('h1:has-text("Students")')).toBeVisible();

    // Teacher should NOT see the "Add Student" link (read-only)
    await expect(page.locator('a:has-text("Add Student")')).not.toBeVisible();

    // The table should render
    await page.locator('select#academic-session').selectOption({ value: 'aaaaaaaa-1111-1111-1111-111111111111' });
    await expect(page.locator('table')).toBeVisible();
  });

  test('Students page rejects access with invalid branch context', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Access with a branch ID that the user does not belong to
    await page.goto('/students?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03&session=aaaaaaaa-1111-1111-1111-111111111111');

    // Should show Access Denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});

test.describe('Students/New Page Authorization', () => {

  test('Branch Admin can access /students/new for their branch', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/new?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Page should render the enrollment form
    await expect(page.getByRole('heading', { name: 'Enroll New Student' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
  });

  test('Teacher cannot access /students/new (read-only role)', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'teacher') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/new?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Should show insufficient permissions
    await expect(page.locator('text=Insufficient Permissions')).toBeVisible();
  });

  test('Students/new page does not contain hardcoded branch/org IDs', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/new?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Verify the page source does not contain the old hardcoded UUIDs
    const content = await page.content();
    expect(content).not.toContain('11111111-1111-1111-1111-111111111111');
    expect(content).not.toContain('33333333-3333-3333-3333-333333333333');
  });

  test('Students/new rejects cross-branch access', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Attempt to access with a foreign branch
    await page.goto('/students/new?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03&session=aaaaaaaa-1111-1111-1111-111111111111');

    // Should show Access Denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});

test.describe('Students Detail Page Authorization', () => {

  test('Student detail page enforces branch context', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Access a non-existent student ID within the authorized branch
    await page.goto('/students/00000000-0000-0000-0000-000000000099?session=aaaaaaaa-1111-1111-1111-111111111111');

    // Should show "Student not found" (auth passes, but student doesn't exist)
    await expect(page.locator('text=Student not found')).toBeVisible();
  });

  test('Student detail page rejects cross-branch access', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    // Attempt to access with a foreign branch
    await page.goto('/students/00000000-0000-0000-0000-000000000099?branchId=eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03&session=aaaaaaaa-1111-1111-1111-111111111111');

    // Should show Access Denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});
