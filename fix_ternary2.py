import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    pattern = re.compile(r"const name = t\.staff \? \(Array\.isArray\(t\.staff\) \? \$\{t\.staff\[0\]\.first_name\} \$\{t\.staff\[0\]\.last_name\} : \$\{t\.staff\.first_name\} \$\{t\.staff\.last_name\}\) : 'Unknown';")
    
    replacement = '''
                  let name = 'Unknown';
                  if (t.staff) {
                    name = Array.isArray(t.staff) ? ${t.staff[0].first_name}  : ${t.staff.first_name} ;
                  }
'''
    
    content = pattern.sub(replacement.strip(), content)

    with open(filepath, 'w') as f:
        f.write(content)

fix_file('apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx')
fix_file('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx')
