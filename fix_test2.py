with open('apps/web/e2e/timetable.spec.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "await page.getByRole('button', { name: 'Archive Entry' }).click();\n      page.on('dialog', dialog => dialog.accept());",
    "page.on('dialog', dialog => dialog.accept());\n      await page.getByRole('button', { name: 'Archive Entry' }).click();"
)

with open('apps/web/e2e/timetable.spec.ts', 'w') as f:
    f.write(content)
