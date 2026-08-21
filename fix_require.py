with open('apps/web/e2e/timetable.spec.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "require('fs').writeFileSync('debug.html', html);" in line:
        pass
    elif "const html = await page.content();" in line:
        pass
    else:
        new_lines.append(line)

with open('apps/web/e2e/timetable.spec.ts', 'w') as f:
    f.writelines(new_lines)
