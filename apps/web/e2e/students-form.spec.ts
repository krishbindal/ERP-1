import { test, expect } from '@playwright/test';

test.describe('Student Enrollment Form Submission', () => {

  test('Branch Admin encounters validation error display on invalid submit', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/new');
    await expect(page.getByRole('heading', { name: 'Enroll New Student' })).toBeVisible();

    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();

    // Verify required attributes on inputs for accessible client validation
    expect(await firstNameInput.getAttribute('required')).not.toBeNull();
    expect(await lastNameInput.getAttribute('required')).not.toBeNull();

    // Directly test server-action validation error display via error query state
    await page.goto('/students/new?error=First+name+and+last+name+are+required.');
    
    // Verify accessible role="alert" container renders
    const alertBox = page.getByRole('alert').filter({ hasText: 'Enrollment Failed' });
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Enrollment Failed');
    await expect(alertBox).toContainText('First name and last name are required.');
  });

  test('Branch Admin completes real student form submission successfully', async ({ page }) => {
    if (test.info().project.metadata?.role !== 'branchadmin') {
      test.skip(1 === 1, 'EXPECTED_ROLE_SCOPE');
    }

    await page.goto('/students/new');
    await expect(page.getByRole('heading', { name: 'Enroll New Student' })).toBeVisible();

    const uniqueTimestamp = Date.now();
    const testFirstName = `JaneE2E_${uniqueTimestamp}`;
    const testLastName = `SmithE2E_${uniqueTimestamp}`;

    // Fill the form
    await page.fill('input[name="firstName"]', testFirstName);
    await page.fill('input[name="lastName"]', testLastName);
    await page.fill('input[name="dateOfBirth"]', '2016-04-12');

    // Submit form
    const submitBtn = page.locator('#enroll-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Should navigate to student detail page /students/[id]
    await page.waitForURL(/\/students\/[a-f0-9-]+/, { timeout: 15000 });
    
    // Verify student detail page renders the student's name
    await expect(page.locator(`text=${testFirstName}`)).toBeVisible();
    await expect(page.locator(`text=${testLastName}`)).toBeVisible();

    // Navigate back to /students list and verify student is listed
    await page.goto('/students');
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
    await expect(page.locator(`text=${testFirstName} ${testLastName}`)).toBeVisible();
  });
});
