with open('apps/web/e2e/timetable.spec.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "await page.locator('select[name=\"status\"]').selectOption('ARCHIVED');\n      await page.getByRole('button', { name: 'Save' }).click();",
    "await page.getByRole('button', { name: 'Archive Entry' }).click();\n      page.on('dialog', dialog => dialog.accept());"
)

with open('apps/web/e2e/timetable.spec.ts', 'w') as f:
    f.write(content)
