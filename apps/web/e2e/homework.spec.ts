import { test, expect } from '@playwright/test';

test.describe('Homework E2E - Phase 5', () => {

  test.describe('Teacher Creation Flow', () => {
    test.beforeEach(async ({}, testInfo) => {
      // Only run creation flow as Teacher
      test.skip(testInfo.project.name !== 'chromium-teacher', 'EXPECTED_ROLE_SCOPE');
    });

    test('Teacher creates, saves draft, and publishes', async ({ page }, testInfo) => {
      const projectIndex = testInfo.project.name === 'chromium-teacher' ? 3 : 0;
      
      await page.goto('/homework?session=aaaaaaaa-1111-1111-1111-111111111111');
      // Wait for the heading to appear. Use a higher timeout because it might be a cold start.
      await expect(page.getByRole('heading', { name: /Homework/i }).first()).toBeVisible({ timeout: 15000 });

      await page.goto('/homework/new?session=aaaaaaaa-1111-1111-1111-111111111111');
      await expect(page.getByRole('heading', { name: /Create Homework Assignment/i }).first()).toBeVisible({ timeout: 15000 });

      const uniqueTitle = `E2E Homework ${Date.now()}-${projectIndex}`;
      await page.fill('input[name="title"]', uniqueTitle);
      await page.fill('textarea[name="description"]', 'Please solve the equations.');
      
      // Select the first valid section and subject
      const sectionSelect = page.locator('select[name="sectionId"]');
      await sectionSelect.selectOption({ value: 'aaaaaaaa-1111-1111-1111-111111111111' });

      const subjectSelect = page.locator('select[name="subjectId"]');
      await subjectSelect.selectOption({ value: 'aaaaaaaa-1111-1111-1111-111111111111' });

      // Dates
      const issueDate = new Date();
      issueDate.setMinutes(issueDate.getMinutes() - 5);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      // format datetime-local
      const toDateTimeLocal = (d: Date) => d.toISOString().slice(0, 16);
      await page.fill('input[name="issueAt"]', toDateTimeLocal(issueDate));
      await page.fill('input[name="dueAt"]', toDateTimeLocal(dueDate));
      await page.fill('input[name="maxMarks"]', '100');

      await page.getByRole('button', { name: 'Save Draft' }).click();

      // Should redirect to details
      await expect(page).toHaveURL(/\/homework\/[a-f0-9-]{36}/, { timeout: 15000 });
      await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=DRAFT').first()).toBeVisible();

      // Publish it
      await page.click('button:has-text("Publish")');
      await expect(page.locator('text=PUBLISHED').first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Guardian View Flow', () => {
    test.beforeEach(async ({}, testInfo) => {
      // Only run view flow as Guardian
      test.skip(testInfo.project.name !== 'chromium-guardian', 'EXPECTED_ROLE_SCOPE');
    });

    test('Guardian views homework but cannot submit', async ({ page }) => {
      await page.goto('/homework?session=aaaaaaaa-1111-1111-1111-111111111111');
      await expect(page.getByRole('heading', { name: /Homework/i }).first()).toBeVisible({ timeout: 15000 });
      
      // Guardian is read-only
      await expect(page.locator('text=Create Homework Assignment')).not.toBeVisible();
      
      // Navigate to seeded homework assignment
      await page.goto('/homework/bbbbbbbb-5555-5555-5555-555555555555?session=aaaaaaaa-1111-1111-1111-111111111111');
      await expect(page.locator('text=Due Date:').first()).toBeVisible({ timeout: 15000 });
      
      // Guardians cannot submit homework directly
      await expect(page.locator('text=Guardians cannot submit homework on behalf of students directly.')).toBeVisible();
      await expect(page.locator('button:has-text("Submit Homework")')).not.toBeVisible();
    });
  });

  test.describe('Unauthorized Access', () => {
    test.beforeEach(async ({}, testInfo) => {
      // Only run this test for Guardian to verify access denied
      test.skip(testInfo.project.name !== 'chromium-guardian', 'EXPECTED_ROLE_SCOPE');
    });

    test('Unauthorized access to creation page is blocked', async ({ page }) => {
      await page.goto('/homework/new?session=aaaaaaaa-1111-1111-1111-111111111111');
      await expect(page.getByRole('heading', { name: /Access Denied/i }).first()).toBeVisible({ timeout: 15000 });
    });
  });
});
