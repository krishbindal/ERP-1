with open('apps/web/e2e/substitutions.spec.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "fill('2026-08-18'); // Thursday" in line:
        new_lines.append(line.replace('2026-08-18', '2026-08-20'))
    elif "fill('2026-08-18'); // Tuesday (Wrong weekday" in line:
        new_lines.append(line)
    elif "fill('2026-08-19')" in line:
        new_lines.append(line)
    else:
        new_lines.append(line)

with open('apps/web/e2e/substitutions.spec.ts', 'w') as f:
    f.writelines(new_lines)
