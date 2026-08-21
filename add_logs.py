import os

path = 'apps/web/src/app/scheduling/timetable/actions.ts'
with open(path, 'r') as f:
    c = f.read()

c = c.replace(
    'if (error) return { error: mapDatabaseError(error) };',
    'if (error) { console.error("Timetable mutation error:", error); return { error: mapDatabaseError(error) }; }'
)

with open(path, 'w') as f:
    f.write(c)

path2 = 'apps/web/src/app/scheduling/substitutions/actions.ts'
with open(path2, 'r') as f:
    c = f.read()

c = c.replace(
    'if (error) return { error: mapDatabaseError(error) };',
    'if (error) { console.error("Substitution mutation error:", error); return { error: mapDatabaseError(error) }; }'
)

with open(path2, 'w') as f:
    f.write(c)
