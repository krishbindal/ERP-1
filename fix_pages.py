import re

def fix_page(filepath, import_path):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find where to add import
    import_statement = f"import {{ BranchAccessError }} from '{import_path}';\n"
    content = content.replace("import { createClient } from '@/lib/supabase/server';", f"import {{ createClient }} from '@/lib/supabase/server';\n{import_statement}")
    
    pattern = r"if \(errorState === 'NO_CONTEXT'\).*?</p>\s*</div>\s*</div>\s*\);\s*}"
    
    content = re.sub(pattern, "if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;", content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

fix_page('apps/web/src/app/scheduling/page.tsx', './components/BranchAccessError')
fix_page('apps/web/src/app/scheduling/timetable/page.tsx', '../components/BranchAccessError')
fix_page('apps/web/src/app/scheduling/substitutions/page.tsx', '../components/BranchAccessError')
