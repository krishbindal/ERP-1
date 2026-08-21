with open('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "const name = t.staff ?" in line:
        new_lines.append("                  let name = 'Unknown';\n")
        new_lines.append("                  if (t.staff) {\n")
        new_lines.append("                    name = Array.isArray(t.staff) ? ${t.staff[0].first_name}  : ${t.staff.first_name} ;\n")
        new_lines.append("                  }\n")
    else:
        new_lines.append(line)

with open('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx', 'w') as f:
    f.writelines(new_lines)


with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "const name = t.staff ?" in line:
        new_lines.append("                  let name = 'Unknown';\n")
        new_lines.append("                  if (t.staff) {\n")
        new_lines.append("                    name = Array.isArray(t.staff) ? ${t.staff[0].first_name}  : ${t.staff.first_name} ;\n")
        new_lines.append("                  }\n")
    else:
        new_lines.append(line)

with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'w') as f:
    f.writelines(new_lines)
