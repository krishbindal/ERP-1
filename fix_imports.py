import re

def refactor_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove unused imports
    content = re.sub(r"import \{ createClient \}.*?\n", "", content)
    content = re.sub(r"import \{ getContextBranchId \}.*?\n", "", content)

    with open(filepath, 'w') as f:
        f.write(content)

refactor_action('apps/web/src/app/scheduling/timetable/actions.ts')
refactor_action('apps/web/src/app/scheduling/substitutions/actions.ts')
refactor_action('apps/web/src/app/scheduling/actions.ts')
