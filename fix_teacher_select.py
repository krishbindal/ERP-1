import re

def fix_tt():
    with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'r') as f:
        content = f.read()

    # Import
    content = content.replace("import { DrawerForm } from '@/components/ui/DrawerForm';", "import { DrawerForm } from '@/components/ui/DrawerForm';\nimport { TeacherSelect } from '../../components/TeacherSelect';")

    # Replace Teacher block
    # from <div>\n              <label htmlFor="staff_branch_profile_id" ... to </select>\n            </div>
    
    pattern = r'<div>\s*<label htmlFor="staff_branch_profile_id".*?</select>\s*</div>'
    replacement = "<TeacherSelect teachers={teachers} id=\"staff_branch_profile_id\" name=\"staff_branch_profile_id\" label=\"Teacher\" defaultValue={initialData?.staff_branch_profile_id || ''} />"
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'w') as f:
        f.write(content)


def fix_sub():
    with open('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx', 'r') as f:
        content = f.read()

    # Import
    content = content.replace("import { DrawerForm } from '@/components/ui/DrawerForm';", "import { DrawerForm } from '@/components/ui/DrawerForm';\nimport { TeacherSelect } from '../../components/TeacherSelect';")

    pattern = r'<div>\s*<label htmlFor="substitute_staff_id".*?</select>\s*</div>'
    replacement = "<TeacherSelect teachers={teachers} id=\"substitute_staff_id\" name=\"substitute_staff_id\" label=\"Substitute Teacher\" />"
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    with open('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx', 'w') as f:
        f.write(content)

fix_tt()
fix_sub()
