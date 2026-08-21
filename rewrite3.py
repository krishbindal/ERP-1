import re

replacements = {
    "{ label: 'Class 10' }": "'aaaaaaaa-2222-2222-2222-222222222222'",
    "{ label: 'Class 11' }": "'aaaaaaaa-2222-2222-2222-222222222223'",
    "{ label: 'Section A' }": "'aaaaaaaa-3333-3333-3333-333333333333'",
    "{ label: 'Section B' }": "'aaaaaaaa-3333-3333-3333-333333333334'",
    "{ label: 'Mathematics' }": "'aaaaaaaa-4444-4444-4444-444444444444'",
    "{ label: 'Science' }": "'aaaaaaaa-4444-4444-4444-444444444445'",
    "{ label: 'Room 101' }": "'aaaaaaaa-5555-5555-5555-555555555555'",
    "{ label: 'Room 102' }": "'aaaaaaaa-5555-5555-5555-555555555556'",
    "{ label: 'Period 1' }": "'aaaaaaaa-6666-6666-6666-666666666666'",
    "{ label: 'Science (Branch Admin)' }": "{ label: 'Class 11 Section B - Science (Period 1)' }",
    "{ label: 'Mathematics (Teacher A)' }": "{ label: 'Class 10 Section A - Mathematics (Period 1)' }"
}

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
    for k, v in replacements.items():
        content = content.replace(k, v)
    with open(path, 'w') as f:
        f.write(content)

process_file('apps/web/e2e/timetable.spec.ts')
process_file('apps/web/e2e/substitutions.spec.ts')
