with open('apps/web/e2e/substitutions.spec.ts', 'r') as f:
    content = f.read()

# Replace all occurrences of 2026-08-20 with 2026-08-18 in the substitutions test
content = content.replace('2026-08-20', '2026-08-18')

with open('apps/web/e2e/substitutions.spec.ts', 'w') as f:
    f.write(content)
