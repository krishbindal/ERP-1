import re

with open('apps/web/e2e/timetable.spec.ts', 'r') as f:
    content = f.read()

content = content.replace("const html = await page.content();", "{ const html = await page.content();")
content = content.replace("require('fs').writeFileSync('debug.html', html);", "require('fs').writeFileSync('debug.html', html); }")

with open('apps/web/e2e/timetable.spec.ts', 'w') as f:
    f.write(content)
