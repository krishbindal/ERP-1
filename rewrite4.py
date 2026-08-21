import re

with open('apps/web/e2e/timetable.spec.ts', 'r') as f:
    content = f.read()

# Add a page.reload() after creating
content = content.replace(
    "await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();",
    "await expect(page.locator('text=New Timetable Entry')).not.toBeVisible();\n      await page.waitForTimeout(500); // Give Server Action a moment\n      await page.reload();"
)

with open('apps/web/e2e/timetable.spec.ts', 'w') as f:
    f.write(content)
