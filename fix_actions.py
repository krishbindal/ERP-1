with open('apps/web/src/app/scheduling/timetable/actions.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'console.log("createTimetableEntry called! period:", data.period_id' in line:
        continue
    new_lines.append(line)

with open('apps/web/src/app/scheduling/timetable/actions.ts', 'w') as f:
    f.writelines(new_lines)
