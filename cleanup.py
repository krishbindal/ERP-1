import re

def remove_unused(filepath, to_remove):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for item in to_remove:
        # e.g., remove getAppContext,  or , getAppContext
        content = re.sub(r',\s*' + item + r'\b', '', content)
        content = re.sub(r'\b' + item + r'\s*,', '', content)
        # e.g., remove { getAppContext }
        content = re.sub(r'{\s*' + item + r'\s*}', '{}', content)
        # remove empty imports
        content = re.sub(r'import\s*{}\s*from\s*[\'"].*?[\'"];?\n', '', content)
    
    # special cleanup for unused variables
    content = re.sub(r'const supabase = await createClient\(\);\n', '', content)
    content = re.sub(r'const {.*?isReadOnly.*?}.*?verifyPageBranchContext.*?\n', lambda m: m.group(0).replace('isReadOnly, ', ''), content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned {filepath}")

remove_unused('apps/web/src/app/academic-structure/actions.ts', ['auth_has_org_access', 'getAppContext'])
remove_unused('apps/web/src/app/academic-structure/page.tsx', ['getAppContext'])
remove_unused('apps/web/src/app/admin/app-config/actions.ts', ['auth_has_org_access', 'getAppContext'])
remove_unused('apps/web/src/app/admin/app-config/page.tsx', ['getAppContext', 'supabase', 'isReadOnly'])
remove_unused('apps/web/src/app/scheduling/actions.ts', ['auth_has_org_access', 'getAppContext'])
remove_unused('apps/web/src/app/scheduling/page.tsx', ['getAppContext'])
