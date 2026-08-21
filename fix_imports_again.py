def add_import(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace('import { DrawerForm }', 'import { TeacherSelect } from "../../components/TeacherSelect";\nimport { DrawerForm }')

    with open(filepath, 'w') as f:
        f.write(content)

add_import('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx')
add_import('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx')
