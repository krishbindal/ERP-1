with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'r') as f:
    content = f.read()

replacement = '''
                  let name = 'Unknown';
                  if (t.staff) {
                    name = Array.isArray(t.staff) ? ${t.staff[0].first_name}  : ${t.staff.first_name} ;
                  }
'''

content = content.replace("const name = t.staff ? (Array.isArray(t.staff) ? ${t.staff[0].first_name}  : ${t.staff.first_name} ) : 'Unknown';", replacement.strip('\n'))

with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'w') as f:
    f.write(content)
