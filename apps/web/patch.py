import re

with open('e2e/attendance.spec.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"const targetDate = \2026-08-\\\$\{String\\\(\\\(browserIndex >= 0 \? browserIndex : 0\\\) \+ 1\\\)\.padStart\\\(2, '0'\\\)\}\;", 
    "const d = new Date('2026-08-17T00:00:00Z'); let daysToAdd = testInfo.workerIndex; if (daysToAdd > 4) daysToAdd += 2; if (daysToAdd > 9) daysToAdd += 2; d.setDate(d.getDate() + daysToAdd); const targetDate = d.toISOString().split('T')[0];", 
    content
)

content = re.sub(
    r"const targetDate = \2026-08-\\\$\{String\\\(\\\(browserIndex >= 0 \? browserIndex : 0\\\) \+ 15\\\)\.padStart\\\(2, '0'\\\)\}\;", 
    "const d = new Date('2026-08-24T00:00:00Z'); let daysToAdd = testInfo.workerIndex; if (daysToAdd > 4) daysToAdd += 2; if (daysToAdd > 9) daysToAdd += 2; d.setDate(d.getDate() + daysToAdd); const targetDate = d.toISOString().split('T')[0];", 
    content
)

with open('e2e/attendance.spec.ts', 'w') as f:
    f.write(content)
