path = 'apps/web/src/app/scheduling/timetable/actions.ts'
with open(path, 'r') as f:
    c = f.read()

c = c.replace(
    'export async function createTimetableEntry(',
    'export async function createTimetableEntry(\n'
).replace(
    'const supabase = await createClient();',
    'const supabase = await createClient();\n    console.log("createTimetableEntry called! period:", data.period_id, "room:", data.room_id, "day:", data.day_of_week);'
)

with open(path, 'w') as f:
    f.write(c)
