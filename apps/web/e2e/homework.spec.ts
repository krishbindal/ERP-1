import { test, expect } from '@playwright/test';

test.describe('Homework E2E - Phase 5', () => {
  let projectIndex = 0;
  test.beforeEach(async ({ }, testInfo) => {
    projectIndex = testInfo.project.name === 'chromium-superadmin' ? 1 
                 : testInfo.project.name === 'chromium-branchadmin' ? 2 
                 : testInfo.project.name === 'chromium-teacher' ? 3 
                 : testInfo.project.name === 'chromium-student' ? 4 
                 : testInfo.project.name === 'chromium-guardian' ? 5 : 0;
  });

  test('Teacher creates, saves draft, publishes, and student submits', async ({ page }, testInfo) => {
    // Only run this test for teacher role. Student/guardian flows will be separate, or we can just run the full flow in a dedicated test but Playwright handles login globally via storage state.
    // Wait, the default matrix runs all tests for all roles.
    // We should branch based on the project role.
    const role = testInfo.project.name;

    if (role === 'chromium-teacher' || role === 'chromium-superadmin' || role === 'chromium-branchadmin') {
      await page.goto('/homework');
      await expect(page.locator('h1', { hasText: 'Homework' }).first()).toBeVisible();

      await page.goto('/homework/new');
      await expect(page.locator('h1', { hasText: 'Create Homework Assignment' }).first()).toBeVisible();

      const uniqueTitle = `E2E Homework ${Date.now()}-${projectIndex}`;
      await page.fill('input[name="title"]', uniqueTitle);
      await page.fill('textarea[name="description"]', 'Please solve the equations.');
      
      // Select the first valid section and subject
      const sectionSelect = page.locator('select[name="sectionId"]');
      await sectionSelect.selectOption({ index: 1 });

      const subjectSelect = page.locator('select[name="subjectId"]');
      await subjectSelect.selectOption({ index: 1 });

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

      await page.click('button[type="submit"]');

      // Should redirect to details
      await expect(page).toHaveURL(/\/homework\/[a-f0-9-]{36}/);
      await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();
      await expect(page.locator('text=DRAFT').first()).toBeVisible();

      // Publish it
      await page.click('button:has-text("Publish")');
      await expect(page.locator('text=PUBLISHED').first()).toBeVisible();
      
    } else if (role === 'chromium-student') {
      await page.goto('/homework');
      await expect(page.locator('h1', { hasText: 'Homework' }).first()).toBeVisible();
      // Student cannot see the create button
      await expect(page.locator('text=Create Homework Assignment')).not.toBeVisible();
      
    } else if (role === 'chromium-guardian') {
      await page.goto('/homework');
      await expect(page.locator('h1', { hasText: 'Homework' }).first()).toBeVisible();
      // Guardian is read-only
      await expect(page.locator('button:has-text("Submit")')).not.toBeVisible();
    }
  });

  test('Student can submit homework', async ({ page }, testInfo) => {
    const role = testInfo.project.name;
    if (role === 'chromium-student') {
      // In a real e2e we'd navigate to a specific seeded assignment
      // We will seed a specific assignment in `seed.sql` for the student test.
      // E.g. assignment ID: bbbbbbbb-5555-5555-5555-555555555555
      await page.goto('/homework/bbbbbbbb-5555-5555-5555-555555555555');
      
      // Wait for it to load
      await expect(page.locator('text=Due Date:')).toBeVisible();
      
      // Fill out comment and submit
      const commentBox = page.locator('textarea');
      // In playwright tests running repeatedly without dropping the DB properly per test, it might already be submitted. So check if the submit button exists instead of just the textarea.
      // But actually, we do wipe the DB. So it will be unsubmitted.
      await expect(commentBox).toBeVisible();
      await commentBox.fill('Here is my submission comment.');
      await page.click('button:has-text("Submit Homework")');
      await expect(page.locator('text=SUBMITTED').first()).toBeVisible();
    }
  });
});

  test('Unauthorized access is blocked', async ({ page }, testInfo) => {
    const role = testInfo.project.name;
    if (role === 'chromium-student' || role === 'chromium-guardian') {
      await page.goto('/homework/new');
      await expect(page.locator('text=Access Denied')).toBeVisible();
    }
  });
